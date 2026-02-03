import { ExternalLayout } from '@/components/layout'
import { Button } from '@/components/ui'
import { useAuthStore } from '@/store'

export function ExternalDashboardPage() {
    const { profile } = useAuthStore()

    const displayName = profile?.nombres_apellidos ?? profile?.razon_social ?? 'Usuario'

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
                        <p className="text-3xl font-bold text-neutral-900">0</p>
                        <p className="text-sm text-neutral-500 mt-1">Total de solicitudes</p>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-neutral-200">
                        <h3 className="text-lg font-medium text-neutral-900 mb-2">
                            En Proceso
                        </h3>
                        <p className="text-3xl font-bold text-neutral-900">0</p>
                        <p className="text-sm text-neutral-500 mt-1">Solicitudes activas</p>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-neutral-200">
                        <h3 className="text-lg font-medium text-neutral-900 mb-2">
                            Observadas
                        </h3>
                        <p className="text-3xl font-bold text-neutral-900">0</p>
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

                    <div className="text-center py-12 text-neutral-500">
                        <p>No tiene solicitudes registradas</p>
                        <p className="text-sm mt-1">
                            Cree una nueva solicitud para comenzar
                        </p>
                    </div>
                </div>
            </div>
        </ExternalLayout>
    )
}
