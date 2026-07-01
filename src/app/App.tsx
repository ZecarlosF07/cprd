import { useEffect } from 'react'
import { Toaster } from 'sonner'

import { AppRouter } from '@/app/router'
import { useAuthStore } from '@/store'

export function App() {
    const initialize = useAuthStore((state) => state.initialize)

    useEffect(() => {
        void initialize()
    }, [initialize])

    return (
        <>
            <AppRouter />
            <Toaster position="top-center" richColors />
        </>
    )
}
