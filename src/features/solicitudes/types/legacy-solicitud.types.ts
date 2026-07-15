import type { CreateParteData, TipoDocumentoAdjunto, TipoSolicitud } from '@/types'

export type LegacyParteData = Omit<CreateParteData, 'rol'>

export interface LegacyEntidadData {
    nombre_entidad: string
    ruc_entidad: string
    direccion_entidad: string
    correo_contacto: string
}

export interface LegacySolicitudFormData {
    formStep: 1 | 2
    tipo_solicitud: TipoSolicitud | ''
    moneda: string
    demandante: LegacyParteData
    demandado: LegacyParteData
    contratista: LegacyParteData
    entidad: LegacyEntidadData
}

export interface LegacyDocumento {
    id: string
    file: File
    tipo: TipoDocumentoAdjunto
    comentario: string
}

export interface LegacyPago {
    file: File
}

export interface LegacyAttachmentState {
    documentos: LegacyDocumento[]
    pago: LegacyPago | null
    docFile: File | null
    docTipo: TipoDocumentoAdjunto | ''
    docComentario: string
}

export interface LegacyDocumentsCardProps extends Omit<LegacyAttachmentState, 'pago'> {
    onAdd: () => void
    onComentarioChange: (value: string) => void
    onFileChange: (file: File | null) => void
    onRemove: (id: string) => void
    onTipoChange: (value: TipoDocumentoAdjunto | '') => void
}

export interface LegacyPaymentCardProps {
    pago: LegacyPago | null
    tipoSolicitud: TipoSolicitud | ''
    onPaymentFileChange: (file: File) => void
}

export interface LegacyAttachmentsStepProps extends LegacyDocumentsCardProps, LegacyPaymentCardProps {
    isSubmitting: boolean
    onBack: () => void
    onSubmit: () => Promise<void>
}
