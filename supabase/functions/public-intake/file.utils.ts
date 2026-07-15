export function safeName(name: string) {
    return name.normalize('NFKD').replace(/[^a-zA-Z0-9._-]/g, '_').slice(-150)
}

export function mapDocumento(tipo: string) {
    const tipos: Record<string, string> = {
        solicitud_principal: 'demanda',
        anexo: 'otro',
        documento_identidad: 'dni_representante',
        poder: 'poder',
        otro: 'otro',
    }
    return tipos[tipo] ?? 'otro'
}
