import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.93.3'

const CODE_PATTERN = /^\d{4}-\d{7}$/

Deno.serve(async (request) => {
    if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders() })
    if (request.method !== 'POST') return json({ error: 'Método no permitido' }, 405)

    try {
        const body = await request.json().catch(() => ({}))
        const codigo = typeof body.codigo === 'string' ? body.codigo.trim() : ''
        if (!CODE_PATTERN.test(codigo)) return json({ error: 'Ingrese un código de seguimiento válido' }, 400)

        const supabaseUrl = Deno.env.get('SUPABASE_URL')
        const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
        if (!supabaseUrl || !serviceKey) throw new Error('Configuración de Supabase incompleta')
        const supabase = createClient(supabaseUrl, serviceKey)

        const ip = (request.headers.get('cf-connecting-ip') ?? request.headers.get('x-forwarded-for')?.split(',')[0] ?? 'unknown').trim()
        const salt = Deno.env.get('RATE_LIMIT_SALT') ?? serviceKey
        const keyHash = await sha256(`tracking:${ip}:${salt}`)
        const { data: allowed, error: rateError } = await supabase.rpc('check_public_rate_limit', {
            p_accion: 'public_tracking', p_key_hash: keyHash, p_limit: 30, p_window_seconds: 300,
        })
        if (rateError) throw rateError
        if (!allowed) return json({ error: 'Demasiadas consultas. Intente nuevamente en unos minutos.' }, 429)

        const { data, error } = await supabase.rpc('buscar_trazabilidad_publica_v2', { p_codigo: codigo })
        if (error) throw error
        if (!data?.length) return json({ error: 'No se encontró el documento' }, 404)

        const item = data[0]
        const eventos: unknown = item.eventos
        return json({
            codigo: item.codigo,
            seccion: item.seccion,
            tramite: item.tramite,
            fechaIngreso: item.fecha_ingreso,
            estado: item.estado,
            eventos: Array.isArray(eventos) ? eventos : [],
            observaciones: publicObservationDescriptions(eventos),
        })
    } catch (error) {
        console.error(error instanceof Error ? error.message : 'Error interno en public-tracking')
        return json({ error: 'No se pudo consultar la trazabilidad. Intente nuevamente.' }, 500)
    }
})

function publicObservationDescriptions(value: unknown) {
    if (!Array.isArray(value)) return []
    return value.flatMap((event: unknown) => {
        if (!event || typeof event !== 'object') return []
        if (!('tipo' in event) || event.tipo !== 'observacion') return []
        if (!('descripcion' in event) || typeof event.descripcion !== 'string') return []
        return [event.descripcion]
    })
}

async function sha256(value: string) {
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))
    return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

function corsHeaders() {
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
    }
}

function json(body: unknown, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    })
}
