export interface TrazabilidadEvento {
    id: string
    tipo: string
    titulo: string
    descripcion: string | null
    estadoAnterior: string | null
    estadoNuevo: string | null
    fecha: string
}

export interface TrazabilidadPublica {
    codigo: string
    seccion: string
    tramite: string
    fechaIngreso: string
    estado: string
    eventos: TrazabilidadEvento[]
}

export interface TrazabilidadSummaryProps {
    trazabilidad: TrazabilidadPublica
}

export interface TrazabilidadTimelineProps {
    eventos: TrazabilidadEvento[]
}
