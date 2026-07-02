import { useRef, useState } from 'react'

import { Button, Input } from '@/components/ui'

import type { DocumentoPublico } from '../types/mesa-partes-publica.types'

interface DocumentosFormProps {
    value: DocumentoPublico[]
    onChange: (value: DocumentoPublico[]) => void
    errorFor: (path: string) => string | undefined
}

const ACCEPTED_FILES = '.pdf,.doc,.docx,.jpg,.jpeg,.png'
const MAX_DOCUMENTS = 10

const emptyPrincipal = (): DocumentoPublico => ({
    tipoDocumento: 'solicitud_principal',
    comentario: '',
    enlaceExterno: '',
})

const createAnnex = (archivo: File): DocumentoPublico => ({
    tipoDocumento: 'anexo',
    comentario: '',
    enlaceExterno: '',
    archivo,
})

function formatFileSize(bytes: number) {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

export function DocumentosForm({ value, onChange, errorFor }: DocumentosFormProps) {
    const principalInputRef = useRef<HTMLInputElement>(null)
    const annexInputRef = useRef<HTMLInputElement>(null)
    const [selectionError, setSelectionError] = useState<string | null>(null)
    const principal = value.find((documento) => documento.tipoDocumento === 'solicitud_principal') ?? emptyPrincipal()
    const annexes = value.filter((documento) => documento.tipoDocumento !== 'solicitud_principal')

    const emit = (nextPrincipal: DocumentoPublico, nextAnnexes = annexes) => {
        onChange([
            { ...nextPrincipal, tipoDocumento: 'solicitud_principal' },
            ...nextAnnexes.map((annex) => ({ ...annex, tipoDocumento: 'anexo' as const })),
        ])
    }

    const selectPrincipal = (file?: File) => {
        if (!file) return
        setSelectionError(null)
        emit({ ...principal, archivo: file })
    }

    const addAnnexes = (files: FileList | null) => {
        if (!files?.length) return
        const availableSlots = MAX_DOCUMENTS - 1 - annexes.length
        if (availableSlots <= 0) {
            setSelectionError('Puede adjuntar hasta 9 anexos')
            return
        }

        const selected = Array.from(files)
        const accepted = selected.slice(0, availableSlots)
        setSelectionError(selected.length > availableSlots ? 'Solo se agregaron los archivos permitidos; el máximo es 9 anexos' : null)
        emit(principal, [...annexes, ...accepted.map(createAnnex)])
        if (annexInputRef.current) annexInputRef.current.value = ''
    }

    const removeAnnex = (index: number) => {
        setSelectionError(null)
        emit(principal, annexes.filter((_, current) => current !== index))
    }

    const principalError = errorFor('documentos.0')
    const generalError = errorFor('documentos')

    return (
        <section className="space-y-5">
            <div>
                <h2 className="border-l-4 border-[#2a7221] pl-3 text-lg font-semibold text-[#0c211c]">Archivos del trámite</h2>
                <p className="mt-2 text-sm text-neutral-600">Adjunte el documento principal firmado. Los anexos son opcionales.</p>
            </div>

            <div className="border-y border-[#c1d0c7] py-5">
                <div className="grid gap-3 sm:grid-cols-[minmax(150px,190px)_1fr] sm:items-center">
                    <p className="text-sm font-semibold text-[#0c211c]">Documento principal <span className="text-red-600">*</span></p>
                    <div className="min-w-0">
                        <input
                            ref={principalInputRef}
                            type="file"
                            className="sr-only"
                            accept={ACCEPTED_FILES}
                            onChange={(event) => selectPrincipal(event.target.files?.[0])}
                        />
                        {principal.archivo ? (
                            <div className="flex flex-wrap items-center gap-3 rounded-lg border border-[#c1d0c7] bg-[#f7faf8] px-3 py-2">
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium text-[#0c211c]">{principal.archivo.name}</p>
                                    <p className="text-xs text-neutral-500">{formatFileSize(principal.archivo.size)}</p>
                                </div>
                                <Button type="button" variant="outline" size="sm" onClick={() => principalInputRef.current?.click()}>
                                    Cambiar
                                </Button>
                                <Button type="button" variant="secondary" size="sm" onClick={() => emit({ ...principal, archivo: undefined })}>
                                    Quitar
                                </Button>
                            </div>
                        ) : (
                            <Button type="button" variant="outline" onClick={() => principalInputRef.current?.click()}>
                                Seleccionar documento
                            </Button>
                        )}
                        {principalError && <p className="mt-2 text-sm text-red-600">{principalError}</p>}
                    </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(150px,190px)_1fr] sm:items-start">
                    <p className="pt-2 text-sm font-medium text-[#0c211c]">Archivo pesado</p>
                    <div>
                        <Input
                            type="url"
                            aria-label="Enlace de Drive para archivos pesados"
                            placeholder="https://drive.google.com/..."
                            value={principal.enlaceExterno}
                            onChange={(event) => emit({ ...principal, enlaceExterno: event.target.value })}
                        />
                        <p className="mt-1 text-xs text-neutral-500">Use un enlace público de Drive si los archivos superan 20 MB en total.</p>
                    </div>
                </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-[minmax(150px,190px)_1fr] sm:items-start">
                <div>
                    <p className="text-sm font-semibold text-[#0c211c]">Anexos</p>
                    <p className="text-xs text-neutral-500">Opcional</p>
                </div>
                <div className="min-w-0 space-y-3">
                    <input
                        ref={annexInputRef}
                        type="file"
                        multiple
                        className="sr-only"
                        accept={ACCEPTED_FILES}
                        onChange={(event) => addAnnexes(event.target.files)}
                    />
                    <Button type="button" variant="outline" size="sm" onClick={() => annexInputRef.current?.click()} disabled={annexes.length >= MAX_DOCUMENTS - 1}>
                        + Agregar anexos
                    </Button>

                    {annexes.length > 0 && (
                        <div className="overflow-hidden rounded-lg border border-[#c1d0c7]">
                            <div className="hidden grid-cols-[44px_minmax(0,1fr)_110px_90px] gap-2 bg-[#edf4ef] px-3 py-2 text-xs font-semibold uppercase text-[#355046] sm:grid">
                                <span>#</span>
                                <span>Nombre</span>
                                <span>Tamaño</span>
                                <span className="text-right">Acción</span>
                            </div>
                            {annexes.map((annex, index) => (
                                <div key={`${annex.archivo?.name ?? 'anexo'}-${index}`} className="grid gap-2 border-t border-[#dbe5de] px-3 py-3 first:border-t-0 sm:grid-cols-[44px_minmax(0,1fr)_110px_90px] sm:items-center">
                                    <span className="hidden text-sm text-neutral-500 sm:block">{index + 1}</span>
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-medium text-[#0c211c]">{annex.archivo?.name ?? 'Anexo sin archivo'}</p>
                                        {errorFor(`documentos.${index + 1}`) && <p className="mt-1 text-xs text-red-600">{errorFor(`documentos.${index + 1}`)}</p>}
                                    </div>
                                    <span className="text-xs text-neutral-500 sm:text-sm">{annex.archivo ? formatFileSize(annex.archivo.size) : '-'}</span>
                                    <button
                                        type="button"
                                        className="justify-self-start text-sm font-semibold text-red-700 hover:text-red-900 focus:outline-none focus:ring-2 focus:ring-red-300 sm:justify-self-end"
                                        onClick={() => removeAnnex(index)}
                                        aria-label={`Quitar ${annex.archivo?.name ?? `anexo ${index + 1}`}`}
                                    >
                                        Quitar
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                    {annexes.length === 0 && <p className="text-sm text-neutral-500">No se agregaron anexos.</p>}
                    {(selectionError || generalError) && <p className="text-sm text-red-600">{selectionError ?? generalError}</p>}
                    <p className="text-xs text-neutral-500">PDF, Word, JPG o PNG. Máximo 9 anexos y 20 MB entre todos los archivos.</p>
                </div>
            </div>
        </section>
    )
}
