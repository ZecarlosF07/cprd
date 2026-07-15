import type { LegacyDocumento, LegacyPago, LegacySolicitudFormData } from '@/features/solicitudes/types/legacy-solicitud.types'
import type { CreateParteData } from '@/types'

import { addComprobantePago, addDocumento, createParte, createSolicitud } from './solicitud.service'
import { uploadSolicitudFile } from './storage.service'

async function requirePart(solicitudId: string, userId: string | null, data: CreateParteData) {
    const result = await createParte(solicitudId, userId, data)
    if (result.error || !result.data) throw result.error ?? new Error('No se pudo registrar una parte')
}

async function createLegacyParts(solicitudId: string, userId: string, data: LegacySolicitudFormData) {
    if (data.tipo_solicitud === 'jprd') {
        await requirePart(solicitudId, userId, { ...data.contratista, rol: 'contratista' })
        await requirePart(solicitudId, null, {
            rol: 'entidad', tipo_persona: 'juridica', tipo_documento: 'ruc',
            numero_documento: data.entidad.ruc_entidad,
            razon_social: data.entidad.nombre_entidad,
            domicilio: data.entidad.direccion_entidad,
            correo_electronico: data.entidad.correo_contacto,
        })
        return
    }

    await requirePart(solicitudId, userId, { ...data.demandante, rol: 'demandante' })
    await requirePart(solicitudId, null, { ...data.demandado, rol: 'demandado' })
}

async function uploadLegacyDocuments(userId: string, solicitudId: string, documentos: LegacyDocumento[]) {
    for (const documento of documentos) {
        const upload = await uploadSolicitudFile(solicitudId, documento.file, 'documentos')
        if (upload.error) throw upload.error
        const result = await addDocumento(userId, solicitudId, {
            tipo_documento: documento.tipo,
            nombre_archivo: documento.file.name,
            archivo_url: upload.path,
            tamano_bytes: documento.file.size,
            mime_type: documento.file.type,
            comentario: documento.comentario,
        })
        if (result.error) throw result.error
    }
}

async function uploadLegacyPayment(userId: string, solicitudId: string, pago: LegacyPago) {
    const upload = await uploadSolicitudFile(solicitudId, pago.file, 'pagos')
    if (upload.error) throw upload.error
    const result = await addComprobantePago(userId, solicitudId, {
        archivo_url: upload.path,
        numero_operacion: 'PENDIENTE',
        monto: 0,
        fecha_pago: new Date().toISOString(),
    })
    if (result.error) throw result.error
}

export async function submitLegacySolicitud(
    userId: string,
    data: LegacySolicitudFormData,
    documentos: LegacyDocumento[],
    pago: LegacyPago
) {
    if (!data.tipo_solicitud) throw new Error('Tipo de solicitud no seleccionado')
    const created = await createSolicitud(userId, { tipo_solicitud: data.tipo_solicitud })
    if (created.error || !created.data) throw created.error ?? new Error('No se pudo crear la solicitud')

    await createLegacyParts(created.data.id, userId, data)
    await uploadLegacyDocuments(userId, created.data.id, documentos)
    await uploadLegacyPayment(userId, created.data.id, pago)
    return created.data.id
}
