import type { ComprobantePago, Documento, HistorialSolicitud, Parte, Solicitud } from '@/types'

import { supabase } from '../supabase.client'
import type {
    HistorialListResponse,
    PartesListResponse,
    SolicitudConPartesResponse,
    SolicitudResponse,
    SolicitudesListResponse,
    SolicitudStats,
} from './solicitud-service.types'

export async function getSolicitudById(solicitudId: string): Promise<SolicitudResponse> {
    const { data, error } = await supabase.from('solicitudes').select('*')
        .eq('id', solicitudId).is('deleted_at', null).single()
    return { data: data as Solicitud | null, error: error ? new Error(error.message) : null }
}

export async function getSolicitudConPartes(solicitudId: string): Promise<SolicitudConPartesResponse> {
    const { data: solicitud, error } = await supabase.from('solicitudes').select('*')
        .eq('id', solicitudId).is('deleted_at', null).single()
    if (error) return { data: null, error: new Error(error.message) }

    const [partes, documentos, comprobantes] = await Promise.all([
        supabase.from('partes').select('*').eq('solicitud_id', solicitudId).is('deleted_at', null),
        supabase.from('documentos').select('*').eq('solicitud_id', solicitudId).is('deleted_at', null)
            .order('created_at', { ascending: false }),
        supabase.from('comprobantes_pago').select('*').eq('solicitud_id', solicitudId).is('deleted_at', null)
            .order('created_at', { ascending: false }),
    ])

    return {
        data: {
            ...(solicitud as Solicitud),
            partes: (partes.data as Parte[] | null) ?? [],
            documentos: (documentos.data as Documento[] | null) ?? [],
            comprobantes_pago: (comprobantes.data as ComprobantePago[] | null) ?? [],
        },
        error: null,
    }
}

export async function getSolicitudesByUser(userId: string): Promise<SolicitudesListResponse> {
    const { data, error } = await supabase.from('solicitudes').select('*')
        .eq('user_id', userId).is('deleted_at', null).order('created_at', { ascending: false })
    return { data: (data as Solicitud[] | null) ?? [], error: error ? new Error(error.message) : null }
}

export async function getPartesBySolicitud(solicitudId: string): Promise<PartesListResponse> {
    const { data, error } = await supabase.from('partes').select('*')
        .eq('solicitud_id', solicitudId).is('deleted_at', null)
    return { data: (data as Parte[] | null) ?? [], error: error ? new Error(error.message) : null }
}

export async function getHistorialBySolicitud(solicitudId: string): Promise<HistorialListResponse> {
    const { data, error } = await supabase.from('historial_solicitud').select('*')
        .eq('solicitud_id', solicitudId).is('deleted_at', null).order('created_at', { ascending: false })
    return { data: (data as HistorialSolicitud[] | null) ?? [], error: error ? new Error(error.message) : null }
}

export async function countSolicitudesByEstado(userId: string): Promise<SolicitudStats> {
    const { data } = await supabase.from('solicitudes').select('estado')
        .eq('user_id', userId).is('deleted_at', null)
    if (!data) return { total: 0, enProceso: 0, observadas: 0 }
    return {
        total: data.length,
        enProceso: data.filter(({ estado }) => ['recibida', 'en_revision', 'subsanada'].includes(estado)).length,
        observadas: data.filter(({ estado }) => estado === 'observada').length,
    }
}
