export function corsHeaders() {
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
    }
}

export function json(body: unknown, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    })
}

export function getClientIp(request: Request) {
    const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]
    const value = (request.headers.get('cf-connecting-ip') ?? forwarded ?? '').trim()
    return value && /^[0-9a-f:.]+$/i.test(value) ? value : null
}
