import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'

import { AuthLayout } from '@/components/layout'
import { Button, Input } from '@/components/ui'
import { registerSchema, type RegisterFormData } from '@/features/auth/schemas'
import { useAuthStore } from '@/store'
import { ROUTES } from '@/utils/constants'

export function RegisterPage() {
    const { register: registerUser, isLoading, error, clearError } = useAuthStore()
    const navigate = useNavigate()

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
    })

    const onSubmit = async (data: RegisterFormData) => {
        clearError()
        const success = await registerUser(data)
        if (success) {
            navigate(ROUTES.PROFILE)
        }
    }

    return (
        <AuthLayout
            title="Crear cuenta"
            subtitle="Complete el formulario para registrarse en el sistema"
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
                    placeholder="Mínimo 6 caracteres"
                    error={errors.password?.message}
                    {...register('password')}
                />

                <Input
                    label="Confirmar contraseña"
                    type="password"
                    placeholder="Repita su contraseña"
                    error={errors.confirmPassword?.message}
                    {...register('confirmPassword')}
                />

                <Button type="submit" fullWidth isLoading={isLoading}>
                    Crear cuenta
                </Button>

                <p className="text-center text-sm text-neutral-600">
                    ¿Ya tiene una cuenta?{' '}
                    <Link
                        to={ROUTES.LOGIN}
                        className="font-medium text-neutral-900 hover:underline"
                    >
                        Inicie sesión
                    </Link>
                </p>
            </form>
        </AuthLayout>
    )
}
