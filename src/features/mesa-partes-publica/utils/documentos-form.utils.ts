import type { DocumentoPublico } from '../types/mesa-partes-publica.types'

export const ACCEPTED_PUBLIC_FILES = '.pdf,.doc,.docx,.jpg,.jpeg,.png'
export const MAX_PUBLIC_DOCUMENTS = 10

export function createEmptyPrincipal(): DocumentoPublico {
    return { tipoDocumento: 'solicitud_principal', comentario: '', enlaceExterno: '' }
}

export function createAnnex(archivo: File): DocumentoPublico {
    return { tipoDocumento: 'anexo', comentario: '', enlaceExterno: '', archivo }
}

export function formatFileSize(bytes: number) {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}
