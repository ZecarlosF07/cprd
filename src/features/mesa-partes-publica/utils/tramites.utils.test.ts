import { describe, expect, it } from 'vitest'

import { getTramiteByCodigo, getTramitesBySeccion, TRAMITES_MESA_PARTES } from './tramites.utils'

describe('catálogo de trámites públicos', () => {
    it('contiene siete trámites de arbitraje y cuatro de JPRD', () => {
        expect(getTramitesBySeccion('arbitraje')).toHaveLength(7)
        expect(getTramitesBySeccion('jprd')).toHaveLength(4)
    })

    it('exige pago en los seis trámites definidos por el Hito 6', () => {
        const codigosConPago = TRAMITES_MESA_PARTES
            .filter((tramite) => tramite.requierePago)
            .map((tramite) => tramite.codigo)

        expect(codigosConPago).toEqual([
            'arbitraje_institucional',
            'arbitraje_emergencia',
            'incorporacion_arbitros',
            'renovacion_arbitros',
            'jprd_solicitud',
            'incorporacion_adjudicadores',
        ])
    })

    it('define campos condicionales para escritos y otros trámites', () => {
        expect(getTramiteByCodigo('escrito_expediente_arbitraje')).toMatchObject({
            requiereAsunto: false,
            requiereExpediente: true,
            requiereSumilla: true,
        })
        expect(getTramiteByCodigo('otro_jprd')).toMatchObject({
            requiereAsunto: true,
            requiereExpediente: false,
            requiereSumilla: false,
        })
    })

    it('no encuentra códigos ajenos al catálogo', () => {
        expect(getTramiteByCodigo('inexistente')).toBeUndefined()
    })
})
