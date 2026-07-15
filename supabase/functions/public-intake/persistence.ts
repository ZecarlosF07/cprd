import type { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.93.3'

import type { FinalizeInput, FinalizeResult } from './types.ts'

export async function finalizeIntake(
    supabase: SupabaseClient,
    input: FinalizeInput
): Promise<FinalizeResult> {
    const { data, error } = await supabase.rpc('finalize_public_intake', {
        p_idempotency_key: input.idempotencyKey,
        p_payload_hash: input.payloadHash,
        p_payload: input.payload,
        p_documentos: input.documentos,
        p_pago: input.pago,
        p_ip: input.ip,
        p_user_agent: input.userAgent,
        p_public_app_url: requireEnv('PUBLIC_APP_URL'),
    })
    if (error || !data?.[0]) throw new Error(error?.message ?? 'No se pudo finalizar la solicitud')
    return data[0] as FinalizeResult
}

export async function deliverReceptionWebhook(
    supabase: SupabaseClient,
    outboxId: string,
    payload: unknown
) {
    const url = Deno.env.get('N8N_RECEPCION_WEBHOOK_URL')
    if (!url || !outboxId) return
    let success = false
    let status = 0
    let errorMessage = ''
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: webhookHeaders(outboxId),
            body: JSON.stringify(payload),
            signal: AbortSignal.timeout(8000),
        })
        success = response.ok
        status = response.status
        if (!success) errorMessage = `HTTP ${status}`
    } catch (error) {
        errorMessage = error instanceof Error ? error.message : 'Error de red'
    }
    await supabase.rpc('complete_webhook_attempt', {
        p_id: outboxId,
        p_success: success,
        p_status: status || null,
        p_error: errorMessage,
    })
}

function webhookHeaders(id: string) {
    const secret = Deno.env.get('N8N_WEBHOOK_SECRET')
    return {
        'Content-Type': 'application/json',
        'Idempotency-Key': id,
        ...(secret ? { 'x-webhook-secret': secret } : {}),
    }
}

function requireEnv(name: string) {
    const value = Deno.env.get(name)
    if (!value) throw new Error(`${name} no configurado`)
    return value
}
