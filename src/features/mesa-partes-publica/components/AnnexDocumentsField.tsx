import { useRef } from 'react'

import { Button } from '@/components/ui'

import type { AnnexDocumentsFieldProps } from '../types/documentos-form.types'
import { ACCEPTED_PUBLIC_FILES, formatFileSize, MAX_PUBLIC_DOCUMENTS } from '../utils/documentos-form.utils'

export function AnnexDocumentsField(props: AnnexDocumentsFieldProps) {
    const inputRef = useRef<HTMLInputElement>(null)

    return (
        <div className="grid gap-3 sm:grid-cols-[minmax(150px,190px)_1fr] sm:items-start">
            <div><p className="text-sm font-semibold text-[#0c211c]">Anexos</p><p className="text-xs text-neutral-500">Opcional</p></div>
            <div className="min-w-0 space-y-3">
                <input
                    ref={inputRef}
                    type="file"
                    multiple
                    className="sr-only"
                    accept={ACCEPTED_PUBLIC_FILES}
                    onChange={(event) => {
                        props.onAdd(event.target.files)
                        event.currentTarget.value = ''
                    }}
                />
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => inputRef.current?.click()}
                    disabled={props.documentos.length >= MAX_PUBLIC_DOCUMENTS - 1}
                >
                    + Agregar anexos
                </Button>
                {props.documentos.length > 0 ? (
                    <div className="overflow-hidden rounded-lg border border-[#c1d0c7]">
                        {props.documentos.map((documento, index) => (
                            <div key={`${documento.archivo?.name ?? 'anexo'}-${index}`} className="grid gap-2 border-t border-[#dbe5de] px-3 py-3 first:border-t-0 sm:grid-cols-[44px_minmax(0,1fr)_110px_90px] sm:items-center">
                                <span className="hidden text-sm text-neutral-500 sm:block">{index + 1}</span>
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-medium text-[#0c211c]">{documento.archivo?.name ?? 'Anexo sin archivo'}</p>
                                    {props.errorFor(`documentos.${index + 1}`) && <p className="mt-1 text-xs text-red-600">{props.errorFor(`documentos.${index + 1}`)}</p>}
                                </div>
                                <span className="text-xs text-neutral-500 sm:text-sm">{documento.archivo ? formatFileSize(documento.archivo.size) : '-'}</span>
                                <button type="button" className="text-sm font-semibold text-red-700 sm:justify-self-end" onClick={() => props.onRemove(index)}>Quitar</button>
                            </div>
                        ))}
                    </div>
                ) : <p className="text-sm text-neutral-500">No se agregaron anexos.</p>}
                {props.error && <p className="text-sm text-red-600">{props.error}</p>}
                <p className="text-xs text-neutral-500">PDF, Word, JPG o PNG. Máximo 9 anexos y 20 MB entre todos los archivos.</p>
            </div>
        </div>
    )
}
