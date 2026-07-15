import type {
    ComprobantePago,
    Documento,
    HistorialSolicitud,
    Parte,
    Solicitud,
    SolicitudConPartes,
} from '@/types'

export interface ServiceResponse<T> {
    data: T
    error: Error | null
}

export type SolicitudResponse = ServiceResponse<Solicitud | null>
export type SolicitudConPartesResponse = ServiceResponse<SolicitudConPartes | null>
export type SolicitudesListResponse = ServiceResponse<Solicitud[]>
export type ParteResponse = ServiceResponse<Parte | null>
export type PartesListResponse = ServiceResponse<Parte[]>
export type HistorialListResponse = ServiceResponse<HistorialSolicitud[]>
export type DocumentoResponse = ServiceResponse<Documento | null>
export type ComprobantePagoResponse = ServiceResponse<ComprobantePago | null>

export interface SolicitudStats {
    total: number
    enProceso: number
    observadas: number
}
