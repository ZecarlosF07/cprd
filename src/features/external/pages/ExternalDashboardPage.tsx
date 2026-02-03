import { useEffect } from 'react'
import { Link } from 'react-router-dom'

import { ExternalLayout } from '@/components/layout'
import { Button } from '@/components/ui'
import { useAuthStore, useSolicitudStore } from '@/store'
import { formatDate } from '@/utils/date.utils'
import { getEstadoDisplay } from '@/utils/estado.utils'

export function ExternalDashboardPage() {
    const { profile, user } = useAuthStore()
    const { solicitudes, stats, isLoading, fetchSolicitudes, fetchStats } = useSolicitudStore()

    useEffect(() => {
        if (user?.id) {
            fetchSolicitudes(user.id)
            fetchStats(user.id)
        }
    }, [user?.id, fetchSolicitudes, fetchStats])

    const displayName = profile?.nombres_apellidos ?? profile?.razon_social ?? 'Usuario'
    const recentSolicitudes = solicitudes.slice(0, 5)

    return (
        <ExternalLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold text-neutral-900">
                        Bienvenido, {displayName}
                    </h1>
                    <p className="text-neutral-600 mt-1">
                        Gestione sus solicitudes desde este panel
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-xl border border-neutral-200">
                        <h3 className="text-lg font-medium text-neutral-900 mb-2">
                            Mis Solicitudes
                        </h3>
                        <p className="text-3xl font-bold text-neutral-900">{stats.total}</p>
                        <p className="text-sm text-neutral-500 mt-1">Total de solicitudes</p>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-neutral-200">
                        <h3 className="text-lg font-medium text-neutral-900 mb-2">
                            En Proceso
                        </h3>
                        <p className="text-3xl font-bold text-neutral-900">{stats.enProceso}</p>
                        <p className="text-sm text-neutral-500 mt-1">Solicitudes activas</p>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-neutral-200">
                        <h3 className="text-lg font-medium text-neutral-900 mb-2">
                            Observadas
                        </h3>
                        <p className="text-3xl font-bold text-amber-600">{stats.observadas}</p>
                        <p className="text-sm text-neutral-500 mt-1">Requieren atención</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-neutral-200">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-medium text-neutral-900">
                            Solicitudes recientes
                        </h2>
                        <Button variant="primary" size="sm" onClick={() => (window.location.href = '/solicitudes/nueva')}>
                            Nueva solicitud
                        </Button>
                    </div>

                    {isLoading ? (
                        <div className="text-center py-12 text-neutral-500">
                            <p>Cargando solicitudes...</p>
                        </div>
                    ) : recentSolicitudes.length === 0 ? (
                        <div className="text-center py-12 text-neutral-500">
                            <p>No tiene solicitudes registradas</p>
                            <p className="text-sm mt-1">
                                Cree una nueva solicitud para comenzar
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-neutral-200">
                                        <th className="py-3 px-2 text-sm font-medium text-neutral-600">Código</th>
                                        <th className="py-3 px-2 text-sm font-medium text-neutral-600">Tipo</th>
                                        <th className="py-3 px-2 text-sm font-medium text-neutral-600">Estado</th>
                                        <th className="py-3 px-2 text-sm font-medium text-neutral-600">Fecha</th>
                                        <th className="py-3 px-2 text-sm font-medium text-neutral-600"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentSolicitudes.map((sol) => {
                                        const estadoInfo = getEstadoDisplay(sol.estado)
                                        return (
                                            <tr key={sol.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                                                <td className="py-3 px-2 text-sm font-mono text-neutral-900">
                                                    {sol.codigo_expediente}
                                                </td>
                                                <td className="py-3 px-2 text-sm text-neutral-600 capitalize">
                                                    {sol.tipo_solicitud.replace('_', ' ')}
                                                </td>
                                                <td className="py-3 px-2">
                                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${estadoInfo.bgColor} ${estadoInfo.textColor}`}>
                                                        {estadoInfo.label}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-2 text-sm text-neutral-500">
                                                    {formatDate(sol.created_at)}
                                                </td>
                                                <td className="py-3 px-2">
                                                    <Link
                                                        to={`/solicitudes/${sol.id}`}
                                                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                                                    >
                                                        Ver detalle
                                                    </Link>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </ExternalLayout>
    )
}
