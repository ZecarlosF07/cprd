import type { ReactNode } from 'react'

import { Link, NavLink } from 'react-router-dom'

import { ROUTES } from '@/utils/constants'

interface PublicLayoutProps {
    children: ReactNode
}

export function PublicLayout({ children }: PublicLayoutProps) {
    return (
        <div className="flex min-h-screen flex-col bg-[#f3f6f3]">
            <div className="h-2 bg-[#b6eb66]" />
            <header className="border-b border-[#b8ccc2] bg-[#dfeae4]">
                <div className="mx-auto flex min-h-20 max-w-6xl flex-col items-stretch justify-between gap-3 px-4 py-3 sm:flex-row sm:items-center sm:gap-5 sm:px-6">
                    <Link to={ROUTES.MESA_PARTES} className="block">
                        <img
                            src="/brand/cprd-cobranding-full-color.png"
                            alt="CCI CPRD - Centro de Prevención y Resolución de Disputas"
                            className="h-auto w-[300px] max-w-full sm:w-[360px]"
                        />
                    </Link>
                    <nav className="flex items-center justify-between gap-2 text-sm font-semibold sm:justify-end">
                        <NavLink to={ROUTES.MESA_PARTES} className={navClass}>
                            Presentar documento
                        </NavLink>
                        <NavLink to={ROUTES.TRAZABILIDAD} className={navClass}>
                            Trazabilidad
                        </NavLink>
                    </nav>
                </div>
            </header>
            <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
                {children}
            </main>
            <footer className="mt-6 border-t-4 border-[#b6eb66] bg-[#0c211c] text-[#dce8e2]">
                <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-6">
                    <p>Centro de Prevención y Resolución de Disputas</p>
                    <a className="font-medium text-[#b6eb66] hover:text-white" href="mailto:elcentro@camaraica.org.pe">
                        elcentro@camaraica.org.pe
                    </a>
                </div>
            </footer>
        </div>
    )
}

function navClass({ isActive }: { isActive: boolean }) {
    return `rounded-md px-3 py-2 transition-colors ${isActive ? 'bg-[#0c211c] text-white shadow-sm' : 'text-[#0c211c] hover:bg-[#b6eb66]'}`
}
