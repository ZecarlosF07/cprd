export type SeccionMesaPartes = 'arbitraje' | 'jprd'

export type TipoPersonaPublica = 'natural' | 'juridica'

export type TipoDocumentoPublico = 'dni' | 'ce' | 'pasaporte' | 'ruc'

export type TipoFacturacionPublica =
    | 'boleta'
    | 'factura_contado'
    | 'factura_credito'
    | 'factura'

export type TipoDocumentoMesaPartes =
    | 'solicitud_principal'
    | 'anexo'
    | 'documento_identidad'
    | 'poder'
    | 'otro'

export interface TramiteMesaPartes {
    codigo: string
    nombre: string
    seccion: SeccionMesaPartes
    requierePago: boolean
    requiereExpediente: boolean
    requiereSumilla: boolean
    requiereAsunto: boolean
    enlaceRequisitos?: string
    enlaceTarifario?: string
}

export interface SolicitantePublico {
    tipoPersona: TipoPersonaPublica
    tipoDocumento: TipoDocumentoPublico
    numeroDocumento: string
    nombresApellidos: string
    razonSocial: string
    representanteLegal: string
    cargoRepresentante: string
    celular: string
    correo: string
    domicilio: string
}

export interface DocumentoPublico {
    tipoDocumento: TipoDocumentoMesaPartes
    comentario: string
    enlaceExterno: string
    archivo?: File
}

export interface PagoPublico {
    tipoFacturacion: TipoFacturacionPublica
    nombreRazonSocial: string
    documento: string
    direccion: string
    archivo?: File
}

export interface SolicitudPublicaFormData {
    seccion: SeccionMesaPartes
    tramiteCodigo: string
    solicitante: SolicitantePublico
    numeroExpedienteReferido: string
    sumilla: string
    asunto: string
    documentos: DocumentoPublico[]
    pago: PagoPublico
    aceptaNotificaciones: boolean
    aceptaDatosPersonales: boolean
    captchaToken: string
}

export interface PublicIntakeResult {
    codigo: string
    solicitudId: string
    estado: string
}

export interface TrazabilidadPublica {
    codigo: string
    seccion: string
    tramite: string
    fechaIngreso: string
    estado: string
    observaciones: string[]
}
