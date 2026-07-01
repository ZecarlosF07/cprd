import type { ReactNode } from 'react'

import type { AdminSolicitud } from '../types/admin-solicitud.types'

interface AdminSolicitudesTableProps {
    solicitudes: AdminSolicitud[]
    selectedId?: string
    onSelect: (solicitud: AdminSolicitud) => void
}

export function AdminSolicitudesTable({ solicitudes, selectedId, onSelect }: AdminSolicitudesTableProps) {
    return (
        <div className="overflow-hidden rounded-lg border border-[#b9cbbf] bg-white">
            <table className="min-w-full divide-y divide-[#c7d3cc]">
                <thead className="bg-[#0c211c]">
                    <tr>
                        <Header>Código</Header>
                        <Header>Trámite</Header>
                        <Header>Solicitante</Header>
                        <Header>Estado</Header>
                        <Header>Ingreso</Header>
                    </tr>
                </thead>
                <tbody className="divide-y divide-[#dce5df]">
                    {solicitudes.map((solicitud) => (
                        <tr
                            key={solicitud.id}
                            onClick={() => onSelect(solicitud)}
                            className={`cursor-pointer hover:bg-[#eef8df] ${selectedId === solicitud.id ? 'bg-[#dff3bf]' : ''}`}
                        >
                            <Cell>{solicitud.codigo_expediente ?? '-'}</Cell>
                            <Cell>{solicitud.tipo_tramite ?? solicitud.tipo_solicitud}</Cell>
                            <Cell>{getSolicitante(solicitud)}</Cell>
                            <Cell>{solicitud.estado}</Cell>
                            <Cell>{new Date(solicitud.created_at).toLocaleDateString()}</Cell>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

function Header({ children }: { children: ReactNode }) {
    return <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-[#dff3bf]">{children}</th>
}

function Cell({ children }: { children: ReactNode }) {
    return <td className="px-4 py-3 text-sm text-neutral-800">{children}</td>
}

function getSolicitante(solicitud: AdminSolicitud) {
    const solicitante = solicitud.partes[0]
    return solicitante?.razon_social || solicitante?.nombres_apellidos || '-'
}
