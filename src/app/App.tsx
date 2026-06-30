import { useEffect } from 'react'
import { Toaster } from 'sonner'

import { AppRouter } from '@/app/router'
import { Button, Loader } from '@/components/ui'
import { useAuthStore } from '@/store'

export function App() {
    const { initialize, profileChecked, profileLoadError } = useAuthStore()

    useEffect(() => {
        initialize()
    }, [initialize])

    if (!profileChecked) {
        return <Loader />
    }

    if (profileLoadError) {
        return (
            <main className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
                <div className="w-full max-w-md bg-white border border-neutral-200 p-6 text-center">
                    <h1 className="text-xl font-semibold text-neutral-900">
                        No se pudo cargar la cuenta
                    </h1>
                    <p className="mt-2 text-sm text-neutral-600">{profileLoadError}</p>
                    <Button className="mt-6" onClick={() => void initialize()}>
                        Reintentar
                    </Button>
                </div>
            </main>
        )
    }

    return (
        <>
            <AppRouter />
            <Toaster position="top-center" richColors />
        </>
    )
}
