export type TipoPersona = 'natural' | 'juridica'

export type TipoDocumento = 'dni' | 'ce' | 'pasaporte' | 'ruc'

export type RolUsuario = 'externo' | 'interno' | 'administrador'

export interface Profile {
    id: string
    user_id: string
    tipo_persona: TipoPersona
    tipo_documento: TipoDocumento
    numero_documento: string
    nombres_apellidos: string | null
    razon_social: string | null
    celular: string
    domicilio: string
    rol: RolUsuario
    created_at: string
    updated_at: string
    deleted_at: string | null
}

export interface User {
    id: string
    email: string
    created_at: string
}

export interface AuthState {
    user: User | null
    profile: Profile | null
    isLoading: boolean
    isAuthenticated: boolean
}

export interface LoginCredentials {
    email: string
    password: string
}

export interface RegisterCredentials {
    email: string
    password: string
    confirmPassword: string
}

export interface ProfileFormData {
    tipo_persona: TipoPersona
    tipo_documento: TipoDocumento
    numero_documento: string
    nombres_apellidos?: string
    razon_social?: string
    celular: string
    domicilio: string
}
