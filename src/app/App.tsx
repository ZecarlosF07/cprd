import { useEffect } from 'react'

import { AppRouter } from '@/app/router'
import { Loader } from '@/components/ui'
import { useAuthStore } from '@/store'

export function App() {
    const { initialize, isLoading } = useAuthStore()

    useEffect(() => {
        initialize()
    }, [initialize])

    if (isLoading) {
        return <Loader />
    }

    return <AppRouter />
}
