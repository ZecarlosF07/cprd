import type { EstadoSolicitud } from '@/types'

export interface AdminParte {
    rol: string
    nombres_apellidos: string | null
    razon_social: string | null
    correo: string | null
    celular: string | null
}

export interface AdminObservacion {
    id: string
    visibilidad: 'publica' | 'interna'
    mensaje: string
    created_at: string
}

export interface AdminSolicitud {
    id: string
    codigo_expediente: string | null
    tipo_solicitud: string
    tipo_tramite: string | null
    estado: EstadoSolicitud
    created_at: string
    correo_seguimiento: string | null
    partes: AdminParte[]
    observaciones_solicitud: AdminObservacion[]
}
