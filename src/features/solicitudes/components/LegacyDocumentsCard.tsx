import { Button, FileUpload, Input, Select } from '@/components/ui'

import type { LegacyDocumentsCardProps } from '../types/legacy-solicitud.types'
import { LEGACY_DOCUMENT_TYPES } from '../utils/legacy-solicitud.constants'

export function LegacyDocumentsCard(props: LegacyDocumentsCardProps) {
    return (
        <section className="rounded-lg border border-neutral-200 bg-white p-6">
            <h2 className="mb-4 text-xl font-semibold text-neutral-900">1. Documentos Adjuntos</h2>
            <div className="mb-4 grid gap-4 rounded-md bg-neutral-50 p-4 md:grid-cols-2">
                <Select
                    label="Tipo Doc."
                    options={LEGACY_DOCUMENT_TYPES}
                    value={props.docTipo}
                    onChange={(event) => props.onTipoChange(event.target.value as typeof props.docTipo)}
                    placeholder="Seleccione..."
                />
                <FileUpload label="Archivo" accept=".pdf,.doc,.docx" onFileSelect={props.onFileChange} />
                <div className="md:col-span-2">
                    <Input
                        label="Comentario"
                        value={props.docComentario}
                        onChange={(event) => props.onComentarioChange(event.target.value)}
                        placeholder="Descripción opcional"
                    />
                </div>
                <div className="flex justify-end md:col-span-2">
                    <Button type="button" variant="secondary" onClick={props.onAdd} disabled={!props.docFile}>
                        Agregar a la lista
                    </Button>
                </div>
            </div>
            {props.documentos.length === 0 ? (
                <p className="py-4 text-center text-sm text-neutral-500">No hay documentos agregados aún.</p>
            ) : (
                <ul className="space-y-2">
                    {props.documentos.map((documento) => (
                        <li key={documento.id} className="flex items-center justify-between rounded border bg-neutral-50 p-2">
                            <div>
                                <span className="block text-sm font-medium">
                                    {LEGACY_DOCUMENT_TYPES.find((type) => type.value === documento.tipo)?.label}
                                </span>
                                <span className="text-xs text-neutral-500">{documento.file.name}</span>
                            </div>
                            <Button type="button" variant="secondary" size="sm" onClick={() => props.onRemove(documento.id)}>
                                Eliminar
                            </Button>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    )
}
