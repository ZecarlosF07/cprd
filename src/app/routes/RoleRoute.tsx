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
    const { isAuthenticated, profileChecked, profile } = useAuthStore()

    if (!profileChecked) {
        return <Loader />
    }

    if (!isAuthenticated) {
        return <Navigate to={ROUTES.ADMIN_LOGIN} replace />
    }

    if (!profile) {
        return <Navigate to={ROUTES.PROFILE} replace />
    }

    if (!allowedRoles.includes(profile.rol)) {
        const fallbackRoute = profile.rol === 'administrador'
            ? ROUTES.DASHBOARD_ADMIN
            : ROUTES.MESA_PARTES

        return <Navigate to={fallbackRoute} replace />
    }

    return <>{children}</>
}
