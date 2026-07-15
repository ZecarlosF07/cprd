import { useRef } from 'react'

import { Button, Input } from '@/components/ui'

import type { PrincipalDocumentFieldProps } from '../types/documentos-form.types'
import { ACCEPTED_PUBLIC_FILES, formatFileSize } from '../utils/documentos-form.utils'

export function PrincipalDocumentField(props: PrincipalDocumentFieldProps) {
    const inputRef = useRef<HTMLInputElement>(null)
    const archivo = props.documento.archivo

    return (
        <div className="border-y border-[#c1d0c7] py-5">
            <div className="grid gap-3 sm:grid-cols-[minmax(150px,190px)_1fr] sm:items-center">
                <p className="text-sm font-semibold text-[#0c211c]">Documento principal <span className="text-red-600">*</span></p>
                <div className="min-w-0">
                    <input
                        ref={inputRef}
                        type="file"
                        className="sr-only"
                        accept={ACCEPTED_PUBLIC_FILES}
                        onChange={(event) => props.onSelect(event.target.files?.[0])}
                    />
                    {archivo ? (
                        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-[#c1d0c7] bg-[#f7faf8] px-3 py-2">
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-[#0c211c]">{archivo.name}</p>
                                <p className="text-xs text-neutral-500">{formatFileSize(archivo.size)}</p>
                            </div>
                            <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()}>Cambiar</Button>
                            <Button type="button" variant="secondary" size="sm" onClick={() => props.onChange({ ...props.documento, archivo: undefined })}>Quitar</Button>
                        </div>
                    ) : (
                        <Button type="button" variant="outline" onClick={() => inputRef.current?.click()}>Seleccionar documento</Button>
                    )}
                    {props.error && <p className="mt-2 text-sm text-red-600">{props.error}</p>}
                </div>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(150px,190px)_1fr] sm:items-start">
                <p className="pt-2 text-sm font-medium text-[#0c211c]">Archivo pesado</p>
                <div>
                    <Input
                        type="url"
                        aria-label="Enlace de Drive para archivos pesados"
                        placeholder="https://drive.google.com/..."
                        value={props.documento.enlaceExterno}
                        onChange={(event) => props.onChange({ ...props.documento, enlaceExterno: event.target.value })}
                    />
                    <p className="mt-1 text-xs text-neutral-500">Use un enlace público de Drive si los archivos superan 20 MB en total.</p>
                </div>
            </div>
        </div>
    )
}
