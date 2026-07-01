import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async () => {
    const webhookUrl = Deno.env.get('N8N_RECEPCION_WEBHOOK_URL')
    if (!webhookUrl) {
        return json({ processed: 0, skipped: 'N8N_RECEPCION_WEBHOOK_URL no configurado' })
    }

    const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )
    const { data, error } = await supabase
        .from('webhook_outbox')
        .select('id, payload, intentos')
        .eq('evento', 'recepcion_documento')
        .eq('estado', 'pendiente')
        .order('created_at', { ascending: true })
        .limit(20)

    if (error) return json({ error: error.message }, 500)

    let processed = 0
    for (const item of data ?? []) {
        try {
            const response = await fetch(webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(Deno.env.get('N8N_WEBHOOK_SECRET') ? { 'x-webhook-secret': Deno.env.get('N8N_WEBHOOK_SECRET')! } : {}),
                },
                body: JSON.stringify(item.payload),
            })

            if (!response.ok) throw new Error(`HTTP ${response.status}`)

            await supabase.from('webhook_outbox').update({
                estado: 'enviado',
                intentos: item.intentos + 1,
                processed_at: new Date().toISOString(),
            }).eq('id', item.id)
            processed += 1
        } catch (sendError) {
            await supabase.from('webhook_outbox').update({
                estado: 'fallido',
                intentos: item.intentos + 1,
                ultimo_error: sendError instanceof Error ? sendError.message : 'Error desconocido',
            }).eq('id', item.id)
        }
    }

    return json({ processed })
})

function json(body: unknown, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: { 'Content-Type': 'application/json' },
    })
}
