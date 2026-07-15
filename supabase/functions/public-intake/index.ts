import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.93.3'

import { corsHeaders, getClientIp, json } from './http.ts'
import { requireUuid } from './payload.utils.ts'
import { deliverReceptionWebhook, finalizeIntake } from './persistence.ts'
import { RequestError } from './request-error.ts'
import { enforceRateLimit, getExistingResult, hashRequest, validateCaptcha } from './security.ts'
import { cleanupFailedUploads, uploadDocuments, uploadPayment } from './storage.ts'
import { parsePayload, validatePayload } from './validation.ts'

Deno.serve(async (request) => {
    if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders() })
    if (request.method !== 'POST') return json({ error: 'Método no permitido' }, 405)

    const supabase = createServiceClient()
    const uploadedPaths: string[] = []
    let idempotencyKey = ''
    let payloadHash = ''

    try {
        const formData = await request.formData()
        const rawPayload = parsePayload(formData)
        idempotencyKey = requireUuid(rawPayload.idempotencyKey)
        const validated = await validatePayload(rawPayload, formData)
        payloadHash = await hashRequest(validated.payload, validated.files)

        const previous = await getExistingResult(supabase, idempotencyKey, payloadHash)
        if (previous) return json(previous)

        const ip = getClientIp(request)
        await enforceRateLimit(supabase, ip, validated.payload.solicitante.correo)
        await validateCaptcha(validated.payload.captchaToken, ip)

        const documentos = await uploadDocuments(supabase, idempotencyKey, validated, uploadedPaths)
        const pago = await uploadPayment(supabase, idempotencyKey, validated, uploadedPaths)
        const result = await finalizeIntake(supabase, {
            idempotencyKey,
            payloadHash,
            payload: validated.payload,
            documentos,
            pago,
            ip,
            userAgent: request.headers.get('user-agent'),
        })

        await deliverReceptionWebhook(supabase, result.outbox_id, result.webhook_payload)
        return json({ codigo: result.codigo, solicitudId: result.solicitud_id, estado: result.estado })
    } catch (error) {
        if (uploadedPaths.length) {
            await cleanupFailedUploads(supabase, uploadedPaths, idempotencyKey, payloadHash)
        }
        if (error instanceof RequestError) return json({ error: error.message }, error.status)
        console.error(error instanceof Error ? error.message : 'Error interno en public-intake')
        return json({ error: 'No se pudo registrar la solicitud. Intente nuevamente.' }, 500)
    }
})

function createServiceClient() {
    const url = Deno.env.get('SUPABASE_URL')
    const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!url || !key) throw new Error('Configuración de Supabase incompleta')
    return createClient(url, key)
}
