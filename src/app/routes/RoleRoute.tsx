import type { ReactNode } from 'react'

import { Navigate } from 'react-router-dom'

import { Loader } from '@/components/ui'
import { useAuthStore } from '@/store'
import type { RolUsuario } from '@/types'
import { ROUTES } from '@/utils/constants'
import { getDashboardRoute } from '@/utils/route.utils'

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
        return <Navigate to={ROUTES.LOGIN} replace />
    }

    if (!profile) {
        return <Navigate to={ROUTES.PROFILE} replace />
    }

    if (!allowedRoles.includes(profile.rol)) {
        return <Navigate to={getDashboardRoute(profile.rol)} replace />
    }

    return <>{children}</>
}
