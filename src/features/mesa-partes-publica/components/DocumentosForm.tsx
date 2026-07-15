import { useState } from 'react'

import type { DocumentoPublico } from '../types/mesa-partes-publica.types'
import type { DocumentosFormProps } from '../types/documentos-form.types'
import { createAnnex, createEmptyPrincipal, MAX_PUBLIC_DOCUMENTS } from '../utils/documentos-form.utils'
import { AnnexDocumentsField } from './AnnexDocumentsField'
import { PrincipalDocumentField } from './PrincipalDocumentField'

export function DocumentosForm({ value, onChange, errorFor }: DocumentosFormProps) {
    const [selectionError, setSelectionError] = useState<string | null>(null)
    const principal = value.find((item) => item.tipoDocumento === 'solicitud_principal') ?? createEmptyPrincipal()
    const annexes = value.filter((item) => item.tipoDocumento !== 'solicitud_principal')

    const emit = (nextPrincipal: DocumentoPublico, nextAnnexes = annexes) => {
        onChange([
            { ...nextPrincipal, tipoDocumento: 'solicitud_principal' },
            ...nextAnnexes.map((annex) => ({ ...annex, tipoDocumento: 'anexo' as const })),
        ])
    }

    const addAnnexes = (files: FileList | null) => {
        if (!files?.length) return
        const available = MAX_PUBLIC_DOCUMENTS - 1 - annexes.length
        if (available <= 0) {
            setSelectionError('Puede adjuntar hasta 9 anexos')
            return
        }
        const selected = Array.from(files)
        setSelectionError(selected.length > available ? 'Solo se agregaron los archivos permitidos' : null)
        emit(principal, [...annexes, ...selected.slice(0, available).map(createAnnex)])
    }

    return (
        <section className="space-y-5">
            <div>
                <h2 className="border-l-4 border-[#2a7221] pl-3 text-lg font-semibold text-[#0c211c]">Archivos del trámite</h2>
                <p className="mt-2 text-sm text-neutral-600">Adjunte el documento principal firmado. Los anexos son opcionales.</p>
            </div>
            <PrincipalDocumentField
                documento={principal}
                error={errorFor('documentos.0')}
                onChange={(documento) => emit(documento)}
                onSelect={(archivo) => archivo && emit({ ...principal, archivo })}
            />
            <AnnexDocumentsField
                documentos={annexes}
                error={selectionError ?? errorFor('documentos')}
                errorFor={errorFor}
                onAdd={addAnnexes}
                onRemove={(index) => emit(principal, annexes.filter((_, current) => current !== index))}
            />
        </section>
    )
}
