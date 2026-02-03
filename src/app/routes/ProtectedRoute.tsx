import type { ReactNode } from 'react'

import { Navigate } from 'react-router-dom'

import { Loader } from '@/components/ui'
import { useAuthStore } from '@/store'
import { ROUTES } from '@/utils/constants'

interface ProtectedRouteProps {
    children: ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { isAuthenticated, isLoading } = useAuthStore()

    if (isLoading) {
        return <Loader />
    }

    if (!isAuthenticated) {
        return <Navigate to={ROUTES.LOGIN} replace />
    }

    return <>{children}</>
}
