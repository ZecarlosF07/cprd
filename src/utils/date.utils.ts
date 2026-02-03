/**
 * Formatea una fecha ISO a formato legible
 */
export function formatDate(isoDate: string): string {
    const date = new Date(isoDate)
    return date.toLocaleDateString('es-PE', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    })
}

/**
 * Formatea fecha y hora
 */
export function formatDateTime(isoDate: string): string {
    const date = new Date(isoDate)
    return date.toLocaleDateString('es-PE', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })
}
