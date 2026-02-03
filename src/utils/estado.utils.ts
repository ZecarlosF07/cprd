import type { EstadoSolicitud } from '@/types'

interface EstadoDisplay {
    label: string
    bgColor: string
    textColor: string
}

const ESTADO_MAP: Record<EstadoSolicitud, EstadoDisplay> = {
    recibida: {
        label: 'Recibida',
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-800',
    },
    en_revision: {
        label: 'En Revisión',
        bgColor: 'bg-purple-100',
        textColor: 'text-purple-800',
    },
    observada: {
        label: 'Observada',
        bgColor: 'bg-amber-100',
        textColor: 'text-amber-800',
    },
    subsanada: {
        label: 'Subsanada',
        bgColor: 'bg-cyan-100',
        textColor: 'text-cyan-800',
    },
    admitida: {
        label: 'Admitida',
        bgColor: 'bg-green-100',
        textColor: 'text-green-800',
    },
    rechazada: {
        label: 'Rechazada',
        bgColor: 'bg-red-100',
        textColor: 'text-red-800',
    },
    archivada: {
        label: 'Archivada',
        bgColor: 'bg-neutral-100',
        textColor: 'text-neutral-600',
    },
}

/**
 * Obtiene la configuración de display para un estado de solicitud
 */
export function getEstadoDisplay(estado: EstadoSolicitud): EstadoDisplay {
    return ESTADO_MAP[estado] ?? {
        label: estado,
        bgColor: 'bg-neutral-100',
        textColor: 'text-neutral-600',
    }
}
