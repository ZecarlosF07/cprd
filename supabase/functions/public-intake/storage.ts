import type { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.93.3'

import { mapDocumento, safeName } from './file.utils.ts'
import { cleanOptional, normalizeLink } from './payload.utils.ts'
import type { DocumentMetadata, PaymentMetadata, ValidatedIntake } from './types.ts'

export async function uploadDocuments(
    supabase: SupabaseClient,
    key: string,
    validated: ValidatedIntake,
    uploaded: string[]
): Promise<DocumentMetadata[]> {
    const documents: DocumentMetadata[] = []
    for (const [index, documento] of validated.payload.documentos.entries()) {
        const file = validated.documentFiles[index]
        const path = file
            ? await uploadFile(supabase, file, `${key}/documentos/${index}-${safeName(file.name)}`, uploaded)
            : ''
        documents.push({
            tipo_documento: mapDocumento(documento.tipoDocumento),
            nombre_archivo: file?.name ?? `enlace-${index + 1}`,
            archivo_url: path,
            link_externo: normalizeLink(documento.enlaceExterno),
            tamano_bytes: file?.size ?? null,
            mime_type: file?.type ?? null,
            comentario: cleanOptional(documento.comentario, 1000),
        })
    }
    return documents
}

export async function uploadPayment(
    supabase: SupabaseClient,
    key: string,
    validated: ValidatedIntake,
    uploaded: string[]
): Promise<PaymentMetadata | null> {
    if (!validated.payload.requierePago || !validated.paymentFile) return null
    const file = validated.paymentFile
    const path = await uploadFile(supabase, file, `${key}/pagos/comprobante-${safeName(file.name)}`, uploaded)
    return {
        archivo_url: path,
        tipo_facturacion: validated.payload.pago.tipoFacturacion,
        nombre_razon_social: validated.payload.pago.nombreRazonSocial,
        documento_facturacion: validated.payload.pago.documento,
        direccion_facturacion: validated.payload.pago.direccion,
    }
}

export async function cleanupFailedUploads(
    supabase: SupabaseClient,
    paths: string[],
    key: string,
    hash: string
) {
    if (key && hash) {
        const { data } = await supabase.rpc('get_public_intake_result', {
            p_idempotency_key: key,
            p_payload_hash: hash,
        })
        if (data?.length) return
    }
    await supabase.storage.from('solicitudes').remove(paths)
}

async function uploadFile(supabase: SupabaseClient, file: File, path: string, uploaded: string[]) {
    const { error } = await supabase.storage.from('solicitudes').upload(path, file, {
        contentType: file.type,
        upsert: true,
    })
    if (error) throw new Error(error.message)
    uploaded.push(path)
    return path
}
