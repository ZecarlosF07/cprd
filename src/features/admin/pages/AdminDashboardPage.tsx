import { useEffect, useState } from 'react'

import { AdminLayout } from '@/components/layout'
import { Loader } from '@/components/ui'
import { AdminSolicitudPanel, AdminSolicitudesTable } from '@/features/admin/components'
import type { AdminSolicitud } from '@/features/admin/types/admin-solicitud.types'
import { actualizarEstadoSolicitud, agregarObservacionSolicitud, listSolicitudesPublicas } from '@/services'
import type { EstadoSolicitud } from '@/types'

export function AdminDashboardPage() {
    const [solicitudes, setSolicitudes] = useState<AdminSolicitud[]>([])
    const [selected, setSelected] = useState<AdminSolicitud | undefined>()
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const loadSolicitudes = async () => {
        setError(null)
        try {
            const data = await listSolicitudesPublicas()
            setSolicitudes(data)
            setSelected((current) => data.find((item) => item.id === current?.id) ?? data[0])
        } catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : 'No se pudieron cargar las solicitudes')
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        void loadSolicitudes()
    }, [])

    const handleEstadoChange = async (estado: EstadoSolicitud) => {
        if (!selected) return
        await actualizarEstadoSolicitud(selected.id, estado)
        await loadSolicitudes()
    }

    const handleObservacion = async (mensaje: string, visibilidad: 'publica' | 'interna') => {
        if (!selected) return
        await agregarObservacionSolicitud(selected.id, mensaje, visibilidad)
        await loadSolicitudes()
    }

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="rounded-lg bg-[#0c211c] px-6 py-5 text-white">
                    <p className="mb-1 text-sm font-semibold uppercase text-[#b6eb66]">Administración CPRD</p>
                    <h1 className="text-2xl font-semibold">
                        Solicitudes recibidas
                    </h1>
                    <p className="mt-1 text-[#dce8e2]">
                        Revise documentos presentados por mesa de partes pública
                    </p>
                </div>
                {isLoading && <Loader />}
                {error && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>}
                {!isLoading && !error && solicitudes.length > 0 && (
                    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
                        <AdminSolicitudesTable solicitudes={solicitudes} selectedId={selected?.id} onSelect={setSelected} />
                        <AdminSolicitudPanel key={selected?.id} solicitud={selected} onEstadoChange={handleEstadoChange} onObservacion={handleObservacion} />
                    </div>
                )}
                {!isLoading && !error && solicitudes.length === 0 && (
                    <div className="rounded-lg border border-[#c1d0c7] bg-white p-8 text-center text-neutral-500">
                        No hay solicitudes públicas registradas.
                    </div>
                )}
            </div>
        </AdminLayout>
    )
}
