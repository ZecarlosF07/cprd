import type { SolicitudInfoProps } from '../types/solicitud-detail.types'

export function SolicitudInfo({ solicitud }: SolicitudInfoProps) {
    const cuantia = solicitud.cuantia
        ? `${solicitud.moneda} ${solicitud.cuantia.toLocaleString()}`
        : 'No especificada'

    return (
        <section className="rounded-xl border border-neutral-200 bg-white p-6">
            <h2 className="mb-4 border-b pb-2 text-lg font-semibold text-neutral-900">
                Información del Procedimiento
            </h2>
            <dl className="grid grid-cols-1 gap-y-4 sm:grid-cols-2">
                <div>
                    <dt className="text-sm font-medium text-neutral-500">Materia</dt>
                    <dd className="mt-1 text-sm text-neutral-900">{solicitud.materia || '-'}</dd>
                </div>
                <div>
                    <dt className="text-sm font-medium text-neutral-500">Cuantía</dt>
                    <dd className="mt-1 text-sm text-neutral-900">{cuantia}</dd>
                </div>
                <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-neutral-500">Descripción / Controversia</dt>
                    <dd className="mt-1 whitespace-pre-wrap text-sm text-neutral-900">
                        {solicitud.descripcion_controversia || '-'}
                    </dd>
                </div>
            </dl>
        </section>
    )
}
