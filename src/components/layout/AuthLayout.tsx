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
        <div className="min-h-screen bg-neutral-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <Link to={ROUTES.HOME} className="flex justify-center">
                    <h1 className="text-2xl font-bold text-neutral-900">CPRD</h1>
                </Link>
                <h2 className="mt-6 text-center text-3xl font-semibold text-neutral-900">
                    {title}
                </h2>
                {subtitle && (
                    <p className="mt-2 text-center text-sm text-neutral-600">
                        {subtitle}
                    </p>
                )}
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-sm rounded-xl sm:px-10 border border-neutral-200">
                    {children}
                </div>
            </div>
        </div>
    )
}
