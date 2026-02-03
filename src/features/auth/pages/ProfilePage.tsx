import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'

import { ExternalLayout } from '@/components/layout'
import { Button, Input, Select } from '@/components/ui'
import { profileSchema, type ProfileFormDataSchema } from '@/features/auth/schemas'
import { useAuthStore } from '@/store'
import {
    ROUTES,
    TIPOS_DOCUMENTO_OPTIONS,
    TIPOS_PERSONA_OPTIONS,
} from '@/utils/constants'

export function ProfilePage() {
    const { profile, createUserProfile, updateUserProfile, isLoading, error, clearError } = useAuthStore()
    const navigate = useNavigate()
    const isEditing = !!profile

    const {
        register,
        handleSubmit,
        watch,
        reset,
        formState: { errors },
    } = useForm<ProfileFormDataSchema>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            tipo_persona: 'natural',
            tipo_documento: 'dni',
        },
    })

    const tipoPersona = watch('tipo_persona')

    useEffect(() => {
        if (profile) {
            reset({
                tipo_persona: profile.tipo_persona,
                tipo_documento: profile.tipo_documento,
                numero_documento: profile.numero_documento,
                nombres_apellidos: profile.nombres_apellidos ?? '',
                razon_social: profile.razon_social ?? '',
                celular: profile.celular,
                domicilio: profile.domicilio,
            })
        }
    }, [profile, reset])

    const onSubmit = async (data: ProfileFormDataSchema) => {
        clearError()
        let success: boolean

        if (isEditing) {
            success = await updateUserProfile(data)
        } else {
            success = await createUserProfile(data)
        }

        if (success) {
            navigate(ROUTES.DASHBOARD_EXTERNO)
        }
    }

    const formContent = (
        <div className="max-w-2xl mx-auto">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-neutral-200">
                <h1 className="text-2xl font-semibold text-neutral-900 mb-2">
                    {isEditing ? 'Editar perfil' : 'Completar perfil'}
                </h1>
                <p className="text-neutral-600 mb-6">
                    {isEditing
                        ? 'Actualice sus datos personales'
                        : 'Complete sus datos para continuar usando el sistema'}
                </p>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}

                    <Select
                        label="Tipo de persona"
                        options={TIPOS_PERSONA_OPTIONS}
                        error={errors.tipo_persona?.message}
                        {...register('tipo_persona')}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Select
                            label="Tipo de documento"
                            options={TIPOS_DOCUMENTO_OPTIONS}
                            error={errors.tipo_documento?.message}
                            {...register('tipo_documento')}
                        />

                        <Input
                            label="Número de documento"
                            placeholder="Ingrese su número de documento"
                            error={errors.numero_documento?.message}
                            {...register('numero_documento')}
                        />
                    </div>

                    {tipoPersona === 'natural' && (
                        <Input
                            label="Nombres y apellidos"
                            placeholder="Ingrese sus nombres y apellidos completos"
                            error={errors.nombres_apellidos?.message}
                            {...register('nombres_apellidos')}
                        />
                    )}

                    {tipoPersona === 'juridica' && (
                        <Input
                            label="Razón social"
                            placeholder="Ingrese la razón social de la empresa"
                            error={errors.razon_social?.message}
                            {...register('razon_social')}
                        />
                    )}

                    <Input
                        label="Celular"
                        type="tel"
                        placeholder="Ingrese su número de celular"
                        error={errors.celular?.message}
                        {...register('celular')}
                    />

                    <Input
                        label="Domicilio"
                        placeholder="Ingrese su dirección completa"
                        error={errors.domicilio?.message}
                        {...register('domicilio')}
                    />

                    <div className="flex gap-4">
                        {isEditing && (
                            <Button
                                type="button"
                                variant="outline"
                                fullWidth
                                onClick={() => navigate(-1)}
                            >
                                Cancelar
                            </Button>
                        )}
                        <Button type="submit" fullWidth isLoading={isLoading}>
                            {isEditing ? 'Guardar cambios' : 'Completar perfil'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )

    if (isEditing) {
        return <ExternalLayout>{formContent}</ExternalLayout>
    }

    return (
        <div className="min-h-screen bg-neutral-50 py-12 px-4">
            {formContent}
        </div>
    )
}
