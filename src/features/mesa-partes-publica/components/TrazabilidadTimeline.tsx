import { formatDateTime } from '@/utils/date.utils'

import type { TrazabilidadTimelineProps } from '../types/tracking.types'
import { trackingStateLabel } from '../utils/tracking.utils'

export function TrazabilidadTimeline({ eventos }: TrazabilidadTimelineProps) {
    return (
        <section className="rounded-lg border border-[#b9cbbf] bg-white p-5 sm:p-6">
            <div className="mb-6">
                <h2 className="text-xl font-semibold text-[#0c211c]">Historial del trámite</h2>
                <p className="mt-1 text-sm text-neutral-600">Eventos públicos ordenados desde la recepción del documento.</p>
            </div>
            {eventos.length === 0 ? (
                <p className="rounded-md bg-neutral-50 p-4 text-sm text-neutral-600">Aún no existen eventos públicos.</p>
            ) : (
                <ol className="space-y-0">
                    {eventos.map((evento, index) => (
                        <li key={evento.id} className="relative grid grid-cols-[24px_1fr] gap-4 pb-7 last:pb-0">
                            {index < eventos.length - 1 && <span className="absolute left-[11px] top-5 h-full w-0.5 bg-[#cfe0d4]" aria-hidden="true" />}
                            <span className={`relative mt-1 h-6 w-6 rounded-full border-4 border-white ring-2 ${evento.tipo === 'observacion' ? 'bg-amber-500 ring-amber-200' : 'bg-[#2a7221] ring-[#b6eb66]'}`} />
                            <div>
                                <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                                    <h3 className="font-semibold text-[#0c211c]">{evento.titulo}</h3>
                                    <time className="shrink-0 text-xs text-neutral-500">{formatDateTime(evento.fecha)}</time>
                                </div>
                                {evento.descripcion && <p className="mt-1 text-sm text-neutral-700">{evento.descripcion}</p>}
                                {evento.estadoNuevo && (
                                    <p className="mt-2 text-xs font-medium text-neutral-600">
                                        {trackingStateLabel(evento.estadoAnterior) ?? 'Inicio'} → {trackingStateLabel(evento.estadoNuevo)}
                                    </p>
                                )}
                            </div>
                        </li>
                    ))}
                </ol>
            )}
        </section>
    )
}
