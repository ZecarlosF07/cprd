export const ROLES = {
    EXTERNO: 'externo',
    INTERNO: 'interno',
    ADMINISTRADOR: 'administrador',
} as const

export const TIPOS_PERSONA = {
    NATURAL: 'natural',
    JURIDICA: 'juridica',
} as const

export const TIPOS_DOCUMENTO = {
    DNI: 'dni',
    CE: 'ce',
    PASAPORTE: 'pasaporte',
    RUC: 'ruc',
} as const

export const TIPOS_SOLICITUD = {
    ARBITRAJE: 'arbitraje',
    ARBITRAJE_EMERGENCIA: 'arbitraje_emergencia',
    JPRD: 'jprd',
} as const

export const ESTADOS_SOLICITUD = {
    RECIBIDA: 'recibida',
    EN_REVISION: 'en_revision',
    OBSERVADA: 'observada',
    SUBSANADA: 'subsanada',
    ADMITIDA: 'admitida',
    RECHAZADA: 'rechazada',
    ARCHIVADA: 'archivada',
} as const

export const ROLES_PARTE = {
    DEMANDANTE: 'demandante',
    DEMANDADO: 'demandado',
    CONTRATISTA: 'contratista',
    ENTIDAD: 'entidad',
} as const

export const TIPOS_DOCUMENTO_OPTIONS = [
    { value: 'dni', label: 'DNI' },
    { value: 'ce', label: 'Carné de Extranjería' },
    { value: 'pasaporte', label: 'Pasaporte' },
    { value: 'ruc', label: 'RUC' },
] as const

export const TIPOS_PERSONA_OPTIONS = [
    { value: 'natural', label: 'Persona Natural' },
    { value: 'juridica', label: 'Persona Jurídica' },
] as const

export const TIPOS_SOLICITUD_OPTIONS = [
    { value: 'arbitraje', label: 'Arbitraje', description: 'Solicitud de arbitraje institucional' },
    { value: 'arbitraje_emergencia', label: 'Arbitraje de Emergencia', description: 'Procedimiento prioritario de arbitraje' },
    { value: 'jprd', label: 'JPRD', description: 'Junta de Prevención y Resolución de Disputas' },
] as const

export const ESTADOS_SOLICITUD_OPTIONS = [
    { value: 'recibida', label: 'Recibida', color: 'bg-blue-100 text-blue-800' },
    { value: 'en_revision', label: 'En Revisión', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'observada', label: 'Observada', color: 'bg-orange-100 text-orange-800' },
    { value: 'subsanada', label: 'Subsanada', color: 'bg-purple-100 text-purple-800' },
    { value: 'admitida', label: 'Admitida', color: 'bg-green-100 text-green-800' },
    { value: 'rechazada', label: 'Rechazada', color: 'bg-red-100 text-red-800' },
    { value: 'archivada', label: 'Archivada', color: 'bg-gray-100 text-gray-800' },
] as const

export const ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    REGISTER: '/registro',
    PROFILE: '/perfil',
    DASHBOARD_EXTERNO: '/dashboard',
    DASHBOARD_INTERNO: '/interno',
    DASHBOARD_ADMIN: '/admin',
    // Rutas de solicitudes
    NUEVA_SOLICITUD: '/solicitudes/nueva',
    DETALLE_SOLICITUD: '/solicitudes/:id',
    MIS_SOLICITUDES: '/solicitudes',
} as const

/**
 * Genera la ruta de detalle de solicitud con el ID
 */
export function getDetalleSolicitudRoute(id: string): string {
    return `/solicitudes/${id}`
}
