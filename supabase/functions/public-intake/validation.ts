import { ALLOWED_MIME, MAX_TOTAL_BYTES, TRAMITES } from './constants.ts'
import { normalizeLink } from './payload.utils.ts'
import { RequestError } from './request-error.ts'
import type { IntakePayload, ValidatedIntake } from './types.ts'

export function parsePayload(formData: FormData): IntakePayload {
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

export async function validatePayload(payload: IntakePayload, formData: FormData): Promise<ValidatedIntake> {
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
    if (payload.documentos[0]?.tipoDocumento !== 'solicitud_principal') throw new RequestError('Adjunte el documento principal')
    if (payload.documentos.slice(1).some((documento) => documento.tipoDocumento !== 'anexo')) throw new RequestError('Los documentos adicionales deben registrarse como anexos')

    const files: File[] = []
    const documentFiles: Array<File | null> = []
    payload.documentos.forEach((documento, index) => {
        if (!['solicitud_principal', 'anexo', 'documento_identidad', 'poder', 'otro'].includes(documento.tipoDocumento)) throw new RequestError('Tipo de documento inválido')
        const file = getFile(formData, `documentos.${index}.archivo`)
        if (!file && !normalizeLink(documento.enlaceExterno)) throw new RequestError(`Adjunte archivo o enlace en el documento ${index + 1}`)
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
    return { payload: { ...payload, tramiteNombre: tramite.nombre, requierePago: tramite.pago }, files, documentFiles, paymentFile }
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
    if (file.type === 'application/pdf') return startsWith(0x25, 0x50, 0x44, 0x46)
    if (file.type === 'image/jpeg') return startsWith(0xff, 0xd8, 0xff)
    if (file.type === 'image/png') return startsWith(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a)
    if (file.type === 'application/msword') return startsWith(0xd0, 0xcf, 0x11, 0xe0)
    if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return startsWith(0x50, 0x4b, 0x03, 0x04)
    return false
}

function getFile(formData: FormData, key: string): File | null {
    const value = formData.get(key)
    return value instanceof File && value.size > 0 ? value : null
}

function requireText(value: unknown, message: string, max: number) {
    if (typeof value !== 'string' || !value.trim() || value.trim().length > max) throw new RequestError(message)
}

function validateOptionalText(value: unknown, max: number) {
    if (value !== undefined && (typeof value !== 'string' || value.length > max)) throw new RequestError('Uno de los campos excede el tamaño permitido')
}

function isEmail(value: unknown) {
    return typeof value === 'string' && value.length <= 255 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}
