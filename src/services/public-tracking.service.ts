import type { TrazabilidadPublica } from '@/features/mesa-partes-publica/types/mesa-partes-publica.types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? ''
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? ''

export async function buscarTrazabilidadPublica(codigo: string): Promise<TrazabilidadPublica> {
    const response = await fetch(`${supabaseUrl}/functions/v1/public-tracking`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${anonKey}`,
            apikey: anonKey,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ codigo }),
    })

    const result = await response.json().catch(() => null)

    if (!response.ok) {
        throw new Error(result?.error ?? 'No se encontró el documento')
    }

    return result as TrazabilidadPublica
}
