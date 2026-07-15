import type { SolicitudPartiesProps } from '../types/solicitud-detail.types'

export function SolicitudParties({ partes }: SolicitudPartiesProps) {
    return (
        <section className="rounded-xl border border-neutral-200 bg-white p-6">
            <h2 className="mb-4 border-b pb-2 text-lg font-semibold text-neutral-900">Partes Involucradas</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {partes.map((parte) => (
                    <div key={parte.id} className="rounded-lg border border-neutral-100 bg-neutral-50 p-4">
                        <span className="mb-2 inline-block rounded border border-neutral-200 bg-white px-2 py-0.5 text-xs font-medium uppercase tracking-wider text-neutral-500">
                            {parte.rol}
                        </span>
                        <p className="font-medium text-neutral-900">{parte.razon_social || parte.nombres_apellidos}</p>
                        <p className="text-sm text-neutral-500">
                            {parte.tipo_documento.toUpperCase()}: {parte.numero_documento}
                        </p>
                        {parte.domicilio && <p className="mt-2 truncate text-xs text-neutral-400">📍 {parte.domicilio}</p>}
                    </div>
                ))}
            </div>
        </section>
    )
}
