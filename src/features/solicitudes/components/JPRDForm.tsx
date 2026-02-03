import { useFormContext } from 'react-hook-form'

import { Input } from '@/components/ui'

import { ParteForm } from './ParteForm'

export function JPRDForm() {
    const {
        register,
        formState: { errors },
    } = useFormContext()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const getError = (name: string) => {
        const parts = name.split('.')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let obj: any = errors
        for (const part of parts) {
            obj = obj?.[part]
        }
        return obj?.message as string | undefined
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <ParteForm
                prefix="contratista"
                title="Datos del Solicitante / Contratista"
                description="Sus datos como parte solicitante."
            />

            <hr className="border-neutral-200" />

            <div className="space-y-6 rounded-xl border border-neutral-200 bg-white p-6">
                <div>
                    <h3 className="text-lg font-medium text-neutral-900">Datos de la Entidad</h3>
                    <p className="text-sm text-neutral-500">Información de la entidad pública involucrada.</p>
                </div>

                <div className="grid gap-6">
                    <Input
                        label="Nombre de la Entidad"
                        error={getError('entidad.nombre_entidad')}
                        {...register('entidad.nombre_entidad')}
                    />

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <Input
                            label="RUC de la Entidad"
                            maxLength={11}
                            error={getError('entidad.ruc_entidad')}
                            {...register('entidad.ruc_entidad')}
                        />
                        <Input
                            label="Correo de Contacto"
                            type="email"
                            error={getError('entidad.correo_contacto')}
                            {...register('entidad.correo_contacto')}
                        />
                    </div>

                    <Input
                        label="Dirección de la Entidad"
                        error={getError('entidad.direccion_entidad')}
                        {...register('entidad.direccion_entidad')}
                    />
                </div>
            </div>

            {/* Información del Procedimiento eliminada por requerimiento */}

        </div>
    )
}
