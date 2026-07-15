import type { CreateParteData, CreateSolicitudData, Parte, Solicitud } from '@/types'

import { supabase } from '../supabase.client'
import type { ParteResponse, SolicitudResponse } from './solicitud-service.types'

export async function createSolicitud(
    userId: string,
    solicitud: CreateSolicitudData
): Promise<SolicitudResponse> {
    const { data, error } = await supabase
        .from('solicitudes')
        .insert({
            user_id: userId,
            tipo_solicitud: solicitud.tipo_solicitud,
            materia: solicitud.materia,
            cuantia: solicitud.cuantia,
            moneda: solicitud.moneda ?? 'PEN',
            descripcion_controversia: solicitud.descripcion_controversia,
            estado: 'recibida',
        })
        .select()
        .single()

    return { data: data as Solicitud | null, error: error ? new Error(error.message) : null }
}

export async function createParte(
    solicitudId: string,
    userId: string | null,
    parte: CreateParteData
): Promise<ParteResponse> {
    const { data, error } = await supabase
        .from('partes')
        .insert({
            solicitud_id: solicitudId,
            user_id: userId,
            rol: parte.rol,
            tipo_persona: parte.tipo_persona,
            tipo_documento: parte.tipo_documento,
            numero_documento: parte.numero_documento,
            nombres_apellidos: parte.nombres_apellidos,
            razon_social: parte.razon_social,
            celular: parte.celular,
            domicilio: parte.domicilio,
        })
        .select()
        .single()

    if (data && parte.correo_electronico) {
        await supabase.from('correos_parte').insert({
            parte_id: data.id,
            correo: parte.correo_electronico,
            es_principal: true,
        })
    }

    return { data: data as Parte | null, error: error ? new Error(error.message) : null }
}
