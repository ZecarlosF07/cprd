import { useFormContext } from 'react-hook-form'

import { Input, Select } from '@/components/ui'
import { TIPOS_DOCUMENTO_OPTIONS, TIPOS_PERSONA_OPTIONS } from '@/utils/constants'

import type { LegacySolicitudFormData } from '../types/legacy-solicitud.types'

interface ParteFormProps {
    prefix: 'demandante' | 'demandado' | 'contratista'
    title: string
    description?: string
}

export function ParteForm({ prefix, title, description }: ParteFormProps) {
    const {
        register,
        watch,
        formState: { errors },
    } = useFormContext<LegacySolicitudFormData>()

    const tipoPersona = watch(`${prefix}.tipo_persona`)
    const partErrors = errors[prefix]

    return (
        <div className="space-y-6 rounded-xl border border-neutral-200 bg-white p-6">
            <div>
                <h3 className="text-lg font-medium text-neutral-900">{title}</h3>
                {description && <p className="text-sm text-neutral-500">{description}</p>}
            </div>

            <div className="grid gap-6">
                <Select
                    label="Tipo de persona"
                    options={TIPOS_PERSONA_OPTIONS}
                    error={partErrors?.tipo_persona?.message}
                    {...register(`${prefix}.tipo_persona`)}
                />

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Select
                        label="Tipo de documento"
                        options={TIPOS_DOCUMENTO_OPTIONS}
                        error={partErrors?.tipo_documento?.message}
                        {...register(`${prefix}.tipo_documento`)}
                    />

                    <Input
                        label="Número de documento"
                        error={partErrors?.numero_documento?.message}
                        {...register(`${prefix}.numero_documento`)}
                    />
                </div>

                {tipoPersona === 'natural' && (
                    <Input
                        label="Nombres y apellidos"
                        error={partErrors?.nombres_apellidos?.message}
                        {...register(`${prefix}.nombres_apellidos`)}
                    />
                )}

                {tipoPersona === 'juridica' && (
                    <Input
                        label="Razón social"
                        error={partErrors?.razon_social?.message}
                        {...register(`${prefix}.razon_social`)}
                    />
                )}

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Input
                        label="Celular"
                        type="tel"
                        error={partErrors?.celular?.message}
                        {...register(`${prefix}.celular`)}
                    />
                    <Input
                        label="Correo electrónico (para notificaciones)"
                        type="email"
                        error={partErrors?.correo_electronico?.message}
                        {...register(`${prefix}.correo_electronico`)}
                    />
                </div>

                <Input
                    label="Domicilio"
                    error={partErrors?.domicilio?.message}
                    {...register(`${prefix}.domicilio`)}
                />
            </div>
        </div>
    )
}
