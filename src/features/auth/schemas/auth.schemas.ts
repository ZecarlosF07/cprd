import { z } from 'zod'

export const loginSchema = z.object({
    email: z
        .string()
        .min(1, 'El correo es requerido')
        .email('Ingrese un correo válido'),
    password: z
        .string()
        .min(1, 'La contraseña es requerida')
        .min(6, 'La contraseña debe tener al menos 6 caracteres'),
})

export const registerSchema = z
    .object({
        email: z
            .string()
            .min(1, 'El correo es requerido')
            .email('Ingrese un correo válido'),
        password: z
            .string()
            .min(1, 'La contraseña es requerida')
            .min(6, 'La contraseña debe tener al menos 6 caracteres'),
        confirmPassword: z
            .string()
            .min(1, 'Confirme su contraseña'),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'Las contraseñas no coinciden',
        path: ['confirmPassword'],
    })

const TIPOS_PERSONA = ['natural', 'juridica'] as const
const TIPOS_DOCUMENTO = ['dni', 'ce', 'pasaporte', 'ruc'] as const

export const profileSchema = z
    .object({
        tipo_persona: z.enum(TIPOS_PERSONA, { message: 'Seleccione el tipo de persona' }),
        tipo_documento: z.enum(TIPOS_DOCUMENTO, { message: 'Seleccione el tipo de documento' }),
        numero_documento: z
            .string()
            .min(1, 'El número de documento es requerido')
            .max(20, 'El número de documento es muy largo'),
        nombres_apellidos: z.string().optional(),
        razon_social: z.string().optional(),
        celular: z
            .string()
            .min(1, 'El celular es requerido')
            .min(9, 'El celular debe tener al menos 9 dígitos'),
        domicilio: z
            .string()
            .min(1, 'El domicilio es requerido')
            .max(500, 'El domicilio es muy largo'),
    })
    .refine(
        (data) => {
            if (data.tipo_persona === 'natural') {
                return !!data.nombres_apellidos && data.nombres_apellidos.length >= 3
            }
            return true
        },
        {
            message: 'Los nombres y apellidos son requeridos para persona natural',
            path: ['nombres_apellidos'],
        }
    )
    .refine(
        (data) => {
            if (data.tipo_persona === 'juridica') {
                return !!data.razon_social && data.razon_social.length >= 3
            }
            return true
        },
        {
            message: 'La razón social es requerida para persona jurídica',
            path: ['razon_social'],
        }
    )

export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
export type ProfileFormDataSchema = z.infer<typeof profileSchema>
