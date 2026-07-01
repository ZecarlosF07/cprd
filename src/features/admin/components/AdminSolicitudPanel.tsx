import { useEffect, useState } from 'react'

import { Button, Select, Textarea } from '@/components/ui'
import { ESTADOS_SOLICITUD_OPTIONS } from '@/utils/constants'
import type { EstadoSolicitud } from '@/types'

import type { AdminSolicitud } from '../types/admin-solicitud.types'

interface AdminSolicitudPanelProps {
    solicitud?: AdminSolicitud
    onEstadoChange: (estado: EstadoSolicitud) => Promise<void>
    onObservacion: (mensaje: string, visibilidad: 'publica' | 'interna') => Promise<void>
}

export function AdminSolicitudPanel({ solicitud, onEstadoChange, onObservacion }: AdminSolicitudPanelProps) {
    const [estado, setEstado] = useState<EstadoSolicitud>(solicitud?.estado ?? 'recibida')
    const [mensaje, setMensaje] = useState('')
    const [visibilidad, setVisibilidad] = useState<'publica' | 'interna'>('publica')
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        if (solicitud) {
            setEstado(solicitud.estado)
        }
    }, [solicitud])

    if (!solicitud) {
        return <div className="rounded-lg border border-[#b9cbbf] bg-white p-6 text-neutral-500">Seleccione una solicitud.</div>
    }

    const saveObservacion = async () => {
        if (!mensaje.trim()) return
        setIsSaving(true)
        await onObservacion(mensaje.trim(), visibilidad)
        setMensaje('')
        setIsSaving(false)
    }

    return (
        <aside className="space-y-5 rounded-lg border border-[#b9cbbf] border-t-4 border-t-[#2a7221] bg-white p-5">
            <div>
                <h2 className="text-lg font-semibold text-[#0c211c]">{solicitud.codigo_expediente}</h2>
                <p className="text-sm text-neutral-600">{solicitud.tipo_tramite ?? solicitud.tipo_solicitud}</p>
            </div>
            <Select label="Estado" value={estado} onChange={(event) => setEstado(event.target.value as EstadoSolicitud)} options={ESTADOS_SOLICITUD_OPTIONS.filter((option) => option.value !== 'borrador')} />
            <Button type="button" fullWidth onClick={() => onEstadoChange(estado)}>
                Actualizar estado
            </Button>
            <div className="space-y-3">
                <Select label="Visibilidad de observación" value={visibilidad} onChange={(event) => setVisibilidad(event.target.value as 'publica' | 'interna')} options={[{ value: 'publica', label: 'Pública' }, { value: 'interna', label: 'Interna' }]} />
                <Textarea label="Observación" value={mensaje} onChange={(event) => setMensaje(event.target.value)} />
                <Button type="button" variant="outline" fullWidth isLoading={isSaving} onClick={saveObservacion}>
                    Agregar observación
                </Button>
            </div>
            {solicitud.observaciones_solicitud.length > 0 && (
                <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-[#1f5c18]">Observaciones</h3>
                    {solicitud.observaciones_solicitud.map((observacion) => (
                        <p key={observacion.id} className="rounded-md bg-[#eef8df] p-3 text-sm text-neutral-700">
                            [{observacion.visibilidad}] {observacion.mensaje}
                        </p>
                    ))}
                </div>
            )}
        </aside>
    )
}
