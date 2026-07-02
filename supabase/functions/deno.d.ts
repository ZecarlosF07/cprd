declare namespace Deno {
    function serve(handler: (request: Request) => Response | Promise<Response>): void

    namespace env {
        function get(name: string): string | undefined
    }
}

declare module 'https://esm.sh/@supabase/supabase-js@2.93.3' {
    export * from '@supabase/supabase-js'
}
