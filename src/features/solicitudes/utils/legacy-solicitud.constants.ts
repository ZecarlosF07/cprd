import type { TipoDocumentoAdjunto } from '@/types'

export const LEGACY_DOCUMENT_TYPES: readonly { value: TipoDocumentoAdjunto; label: string }[] = [
    { value: 'demanda', label: 'Demanda / Solicitud' },
    { value: 'contrato', label: 'Contrato / Convenio Arbitral' },
    { value: 'poder', label: 'Poder de Representación' },
    { value: 'dni_representante', label: 'DNI del Representante' },
    { value: 'constitucion_empresa', label: 'Vigencia de Poder / Constitución' },
    { value: 'otro', label: 'Otro Documento' },
]
