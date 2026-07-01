import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useLocation, useNavigate } from 'react-router-dom'

import { AuthLayout } from '@/components/layout'
import { Button, Input } from '@/components/ui'
import { loginSchema, type LoginFormData } from '@/features/auth/schemas'
import { useAuthStore } from '@/store'
import { ROUTES } from '@/utils/constants'

export function LoginPage() {
    const { login, logout, isLoading, error, clearError, isAuthenticated, profile, profileChecked } = useAuthStore()
    const navigate = useNavigate()
    const location = useLocation()
    const registrationState = location.state as {
        registrationMessage?: string
        email?: string
    } | null

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: registrationState?.email ?? '',
        },
    })

    useEffect(() => {
        if (!isAuthenticated || isLoading || !profileChecked) {
            return
        }

        if (!profile) {
            navigate(ROUTES.PROFILE, { replace: true })
            return
        }

        if (profile.rol === 'administrador') {
            navigate(ROUTES.DASHBOARD_ADMIN, { replace: true })
            return
        }

        void logout().then(() => navigate(ROUTES.MESA_PARTES, { replace: true }))
    }, [isAuthenticated, isLoading, profile, profileChecked, navigate, logout])

    const onSubmit = async (data: LoginFormData) => {
        clearError()
        await login(data)
        // La redirección se maneja en el useEffect cuando isAuthenticated y profile cambien
    }

    return (
        <AuthLayout
            title="Iniciar sesión"
            subtitle="Ingrese sus credenciales para acceder al sistema"
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {registrationState?.registrationMessage && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-700">
                            {registrationState.registrationMessage}
                        </p>
                    </div>
                )}

                {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-600">{error}</p>
                    </div>
                )}

                <Input
                    label="Correo electrónico"
                    type="email"
                    placeholder="correo@ejemplo.com"
                    error={errors.email?.message}
                    {...register('email')}
                />

                <Input
                    label="Contraseña"
                    type="password"
                    placeholder="••••••••"
                    error={errors.password?.message}
                    {...register('password')}
                />

                <Button type="submit" fullWidth isLoading={isLoading}>
                    Iniciar sesión
                </Button>
            </form>
        </AuthLayout>
    )
}
