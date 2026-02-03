export const ROLES = {
    EXTERNO: 'externo',
    INTERNO: 'interno',
    ADMINISTRADOR: 'administrador',
} as const

export const TIPOS_PERSONA = {
    NATURAL: 'natural',
    JURIDICA: 'juridica',
} as const

export const TIPOS_DOCUMENTO = {
    DNI: 'dni',
    CE: 'ce',
    PASAPORTE: 'pasaporte',
    RUC: 'ruc',
} as const

export const TIPOS_DOCUMENTO_OPTIONS = [
    { value: 'dni', label: 'DNI' },
    { value: 'ce', label: 'Carné de Extranjería' },
    { value: 'pasaporte', label: 'Pasaporte' },
    { value: 'ruc', label: 'RUC' },
] as const

export const TIPOS_PERSONA_OPTIONS = [
    { value: 'natural', label: 'Persona Natural' },
    { value: 'juridica', label: 'Persona Jurídica' },
] as const

export const ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    REGISTER: '/registro',
    PROFILE: '/perfil',
    DASHBOARD_EXTERNO: '/dashboard',
    DASHBOARD_INTERNO: '/interno',
    DASHBOARD_ADMIN: '/admin',
} as const
