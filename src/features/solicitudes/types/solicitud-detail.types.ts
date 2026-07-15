import type {
    ComprobantePago,
    Documento,
    HistorialSolicitud,
    Parte,
    SolicitudConPartes,
} from '@/types'

export interface SolicitudHeaderProps {
    solicitud: SolicitudConPartes
}

export interface SolicitudInfoProps {
    solicitud: SolicitudConPartes
}

export interface SolicitudDocumentsProps {
    documentos: Documento[]
    solicitudId: string
}

export interface SolicitudPaymentProps {
    comprobantes: ComprobantePago[]
    solicitudId: string
}

export interface SolicitudPartiesProps {
    partes: Parte[]
}

export interface SolicitudHistoryProps {
    historial: HistorialSolicitud[]
}
