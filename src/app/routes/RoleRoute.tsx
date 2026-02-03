import type { ReactNode } from 'react'

import { Navigate } from 'react-router-dom'

import { Loader } from '@/components/ui'
import { useAuthStore } from '@/store'
import type { RolUsuario } from '@/types'
import { ROUTES } from '@/utils/constants'

interface RoleRouteProps {
    children: ReactNode
    allowedRoles: RolUsuario[]
}

export function RoleRoute({ children, allowedRoles }: RoleRouteProps) {
    const { isAuthenticated, isLoading, profile } = useAuthStore()

    if (isLoading) {
        return <Loader />
    }

    if (!isAuthenticated) {
        return <Navigate to={ROUTES.LOGIN} replace />
    }

    if (!profile) {
        return <Navigate to={ROUTES.PROFILE} replace />
    }

    if (!allowedRoles.includes(profile.rol)) {
        const redirectRoute = getDefaultRouteForRole(profile.rol)
        return <Navigate to={redirectRoute} replace />
    }

    return <>{children}</>
}

function getDefaultRouteForRole(rol: RolUsuario): string {
    switch (rol) {
        case 'administrador':
            return ROUTES.DASHBOARD_ADMIN
        case 'interno':
            return ROUTES.DASHBOARD_INTERNO
        default:
            return ROUTES.DASHBOARD_EXTERNO
    }
}
