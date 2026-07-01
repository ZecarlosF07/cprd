import type { SolicitudPublicaFormData } from '../types/mesa-partes-publica.types'

interface ConsentimientosFormProps {
    value: SolicitudPublicaFormData
    onChange: (value: SolicitudPublicaFormData) => void
    errorFor: (path: string) => string | undefined
}

export function ConsentimientosForm({ value, onChange, errorFor }: ConsentimientosFormProps) {
    const update = (field: 'aceptaNotificaciones' | 'aceptaDatosPersonales', checked: boolean) => {
        onChange({ ...value, [field]: checked })
    }

    return (
        <section className="space-y-3 rounded-lg border border-[#c1d0c7] bg-[#eef8df] p-4">
            <label className="flex gap-3 text-sm text-neutral-700">
                <input className="accent-[#2a7221]" type="checkbox" checked={value.aceptaNotificaciones} onChange={(event) => update('aceptaNotificaciones', event.target.checked)} />
                Acepto recibir comunicaciones sobre esta presentación al correo declarado.
            </label>
            {errorFor('aceptaNotificaciones') && <p className="text-sm text-red-600">{errorFor('aceptaNotificaciones')}</p>}
            <label className="flex gap-3 text-sm text-neutral-700">
                <input className="accent-[#2a7221]" type="checkbox" checked={value.aceptaDatosPersonales} onChange={(event) => update('aceptaDatosPersonales', event.target.checked)} />
                Acepto el tratamiento de mis datos personales para la gestión del trámite.
            </label>
            {errorFor('aceptaDatosPersonales') && <p className="text-sm text-red-600">{errorFor('aceptaDatosPersonales')}</p>}
        </section>
    )
}
