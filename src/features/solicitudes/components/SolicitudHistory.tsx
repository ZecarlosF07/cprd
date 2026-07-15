import { format } from 'date-fns'

import type { SolicitudHistoryProps } from '../types/solicitud-detail.types'

export function SolicitudHistory({ historial }: SolicitudHistoryProps) {
    return (
        <section className="rounded-xl border border-neutral-200 bg-white p-6">
            <h2 className="mb-4 border-b pb-2 text-lg font-semibold text-neutral-900">Historial</h2>
            <ul className="-mb-8">
                {historial.map((evento, index) => (
                    <li key={evento.id} className="relative pb-8">
                        {index < historial.length - 1 && (
                            <span className="absolute left-4 top-4 h-full w-0.5 bg-neutral-200" aria-hidden="true" />
                        )}
                        <div className="relative flex gap-3">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 ring-8 ring-white">
                                <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
                            </span>
                            <div className="min-w-0 flex-1 pt-1.5">
                                <p className="text-sm text-neutral-900">
                                    {evento.descripcion} <span className="font-medium text-neutral-500">({evento.accion})</span>
                                </p>
                                <time className="text-xs text-neutral-500">
                                    {format(new Date(evento.created_at), 'dd/MM/yy HH:mm')}
                                </time>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </section>
    )
}
