import { createClient, type SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.93.3'

Deno.serve(async (request) => {
    if (request.method !== 'POST') return json({ error: 'Método no permitido' }, 405)
    if (!isAuthorized(request)) return json({ error: 'No autorizado' }, 401)

    const webhookUrl = Deno.env.get('N8N_RECEPCION_WEBHOOK_URL')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!webhookUrl || !supabaseUrl || !serviceKey) return json({ error: 'Configuración incompleta' }, 500)

    const supabase = createClient(supabaseUrl, serviceKey)
    const { data, error } = await supabase.rpc('claim_webhook_outbox', { p_limit: 20 })
    if (error) return json({ error: 'No se pudo obtener la cola' }, 500)

    let sent = 0
    let pending = 0
    for (const item of data ?? []) {
        const result = await sendWebhook(webhookUrl, item.id, item.payload)
        await completeAttempt(supabase, item.id, result)
        if (result.success) sent += 1
        else pending += 1
    }

    return json({ processed: data?.length ?? 0, sent, pending })
})

function isAuthorized(request: Request) {
    const expected = Deno.env.get('NOTIFICATION_WORKER_SECRET')
    const received = request.headers.get('x-worker-secret')
    return Boolean(expected && received && timingSafeEqual(expected, received))
}

async function sendWebhook(url: string, id: string, payload: unknown) {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: webhookHeaders(id),
            body: JSON.stringify(payload),
            signal: AbortSignal.timeout(8000),
        })
        return { success: response.ok, status: response.status, error: response.ok ? '' : `HTTP ${response.status}` }
    } catch (error) {
        return { success: false, status: null, error: error instanceof Error ? error.message : 'Error de red' }
    }
}

async function completeAttempt(supabase: SupabaseClient, id: string, result: { success: boolean; status: number | null; error: string }) {
    const { error } = await supabase.rpc('complete_webhook_attempt', {
        p_id: id,
        p_success: result.success,
        p_status: result.status,
        p_error: result.error,
    })
    if (error) console.error(`No se pudo actualizar outbox ${id}: ${error.message}`)
}

function webhookHeaders(id: string) {
    const secret = Deno.env.get('N8N_WEBHOOK_SECRET')
    return {
        'Content-Type': 'application/json',
        'Idempotency-Key': id,
        ...(secret ? { 'x-webhook-secret': secret } : {}),
    }
}

function timingSafeEqual(left: string, right: string) {
    if (left.length !== right.length) return false
    let result = 0
    for (let index = 0; index < left.length; index += 1) result |= left.charCodeAt(index) ^ right.charCodeAt(index)
    return result === 0
}

function json(body: unknown, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: { 'Content-Type': 'application/json' },
    })
}
