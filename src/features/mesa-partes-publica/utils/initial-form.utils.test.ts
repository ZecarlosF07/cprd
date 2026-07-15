import { describe, expect, it } from 'vitest'

import { createInitialPublicIntakeForm } from './initial-form.utils'

describe('formulario público inicial', () => {
    it('crea una operación nueva con valores seguros', () => {
        const form = createInitialPublicIntakeForm()

        expect(form.idempotencyKey).toMatch(/^[0-9a-f-]{36}$/)
        expect(form.seccion).toBe('arbitraje')
        expect(form.tramiteCodigo).toBe('arbitraje_institucional')
        expect(form.documentos).toEqual([
            { tipoDocumento: 'solicitud_principal', comentario: '', enlaceExterno: '' },
        ])
        expect(form.aceptaDatosPersonales).toBe(false)
        expect(form.aceptaNotificaciones).toBe(false)
    })

    it('genera una clave idempotente distinta por formulario', () => {
        expect(createInitialPublicIntakeForm().idempotencyKey)
            .not.toBe(createInitialPublicIntakeForm().idempotencyKey)
    })
})
