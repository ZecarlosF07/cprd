import { InternalLayout } from '@/components/layout'

export function InternalDashboardPage() {
    return (
        <InternalLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold text-neutral-900">
                        Bandeja de Solicitudes
                    </h1>
                    <p className="text-neutral-600 mt-1">
                        Gestione las solicitudes recibidas
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-xl border border-neutral-200">
                        <h3 className="text-sm font-medium text-neutral-500 mb-1">
                            Recibidas
                        </h3>
                        <p className="text-2xl font-bold text-neutral-900">0</p>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-neutral-200">
                        <h3 className="text-sm font-medium text-neutral-500 mb-1">
                            En Revisión
                        </h3>
                        <p className="text-2xl font-bold text-neutral-900">0</p>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-neutral-200">
                        <h3 className="text-sm font-medium text-neutral-500 mb-1">
                            Observadas
                        </h3>
                        <p className="text-2xl font-bold text-neutral-900">0</p>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-neutral-200">
                        <h3 className="text-sm font-medium text-neutral-500 mb-1">
                            Admitidas
                        </h3>
                        <p className="text-2xl font-bold text-neutral-900">0</p>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-neutral-200">
                    <div className="p-6 border-b border-neutral-200">
                        <h2 className="text-lg font-medium text-neutral-900">
                            Todas las solicitudes
                        </h2>
                    </div>

                    <div className="text-center py-12 text-neutral-500">
                        <p>No hay solicitudes pendientes</p>
                    </div>
                </div>
            </div>
        </InternalLayout>
    )
}
