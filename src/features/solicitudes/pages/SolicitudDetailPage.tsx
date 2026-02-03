import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useEffect } from 'react'
import { useParams } from 'react-router-dom'

import { ExternalLayout } from '@/components/layout'
import { Badge, Loader } from '@/components/ui'
import { useSolicitudStore } from '@/store'
import { ESTADOS_SOLICITUD_OPTIONS, TIPOS_SOLICITUD_OPTIONS } from '@/utils/constants'
import { DocumentoUpload } from '../components/DocumentoUpload'
import { ComprobantePagoUpload } from '../components/ComprobantePagoUpload'

export function SolicitudDetailPage() {
    const { id } = useParams<{ id: string }>()
    const { fetchSolicitudById, solicitudActual, partes, historial, isLoading, error } =
        useSolicitudStore()

    useEffect(() => {
        if (id) {
            fetchSolicitudById(id)
        }
    }, [id, fetchSolicitudById])

    if (isLoading) {
        return (
            <ExternalLayout>
                <div className="flex h-96 items-center justify-center">
                    <Loader />
                </div>
            </ExternalLayout>
        )
    }

    if (error || !solicitudActual) {
        return (
            <ExternalLayout>
                <div className="flex h-96 flex-col items-center justify-center text-center">
                    <p className="text-lg text-red-600 font-medium">{error || 'Solicitud no encontrada'}</p>
                </div>
            </ExternalLayout>
        )
    }

    const tipoLabel = TIPOS_SOLICITUD_OPTIONS.find(
        (t) => t.value === solicitudActual.tipo_solicitud
    )?.label

    const estadoConfig = ESTADOS_SOLICITUD_OPTIONS.find(
        (e) => e.value === solicitudActual.estado
    )

    return (
        <ExternalLayout>
            <div className="mx-auto max-w-5xl py-6 space-y-8">
                {/* Encabezado */}
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold text-neutral-900">
                                Expediente {solicitudActual.codigo_expediente}
                            </h1>
                            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${estadoConfig?.color}`}>
                                {estadoConfig?.label}
                            </span>
                        </div>
                        <p className="mt-1 text-sm text-neutral-500">
                            Registrado el {format(new Date(solicitudActual.created_at), "d 'de' MMMM 'de' yyyy", { locale: es })}
                        </p>
                    </div>
                    <div className="text-right">
                        <span className="inline-block rounded-lg bg-neutral-100 px-3 py-1 text-sm font-medium text-neutral-700">
                            {tipoLabel}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    {/* Columna Principal */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Información General */}
                        <section className="bg-white p-6 rounded-xl border border-neutral-200">
                            <h2 className="text-lg font-semibold text-neutral-900 mb-4 border-b pb-2">
                                Información del Procedimiento
                            </h2>
                            <dl className="grid grid-cols-1 gap-y-4 sm:grid-cols-2">
                                <div>
                                    <dt className="text-sm font-medium text-neutral-500">Materia</dt>
                                    <dd className="mt-1 text-sm text-neutral-900">{solicitudActual.materia || '-'}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-neutral-500">Cuantía</dt>
                                    <dd className="mt-1 text-sm text-neutral-900">
                                        {solicitudActual.cuantia
                                            ? `${solicitudActual.moneda} ${solicitudActual.cuantia.toLocaleString()}`
                                            : 'No especificada'}
                                    </dd>
                                </div>
                                <div className="sm:col-span-2">
                                    <dt className="text-sm font-medium text-neutral-500">Descripción / Controversia</dt>
                                    <dd className="mt-1 text-sm text-neutral-900 whitespace-pre-wrap">
                                        {solicitudActual.descripcion_controversia || '-'}
                                    </dd>
                                </div>
                            </dl>
                        </section>

                        {/* Documentos del Expediente */}
                        <section className="bg-white p-6 rounded-xl border border-neutral-200">
                            <div className="flex items-center justify-between mb-4 border-b pb-2">
                                <h2 className="text-lg font-semibold text-neutral-900">
                                    Documentos Adjuntos
                                </h2>
                            </div>

                            <div className="mb-6 space-y-4">
                                {solicitudActual.documentos && solicitudActual.documentos.length > 0 ? (
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
                                                {solicitudActual.documentos.map((doc) => (
                                                    <tr key={doc.id}>
                                                        <td className="px-4 py-3">
                                                            <div className="text-sm font-medium text-neutral-900">
                                                                {doc.tipo_documento.replace(/_/g, ' ').toUpperCase()}
                                                            </div>
                                                            <div className="text-sm text-neutral-500 truncate max-w-xs">{doc.nombre_archivo}</div>
                                                            {doc.comentario && <p className="text-xs text-neutral-400 italic">"{doc.comentario}"</p>}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-neutral-500">
                                                            {format(new Date(doc.created_at), "dd/MM/yy HH:mm", { locale: es })}
                                                        </td>
                                                        <td className="px-4 py-3 text-right text-sm">
                                                            <a
                                                                href={doc.link_externo || '#'}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="text-blue-600 hover:text-blue-800 font-medium"
                                                                onClick={(e) => {
                                                                    if (!doc.link_externo && doc.archivo_url) {
                                                                        e.preventDefault()
                                                                        // Aquí deberíamos manejar la descarga con signedUrl
                                                                        // Por simplicidad, implementaremos un handler de descarga luego o asumimos link directo si fuera público
                                                                        alert('Descarga no implementada con URL firmada aún. Ver storage service.')
                                                                    }
                                                                }}
                                                            >
                                                                Ver
                                                            </a>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <p className="text-sm text-neutral-500 italic">No hay documentos adjuntos.</p>
                                )}
                            </div>

                            <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-100">
                                <DocumentoUpload
                                    solicitudId={solicitudActual.id}
                                    onSuccess={() => { }} // Store actualiza auto
                                />
                            </div>
                        </section>

                        {/* Comprobante de Pago */}
                        <section className="bg-white p-6 rounded-xl border border-neutral-200">
                            <h2 className="text-lg font-semibold text-neutral-900 mb-4 border-b pb-2">
                                Comprobante de Pago
                            </h2>

                            {solicitudActual.comprobantes_pago && solicitudActual.comprobantes_pago.length > 0 ? (
                                <div className="space-y-4">
                                    {solicitudActual.comprobantes_pago.map((pago) => (
                                        <div key={pago.id} className="flex items-center justify-between rounded-lg border border-neutral-200 p-4">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-neutral-900">Pago Registrado</span>
                                                    <Badge variant={pago.estado === 'validado' ? 'success' : pago.estado === 'observado' ? 'destructive' : 'default'}>
                                                        {pago.estado.toUpperCase()}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-neutral-500 mt-1">
                                                    Operación: {pago.numero_operacion || '-'} • Monto: {pago.monto?.toFixed(2)}
                                                </p>
                                                <p className="text-xs text-neutral-400">
                                                    Subido el {format(new Date(pago.created_at), "dd/MM/yy HH:mm", { locale: es })}
                                                </p>
                                                {pago.observado_motivo && (
                                                    <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                                                        <strong>Observación:</strong> {pago.observado_motivo}
                                                    </div>
                                                )}
                                            </div>
                                            {/* Aquí podríamos poner botón para ver el voucher */}
                                        </div>
                                    ))}

                                    {/* Si el último pago está rechazado u observado, permitir subir otro? */}
                                </div>
                            ) : (
                                <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-100">
                                    <div className="mb-4 rounded-md bg-yellow-50 p-3 text-sm text-yellow-800">
                                        ⚠️ Es obligatorio registrar el comprobante de pago para que la solicitud sea revisada.
                                    </div>
                                    <ComprobantePagoUpload solicitudId={solicitudActual.id} />
                                </div>
                            )}
                        </section>

                        {/* Partes Involucradas (Movido abajo) */}
                        <section className="bg-white p-6 rounded-xl border border-neutral-200">
                            <h2 className="text-lg font-semibold text-neutral-900 mb-4 border-b pb-2">
                                Partes Involucradas
                            </h2>
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                {partes.map((parte) => (
                                    <div key={parte.id} className="rounded-lg border border-neutral-100 bg-neutral-50 p-4">
                                        <span className="mb-2 inline-block rounded border border-neutral-200 bg-white px-2 py-0.5 text-xs font-medium uppercase tracking-wider text-neutral-500">
                                            {parte.rol}
                                        </span>
                                        <p className="font-medium text-neutral-900">
                                            {parte.razon_social || parte.nombres_apellidos}
                                        </p>
                                        <p className="text-sm text-neutral-500">
                                            {parte.tipo_documento.toUpperCase()}: {parte.numero_documento}
                                        </p>
                                        {parte.domicilio && (
                                            <p className="mt-2 text-xs text-neutral-400 truncate">
                                                📍 {parte.domicilio}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* Columna Lateral (Historial) */}
                    <div className="space-y-6">
                        <section className="bg-white p-6 rounded-xl border border-neutral-200">
                            <h2 className="text-lg font-semibold text-neutral-900 mb-4 border-b pb-2">
                                Historial
                            </h2>
                            <div className="flow-root">
                                <ul className="-mb-8">
                                    {historial.map((evento, eventIdx) => (
                                        <li key={evento.id}>
                                            <div className="relative pb-8">
                                                {eventIdx !== historial.length - 1 ? (
                                                    <span
                                                        className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-neutral-200"
                                                        aria-hidden="true"
                                                    />
                                                ) : null}
                                                <div className="relative flex space-x-3">
                                                    <div>
                                                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 ring-8 ring-white">
                                                            <div className="h-2.5 w-2.5 rounded-full bg-blue-600" />
                                                        </span>
                                                    </div>
                                                    <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                                                        <div>
                                                            <p className="text-sm text-neutral-900">
                                                                {evento.descripcion} <span className="font-medium text-neutral-500">({evento.accion})</span>
                                                            </p>
                                                        </div>
                                                        <div className="whitespace-nowrap text-right text-sm text-neutral-500">
                                                            {format(new Date(evento.created_at), "dd/MM/yy HH:mm", { locale: es })}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </ExternalLayout>
    )
}
