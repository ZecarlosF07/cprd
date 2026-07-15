export const MAX_TOTAL_BYTES = 20 * 1024 * 1024

export const ALLOWED_MIME = new Set([
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
])

export interface TramiteConfig {
    seccion: 'arbitraje' | 'jprd'
    nombre: string
    pago: boolean
    expediente?: boolean
    sumilla?: boolean
    asunto?: boolean
}

export const TRAMITES: Record<string, TramiteConfig> = {
    arbitraje_institucional: { seccion: 'arbitraje', nombre: 'Solicitud de Arbitraje Institucional', pago: true },
    arbitraje_emergencia: { seccion: 'arbitraje', nombre: 'Solicitud de Arbitraje de Emergencia', pago: true },
    incorporacion_arbitros: { seccion: 'arbitraje', nombre: 'Incorporación a la nómina de Árbitros', pago: true },
    renovacion_arbitros: { seccion: 'arbitraje', nombre: 'Renovación a la nómina de Árbitros', pago: true },
    copia_certificada: { seccion: 'arbitraje', nombre: 'Solicitud de copia certificada', pago: false },
    escrito_expediente_arbitraje: { seccion: 'arbitraje', nombre: 'Ingresar escrito en expediente', pago: false, expediente: true, sumilla: true },
    otro_arbitraje: { seccion: 'arbitraje', nombre: 'Otro trámite', pago: false, asunto: true },
    jprd_solicitud: { seccion: 'jprd', nombre: 'Solicitud de JPRD', pago: true },
    incorporacion_adjudicadores: { seccion: 'jprd', nombre: 'Incorporación a la nómina de adjudicadores', pago: true },
    escrito_expediente_jprd: { seccion: 'jprd', nombre: 'Ingresar escrito en expediente', pago: false, expediente: true, sumilla: true },
    otro_jprd: { seccion: 'jprd', nombre: 'Otro trámite', pago: false, asunto: true },
}
