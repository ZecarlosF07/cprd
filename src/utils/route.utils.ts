import type { RolUsuario } from '@/types'

import { ROUTES } from './constants'

export function getDashboardRoute(rol: RolUsuario): string {
    switch (rol) {
        case 'administrador':
            return ROUTES.DASHBOARD_ADMIN
        case 'interno':
            return ROUTES.DASHBOARD_INTERNO
        default:
            return ROUTES.DASHBOARD_EXTERNO
    }
}
