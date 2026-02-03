import { useFormContext } from 'react-hook-form'

import { cn } from '@/lib/utils'
import { TIPOS_SOLICITUD_OPTIONS } from '@/utils/constants'

export function SolicitudTypeSelector() {
    const { register, watch, setValue } = useFormContext()
    const selectedType = watch('tipo_solicitud')

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {TIPOS_SOLICITUD_OPTIONS.map((option) => (
                <div
                    key={option.value}
                    onClick={() => setValue('tipo_solicitud', option.value, { shouldValidate: true })}
                    className={cn(
                        'cursor-pointer rounded-xl border-2 p-6 transition-all hover:border-neutral-900',
                        selectedType === option.value
                            ? 'border-neutral-900 bg-neutral-50 ring-1 ring-neutral-900'
                            : 'border-neutral-200 bg-white'
                    )}
                >
                    <input
                        type="radio"
                        value={option.value}
                        className="sr-only"
                        {...register('tipo_solicitud')}
                    />
                    <h3 className="font-semibold text-neutral-900">{option.label}</h3>
                    <p className="mt-2 text-sm text-neutral-500">{option.description}</p>
                </div>
            ))}
        </div>
    )
}
