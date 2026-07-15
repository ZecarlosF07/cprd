import type { DocumentoPublico } from './mesa-partes-publica.types'

export interface PrincipalDocumentFieldProps {
    documento: DocumentoPublico
    error?: string
    onChange: (documento: DocumentoPublico) => void
    onSelect: (file?: File) => void
}

export interface AnnexDocumentsFieldProps {
    documentos: DocumentoPublico[]
    error?: string | null
    errorFor: (path: string) => string | undefined
    onAdd: (files: FileList | null) => void
    onRemove: (index: number) => void
}

export interface DocumentosFormProps {
    value: DocumentoPublico[]
    onChange: (value: DocumentoPublico[]) => void
    errorFor: (path: string) => string | undefined
}
