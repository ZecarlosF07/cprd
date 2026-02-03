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
    error: string | null
    initialize: () => Promise<void>
    login: (credentials: LoginCredentials) => Promise<boolean>
    register: (credentials: RegisterCredentials) => Promise<boolean>
    logout: () => Promise<void>
    createUserProfile: (profileData: ProfileFormData) => Promise<boolean>
    updateUserProfile: (profileData: Partial<ProfileFormData>) => Promise<boolean>
    clearError: () => void
}

function mapSupabaseUser(supabaseUser: SupabaseUser | null): User | null {
    if (!supabaseUser) return null
    return {
        id: supabaseUser.id,
        email: supabaseUser.email ?? '',
        created_at: supabaseUser.created_at,
    }
}

export const useAuthStore = create<AuthStore>((set, get) => ({
    user: null,
    profile: null,
    isLoading: true,
    isAuthenticated: false,
    profileChecked: false,
    error: null,

    initialize: async () => {
        set({ isLoading: true })

        const { user: supabaseUser } = await getCurrentUser()
        const user = mapSupabaseUser(supabaseUser)

        if (user) {
            const { data: profile } = await getProfile(user.id)
            set({
                user,
                profile,
                isAuthenticated: true,
                profileChecked: true,
                isLoading: false,
            })
        } else {
            set({
                user: null,
                profile: null,
                isAuthenticated: false,
                profileChecked: true,
                isLoading: false,
            })
        }

        onAuthStateChange(async (supabaseUser) => {
            const user = mapSupabaseUser(supabaseUser)
            if (user) {
                const { data: profile } = await getProfile(user.id)
                set({ user, profile, isAuthenticated: true, profileChecked: true })
            } else {
                set({ user: null, profile: null, isAuthenticated: false, profileChecked: true })
            }
        })
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
            const { data: profile } = await getProfile(user.id)
            set({
                user,
                profile,
                isAuthenticated: true,
                profileChecked: true,
                isLoading: false,
            })
            return true
        }

        set({ isLoading: false })
        return false
    },

    register: async (credentials) => {
        set({ isLoading: true, error: null })

        const { user: supabaseUser, error } = await signUp(credentials)

        if (error) {
            set({ isLoading: false, error: error.message })
            return false
        }

        const user = mapSupabaseUser(supabaseUser)

        if (user) {
            set({ user, isAuthenticated: true, isLoading: false })
            return true
        }

        set({ isLoading: false })
        return false
    },

    logout: async () => {
        set({ isLoading: true })
        await signOut()
        set({
            user: null,
            profile: null,
            isAuthenticated: false,
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

        set({ profile, isLoading: false })
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

        set({ profile, isLoading: false })
        return true
    },

    clearError: () => set({ error: null }),
}))
