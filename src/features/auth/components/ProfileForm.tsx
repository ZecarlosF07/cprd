import { useWatch } from 'react-hook-form'

import { Button, Input, Select } from '@/components/ui'
import { TIPOS_DOCUMENTO_OPTIONS, TIPOS_PERSONA_OPTIONS } from '@/utils/constants'

import type { ProfileFormProps } from '../types/profile-form.types'

export function ProfileForm({ error, form, isEditing, isLoading, onCancel, onSubmit }: ProfileFormProps) {
    const { control, formState: { errors }, handleSubmit, register } = form
    const tipoPersona = useWatch({ control, name: 'tipo_persona' })

    return (
        <div className="mx-auto max-w-2xl">
            <div className="rounded-xl border border-neutral-200 bg-white p-8 shadow-sm">
                <h1 className="mb-2 text-2xl font-semibold text-neutral-900">
                    {isEditing ? 'Editar perfil' : 'Completar perfil'}
                </h1>
                <p className="mb-6 text-neutral-600">
                    {isEditing ? 'Actualice sus datos personales' : 'Complete sus datos para continuar usando el sistema'}
                </p>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3"><p className="text-sm text-red-600">{error}</p></div>}
                    <Select
                        label="Tipo de persona"
                        options={TIPOS_PERSONA_OPTIONS}
                        error={errors.tipo_persona?.message}
                        {...register('tipo_persona')}
                    />
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                    <Input label="Celular" type="tel" error={errors.celular?.message} {...register('celular')} />
                    <Input label="Domicilio" error={errors.domicilio?.message} {...register('domicilio')} />
                    <div className="flex gap-4">
                        {isEditing && <Button type="button" variant="outline" fullWidth onClick={onCancel}>Cancelar</Button>}
                        <Button type="submit" fullWidth isLoading={isLoading}>
                            {isEditing ? 'Guardar cambios' : 'Completar perfil'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
