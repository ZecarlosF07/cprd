import type { ReactNode } from 'react'

import { Link, useNavigate } from 'react-router-dom'

import { useAuthStore } from '@/store'
import { ROUTES } from '@/utils/constants'

interface ExternalLayoutProps {
    children: ReactNode
}

export function ExternalLayout({ children }: ExternalLayoutProps) {
    const { user, profile, logout } = useAuthStore()
    const navigate = useNavigate()

    const handleLogout = async () => {
        await logout()
        navigate(ROUTES.LOGIN)
    }

    const displayName = profile?.nombres_apellidos ?? profile?.razon_social ?? user?.email

    return (
        <div className="min-h-screen bg-neutral-50">
            <header className="bg-white border-b border-neutral-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link to={ROUTES.DASHBOARD_EXTERNO} className="flex items-center">
                            <h1 className="text-xl font-bold text-neutral-900">CPRD</h1>
                        </Link>

                        <nav className="flex items-center gap-6">
                            <Link
                                to={ROUTES.DASHBOARD_EXTERNO}
                                className="text-neutral-600 hover:text-neutral-900 text-sm font-medium"
                            >
                                Mis Solicitudes
                            </Link>
                            <Link
                                to={ROUTES.PROFILE}
                                className="text-neutral-600 hover:text-neutral-900 text-sm font-medium"
                            >
                                Mi Perfil
                            </Link>
                        </nav>

                        <div className="flex items-center gap-4">
                            <span className="text-sm text-neutral-600">{displayName}</span>
                            <button
                                onClick={handleLogout}
                                className="text-sm text-neutral-500 hover:text-neutral-700"
                            >
                                Cerrar sesión
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>
        </div>
    )
}
