import type { SeccionMesaPartes, TramiteMesaPartes } from '../types/mesa-partes-publica.types'

const ARBITRAJE_TARIFARIO = 'https://camaraica.org.pe/centro-de-arbitraje-2/calculadora-de-costos/'
const JPRD_TARIFARIO = 'https://camaraica.org.pe/jprd/calculadora-de-costo-jprd/'

export const TRAMITES_MESA_PARTES: readonly TramiteMesaPartes[] = [
    {
        codigo: 'arbitraje_institucional',
        nombre: 'Solicitud de Arbitraje Institucional',
        seccion: 'arbitraje',
        requierePago: true,
        requiereExpediente: false,
        requiereSumilla: false,
        requiereAsunto: false,
        enlaceRequisitos: 'https://docs.google.com/document/d/104YZbWusguV8uw-ftKlYCs9-_1li1DVW/edit',
        enlaceTarifario: ARBITRAJE_TARIFARIO,
    },
    {
        codigo: 'arbitraje_emergencia',
        nombre: 'Solicitud de Arbitraje de Emergencia',
        seccion: 'arbitraje',
        requierePago: true,
        requiereExpediente: false,
        requiereSumilla: false,
        requiereAsunto: false,
        enlaceRequisitos: 'https://docs.google.com/document/d/104YZbWusguV8uw-ftKlYCs9-_1li1DVW/edit',
        enlaceTarifario: ARBITRAJE_TARIFARIO,
    },
    {
        codigo: 'incorporacion_arbitros',
        nombre: 'Incorporación a la nómina de Árbitros',
        seccion: 'arbitraje',
        requierePago: false,
        requiereExpediente: false,
        requiereSumilla: false,
        requiereAsunto: false,
        enlaceRequisitos: 'https://camaraica.org.pe/centro-de-arbitraje-2/procedimiento-de-incorporacion-arbitral/',
        enlaceTarifario: ARBITRAJE_TARIFARIO,
    },
    {
        codigo: 'renovacion_arbitros',
        nombre: 'Renovación a la nómina de Árbitros',
        seccion: 'arbitraje',
        requierePago: true,
        requiereExpediente: false,
        requiereSumilla: false,
        requiereAsunto: false,
        enlaceRequisitos: 'https://camaraica.org.pe/centro-de-arbitraje-2/procedimiento-de-incorporacion-arbitral/',
        enlaceTarifario: ARBITRAJE_TARIFARIO,
    },
    {
        codigo: 'copia_certificada',
        nombre: 'Solicitud de copia certificada',
        seccion: 'arbitraje',
        requierePago: false,
        requiereExpediente: false,
        requiereSumilla: false,
        requiereAsunto: false,
        enlaceRequisitos: 'https://docs.google.com/document/d/1SEGNUH2TSFAcskidOwHMPb9aSzzC1ICD/edit',
    },
    {
        codigo: 'escrito_expediente_arbitraje',
        nombre: 'Ingresar escrito en expediente',
        seccion: 'arbitraje',
        requierePago: false,
        requiereExpediente: true,
        requiereSumilla: true,
        requiereAsunto: false,
    },
    {
        codigo: 'otro_arbitraje',
        nombre: 'Otro trámite',
        seccion: 'arbitraje',
        requierePago: false,
        requiereExpediente: false,
        requiereSumilla: false,
        requiereAsunto: true,
    },
    {
        codigo: 'jprd_solicitud',
        nombre: 'Solicitud de JPRD',
        seccion: 'jprd',
        requierePago: true,
        requiereExpediente: false,
        requiereSumilla: false,
        requiereAsunto: false,
        enlaceRequisitos: 'https://docs.google.com/document/d/1o9Z3W1OJ07BkqMbkLRIkUL9ce4lgFPyv/edit',
        enlaceTarifario: JPRD_TARIFARIO,
    },
    {
        codigo: 'incorporacion_adjudicadores',
        nombre: 'Incorporación a la nómina de adjudicadores',
        seccion: 'jprd',
        requierePago: false,
        requiereExpediente: false,
        requiereSumilla: false,
        requiereAsunto: false,
        enlaceRequisitos: 'https://camaraica.org.pe/jprd/procedimiento-de-incorporacion-adjudicadores/',
        enlaceTarifario: JPRD_TARIFARIO,
    },
    {
        codigo: 'escrito_expediente_jprd',
        nombre: 'Ingresar escrito en expediente',
        seccion: 'jprd',
        requierePago: false,
        requiereExpediente: true,
        requiereSumilla: true,
        requiereAsunto: false,
    },
    {
        codigo: 'otro_jprd',
        nombre: 'Otro trámite',
        seccion: 'jprd',
        requierePago: false,
        requiereExpediente: false,
        requiereSumilla: false,
        requiereAsunto: true,
    },
] as const

export function getTramitesBySeccion(seccion: SeccionMesaPartes): TramiteMesaPartes[] {
    return TRAMITES_MESA_PARTES.filter((tramite) => tramite.seccion === seccion)
}

export function getTramiteByCodigo(codigo: string): TramiteMesaPartes | undefined {
    return TRAMITES_MESA_PARTES.find((tramite) => tramite.codigo === codigo)
}
