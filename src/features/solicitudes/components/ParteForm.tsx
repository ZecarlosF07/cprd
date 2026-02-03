import { useFormContext } from 'react-hook-form'

import { Input, Select } from '@/components/ui'
import { TIPOS_DOCUMENTO_OPTIONS, TIPOS_PERSONA_OPTIONS } from '@/utils/constants'

interface ParteFormProps {
    prefix: string
    title: string
    description?: string
}

export function ParteForm({ prefix, title, description }: ParteFormProps) {
    const {
        register,
        watch,
        formState: { errors },
    } = useFormContext()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const getError = (path: string) => {
        const parts = path.split('.')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let obj: any = errors
        for (const part of parts) {
            obj = obj?.[part]
        }
        return obj?.message as string | undefined
    }

    const tipoPersona = watch(`${prefix}.tipo_persona`)

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
                    error={getError(`${prefix}.tipo_persona`)}
                    {...register(`${prefix}.tipo_persona`)}
                />

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Select
                        label="Tipo de documento"
                        options={TIPOS_DOCUMENTO_OPTIONS}
                        error={getError(`${prefix}.tipo_documento`)}
                        {...register(`${prefix}.tipo_documento`)}
                    />

                    <Input
                        label="Número de documento"
                        error={getError(`${prefix}.numero_documento`)}
                        {...register(`${prefix}.numero_documento`)}
                    />
                </div>

                {tipoPersona === 'natural' && (
                    <Input
                        label="Nombres y apellidos"
                        error={getError(`${prefix}.nombres_apellidos`)}
                        {...register(`${prefix}.nombres_apellidos`)}
                    />
                )}

                {tipoPersona === 'juridica' && (
                    <Input
                        label="Razón social"
                        error={getError(`${prefix}.razon_social`)}
                        {...register(`${prefix}.razon_social`)}
                    />
                )}

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Input
                        label="Celular"
                        type="tel"
                        error={getError(`${prefix}.celular`)}
                        {...register(`${prefix}.celular`)}
                    />
                    <Input
                        label="Correo electrónico (para notificaciones)"
                        type="email"
                        error={getError(`${prefix}.correo_electronico`)}
                        {...register(`${prefix}.correo_electronico`)}
                    />
                </div>

                <Input
                    label="Domicilio"
                    error={getError(`${prefix}.domicilio`)}
                    {...register(`${prefix}.domicilio`)}
                />
            </div>
        </div>
    )
}
