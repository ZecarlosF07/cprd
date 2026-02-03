import { z } from 'zod'

export const tipoSolicitudSchema = z.object({
    tipo_solicitud: z.enum(['arbitraje', 'arbitraje_emergencia', 'jprd']),
})

export type TipoSolicitudFormData = z.infer<typeof tipoSolicitudSchema>

// Schema para Parte (basado en CreateParteData)
const parteSchema = z.object({
    tipo_persona: z.enum(['natural', 'juridica']),
    tipo_documento: z.enum(['dni', 'ce', 'pasaporte', 'ruc']),
    numero_documento: z.string().min(1, 'Número de documento es requerido'),
    nombres_apellidos: z.string().optional(),
    razon_social: z.string().optional(),
    celular: z.string().optional(),
    domicilio: z.string().optional(),
    correo_electronico: z.string().email('Correo electrónico inválido').optional().or(z.literal('')),
}).refine((data) => {
    if (data.tipo_persona === 'natural' && !data.nombres_apellidos) {
        return false
    }
    if (data.tipo_persona === 'juridica' && !data.razon_social) {
        return false
    }
    return true
}, {
    message: 'Nombre o Razón Social es requerido según el tipo de persona',
    path: ['nombres_apellidos'], // Marcar error en este campo por defecto
})

// Schema para Arbitraje
export const arbitrajeSchema = z.object({
    // Demandado
    demandado: parteSchema,
})

export type ArbitrajeFormData = z.infer<typeof arbitrajeSchema>

// Schema para JPRD
export const jprdSchema = z.object({
    // Entidad (La tratamos como una parte con rol 'entidad')
    entidad: z.object({
        nombre_entidad: z.string().min(1, 'Nombre de la entidad es requerido'),
        ruc_entidad: z.string().length(11, 'RUC debe tener 11 dígitos'),
        direccion_entidad: z.string().min(5, 'Dirección es requerida'),
        correo_contacto: z.string().email('Correo de contacto inválido'),
    }),
})

export type JPRDFormData = z.infer<typeof jprdSchema>
