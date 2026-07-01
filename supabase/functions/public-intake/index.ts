import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (request) => {
    if (request.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )
        const formData = await request.formData()
        const payload = JSON.parse(String(formData.get('payload') ?? '{}'))

        validatePayload(payload)
        await validateCaptcha(payload.captchaToken)

        const solicitud = await createSolicitud(supabase, payload)
        const parte = await createParte(supabase, solicitud.id, payload)
        await createCorreoParte(supabase, parte.id, payload.solicitante.correo)
        await saveDocuments(supabase, solicitud.id, payload, formData)
        await savePayment(supabase, solicitud.id, payload, formData)
        await saveConsents(supabase, solicitud.id, payload, request)
        const { data: outboxId } = await supabase.rpc('enqueue_recepcion_webhook', { solicitud_id: solicitud.id })
        await notifyReception(supabase, payload, solicitud, outboxId)

        return json({ codigo: solicitud.codigo_expediente, solicitudId: solicitud.id, estado: solicitud.estado })
    } catch (error) {
        return json({ error: error instanceof Error ? error.message : 'No se pudo registrar la solicitud' }, 400)
    }
})

function validatePayload(payload: any) {
    if (!['arbitraje', 'jprd'].includes(payload.seccion)) throw new Error('Sección inválida')
    if (!payload.tramiteCodigo) throw new Error('Seleccione un trámite')
    if (!payload.solicitante?.correo) throw new Error('Ingrese correo de seguimiento')
    if (!payload.aceptaNotificaciones || !payload.aceptaDatosPersonales) throw new Error('Debe aceptar los consentimientos')
    const hasDocument = payload.documentos?.some((doc: any) => doc.enlaceExterno)
    if (!payload.documentos?.length || (!hasDocument && payload.documentos.length === 0)) throw new Error('Adjunte documentos')
}

async function validateCaptcha(token: string | undefined) {
    const secret = Deno.env.get('TURNSTILE_SECRET_KEY')
    if (!secret) return

    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        body: new URLSearchParams({ secret, response: token ?? '' }),
    })
    const result = await response.json()
    if (!result.success) throw new Error('Validación de seguridad fallida')
}

async function createSolicitud(supabase: any, payload: any) {
    const tipoSolicitud = payload.tramiteCodigo === 'arbitraje_emergencia' ? 'arbitraje_emergencia' : payload.seccion
    const { data, error } = await supabase
        .from('solicitudes')
        .insert({
            tipo_solicitud: tipoSolicitud,
            estado: 'recibida',
            origen: 'publico',
            tipo_tramite: payload.tramiteCodigo,
            numero_expediente_referido: payload.numeroExpedienteReferido || null,
            sumilla: payload.sumilla || null,
            asunto: payload.asunto || null,
            correo_seguimiento: payload.solicitante.correo,
            descripcion_controversia: payload.asunto || payload.sumilla || payload.tramiteCodigo,
        })
        .select('id, codigo_expediente, estado, created_at')
        .single()

    if (error) throw error
    return data
}

async function createParte(supabase: any, solicitudId: string, payload: any) {
    const solicitante = payload.solicitante
    const { data, error } = await supabase
        .from('partes')
        .insert({
            solicitud_id: solicitudId,
            rol: payload.seccion === 'jprd' ? 'contratista' : 'demandante',
            tipo_persona: solicitante.tipoPersona,
            tipo_documento: solicitante.tipoDocumento,
            numero_documento: solicitante.numeroDocumento,
            nombres_apellidos: solicitante.nombresApellidos,
            razon_social: solicitante.razonSocial || null,
            representante_legal: solicitante.representanteLegal || null,
            cargo_representante: solicitante.cargoRepresentante || null,
            celular: solicitante.celular,
            correo: solicitante.correo,
            domicilio: solicitante.domicilio,
        })
        .select('id')
        .single()

    if (error) throw error
    return data
}

async function createCorreoParte(supabase: any, parteId: string, correo: string) {
    const { error } = await supabase.from('correos_parte').insert({ parte_id: parteId, correo, es_principal: true })
    if (error) throw error
}

async function saveDocuments(supabase: any, solicitudId: string, payload: any, formData: FormData) {
    for (const [index, documento] of payload.documentos.entries()) {
        const file = formData.get(`documentos.${index}.archivo`) as File | null
        const uploadedPath = file ? await uploadFile(supabase, file, `${solicitudId}/documentos`) : null
        if (!uploadedPath && !documento.enlaceExterno) continue

        const { error } = await supabase.from('documentos').insert({
            solicitud_id: solicitudId,
            tipo_documento: mapDocumento(documento.tipoDocumento),
            nombre_archivo: file?.name ?? `enlace-${index + 1}`,
            archivo_url: uploadedPath,
            link_externo: documento.enlaceExterno || null,
            tamano_bytes: file?.size ?? null,
            mime_type: file?.type ?? null,
            comentario: documento.comentario || null,
            actor_tipo: 'publico',
        })
        if (error) throw error
    }
}

async function savePayment(supabase: any, solicitudId: string, payload: any, formData: FormData) {
    const file = formData.get('pago.archivo') as File | null
    if (!file) return

    const uploadedPath = await uploadFile(supabase, file, `${solicitudId}/pagos`)
    const { error } = await supabase.from('comprobantes_pago').insert({
        solicitud_id: solicitudId,
        archivo_url: uploadedPath,
        actor_tipo: 'publico',
        tipo_facturacion: payload.pago.tipoFacturacion,
        nombre_razon_social: payload.pago.nombreRazonSocial,
        documento_facturacion: payload.pago.documento,
        direccion_facturacion: payload.pago.direccion,
    })
    if (error) throw error
}

async function saveConsents(supabase: any, solicitudId: string, payload: any, request: Request) {
    const { error } = await supabase.from('consentimientos_solicitud').insert({
        solicitud_id: solicitudId,
        acepta_notificaciones: payload.aceptaNotificaciones,
        acepta_datos_personales: payload.aceptaDatosPersonales,
        ip: request.headers.get('x-forwarded-for')?.split(',')[0] ?? null,
        user_agent: request.headers.get('user-agent'),
    })
    if (error) throw error
}

async function uploadFile(supabase: any, file: File, folder: string) {
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const path = `${folder}/${crypto.randomUUID()}-${safeName}`
    const { error } = await supabase.storage.from('solicitudes').upload(path, file, {
        contentType: file.type,
        upsert: false,
    })
    if (error) throw error
    return path
}

async function notifyReception(supabase: any, payload: any, solicitud: any, outboxId?: string) {
    const webhookUrl = Deno.env.get('N8N_RECEPCION_WEBHOOK_URL')
    if (!webhookUrl) return

    const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(Deno.env.get('N8N_WEBHOOK_SECRET') ? { 'x-webhook-secret': Deno.env.get('N8N_WEBHOOK_SECRET')! } : {}),
        },
        body: JSON.stringify({
            evento: 'recepcion_documento',
            codigo: solicitud.codigo_expediente,
            solicitud_id: solicitud.id,
            seccion: payload.seccion,
            tramite: payload.tramiteCodigo,
            estado: solicitud.estado,
            fecha_recepcion: solicitud.created_at,
            correo_destino: payload.solicitante.correo,
            solicitante: payload.solicitante,
        }),
    }).catch(() => undefined)

    if (response?.ok && outboxId) {
        await supabase.from('webhook_outbox').update({
            estado: 'enviado',
            intentos: 1,
            processed_at: new Date().toISOString(),
        }).eq('id', outboxId)
    }
}

function mapDocumento(tipo: string) {
    const map: Record<string, string> = {
        solicitud_principal: 'demanda',
        anexo: 'otro',
        documento_identidad: 'dni_representante',
        poder: 'poder',
        otro: 'otro',
    }
    return map[tipo] ?? 'otro'
}

function json(body: unknown, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
}
