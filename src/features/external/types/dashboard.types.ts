import type { Solicitud } from '@/types'

export interface DashboardStats {
    total: number
    enProceso: number
    observadas: number
}

export interface StatCardProps {
    label: string
    value: number
    description: string
    valueClassName?: string
}

export interface RecentSolicitudesProps {
    isLoading: boolean
    solicitudes: Solicitud[]
    onCreate: () => void
}
