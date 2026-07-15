import { Link } from 'react-router-dom'

import { Button } from '@/components/ui'
import { formatDate } from '@/utils/date.utils'
import { getEstadoDisplay } from '@/utils/estado.utils'

import type { RecentSolicitudesProps } from '../types/dashboard.types'

export function RecentSolicitudes({ isLoading, solicitudes, onCreate }: RecentSolicitudesProps) {
    return (
        <section className="rounded-xl border border-neutral-200 bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-medium text-neutral-900">Solicitudes recientes</h2>
                <Button variant="primary" size="sm" onClick={onCreate}>Nueva solicitud</Button>
            </div>
            {isLoading && <p className="py-12 text-center text-neutral-500">Cargando solicitudes...</p>}
            {!isLoading && solicitudes.length === 0 && (
                <div className="py-12 text-center text-neutral-500">
                    <p>No tiene solicitudes registradas</p>
                    <p className="mt-1 text-sm">Cree una nueva solicitud para comenzar</p>
                </div>
            )}
            {!isLoading && solicitudes.length > 0 && (
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead><tr className="border-b border-neutral-200">
                            {['Código', 'Tipo', 'Estado', 'Fecha', ''].map((label) => <th key={label} className="px-2 py-3 text-sm font-medium text-neutral-600">{label}</th>)}
                        </tr></thead>
                        <tbody className="divide-y divide-neutral-100">
                            {solicitudes.map((solicitud) => {
                                const estado = getEstadoDisplay(solicitud.estado)
                                return (
                                    <tr key={solicitud.id}>
                                        <td className="px-2 py-3 text-sm font-medium">{solicitud.codigo_expediente}</td>
                                        <td className="px-2 py-3 text-sm">{solicitud.tipo_solicitud}</td>
                                        <td className="px-2 py-3"><span className={`rounded-full px-2 py-1 text-xs ${estado.bgColor} ${estado.textColor}`}>{estado.label}</span></td>
                                        <td className="px-2 py-3 text-sm text-neutral-500">{formatDate(solicitud.created_at)}</td>
                                        <td className="px-2 py-3"><Link to={`/solicitudes/${solicitud.id}`} className="text-sm font-medium text-blue-700">Ver detalle</Link></td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    )
}
