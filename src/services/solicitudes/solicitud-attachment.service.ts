import type {
    ComprobantePago,
    CreateComprobantePagoData,
    CreateDocumentoData,
    Documento,
} from '@/types'

import { supabase } from '../supabase.client'
import type { ComprobantePagoResponse, DocumentoResponse } from './solicitud-service.types'

export async function addDocumento(
    userId: string,
    solicitudId: string,
    documento: CreateDocumentoData
): Promise<DocumentoResponse> {
    const { data, error } = await supabase
        .from('documentos')
        .insert({
            solicitud_id: solicitudId,
            tipo_documento: documento.tipo_documento,
            nombre_archivo: documento.nombre_archivo,
            archivo_url: documento.archivo_url,
            link_externo: documento.link_externo,
            tamano_bytes: documento.tamano_bytes,
            mime_type: documento.mime_type,
            comentario: documento.comentario,
            created_by: userId,
        })
        .select()
        .single()

    if (!error && data) {
        await supabase.from('historial_solicitud').insert({
            solicitud_id: solicitudId,
            accion: 'documento_adjunto',
            descripcion: `Se adjuntó documento: ${documento.tipo_documento} - ${documento.nombre_archivo}`,
            user_id: userId,
            metadata: { documento_id: data.id },
        })
    }

    return { data: data as Documento | null, error: error ? new Error(error.message) : null }
}

export async function addComprobantePago(
    userId: string,
    solicitudId: string,
    pago: CreateComprobantePagoData
): Promise<ComprobantePagoResponse> {
    const { data, error } = await supabase
        .from('comprobantes_pago')
        .insert({
            solicitud_id: solicitudId,
            archivo_url: pago.archivo_url,
            numero_operacion: pago.numero_operacion,
            monto: pago.monto,
            fecha_pago: pago.fecha_pago,
            created_by: userId,
            estado: 'pendiente',
        })
        .select()
        .single()

    if (!error && data) {
        await supabase.from('historial_solicitud').insert({
            solicitud_id: solicitudId,
            accion: 'pago_adjunto',
            descripcion: 'Se adjuntó comprobante de pago',
            user_id: userId,
            metadata: { comprobante_id: data.id },
        })
    }

    return { data: data as ComprobantePago | null, error: error ? new Error(error.message) : null }
}
