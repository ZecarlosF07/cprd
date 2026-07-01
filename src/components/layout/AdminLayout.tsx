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
        navigate(ROUTES.ADMIN_LOGIN)
    }

    return (
        <div className="min-h-screen bg-[#f3f6f3]">
            <div className="h-2 bg-[#b6eb66]" />
            <header className="border-b border-[#b8ccc2] bg-[#dfeae4]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex min-h-20 flex-wrap items-center justify-between gap-4 py-3">
                        <Link to={ROUTES.DASHBOARD_ADMIN} className="flex items-center">
                            <img src="/brand/cprd-cobranding-full-color.png" alt="CCI CPRD" className="h-auto w-72 max-w-[72vw]" />
                        </Link>

                        <nav className="flex items-center gap-6">
                            <Link
                                to={ROUTES.DASHBOARD_ADMIN}
                                className="rounded-md bg-[#0c211c] px-3 py-2 text-sm font-semibold text-white"
                            >
                                Solicitudes
                            </Link>
                            <Link
                                to={ROUTES.PROFILE}
                                className="rounded-md px-3 py-2 text-sm font-semibold text-[#0c211c] hover:bg-[#b6eb66]"
                            >
                                Mi perfil
                            </Link>
                        </nav>

                        <div className="flex items-center gap-4">
                            <span className="hidden text-sm text-neutral-500 lg:inline">{user?.email}</span>
                            <button
                                onClick={handleLogout}
                                className="text-sm font-medium text-[#8b3030] hover:text-[#671f1f]"
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
