// Tipos de solicitud
export type TipoSolicitud = 'arbitraje' | 'arbitraje_emergencia' | 'jprd'

// Estados de solicitud
export type EstadoSolicitud =
    | 'recibida'
    | 'en_revision'
    | 'observada'
    | 'subsanada'
    | 'admitida'
    | 'rechazada'
    | 'archivada'

// Rol de parte en el proceso
export type RolParte = 'demandante' | 'demandado' | 'contratista' | 'entidad'

// Tipo de acción en historial
export type TipoAccion =
    | 'creacion'
    | 'cambio_estado'
    | 'observacion'
    | 'subsanacion'
    | 'documento_adjunto'
    | 'pago_adjunto'
    | 'pago_validado'
    | 'pago_observado'

// Interface de Solicitud
export interface Solicitud {
    id: string
    codigo_expediente: string
    tipo_solicitud: TipoSolicitud
    estado: EstadoSolicitud
    user_id: string
    materia: string | null
    cuantia: number | null
    moneda: string
    descripcion_controversia: string | null
    created_at: string
    updated_at: string
    deleted_at: string | null
}

// Interface de Parte
export interface Parte {
    id: string
    solicitud_id: string
    user_id: string | null
    rol: RolParte
    tipo_persona: 'natural' | 'juridica'
    tipo_documento: 'dni' | 'ce' | 'pasaporte' | 'ruc'
    numero_documento: string
    nombres_apellidos: string | null
    razon_social: string | null
    celular: string | null
    domicilio: string | null
    correo_electronico?: string
    created_at: string
    updated_at: string
    deleted_at: string | null
}

// Interface de Historial
export interface HistorialSolicitud {
    id: string
    solicitud_id: string
    accion: TipoAccion
    estado_anterior: EstadoSolicitud | null
    estado_nuevo: EstadoSolicitud | null
    descripcion: string | null
    metadata: Record<string, unknown> | null
    user_id: string
    created_at: string
    deleted_at: string | null
}

// Interface para crear solicitud
export interface CreateSolicitudData {
    tipo_solicitud: TipoSolicitud
    materia?: string
    cuantia?: number
    moneda?: string
    descripcion_controversia?: string
}

// Interface para crear parte
export interface CreateParteData {
    rol: RolParte
    tipo_persona: 'natural' | 'juridica'
    tipo_documento: 'dni' | 'ce' | 'pasaporte' | 'ruc'
    numero_documento: string
    nombres_apellidos?: string
    razon_social?: string
    celular?: string
    domicilio?: string
    correo_electronico?: string
}

// Solicitud completa con partes
export interface SolicitudConPartes extends Solicitud {
    partes: Parte[]
    historial?: HistorialSolicitud[]
    documentos?: Documento[]
    comprobantes_pago?: ComprobantePago[]
}

// Datos del formulario de arbitraje
export interface ArbitrajeFormData {
    // Datos del demandante (precargados del perfil)
    demandante: CreateParteData
    // Datos del demandado
    demandado: CreateParteData
}

// Datos del formulario JPRD
export interface JPRDFormData {
    // Datos del solicitante/contratista (precargados del perfil)
    contratista: CreateParteData
    // Datos de la entidad
    entidad: {
        nombre_entidad: string
        ruc_entidad: string
        direccion_entidad: string
        correo_contacto: string
    }
}

// Tipos de adjuntos
export type TipoDocumentoAdjunto =
    | 'demanda'
    | 'contrato'
    | 'poder'
    | 'dni_representante'
    | 'constitucion_empresa'
    | 'otro'

export type EstadoPago = 'pendiente' | 'validado' | 'observado' | 'rechazado'

// Interface de Documento
export interface Documento {
    id: string
    solicitud_id: string
    tipo_documento: TipoDocumentoAdjunto
    nombre_archivo: string
    archivo_url: string | null
    link_externo: string | null
    tamano_bytes: number | null
    mime_type: string | null
    comentario: string | null
    es_subsanacion: boolean
    documento_original_id: string | null
    created_by: string
    created_at: string
    deleted_at: string | null
}

// Interface de Comprobante de Pago
export interface ComprobantePago {
    id: string
    solicitud_id: string
    numero_operacion: string | null
    monto: number | null
    fecha_pago: string | null
    archivo_url: string
    estado: EstadoPago
    observado_motivo: string | null
    revisado_por: string | null
    revisado_at: string | null
    created_by: string
    created_at: string
    updated_at: string
    deleted_at: string | null
}

// Interface para crear documento
export interface CreateDocumentoData {
    tipo_documento: TipoDocumentoAdjunto
    nombre_archivo: string
    archivo_url?: string
    link_externo?: string
    tamano_bytes?: number
    mime_type?: string
    comentario?: string
}

// Interface para crear comprobante de pago
export interface CreateComprobantePagoData {
    archivo_url: string
    numero_operacion?: string
    monto?: number
    fecha_pago?: string
}
