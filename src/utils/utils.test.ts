import { describe, expect, it } from 'vitest'

import type { EstadoSolicitud } from '@/types'

import { ROUTES } from './constants'
import { formatDate, formatDateTime } from './date.utils'
import { getEstadoDisplay } from './estado.utils'
import { getDashboardRoute } from './route.utils'

describe('utilidades transversales', () => {
    it.each<EstadoSolicitud>([
        'borrador', 'recibida', 'en_revision', 'observada',
        'subsanada', 'admitida', 'rechazada', 'archivada',
    ])('ofrece presentación para el estado %s', (estado) => {
        expect(getEstadoDisplay(estado).label).not.toBe('')
    })

    it('dirige administradores al panel y otros roles a la mesa pública', () => {
        expect(getDashboardRoute('administrador')).toBe(ROUTES.DASHBOARD_ADMIN)
        expect(getDashboardRoute('externo')).toBe(ROUTES.MESA_PARTES)
        expect(getDashboardRoute('interno')).toBe(ROUTES.MESA_PARTES)
    })

    it('formatea fechas ISO para Perú', () => {
        expect(formatDate('2026-07-15T12:30:00Z')).toContain('2026')
        expect(formatDateTime('2026-07-15T12:30:00Z')).toContain('2026')
    })
})
