import { format } from 'date-fns'
import { es } from 'date-fns/locale'

import { ESTADOS_SOLICITUD_OPTIONS, TIPOS_SOLICITUD_OPTIONS } from '@/utils/constants'
import type { SolicitudHeaderProps } from '../types/solicitud-detail.types'

export function SolicitudHeader({ solicitud }: SolicitudHeaderProps) {
    const tipo = TIPOS_SOLICITUD_OPTIONS.find((item) => item.value === solicitud.tipo_solicitud)
    const estado = ESTADOS_SOLICITUD_OPTIONS.find((item) => item.value === solicitud.estado)

    return (
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
                <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-bold text-neutral-900">
                        Expediente {solicitud.codigo_expediente}
                    </h1>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${estado?.color}`}>
                        {estado?.label}
                    </span>
                </div>
                <p className="mt-1 text-sm text-neutral-500">
                    Registrado el {format(new Date(solicitud.created_at), "d 'de' MMMM 'de' yyyy", { locale: es })}
                </p>
            </div>
            <span className="self-start rounded-lg bg-neutral-100 px-3 py-1 text-sm font-medium text-neutral-700">
                {tipo?.label}
            </span>
        </div>
    )
}
