import { createClient, type SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.93.3'

const MAX_TOTAL_BYTES = 20 * 1024 * 1024
const ALLOWED_MIME = new Set([
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
])
const TRAMITES: Record<string, { seccion: 'arbitraje' | 'jprd'; nombre: string; pago: boolean; expediente?: boolean; sumilla?: boolean; asunto?: boolean }> = {
    arbitraje_institucional: { seccion: 'arbitraje', nombre: 'Solicitud de Arbitraje Institucional', pago: true },
    arbitraje_emergencia: { seccion: 'arbitraje', nombre: 'Solicitud de Arbitraje de Emergencia', pago: true },
    incorporacion_arbitros: { seccion: 'arbitraje', nombre: 'Incorporación a la nómina de Árbitros', pago: true },
    renovacion_arbitros: { seccion: 'arbitraje', nombre: 'Renovación a la nómina de Árbitros', pago: true },
    copia_certificada: { seccion: 'arbitraje', nombre: 'Solicitud de copia certificada', pago: false },
    escrito_expediente_arbitraje: { seccion: 'arbitraje', nombre: 'Ingresar escrito en expediente', pago: false, expediente: true, sumilla: true },
    otro_arbitraje: { seccion: 'arbitraje', nombre: 'Otro trámite', pago: false, asunto: true },
    jprd_solicitud: { seccion: 'jprd', nombre: 'Solicitud de JPRD', pago: true },
    incorporacion_adjudicadores: { seccion: 'jprd', nombre: 'Incorporación a la nómina de adjudicadores', pago: true },
    escrito_expediente_jprd: { seccion: 'jprd', nombre: 'Ingresar escrito en expediente', pago: false, expediente: true, sumilla: true },
    otro_jprd: { seccion: 'jprd', nombre: 'Otro trámite', pago: false, asunto: true },
}

interface SolicitantePayload {
    tipoPersona: string
    tipoDocumento: string
    numeroDocumento: string
    nombresApellidos: string
    razonSocial: string
    representanteLegal: string
    cargoRepresentante: string
    celular: string
    correo: string
    domicilio: string
}

interface DocumentoPayload {
    tipoDocumento: string
    comentario: string
    enlaceExterno: string
}

interface PagoPayload {
    tipoFacturacion: string
    nombreRazonSocial: string
    documento: string
    direccion: string
}

interface IntakePayload {
    idempotencyKey: string
    seccion: string
    tramiteCodigo: string
    tramiteNombre?: string
    requierePago?: boolean
    solicitante: SolicitantePayload
    numeroExpedienteReferido: string
    sumilla: string
    asunto: string
    documentos: DocumentoPayload[]
    pago: PagoPayload
    aceptaNotificaciones: boolean
    aceptaDatosPersonales: boolean
    captchaToken: string
}

interface ValidatedIntake {
    payload: IntakePayload & { tramiteNombre: string; requierePago: boolean }
    files: File[]
    documentFiles: Array<File | null>
    paymentFile: File | null
}

interface DocumentMetadata {
    tipo_documento: string
    nombre_archivo: string
    archivo_url: string
    link_externo: string
    tamano_bytes: number | null
    mime_type: string | null
    comentario: string
}

interface PaymentMetadata {
    archivo_url: string
    tipo_facturacion: string
    nombre_razon_social: string
    documento_facturacion: string
    direccion_facturacion: string
}

interface FinalizeInput {
    idempotencyKey: string
    payloadHash: string
    payload: ValidatedIntake['payload']
    documentos: DocumentMetadata[]
    pago: PaymentMetadata | null
    ip: string | null
    userAgent: string | null
}

interface FinalizeResult {
    solicitud_id: string
    codigo: string
    estado: string
    outbox_id: string
    webhook_payload: unknown
}

class RequestError extends Error {
    constructor(message: string, readonly status = 400) {
        super(message)
    }
}

Deno.serve(async (request) => {
    if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders() })
    if (request.method !== 'POST') return json({ error: 'Método no permitido' }, 405)

    const supabase = createServiceClient()
    const uploadedPaths: string[] = []
    let idempotencyKey = ''
    let payloadHash = ''

    try {
        const formData = await request.formData()
        const rawPayload = parsePayload(formData)
        idempotencyKey = requireUuid(rawPayload.idempotencyKey)
        const validated = await validatePayload(rawPayload, formData)
        payloadHash = await hashRequest(validated.payload, validated.files)

        const previous = await getExistingResult(supabase, idempotencyKey, payloadHash)
        if (previous) return json(previous)

        const ip = getClientIp(request)
        await enforceRateLimit(supabase, ip, validated.payload.solicitante.correo)
        await validateCaptcha(validated.payload.captchaToken, ip)

        const documentos = await uploadDocuments(supabase, idempotencyKey, validated, uploadedPaths)
        const pago = await uploadPayment(supabase, idempotencyKey, validated, uploadedPaths)
        const result = await finalizeIntake(supabase, {
            idempotencyKey,
            payloadHash,
            payload: validated.payload,
            documentos,
            pago,
            ip,
            userAgent: request.headers.get('user-agent'),
        })

        await deliverReceptionWebhook(supabase, result.outbox_id, result.webhook_payload)
        return json({ codigo: result.codigo, solicitudId: result.solicitud_id, estado: result.estado })
    } catch (error) {
        if (uploadedPaths.length) await cleanupFailedUploads(supabase, uploadedPaths, idempotencyKey, payloadHash)
        if (error instanceof RequestError) return json({ error: error.message }, error.status)
        console.error(error instanceof Error ? error.message : 'Error interno en public-intake')
        return json({ error: 'No se pudo registrar la solicitud. Intente nuevamente.' }, 500)
    }
})

function createServiceClient() {
    const url = Deno.env.get('SUPABASE_URL')
    const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!url || !key) throw new Error('Configuración de Supabase incompleta')
    return createClient(url, key)
}

function parsePayload(formData: FormData): IntakePayload {
    try {
        const value = formData.get('payload')
        if (typeof value !== 'string') throw new Error()
        const parsed: unknown = JSON.parse(value)
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error()
        return parsed as IntakePayload
    } catch {
        throw new RequestError('Datos de solicitud inválidos')
    }
}

async function validatePayload(payload: IntakePayload, formData: FormData): Promise<ValidatedIntake> {
    const tramite = TRAMITES[String(payload.tramiteCodigo)]
    if (!tramite || tramite.seccion !== payload.seccion) throw new RequestError('Trámite inválido')
    if (!['natural', 'juridica'].includes(payload.solicitante?.tipoPersona)) throw new RequestError('Tipo de persona inválido')
    if (!['dni', 'ce', 'pasaporte', 'ruc'].includes(payload.solicitante?.tipoDocumento)) throw new RequestError('Tipo de documento inválido')

    const solicitante = payload.solicitante
    requireText(solicitante.numeroDocumento, 'Ingrese el documento', 20)
    requireText(solicitante.nombresApellidos, 'Ingrese nombres y apellidos', 255)
    requireText(solicitante.celular, 'Ingrese celular', 30)
    requireText(solicitante.domicilio, 'Ingrese domicilio', 1000)
    if (!isEmail(solicitante.correo)) throw new RequestError('Ingrese un correo válido')
    if (solicitante.tipoPersona === 'juridica') {
        requireText(solicitante.razonSocial, 'Ingrese razón social', 255)
        requireText(solicitante.representanteLegal, 'Ingrese representante legal', 255)
        requireText(solicitante.cargoRepresentante, 'Ingrese cargo', 255)
    }
    validateOptionalText(solicitante.razonSocial, 255)
    validateOptionalText(solicitante.representanteLegal, 255)
    validateOptionalText(solicitante.cargoRepresentante, 255)
    validateOptionalText(payload.numeroExpedienteReferido, 100)
    validateOptionalText(payload.sumilla, 500)
    validateOptionalText(payload.asunto, 2000)
    if (tramite.expediente) requireText(payload.numeroExpedienteReferido, 'Ingrese expediente', 100)
    if (tramite.sumilla) requireText(payload.sumilla, 'Ingrese sumilla', 500)
    if (tramite.asunto) requireText(payload.asunto, 'Ingrese asunto', 2000)
    if (!payload.aceptaNotificaciones || !payload.aceptaDatosPersonales) throw new RequestError('Debe aceptar los consentimientos')
    if (!Array.isArray(payload.documentos) || !payload.documentos.length || payload.documentos.length > 10) throw new RequestError('Adjunte entre 1 y 10 documentos')

    const files: File[] = []
    const documentFiles: Array<File | null> = []
    payload.documentos.forEach((doc, index) => {
        if (!['solicitud_principal', 'anexo', 'documento_identidad', 'poder', 'otro'].includes(doc.tipoDocumento)) throw new RequestError('Tipo de documento inválido')
        const file = getFile(formData, `documentos.${index}.archivo`)
        const link = normalizeLink(doc.enlaceExterno)
        if (!file && !link) throw new RequestError(`Adjunte archivo o enlace en el documento ${index + 1}`)
        documentFiles.push(file)
        if (file) files.push(file)
    })

    const paymentFile = getFile(formData, 'pago.archivo')
    if (tramite.pago) {
        if (!['boleta', 'factura_contado', 'factura_credito', 'factura'].includes(payload.pago?.tipoFacturacion)) throw new RequestError('Tipo de comprobante inválido')
        requireText(payload.pago?.nombreRazonSocial, 'Ingrese datos de facturación', 255)
        requireText(payload.pago?.documento, 'Ingrese documento de facturación', 20)
        requireText(payload.pago?.direccion, 'Ingrese dirección de facturación', 1000)
        if (!paymentFile) throw new RequestError('Adjunte el comprobante de pago')
        files.push(paymentFile)
    }
    await validateFiles(files)

    return {
        payload: { ...payload, tramiteNombre: tramite.nombre, requierePago: tramite.pago },
        files,
        documentFiles,
        paymentFile,
    }
}

async function validateFiles(files: File[]) {
    let total = 0
    for (const file of files) {
        if (!ALLOWED_MIME.has(file.type)) throw new RequestError(`Formato no permitido: ${file.name}`)
        if (!file.size || file.size > MAX_TOTAL_BYTES) throw new RequestError(`Archivo demasiado grande: ${file.name}`)
        if (!await hasValidSignature(file)) throw new RequestError(`El contenido no corresponde al formato declarado: ${file.name}`)
        total += file.size
    }
    if (total > MAX_TOTAL_BYTES) throw new RequestError('Los archivos no deben superar 20 MB en total; use enlaces de Drive para archivos pesados')
}

async function hasValidSignature(file: File) {
    const bytes = new Uint8Array(await file.slice(0, 8).arrayBuffer())
    const startsWith = (...signature: number[]) => signature.every((value, index) => bytes[index] === value)
    switch (file.type) {
        case 'application/pdf': return startsWith(0x25, 0x50, 0x44, 0x46)
        case 'image/jpeg': return startsWith(0xff, 0xd8, 0xff)
        case 'image/png': return startsWith(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a)
        case 'application/msword': return startsWith(0xd0, 0xcf, 0x11, 0xe0)
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': return startsWith(0x50, 0x4b, 0x03, 0x04)
        default: return false
    }
}

async function getExistingResult(supabase: SupabaseClient, key: string, hash: string) {
    const { data, error } = await supabase.rpc('get_public_intake_result', { p_idempotency_key: key, p_payload_hash: hash })
    if (error) throw new RequestError(error.message.includes('idempotencia') ? error.message : 'No se pudo validar el reintento', 409)
    const item = data?.[0]
    return item ? { codigo: item.codigo, solicitudId: item.solicitud_id, estado: item.estado } : null
}

async function enforceRateLimit(supabase: SupabaseClient, ip: string | null, email: string) {
    const salt = Deno.env.get('RATE_LIMIT_SALT') ?? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const keyHash = await sha256(`intake:${ip ?? 'unknown'}:${email.toLowerCase()}:${salt}`)
    const { data, error } = await supabase.rpc('check_public_rate_limit', {
        p_accion: 'public_intake', p_key_hash: keyHash, p_limit: 5, p_window_seconds: 3600,
    })
    if (error) throw new Error(error.message)
    if (!data) throw new RequestError('Se alcanzó el límite de envíos. Intente más tarde.', 429)
}

async function validateCaptcha(token: string, ip: string | null) {
    const secret = Deno.env.get('TURNSTILE_SECRET_KEY')
    if (!secret) throw new Error('TURNSTILE_SECRET_KEY no configurado')
    if (!token || token.length > 2048) throw new RequestError('Complete la validación de seguridad')
    const body = new URLSearchParams({ secret, response: token })
    if (ip) body.set('remoteip', ip)
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST', body, signal: AbortSignal.timeout(8000),
    })
    const result = await response.json()
    const expectedHost = Deno.env.get('TURNSTILE_EXPECTED_HOSTNAME')
    if (!result.success || (expectedHost && result.hostname !== expectedHost)) throw new RequestError('Validación de seguridad fallida')
}

async function uploadDocuments(supabase: SupabaseClient, key: string, validated: ValidatedIntake, uploaded: string[]): Promise<DocumentMetadata[]> {
    const documents: DocumentMetadata[] = []
    for (const [index, doc] of validated.payload.documentos.entries()) {
        const actualFile = validated.documentFiles[index] as File | null
        const path = actualFile ? await uploadFile(supabase, actualFile, `${key}/documentos/${index}-${safeName(actualFile.name)}`, uploaded) : ''
        documents.push({
            tipo_documento: mapDocumento(doc.tipoDocumento),
            nombre_archivo: actualFile?.name ?? `enlace-${index + 1}`,
            archivo_url: path,
            link_externo: normalizeLink(doc.enlaceExterno),
            tamano_bytes: actualFile?.size ?? null,
            mime_type: actualFile?.type ?? null,
            comentario: cleanOptional(doc.comentario, 1000),
        })
    }
    return documents
}

async function uploadPayment(supabase: SupabaseClient, key: string, validated: ValidatedIntake, uploaded: string[]): Promise<PaymentMetadata | null> {
    if (!validated.payload.requierePago || !validated.paymentFile) return null
    const file = validated.paymentFile as File
    const path = await uploadFile(supabase, file, `${key}/pagos/comprobante-${safeName(file.name)}`, uploaded)
    return {
        archivo_url: path,
        tipo_facturacion: validated.payload.pago.tipoFacturacion,
        nombre_razon_social: validated.payload.pago.nombreRazonSocial,
        documento_facturacion: validated.payload.pago.documento,
        direccion_facturacion: validated.payload.pago.direccion,
    }
}

async function uploadFile(supabase: SupabaseClient, file: File, path: string, uploaded: string[]) {
    const { error } = await supabase.storage.from('solicitudes').upload(path, file, { contentType: file.type, upsert: true })
    if (error) throw new Error(error.message)
    uploaded.push(path)
    return path
}

async function finalizeIntake(supabase: SupabaseClient, input: FinalizeInput): Promise<FinalizeResult> {
    const { data, error } = await supabase.rpc('finalize_public_intake', {
        p_idempotency_key: input.idempotencyKey,
        p_payload_hash: input.payloadHash,
        p_payload: input.payload,
        p_documentos: input.documentos,
        p_pago: input.pago,
        p_ip: input.ip,
        p_user_agent: input.userAgent,
        p_public_app_url: requireEnv('PUBLIC_APP_URL'),
    })
    if (error || !data?.[0]) throw new Error(error?.message ?? 'No se pudo finalizar la solicitud')
    return data[0] as FinalizeResult
}

async function deliverReceptionWebhook(supabase: SupabaseClient, outboxId: string, payload: unknown) {
    const url = Deno.env.get('N8N_RECEPCION_WEBHOOK_URL')
    if (!url || !outboxId) return
    let success = false
    let status = 0
    let errorMessage = ''
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: webhookHeaders(outboxId),
            body: JSON.stringify(payload),
            signal: AbortSignal.timeout(8000),
        })
        success = response.ok
        status = response.status
        if (!success) errorMessage = `HTTP ${status}`
    } catch (error) {
        errorMessage = error instanceof Error ? error.message : 'Error de red'
    }
    await supabase.rpc('complete_webhook_attempt', { p_id: outboxId, p_success: success, p_status: status || null, p_error: errorMessage })
}

async function cleanupFailedUploads(supabase: SupabaseClient, paths: string[], key: string, hash: string) {
    if (key && hash) {
        const { data } = await supabase.rpc('get_public_intake_result', { p_idempotency_key: key, p_payload_hash: hash })
        if (data?.length) return
    }
    await supabase.storage.from('solicitudes').remove(paths)
}

function getFile(formData: FormData, key: string): File | null {
    const value = formData.get(key)
    return value instanceof File && value.size > 0 ? value : null
}

function normalizeLink(value: unknown) {
    if (!value) return ''
    try {
        const url = new URL(String(value))
        if (url.protocol !== 'https:') throw new Error()
        return url.toString()
    } catch {
        throw new RequestError('El enlace externo debe ser una URL HTTPS válida')
    }
}

function requireText(value: unknown, message: string, max: number) {
    if (typeof value !== 'string' || !value.trim() || value.trim().length > max) throw new RequestError(message)
}

function validateOptionalText(value: unknown, max: number) {
    if (value !== undefined && (typeof value !== 'string' || value.length > max)) throw new RequestError('Uno de los campos excede el tamaño permitido')
}

function cleanOptional(value: unknown, max: number) {
    return typeof value === 'string' ? value.trim().slice(0, max) : ''
}

function isEmail(value: unknown) {
    return typeof value === 'string' && value.length <= 255 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function requireUuid(value: unknown) {
    const key = String(value ?? '')
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(key)) throw new RequestError('Identificador de envío inválido')
    return key
}

function getClientIp(request: Request) {
    const value = (request.headers.get('cf-connecting-ip') ?? request.headers.get('x-forwarded-for')?.split(',')[0] ?? '').trim()
    return value && /^[0-9a-f:.]+$/i.test(value) ? value : null
}

function safeName(name: string) {
    return name.normalize('NFKD').replace(/[^a-zA-Z0-9._-]/g, '_').slice(-150)
}

function mapDocumento(tipo: string) {
    return ({ solicitud_principal: 'demanda', anexo: 'otro', documento_identidad: 'dni_representante', poder: 'poder', otro: 'otro' } as Record<string, string>)[tipo]
}

async function hashRequest(payload: ValidatedIntake['payload'], files: File[]) {
    const stablePayload: Partial<IntakePayload> = { ...payload }
    delete stablePayload.captchaToken
    const fileMetadata = files.map((file) => ({ name: file.name, size: file.size, type: file.type }))
    return sha256(JSON.stringify({ payload: stablePayload, files: fileMetadata }))
}

async function sha256(value: string) {
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))
    return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

function webhookHeaders(id: string) {
    const secret = Deno.env.get('N8N_WEBHOOK_SECRET')
    return { 'Content-Type': 'application/json', 'Idempotency-Key': id, ...(secret ? { 'x-webhook-secret': secret } : {}) }
}

function requireEnv(name: string) {
    const value = Deno.env.get(name)
    if (!value) throw new Error(`${name} no configurado`)
    return value
}

function corsHeaders() {
    return { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type', 'Access-Control-Allow-Methods': 'POST, OPTIONS' }
}

function json(body: unknown, status = 200) {
    return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders(), 'Content-Type': 'application/json' } })
}
