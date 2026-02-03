import type { AuthError, Session, User } from '@supabase/supabase-js'

import type { LoginCredentials, Profile, ProfileFormData, RegisterCredentials } from '@/types'

import { supabase } from './supabase.client'

interface AuthResponse {
    user: User | null
    session: Session | null
    error: AuthError | null
}

interface ProfileResponse {
    data: Profile | null
    error: Error | null
}

export async function signUp(credentials: RegisterCredentials): Promise<AuthResponse> {
    const { data, error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
    })

    return {
        user: data.user,
        session: data.session,
        error,
    }
}

export async function signIn(credentials: LoginCredentials): Promise<AuthResponse> {
    const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
    })

    return {
        user: data.user,
        session: data.session,
        error,
    }
}

export async function signOut(): Promise<{ error: AuthError | null }> {
    const { error } = await supabase.auth.signOut()
    return { error }
}

export async function getCurrentUser(): Promise<{ user: User | null; error: AuthError | null }> {
    const { data, error } = await supabase.auth.getUser()
    return { user: data.user, error }
}

export async function getSession(): Promise<{ session: Session | null; error: AuthError | null }> {
    const { data, error } = await supabase.auth.getSession()
    return { session: data.session, error }
}

export async function getProfile(userId: string): Promise<ProfileResponse> {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .is('deleted_at', null)
        .single()

    return {
        data: data as Profile | null,
        error: error ? new Error(error.message) : null,
    }
}

export async function createProfile(
    userId: string,
    profileData: ProfileFormData
): Promise<ProfileResponse> {
    const { data, error } = await supabase
        .from('profiles')
        .insert({
            user_id: userId,
            ...profileData,
            rol: 'externo',
        })
        .select()
        .single()

    return {
        data: data as Profile | null,
        error: error ? new Error(error.message) : null,
    }
}

export async function updateProfile(
    profileId: string,
    profileData: Partial<ProfileFormData>
): Promise<ProfileResponse> {
    const { data, error } = await supabase
        .from('profiles')
        .update({
            ...profileData,
            updated_at: new Date().toISOString(),
        })
        .eq('id', profileId)
        .select()
        .single()

    return {
        data: data as Profile | null,
        error: error ? new Error(error.message) : null,
    }
}

export function onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange((_, session) => {
        callback(session?.user ?? null)
    })
}
