import { format } from 'date-fns'

import { DocumentoUpload } from './DocumentoUpload'
import type { SolicitudDocumentsProps } from '../types/solicitud-detail.types'

export function SolicitudDocuments({ documentos, solicitudId }: SolicitudDocumentsProps) {
    return (
        <section className="rounded-xl border border-neutral-200 bg-white p-6">
            <h2 className="mb-4 border-b pb-2 text-lg font-semibold text-neutral-900">
                Documentos Adjuntos
            </h2>
            <div className="mb-6 space-y-4">
                {documentos.length > 0 ? (
                    <div className="overflow-hidden rounded-lg border border-neutral-200">
                        <table className="min-w-full divide-y divide-neutral-200">
                            <thead className="bg-neutral-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">Documento</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">Fecha</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-neutral-500">Acción</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-200 bg-white">
                                {documentos.map((documento) => (
                                    <tr key={documento.id}>
                                        <td className="px-4 py-3">
                                            <p className="text-sm font-medium text-neutral-900">
                                                {documento.tipo_documento.replace(/_/g, ' ').toUpperCase()}
                                            </p>
                                            <p className="max-w-xs truncate text-sm text-neutral-500">{documento.nombre_archivo}</p>
                                            {documento.comentario && <p className="text-xs italic text-neutral-400">“{documento.comentario}”</p>}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-neutral-500">
                                            {format(new Date(documento.created_at), 'dd/MM/yy HH:mm')}
                                        </td>
                                        <td className="px-4 py-3 text-right text-sm">
                                            {documento.link_externo ? (
                                                <a href={documento.link_externo} target="_blank" rel="noreferrer" className="font-medium text-blue-600 hover:text-blue-800">Ver</a>
                                            ) : (
                                                <span className="text-neutral-400" title="Requiere una URL firmada">No disponible</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : <p className="text-sm italic text-neutral-500">No hay documentos adjuntos.</p>}
            </div>
            <div className="rounded-lg border border-neutral-100 bg-neutral-50 p-4">
                <DocumentoUpload solicitudId={solicitudId} onSuccess={() => undefined} />
            </div>
        </section>
    )
}
