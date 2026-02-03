import { AdminLayout } from '@/components/layout'
import { Button } from '@/components/ui'

export function AdminDashboardPage() {
    return (
        <AdminLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold text-neutral-900">
                        Gestión de Usuarios
                    </h1>
                    <p className="text-neutral-600 mt-1">
                        Administre los usuarios del sistema
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-xl border border-neutral-200">
                        <h3 className="text-sm font-medium text-neutral-500 mb-1">
                            Usuarios Externos
                        </h3>
                        <p className="text-2xl font-bold text-neutral-900">0</p>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-neutral-200">
                        <h3 className="text-sm font-medium text-neutral-500 mb-1">
                            Usuarios Internos
                        </h3>
                        <p className="text-2xl font-bold text-neutral-900">0</p>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-neutral-200">
                        <h3 className="text-sm font-medium text-neutral-500 mb-1">
                            Administradores
                        </h3>
                        <p className="text-2xl font-bold text-neutral-900">1</p>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-neutral-200">
                    <div className="p-6 border-b border-neutral-200 flex items-center justify-between">
                        <h2 className="text-lg font-medium text-neutral-900">
                            Usuarios Internos
                        </h2>
                        <Button size="sm">
                            Crear usuario interno
                        </Button>
                    </div>

                    <div className="text-center py-12 text-neutral-500">
                        <p>No hay usuarios internos registrados</p>
                        <p className="text-sm mt-1">
                            Cree un nuevo usuario interno para la gestión de solicitudes
                        </p>
                    </div>
                </div>
            </div>
        </AdminLayout>
    )
}
