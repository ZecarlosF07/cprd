export interface SolicitantePayload {
    tipoPersona: string
    tipoDocumento: string
    numeroDocumento: string
    nombresApellidos: string
    razonSocial: string
    representanteLegal: string
    cargoRepresentante: string
    celular: string
    correo: string
    domicilio: string
}

export interface DocumentoPayload {
    tipoDocumento: string
    comentario: string
    enlaceExterno: string
}

export interface PagoPayload {
    tipoFacturacion: string
    nombreRazonSocial: string
    documento: string
    direccion: string
}

export interface IntakePayload {
    idempotencyKey: string
    seccion: string
    tramiteCodigo: string
    tramiteNombre?: string
    requierePago?: boolean
    solicitante: SolicitantePayload
    numeroExpedienteReferido: string
    sumilla: string
    asunto: string
    documentos: DocumentoPayload[]
    pago: PagoPayload
    aceptaNotificaciones: boolean
    aceptaDatosPersonales: boolean
    captchaToken: string
}

export interface ValidatedIntake {
    payload: IntakePayload & { tramiteNombre: string; requierePago: boolean }
    files: File[]
    documentFiles: Array<File | null>
    paymentFile: File | null
}

export interface DocumentMetadata {
    tipo_documento: string
    nombre_archivo: string
    archivo_url: string
    link_externo: string
    tamano_bytes: number | null
    mime_type: string | null
    comentario: string
}

export interface PaymentMetadata {
    archivo_url: string
    tipo_facturacion: string
    nombre_razon_social: string
    documento_facturacion: string
    direccion_facturacion: string
}

export interface FinalizeInput {
    idempotencyKey: string
    payloadHash: string
    payload: ValidatedIntake['payload']
    documentos: DocumentMetadata[]
    pago: PaymentMetadata | null
    ip: string | null
    userAgent: string | null
}

export interface FinalizeResult {
    solicitud_id: string
    codigo: string
    estado: string
    outbox_id: string
    webhook_payload: unknown
}
