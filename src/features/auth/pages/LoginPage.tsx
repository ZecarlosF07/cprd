import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'

import { AuthLayout } from '@/components/layout'
import { Button, Input } from '@/components/ui'
import { loginSchema, type LoginFormData } from '@/features/auth/schemas'
import { useAuthStore } from '@/store'
import { ROUTES } from '@/utils/constants'

export function LoginPage() {
    const { login, isLoading, error, clearError, isAuthenticated, profile } = useAuthStore()
    const navigate = useNavigate()

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    })

    useEffect(() => {
        if (isAuthenticated) {
            redirectByRole()
        }
    }, [isAuthenticated, profile])

    const redirectByRole = () => {
        if (!profile) {
            navigate(ROUTES.PROFILE)
            return
        }

        switch (profile.rol) {
            case 'administrador':
                navigate(ROUTES.DASHBOARD_ADMIN)
                break
            case 'interno':
                navigate(ROUTES.DASHBOARD_INTERNO)
                break
            default:
                navigate(ROUTES.DASHBOARD_EXTERNO)
        }
    }

    const onSubmit = async (data: LoginFormData) => {
        clearError()
        const success = await login(data)
        if (success) {
            redirectByRole()
        }
    }

    return (
        <AuthLayout
            title="Iniciar sesión"
            subtitle="Ingrese sus credenciales para acceder al sistema"
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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

                <p className="text-center text-sm text-neutral-600">
                    ¿No tiene una cuenta?{' '}
                    <Link
                        to={ROUTES.REGISTER}
                        className="font-medium text-neutral-900 hover:underline"
                    >
                        Regístrese aquí
                    </Link>
                </p>
            </form>
        </AuthLayout>
    )
}
