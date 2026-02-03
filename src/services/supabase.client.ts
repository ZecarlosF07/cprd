import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? ''

const isMissingConfig = !supabaseUrl || !supabaseAnonKey

if (isMissingConfig) {
    console.warn(
        '⚠️ Supabase environment variables are missing. ' +
        'Authentication features will not work. ' +
        'Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.'
    )
}

// Create client even with empty values to prevent crashes during development
export const supabase: SupabaseClient = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder-key'
)

export const isSupabaseConfigured = !isMissingConfig
