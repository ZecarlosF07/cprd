import type { PublicIntakeResult, SolicitudPublicaFormData } from '@/features/mesa-partes-publica/types/mesa-partes-publica.types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? ''
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? ''

export async function submitSolicitudPublica(data: SolicitudPublicaFormData): Promise<PublicIntakeResult> {
    const formData = new FormData()
    const payload = JSON.parse(JSON.stringify(data, (_key, value) => value instanceof File ? undefined : value))

    formData.append('payload', JSON.stringify(payload))
    data.documentos.forEach((documento, index) => {
        if (documento.archivo) {
            formData.append(`documentos.${index}.archivo`, documento.archivo)
        }
    })

    if (data.pago.archivo) {
        formData.append('pago.archivo', data.pago.archivo)
    }

    const response = await fetch(`${supabaseUrl}/functions/v1/public-intake`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${anonKey}`,
            apikey: anonKey,
        },
        body: formData,
    })

    const result = await response.json().catch(() => null)

    if (!response.ok) {
        throw new Error(result?.error ?? 'No se pudo registrar la solicitud')
    }

    return result as PublicIntakeResult
}
