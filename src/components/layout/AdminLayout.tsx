import type { ReactNode } from 'react'

import { Link, useNavigate } from 'react-router-dom'

import { useAuthStore } from '@/store'
import { ROUTES } from '@/utils/constants'

interface AdminLayoutProps {
    children: ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
    const { user, logout } = useAuthStore()
    const navigate = useNavigate()

    const handleLogout = async () => {
        await logout()
        navigate(ROUTES.LOGIN)
    }

    return (
        <div className="min-h-screen bg-neutral-50">
            <header className="bg-neutral-800 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link to={ROUTES.DASHBOARD_ADMIN} className="flex items-center">
                            <h1 className="text-xl font-bold">CPRD - Administración</h1>
                        </Link>

                        <nav className="flex items-center gap-6">
                            <Link
                                to={ROUTES.DASHBOARD_ADMIN}
                                className="text-neutral-300 hover:text-white text-sm font-medium"
                            >
                                Usuarios
                            </Link>
                            <Link
                                to={`${ROUTES.DASHBOARD_ADMIN}/configuracion`}
                                className="text-neutral-300 hover:text-white text-sm font-medium"
                            >
                                Configuración
                            </Link>
                        </nav>

                        <div className="flex items-center gap-4">
                            <span className="text-sm text-neutral-300">{user?.email}</span>
                            <button
                                onClick={handleLogout}
                                className="text-sm text-neutral-400 hover:text-white"
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
