import type { ReactNode } from 'react'

import { Navigate } from 'react-router-dom'

import { Loader } from '@/components/ui'
import { useAuthStore } from '@/store'
import { ROUTES } from '@/utils/constants'

interface ProtectedRouteProps {
    children: ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { isAuthenticated, profileChecked } = useAuthStore()

    if (!profileChecked) {
        return <Loader />
    }

    if (!isAuthenticated) {
        return <Navigate to={ROUTES.ADMIN_LOGIN} replace />
    }

    return <>{children}</>
}
