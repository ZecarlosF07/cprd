import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { ProfileRequiredRoute, ProtectedRoute, RoleRoute } from '@/app/routes'
import { AdminDashboardPage } from '@/features/admin/pages'
import { LoginPage, ProfilePage, RegisterPage } from '@/features/auth/pages'
import { ExternalDashboardPage } from '@/features/external/pages'
import { InternalDashboardPage } from '@/features/internal/pages'
import { NewSolicitudPage, SolicitudDetailPage } from '@/features/solicitudes/pages'
import { ROUTES } from '@/utils/constants'

export function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Public routes */}
                <Route path={ROUTES.HOME} element={<Navigate to={ROUTES.LOGIN} replace />} />
                <Route path={ROUTES.LOGIN} element={<LoginPage />} />
                <Route path={ROUTES.REGISTER} element={<RegisterPage />} />

                {/* Profile route - requires authentication but not profile */}
                <Route
                    path={ROUTES.PROFILE}
                    element={
                        <ProtectedRoute>
                            <ProfilePage />
                        </ProtectedRoute>
                    }
                />

                {/* External user routes */}
                <Route
                    path={ROUTES.DASHBOARD_EXTERNO}
                    element={
                        <ProfileRequiredRoute>
                            <RoleRoute allowedRoles={['externo']}>
                                <ExternalDashboardPage />
                            </RoleRoute>
                        </ProfileRequiredRoute>
                    }
                />
                <Route
                    path={ROUTES.NUEVA_SOLICITUD}
                    element={
                        <ProfileRequiredRoute>
                            <RoleRoute allowedRoles={['externo']}>
                                <NewSolicitudPage />
                            </RoleRoute>
                        </ProfileRequiredRoute>
                    }
                />
                <Route
                    path={ROUTES.DETALLE_SOLICITUD}
                    element={
                        <ProfileRequiredRoute>
                            <RoleRoute allowedRoles={['externo']}>
                                <SolicitudDetailPage />
                            </RoleRoute>
                        </ProfileRequiredRoute>
                    }
                />

                {/* Internal user routes */}
                <Route
                    path={ROUTES.DASHBOARD_INTERNO}
                    element={
                        <ProfileRequiredRoute>
                            <RoleRoute allowedRoles={['interno']}>
                                <InternalDashboardPage />
                            </RoleRoute>
                        </ProfileRequiredRoute>
                    }
                />

                {/* Admin routes */}
                <Route
                    path={ROUTES.DASHBOARD_ADMIN}
                    element={
                        <ProfileRequiredRoute>
                            <RoleRoute allowedRoles={['administrador']}>
                                <AdminDashboardPage />
                            </RoleRoute>
                        </ProfileRequiredRoute>
                    }
                />

                {/* Catch all - redirect to login */}
                <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />
            </Routes>
        </BrowserRouter>
    )
}
