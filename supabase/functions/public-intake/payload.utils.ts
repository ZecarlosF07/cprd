import { RequestError } from './request-error.ts'

export function requireUuid(value: unknown) {
    const key = typeof value === 'string' ? value : ''
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(key)) {
        throw new RequestError('Identificador de envío inválido')
    }
    return key
}

export function normalizeLink(value: unknown) {
    if (!value) return ''
    if (typeof value !== 'string') throw new RequestError('El enlace externo debe ser una URL HTTPS válida')
    try {
        const url = new URL(value)
        if (url.protocol !== 'https:') throw new Error()
        return url.toString()
    } catch {
        throw new RequestError('El enlace externo debe ser una URL HTTPS válida')
    }
}

export function cleanOptional(value: unknown, max: number) {
    return typeof value === 'string' ? value.trim().slice(0, max) : ''
}
