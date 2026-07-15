import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import { ExternalLayout } from '@/components/layout'
import { RecentSolicitudes } from '@/features/external/components/RecentSolicitudes'
import { StatCard } from '@/features/external/components/StatCard'
import { useAuthStore, useSolicitudStore } from '@/store'
import { ROUTES } from '@/utils/constants'

export function ExternalDashboardPage() {
    const navigate = useNavigate()
    const { profile, user } = useAuthStore()
    const { solicitudes, stats, isLoading, fetchSolicitudes, fetchStats } = useSolicitudStore()

    useEffect(() => {
        if (!user?.id) return
        void fetchSolicitudes(user.id)
        void fetchStats(user.id)
    }, [user?.id, fetchSolicitudes, fetchStats])

    const displayName = profile?.nombres_apellidos ?? profile?.razon_social ?? 'Usuario'

    return (
        <ExternalLayout>
            <div className="space-y-6">
                <header>
                    <h1 className="text-2xl font-semibold text-neutral-900">Bienvenido, {displayName}</h1>
                    <p className="mt-1 text-neutral-600">Gestione sus solicitudes desde este panel</p>
                </header>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    <StatCard label="Mis Solicitudes" value={stats.total} description="Total de solicitudes" />
                    <StatCard label="En Proceso" value={stats.enProceso} description="Solicitudes activas" />
                    <StatCard label="Observadas" value={stats.observadas} description="Requieren atención" valueClassName="text-amber-700" />
                </div>
                <RecentSolicitudes
                    isLoading={isLoading}
                    solicitudes={solicitudes.slice(0, 5)}
                    onCreate={() => void navigate(ROUTES.NUEVA_SOLICITUD)}
                />
            </div>
        </ExternalLayout>
    )
}
