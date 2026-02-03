import type { ReactNode } from 'react'

import { Navigate } from 'react-router-dom'

import { Loader } from '@/components/ui'
import { useAuthStore } from '@/store'
import { ROUTES } from '@/utils/constants'

interface ProfileRequiredRouteProps {
    children: ReactNode
}

export function ProfileRequiredRoute({ children }: ProfileRequiredRouteProps) {
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

    return <>{children}</>
}
