import { useEffect } from 'react'
import { useParams } from 'react-router-dom'

import { ExternalLayout } from '@/components/layout'
import { Loader } from '@/components/ui'
import { useSolicitudStore } from '@/store'
import { SolicitudDocuments } from '../components/SolicitudDocuments'
import { SolicitudHeader } from '../components/SolicitudHeader'
import { SolicitudHistory } from '../components/SolicitudHistory'
import { SolicitudInfo } from '../components/SolicitudInfo'
import { SolicitudParties } from '../components/SolicitudParties'
import { SolicitudPayment } from '../components/SolicitudPayment'

export function SolicitudDetailPage() {
    const { id } = useParams<{ id: string }>()
    const { fetchSolicitudById, solicitudActual, partes, historial, isLoading, error } = useSolicitudStore()

    useEffect(() => {
        if (id) void fetchSolicitudById(id)
    }, [id, fetchSolicitudById])

    if (isLoading) {
        return <ExternalLayout><div className="flex h-96 items-center justify-center"><Loader /></div></ExternalLayout>
    }

    if (error || !solicitudActual) {
        return (
            <ExternalLayout>
                <div className="flex h-96 items-center justify-center text-center">
                    <p className="text-lg font-medium text-red-600">{error || 'Solicitud no encontrada'}</p>
                </div>
            </ExternalLayout>
        )
    }

    return (
        <ExternalLayout>
            <div className="mx-auto max-w-5xl space-y-8 py-6">
                <SolicitudHeader solicitud={solicitudActual} />
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    <div className="space-y-8 lg:col-span-2">
                        <SolicitudInfo solicitud={solicitudActual} />
                        <SolicitudDocuments documentos={solicitudActual.documentos ?? []} solicitudId={solicitudActual.id} />
                        <SolicitudPayment comprobantes={solicitudActual.comprobantes_pago ?? []} solicitudId={solicitudActual.id} />
                        <SolicitudParties partes={partes} />
                    </div>
                    <div><SolicitudHistory historial={historial} /></div>
                </div>
            </div>
        </ExternalLayout>
    )
}
