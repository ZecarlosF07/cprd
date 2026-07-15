import { describe, expect, it } from 'vitest'

import { TRAMITES } from './constants.ts'
import { mapDocumento, safeName } from './file.utils.ts'
import { cleanOptional, normalizeLink, requireUuid } from './payload.utils.ts'
import { RequestError } from './request-error.ts'

describe('catálogo del ingreso público', () => {
    it('mantiene exactamente los seis trámites que exigen pago', () => {
        const codigos = Object.entries(TRAMITES)
            .filter(([, tramite]) => tramite.pago)
            .map(([codigo]) => codigo)

        expect(codigos).toEqual([
            'arbitraje_institucional',
            'arbitraje_emergencia',
            'incorporacion_arbitros',
            'renovacion_arbitros',
            'jprd_solicitud',
            'incorporacion_adjudicadores',
        ])
    })

    it('mantiene expediente, sumilla y asunto como reglas excluyentes', () => {
        expect(TRAMITES.escrito_expediente_arbitraje).toMatchObject({ expediente: true, sumilla: true })
        expect(TRAMITES.escrito_expediente_jprd).toMatchObject({ expediente: true, sumilla: true })
        expect(TRAMITES.otro_arbitraje).toMatchObject({ asunto: true })
        expect(TRAMITES.otro_jprd).toMatchObject({ asunto: true })
    })
})

describe('utilidades seguras del ingreso público', () => {
    it('acepta UUID v4 y rechaza identificadores inválidos', () => {
        expect(requireUuid('123e4567-e89b-42d3-a456-426614174000')).toContain('-')
        expect(() => requireUuid('no-es-uuid')).toThrow(RequestError)
    })

    it('solo normaliza enlaces HTTPS', () => {
        expect(normalizeLink('https://drive.google.com/file')).toBe('https://drive.google.com/file')
        expect(normalizeLink('')).toBe('')
        expect(() => normalizeLink('http://example.com')).toThrow('URL HTTPS válida')
        expect(() => normalizeLink(123)).toThrow('URL HTTPS válida')
    })

    it('limpia texto opcional y nombres de archivo', () => {
        expect(cleanOptional('  abcdef  ', 3)).toBe('abc')
        expect(cleanOptional(null, 3)).toBe('')
        expect(safeName('área / solicitud.pdf')).toBe('a_rea___solicitud.pdf')
    })

    it('mapea documentos y usa otro como valor seguro', () => {
        expect(mapDocumento('solicitud_principal')).toBe('demanda')
        expect(mapDocumento('poder')).toBe('poder')
        expect(mapDocumento('desconocido')).toBe('otro')
    })
})
