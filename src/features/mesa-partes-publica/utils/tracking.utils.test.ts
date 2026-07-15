import { describe, expect, it } from 'vitest'

import { trackingProcedureLabel, trackingSectionLabel, trackingStateLabel } from './tracking.utils'

describe('presentación de trazabilidad', () => {
    it('presenta estados con etiquetas comprensibles', () => {
        expect(trackingStateLabel('en_revision')).toBe('En revisión')
        expect(trackingStateLabel('estado_nuevo')).toBe('estado nuevo')
        expect(trackingStateLabel(null)).toBeNull()
    })

    it('presenta sección y trámite sin códigos técnicos', () => {
        expect(trackingSectionLabel('jprd')).toBe('JPRD')
        expect(trackingSectionLabel('arbitraje')).toBe('Arbitraje')
        expect(trackingProcedureLabel('arbitraje_institucional')).toBe('Arbitraje institucional')
    })
})
