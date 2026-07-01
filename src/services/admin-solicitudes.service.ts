import { supabase } from './supabase.client'

import type { EstadoSolicitud } from '@/types'
import type { AdminSolicitud } from '@/features/admin/types/admin-solicitud.types'

export async function listSolicitudesPublicas(): Promise<AdminSolicitud[]> {
    const { data, error } = await supabase
        .from('solicitudes')
        .select(`
            id,
            codigo_expediente,
            tipo_solicitud,
            tipo_tramite,
            estado,
            created_at,
            correo_seguimiento,
            partes(rol, nombres_apellidos, razon_social, correo, celular),
            observaciones_solicitud(id, visibilidad, mensaje, created_at)
        `)
        .eq('origen', 'publico')
        .neq('estado', 'borrador')
        .order('created_at', { ascending: false })

    if (error) {
        throw error
    }

    return (data ?? []) as AdminSolicitud[]
}

export async function actualizarEstadoSolicitud(id: string, estado: EstadoSolicitud) {
    const { error } = await supabase
        .from('solicitudes')
        .update({ estado })
        .eq('id', id)

    if (error) {
        throw error
    }
}

export async function agregarObservacionSolicitud(
    solicitudId: string,
    mensaje: string,
    visibilidad: 'publica' | 'interna'
) {
    const { error } = await supabase
        .from('observaciones_solicitud')
        .insert({ solicitud_id: solicitudId, mensaje, visibilidad })

    if (error) {
        throw error
    }
}
