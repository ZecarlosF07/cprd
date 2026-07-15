const STATE_LABELS: Record<string, string> = {
    recibida: 'Recibida',
    en_revision: 'En revisión',
    observada: 'Observada',
    subsanada: 'Subsanada',
    admitida: 'Admitida',
    rechazada: 'Rechazada',
    archivada: 'Archivada',
}

export function trackingStateLabel(state: string | null) {
    if (!state) return null
    return STATE_LABELS[state] ?? state.replace(/_/g, ' ')
}

export function trackingSectionLabel(section: string) {
    return section === 'jprd' ? 'JPRD' : section.charAt(0).toUpperCase() + section.slice(1)
}

export function trackingProcedureLabel(procedure: string) {
    return procedure.replace(/_/g, ' ').replace(/^./, (letter: string) => letter.toUpperCase())
}
