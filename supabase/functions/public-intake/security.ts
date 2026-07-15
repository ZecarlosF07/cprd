import type { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.93.3'

import { RequestError } from './request-error.ts'
import type { IntakePayload, ValidatedIntake } from './types.ts'

export async function getExistingResult(supabase: SupabaseClient, key: string, hash: string) {
    const { data, error } = await supabase.rpc('get_public_intake_result', {
        p_idempotency_key: key,
        p_payload_hash: hash,
    })
    if (error) {
        const message = error.message.includes('idempotencia') ? error.message : 'No se pudo validar el reintento'
        throw new RequestError(message, 409)
    }
    const item = data?.[0]
    return item ? { codigo: item.codigo, solicitudId: item.solicitud_id, estado: item.estado } : null
}

export async function enforceRateLimit(supabase: SupabaseClient, ip: string | null, email: string) {
    const salt = Deno.env.get('RATE_LIMIT_SALT') ?? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const keyHash = await sha256(`intake:${ip ?? 'unknown'}:${email.toLowerCase()}:${salt}`)
    const { data, error } = await supabase.rpc('check_public_rate_limit', {
        p_accion: 'public_intake',
        p_key_hash: keyHash,
        p_limit: 5,
        p_window_seconds: 3600,
    })
    if (error) throw new Error(error.message)
    if (!data) throw new RequestError('Se alcanzó el límite de envíos. Intente más tarde.', 429)
}

export async function validateCaptcha(token: string, ip: string | null) {
    const secret = Deno.env.get('TURNSTILE_SECRET_KEY')
    if (!secret) throw new Error('TURNSTILE_SECRET_KEY no configurado')
    if (!token || token.length > 2048) throw new RequestError('Complete la validación de seguridad')
    const body = new URLSearchParams({ secret, response: token })
    if (ip) body.set('remoteip', ip)
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        body,
        signal: AbortSignal.timeout(8000),
    })
    const result: unknown = await response.json()
    if (!isTurnstileResult(result)) throw new RequestError('Validación de seguridad fallida')
    const expectedHost = Deno.env.get('TURNSTILE_EXPECTED_HOSTNAME')
    if (!result.success || (expectedHost && result.hostname !== expectedHost)) {
        throw new RequestError('Validación de seguridad fallida')
    }
}

export async function hashRequest(payload: ValidatedIntake['payload'], files: File[]) {
    const stablePayload: Partial<IntakePayload> = { ...payload }
    delete stablePayload.captchaToken
    const fileMetadata = files.map(({ name, size, type }) => ({ name, size, type }))
    return sha256(JSON.stringify({ payload: stablePayload, files: fileMetadata }))
}

function isTurnstileResult(value: unknown): value is { success: boolean; hostname?: string } {
    return typeof value === 'object' && value !== null && 'success' in value && typeof value.success === 'boolean'
}

async function sha256(value: string) {
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))
    return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('')
}
