import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (request) => {
    if (request.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { codigo } = await request.json()
        if (!codigo || typeof codigo !== 'string') {
            throw new Error('Ingrese el código de seguimiento')
        }

        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? ''
        )
        const { data, error } = await supabase.rpc('buscar_trazabilidad_publica', { codigo: codigo.trim() })
        if (error) throw error
        if (!data?.length) throw new Error('No se encontró el documento')

        const item = data[0]
        return json({
            codigo: item.codigo,
            seccion: item.seccion,
            tramite: item.tramite,
            fechaIngreso: item.fecha_ingreso,
            estado: item.estado,
            observaciones: item.observaciones ?? [],
        })
    } catch (error) {
        return json({ error: error instanceof Error ? error.message : 'No se encontró el documento' }, 404)
    }
})

function json(body: unknown, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
}
