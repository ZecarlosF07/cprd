import { z } from 'zod'

import type { SolicitudPublicaFormData } from '../types/mesa-partes-publica.types'
import { getTramiteByCodigo } from '../utils/tramites.utils'

const MAX_FILE_SIZE = 20 * 1024 * 1024
const MAX_TOTAL_FILE_SIZE = 20 * 1024 * 1024
const ALLOWED_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
]

const archivoSchema = z
    .custom<File>((file) => file instanceof File)
    .refine((file) => file.size <= MAX_FILE_SIZE, 'El archivo no debe superar 20 MB')
    .refine((file) => ALLOWED_TYPES.includes(file.type), 'Formato no permitido')

export const solicitudPublicaSchema = z.object({
    idempotencyKey: z.string().uuid(),
    seccion: z.enum(['arbitraje', 'jprd']),
    tramiteCodigo: z.string().min(1, 'Seleccione un trámite'),
    solicitante: z.object({
        tipoPersona: z.enum(['natural', 'juridica']),
        tipoDocumento: z.enum(['dni', 'ce', 'pasaporte', 'ruc']),
        numeroDocumento: z.string().min(3, 'Ingrese el documento'),
        nombresApellidos: z.string().min(3, 'Ingrese nombres y apellidos'),
        razonSocial: z.string(),
        representanteLegal: z.string(),
        cargoRepresentante: z.string(),
        celular: z.string().min(6, 'Ingrese celular'),
        correo: z.string().email('Ingrese un correo válido'),
        domicilio: z.string().min(3, 'Ingrese domicilio'),
    }),
    numeroExpedienteReferido: z.string(),
    sumilla: z.string(),
    asunto: z.string(),
    documentos: z.array(z.object({
        tipoDocumento: z.enum(['solicitud_principal', 'anexo', 'documento_identidad', 'poder', 'otro']),
        comentario: z.string(),
        enlaceExterno: z.string().url('Ingrese un enlace válido').or(z.literal('')),
        archivo: archivoSchema.optional(),
    })).min(1),
    pago: z.object({
        tipoFacturacion: z.enum(['boleta', 'factura_contado', 'factura_credito', 'factura']),
        nombreRazonSocial: z.string(),
        documento: z.string(),
        direccion: z.string(),
        archivo: archivoSchema.optional(),
    }),
    aceptaNotificaciones: z.literal(true, {
        error: 'Debe aceptar las notificaciones electrónicas',
    }),
    aceptaDatosPersonales: z.literal(true, {
        error: 'Debe aceptar el tratamiento de datos personales',
    }),
    captchaToken: z.string().min(1, 'Complete la validación de seguridad'),
}).superRefine((data, ctx) => {
    const tramite = getTramiteByCodigo(data.tramiteCodigo)

    if (!tramite || tramite.seccion !== data.seccion) {
        ctx.addIssue({ code: 'custom', path: ['tramiteCodigo'], message: 'Trámite inválido' })
    }

    if (data.solicitante.tipoPersona === 'juridica') {
        requireField(ctx, data.solicitante.razonSocial, ['solicitante', 'razonSocial'], 'Ingrese razón social')
        requireField(ctx, data.solicitante.representanteLegal, ['solicitante', 'representanteLegal'], 'Ingrese representante legal')
        requireField(ctx, data.solicitante.cargoRepresentante, ['solicitante', 'cargoRepresentante'], 'Ingrese cargo')
    }

    if (tramite?.requiereExpediente) {
        requireField(ctx, data.numeroExpedienteReferido, ['numeroExpedienteReferido'], 'Ingrese expediente')
    }
    if (tramite?.requiereSumilla) {
        requireField(ctx, data.sumilla, ['sumilla'], 'Ingrese sumilla')
    }
    if (tramite?.requiereAsunto) {
        requireField(ctx, data.asunto, ['asunto'], 'Ingrese asunto')
    }

    data.documentos.forEach((documento, index) => {
        if (!documento.archivo && !documento.enlaceExterno) {
            ctx.addIssue({ code: 'custom', path: ['documentos', index], message: 'Adjunte un archivo o enlace de Drive' })
        }
    })

    if (tramite?.requierePago) {
        requireField(ctx, data.pago.nombreRazonSocial, ['pago', 'nombreRazonSocial'], 'Ingrese datos de facturación')
        requireField(ctx, data.pago.documento, ['pago', 'documento'], 'Ingrese documento de facturación')
        requireField(ctx, data.pago.direccion, ['pago', 'direccion'], 'Ingrese dirección de facturación')
        if (!data.pago.archivo) {
            ctx.addIssue({ code: 'custom', path: ['pago', 'archivo'], message: 'Adjunte comprobante de pago' })
        }
    }

    const totalSize = data.documentos.reduce((total, documento) => total + (documento.archivo?.size ?? 0), 0)
        + (tramite?.requierePago ? data.pago.archivo?.size ?? 0 : 0)
    if (totalSize > MAX_TOTAL_FILE_SIZE) {
        ctx.addIssue({ code: 'custom', path: ['documentos'], message: 'Los archivos no deben superar 20 MB en total; use enlaces de Drive para archivos pesados' })
    }
})

function requireField(ctx: z.RefinementCtx, value: string, path: (string | number)[], message: string) {
    if (!value.trim()) {
        ctx.addIssue({ code: 'custom', path, message })
    }
}

export function validarSolicitudPublica(data: SolicitudPublicaFormData) {
    return solicitudPublicaSchema.safeParse(data)
}
