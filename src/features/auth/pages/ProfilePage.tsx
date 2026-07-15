import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'

import { AdminLayout, ExternalLayout, InternalLayout } from '@/components/layout'
import { ProfileForm } from '@/features/auth/components/ProfileForm'
import { profileSchema, type ProfileFormDataSchema } from '@/features/auth/schemas'
import { useAuthStore } from '@/store'
import { getDashboardRoute } from '@/utils/route.utils'

export function ProfilePage() {
    const { profile, createUserProfile, updateUserProfile, isLoading, error, clearError } = useAuthStore()
    const navigate = useNavigate()
    const isEditing = Boolean(profile)
    const form = useForm<ProfileFormDataSchema>({
        resolver: zodResolver(profileSchema),
        defaultValues: { tipo_persona: 'natural', tipo_documento: 'dni' },
    })

    useEffect(() => {
        if (!profile) return
        form.reset({
            tipo_persona: profile.tipo_persona,
            tipo_documento: profile.tipo_documento,
            numero_documento: profile.numero_documento,
            nombres_apellidos: profile.nombres_apellidos ?? '',
            razon_social: profile.razon_social ?? '',
            celular: profile.celular,
            domicilio: profile.domicilio,
        })
    }, [form, profile])

    const onSubmit = async (data: ProfileFormDataSchema) => {
        clearError()
        const success = isEditing ? await updateUserProfile(data) : await createUserProfile(data)
        if (success) void navigate(getDashboardRoute(profile?.rol ?? 'externo'), { replace: true })
    }

    const content = (
        <ProfileForm
            error={error}
            form={form}
            isEditing={isEditing}
            isLoading={isLoading}
            onCancel={() => void navigate(-1)}
            onSubmit={onSubmit}
        />
    )

    if (!profile) return <div className="min-h-screen bg-neutral-50 px-4 py-12">{content}</div>
    if (profile.rol === 'administrador') return <AdminLayout>{content}</AdminLayout>
    if (profile.rol === 'interno') return <InternalLayout>{content}</InternalLayout>
    return <ExternalLayout>{content}</ExternalLayout>
}
