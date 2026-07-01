import type { ReactNode } from 'react'

import { Link } from 'react-router-dom'

import { ROUTES } from '@/utils/constants'

interface AuthLayoutProps {
    children: ReactNode
    title: string
    subtitle?: string
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
    return (
        <div className="min-h-screen border-t-8 border-[#b6eb66] bg-[#0c211c] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <Link to={ROUTES.HOME} className="flex justify-center rounded-lg bg-white p-4">
                    <img
                        src="/brand/cprd-cobranding-full-color.png"
                        alt="CCI CPRD"
                        className="h-auto w-full max-w-sm"
                    />
                </Link>
                <h2 className="mt-8 text-center text-3xl font-semibold text-white">
                    {title}
                </h2>
                {subtitle && (
                    <p className="mt-2 text-center text-sm text-[#c8d8d0]">
                        {subtitle}
                    </p>
                )}
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="rounded-lg border border-[#b6eb66] bg-white px-4 py-8 shadow-lg sm:px-10">
                    {children}
                </div>
            </div>
        </div>
    )
}
