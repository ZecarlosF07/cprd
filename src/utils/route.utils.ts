import type { RolUsuario } from '@/types'

import { ROUTES } from './constants'

export function getDashboardRoute(rol: RolUsuario): string {
    switch (rol) {
        case 'administrador':
            return ROUTES.DASHBOARD_ADMIN
        default:
            return ROUTES.MESA_PARTES
    }
}
