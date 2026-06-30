import type { User as SupabaseUser } from '@supabase/supabase-js'

import { create } from 'zustand'

import type {
    LoginCredentials,
    Profile,
    ProfileFormData,
    RegisterCredentials,
    User,
} from '@/types'

import {
    createProfile,
    getCurrentUser,
    getProfile,
    onAuthStateChange,
    signIn,
    signOut,
    signUp,
    updateProfile,
} from '@/services/auth.service'

interface AuthStore {
    user: User | null
    profile: Profile | null
    isLoading: boolean
    isAuthenticated: boolean
    profileChecked: boolean
    profileLoadError: string | null
    error: string | null
    initialize: () => Promise<void>
    login: (credentials: LoginCredentials) => Promise<boolean>
    register: (credentials: RegisterCredentials) => Promise<RegisterResult>
    logout: () => Promise<void>
    createUserProfile: (profileData: ProfileFormData) => Promise<boolean>
    updateUserProfile: (profileData: Partial<ProfileFormData>) => Promise<boolean>
    clearError: () => void
}

export type RegisterResult = 'authenticated' | 'confirmation_required' | 'error'

let authListenerInitialized = false

function mapSupabaseUser(supabaseUser: SupabaseUser | null): User | null {
    if (!supabaseUser) return null
    return {
        id: supabaseUser.id,
        email: supabaseUser.email ?? '',
        created_at: supabaseUser.created_at,
    }
}

function getRegistrationErrorMessage(code: string | undefined, fallback: string): string {
    switch (code) {
        case 'email_exists':
        case 'user_already_exists':
            return 'Este correo ya está registrado. Inicie sesión para continuar.'
        case 'weak_password':
            return 'La contraseña no cumple los requisitos de seguridad.'
        case 'email_address_invalid':
            return 'El correo electrónico no es válido.'
        case 'over_email_send_rate_limit':
        case 'over_request_rate_limit':
            return 'Se realizaron demasiados intentos. Espere unos minutos y vuelva a intentarlo.'
        case 'signup_disabled':
            return 'El registro de nuevas cuentas está deshabilitado temporalmente.'
        default:
            return fallback
    }
}

export const useAuthStore = create<AuthStore>((set, get) => ({
    user: null,
    profile: null,
    isLoading: true,
    isAuthenticated: false,
    profileChecked: false,
    profileLoadError: null,
    error: null,

    initialize: async () => {
        set({ isLoading: true, profileChecked: false, profileLoadError: null })

        const { user: supabaseUser, error: userError } = await getCurrentUser()

        if (userError) {
            set({
                isLoading: false,
                profileChecked: true,
                profileLoadError: 'No se pudo validar la sesión. Verifique su conexión.',
            })
            return
        }

        const user = mapSupabaseUser(supabaseUser)

        if (user) {
            const { data: profile, error: profileError } = await getProfile(user.id)
            set({
                user,
                profile,
                isAuthenticated: true,
                profileChecked: true,
                profileLoadError: profileError
                    ? 'No se pudo cargar el perfil. Intente nuevamente.'
                    : null,
                isLoading: false,
            })
        } else {
            set({
                user: null,
                profile: null,
                isAuthenticated: false,
                profileChecked: true,
                profileLoadError: null,
                isLoading: false,
            })
        }

        if (!authListenerInitialized) {
            authListenerInitialized = true
            onAuthStateChange(async (supabaseUser) => {
                const user = mapSupabaseUser(supabaseUser)
                if (user) {
                    const { data: profile, error: profileError } = await getProfile(user.id)
                    set((state) => {
                        const keepCurrentProfile =
                            state.user?.id === user.id && state.profile !== null

                        return {
                            user,
                            profile: keepCurrentProfile ? state.profile : profile,
                            isAuthenticated: true,
                            profileChecked: true,
                            profileLoadError:
                                profileError && !keepCurrentProfile
                                    ? 'No se pudo cargar el perfil. Intente nuevamente.'
                                    : null,
                        }
                    })
                } else {
                    set({
                        user: null,
                        profile: null,
                        isAuthenticated: false,
                        profileChecked: true,
                        profileLoadError: null,
                    })
                }
            })
        }
    },

    login: async (credentials) => {
        set({ isLoading: true, error: null })

        const { user: supabaseUser, error } = await signIn(credentials)

        if (error) {
            set({ isLoading: false, error: error.message })
            return false
        }

        const user = mapSupabaseUser(supabaseUser)

        if (user) {
            const { data: profile, error: profileError } = await getProfile(user.id)
            set({
                user,
                profile,
                isAuthenticated: true,
                profileChecked: true,
                profileLoadError: profileError
                    ? 'No se pudo cargar el perfil. Intente nuevamente.'
                    : null,
                isLoading: false,
            })
            return !profileError
        }

        set({ isLoading: false })
        return false
    },

    register: async (credentials) => {
        set({ isLoading: true, error: null })

        const { user: supabaseUser, session, error } = await signUp(credentials)

        if (error) {
            set({
                isLoading: false,
                error: getRegistrationErrorMessage(error.code, error.message),
            })
            return 'error'
        }

        const user = mapSupabaseUser(supabaseUser)

        if (user && session) {
            set({
                user,
                profile: null,
                isAuthenticated: true,
                profileChecked: true,
                profileLoadError: null,
                isLoading: false,
            })
            return 'authenticated'
        }

        if (user) {
            set({
                user: null,
                profile: null,
                isAuthenticated: false,
                profileChecked: true,
                profileLoadError: null,
                isLoading: false,
            })
            return 'confirmation_required'
        }

        set({ isLoading: false })
        return 'error'
    },

    logout: async () => {
        set({ isLoading: true })
        await signOut()
        set({
            user: null,
            profile: null,
            isAuthenticated: false,
            profileChecked: true,
            profileLoadError: null,
            isLoading: false,
        })
    },

    createUserProfile: async (profileData) => {
        const { user } = get()
        if (!user) return false

        set({ isLoading: true, error: null })

        const { data: profile, error } = await createProfile(user.id, profileData)

        if (error) {
            set({ isLoading: false, error: error.message })
            return false
        }

        set({ profile, profileLoadError: null, isLoading: false })
        return true
    },

    updateUserProfile: async (profileData) => {
        const { profile: currentProfile } = get()
        if (!currentProfile) return false

        set({ isLoading: true, error: null })

        const { data: profile, error } = await updateProfile(currentProfile.id, profileData)

        if (error) {
            set({ isLoading: false, error: error.message })
            return false
        }

        set({ profile, profileLoadError: null, isLoading: false })
        return true
    },

    clearError: () => set({ error: null }),
}))
