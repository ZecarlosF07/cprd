import { formatDateTime } from '@/utils/date.utils'

import type { TrazabilidadSummaryProps } from '../types/tracking.types'
import { trackingProcedureLabel, trackingSectionLabel, trackingStateLabel } from '../utils/tracking.utils'

export function TrazabilidadSummary({ trazabilidad }: TrazabilidadSummaryProps) {
    return (
        <section className="rounded-lg border border-[#b9cbbf] border-t-4 border-t-[#2a7221] bg-white p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <p className="text-sm font-medium text-neutral-500">Código</p>
                    <p className="mt-1 text-xl font-semibold text-[#0c211c]">{trazabilidad.codigo}</p>
                </div>
                <div className="sm:text-right">
                    <p className="text-sm font-medium text-neutral-500">Estado actual</p>
                    <span className="mt-1 inline-flex rounded-full bg-[#e9f8d2] px-3 py-1 text-sm font-semibold text-[#1f5c18]">
                        {trackingStateLabel(trazabilidad.estado)}
                    </span>
                </div>
            </div>
            <dl className="mt-5 grid gap-4 border-t border-neutral-200 pt-5 sm:grid-cols-3">
                <Item label="Sección" value={trackingSectionLabel(trazabilidad.seccion)} />
                <Item label="Trámite" value={trackingProcedureLabel(trazabilidad.tramite)} />
                <Item label="Fecha de ingreso" value={formatDateTime(trazabilidad.fechaIngreso)} />
            </dl>
        </section>
    )
}

function Item({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <dt className="text-sm font-medium text-neutral-500">{label}</dt>
            <dd className="mt-1 text-neutral-950">{value}</dd>
        </div>
    )
}
