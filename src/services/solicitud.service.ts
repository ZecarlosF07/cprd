import type {
    ComprobantePago,
    CreateComprobantePagoData,
    CreateDocumentoData,
    CreateParteData,
    CreateSolicitudData,
    Documento,
    HistorialSolicitud,
    Parte,
    Solicitud,
    SolicitudConPartes,
} from '@/types'

import { supabase } from './supabase.client'

interface SolicitudResponse {
    data: Solicitud | null
    error: Error | null
}

interface SolicitudConPartesResponse {
    data: SolicitudConPartes | null
    error: Error | null
}

interface SolicitudesListResponse {
    data: Solicitud[]
    error: Error | null
}

interface ParteResponse {
    data: Parte | null
    error: Error | null
}

interface PartesListResponse {
    data: Parte[]
    error: Error | null
}

interface HistorialListResponse {
    data: HistorialSolicitud[]
    error: Error | null
}

interface DocumentoResponse {
    data: Documento | null
    error: Error | null
}

interface ComprobantePagoResponse {
    data: ComprobantePago | null
    error: Error | null
}

/**
 * Crear una nueva solicitud
 */
export async function createSolicitud(
    userId: string,
    solicitudData: CreateSolicitudData
): Promise<SolicitudResponse> {
    console.log('createSolicitud - Intentando crear con:', { userId, solicitudData })
    
    const { data, error } = await supabase
        .from('solicitudes')
        .insert({
            user_id: userId,
            tipo_solicitud: solicitudData.tipo_solicitud,
            materia: solicitudData.materia,
            cuantia: solicitudData.cuantia,
            moneda: solicitudData.moneda ?? 'PEN',
            descripcion_controversia: solicitudData.descripcion_controversia,
            estado: 'recibida',
        })
        .select()
        .single()

    if (error) {
        console.error('createSolicitud - Error de Supabase:', {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint,
        })
    } else {
        console.log('createSolicitud - Éxito:', data)
    }

    return {
        data: data as Solicitud | null,
        error: error ? new Error(error.message) : null,
    }
}

/**
 * Obtener solicitud por ID
 */
export async function getSolicitudById(
    solicitudId: string
): Promise<SolicitudResponse> {
    const { data, error } = await supabase
        .from('solicitudes')
        .select('*')
        .eq('id', solicitudId)
        .is('deleted_at', null)
        .single()

    return {
        data: data as Solicitud | null,
        error: error ? new Error(error.message) : null,
    }
}

/**
 * Obtener solicitud completa con partes, documentos y comprobantes
 */
export async function getSolicitudConPartes(
    solicitudId: string
): Promise<SolicitudConPartesResponse> {
    const { data: solicitud, error: solicitudError } = await supabase
        .from('solicitudes')
        .select('*')
        .eq('id', solicitudId)
        .is('deleted_at', null)
        .single()

    if (solicitudError) {
        return {
            data: null,
            error: new Error(solicitudError.message),
        }
    }

    // Ejecutar consultas en paralelo
    const [partesRes, documentosRes, comprobantesRes] = await Promise.all([
        supabase
            .from('partes')
            .select('*')
            .eq('solicitud_id', solicitudId)
            .is('deleted_at', null),
        supabase
            .from('documentos')
            .select('*')
            .eq('solicitud_id', solicitudId)
            .is('deleted_at', null)
            .order('created_at', { ascending: false }),
        supabase
            .from('comprobantes_pago')
            .select('*')
            .eq('solicitud_id', solicitudId)
            .is('deleted_at', null)
            .order('created_at', { ascending: false }),
    ])

    return {
        data: {
            ...(solicitud as Solicitud),
            partes: (partesRes.data as Parte[]) || [],
            documentos: (documentosRes.data as Documento[]) || [],
            comprobantes_pago: (comprobantesRes.data as ComprobantePago[]) || [],
        },
        error: null,
    }
}

/**
 * Obtener todas las solicitudes del usuario
 */
export async function getSolicitudesByUser(
    userId: string
): Promise<SolicitudesListResponse> {
    const { data, error } = await supabase
        .from('solicitudes')
        .select('*')
        .eq('user_id', userId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

    return {
        data: (data as Solicitud[]) || [],
        error: error ? new Error(error.message) : null,
    }
}

/**
 * Crear una parte para una solicitud
 */
export async function createParte(
    solicitudId: string,
    userId: string | null,
    parteData: CreateParteData
): Promise<ParteResponse> {
    const { data, error } = await supabase
        .from('partes')
        .insert({
            solicitud_id: solicitudId,
            user_id: userId,
            rol: parteData.rol,
            tipo_persona: parteData.tipo_persona,
            tipo_documento: parteData.tipo_documento,
            numero_documento: parteData.numero_documento,
            nombres_apellidos: parteData.nombres_apellidos,
            razon_social: parteData.razon_social,
            celular: parteData.celular,
            domicilio: parteData.domicilio,
        })
        .select()
        .single()

    if (data && parteData.correo_electronico) {
        await supabase.from('correos_parte').insert({
            parte_id: data.id,
            correo: parteData.correo_electronico,
            es_principal: true,
        })
    }

    return {
        data: data as Parte | null,
        error: error ? new Error(error.message) : null,
    }
}

/**
 * Agregar documento a solicitud
 */
export async function addDocumento(
    userId: string,
    solicitudId: string,
    docData: CreateDocumentoData
): Promise<DocumentoResponse> {
    const { data, error } = await supabase
        .from('documentos')
        .insert({
            solicitud_id: solicitudId,
            tipo_documento: docData.tipo_documento,
            nombre_archivo: docData.nombre_archivo,
            archivo_url: docData.archivo_url,
            link_externo: docData.link_externo,
            tamano_bytes: docData.tamano_bytes,
            mime_type: docData.mime_type,
            comentario: docData.comentario,
            created_by: userId,
        })
        .select()
        .single()

    if (!error && data) {
        // Registrar en historial
        await supabase.from('historial_solicitud').insert({
            solicitud_id: solicitudId,
            accion: 'documento_adjunto',
            descripcion: `Se adjuntó documento: ${docData.tipo_documento} - ${docData.nombre_archivo}`,
            user_id: userId,
            metadata: { documento_id: data.id },
        })
    }

    return {
        data: data as Documento | null,
        error: error ? new Error(error.message) : null,
    }
}

/**
 * Agregar comprobante de pago
 */
export async function addComprobantePago(
    userId: string,
    solicitudId: string,
    pagoData: CreateComprobantePagoData
): Promise<ComprobantePagoResponse> {
    const { data, error } = await supabase
        .from('comprobantes_pago')
        .insert({
            solicitud_id: solicitudId,
            archivo_url: pagoData.archivo_url,
            numero_operacion: pagoData.numero_operacion,
            monto: pagoData.monto,
            fecha_pago: pagoData.fecha_pago,
            created_by: userId,
            estado: 'pendiente', // Por defecto pendiente
        })
        .select()
        .single()

    if (!error && data) {
        // Registrar en historial
        await supabase.from('historial_solicitud').insert({
            solicitud_id: solicitudId,
            accion: 'pago_adjunto',
            descripcion: 'Se adjuntó comprobante de pago',
            user_id: userId,
            metadata: { comprobante_id: data.id },
        })
    }

    return {
        data: data as ComprobantePago | null,
        error: error ? new Error(error.message) : null,
    }
}

/**
 * Obtener partes de una solicitud
 */
export async function getPartesBySolicitud(
    solicitudId: string
): Promise<PartesListResponse> {
    const { data, error } = await supabase
        .from('partes')
        .select('*')
        .eq('solicitud_id', solicitudId)
        .is('deleted_at', null)

    return {
        data: (data as Parte[]) || [],
        error: error ? new Error(error.message) : null,
    }
}

/**
 * Obtener historial de una solicitud
 */
export async function getHistorialBySolicitud(
    solicitudId: string
): Promise<HistorialListResponse> {
    const { data, error } = await supabase
        .from('historial_solicitud')
        .select('*')
        .eq('solicitud_id', solicitudId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

    return {
        data: (data as HistorialSolicitud[]) || [],
        error: error ? new Error(error.message) : null,
    }
}

/**
 * Contar solicitudes por estado para el usuario
 */
export async function countSolicitudesByEstado(
    userId: string
): Promise<{ total: number; enProceso: number; observadas: number }> {
    const { data } = await supabase
        .from('solicitudes')
        .select('estado')
        .eq('user_id', userId)
        .is('deleted_at', null)

    if (!data) {
        return { total: 0, enProceso: 0, observadas: 0 }
    }

    const total = data.length
    const enProceso = data.filter((s) =>
        ['recibida', 'en_revision', 'subsanada'].includes(s.estado)
    ).length
    const observadas = data.filter((s) => s.estado === 'observada').length

    return { total, enProceso, observadas }
}
