import { Button, Input, Select, Textarea } from '@/components/ui'

import type { DocumentoPublico } from '../types/mesa-partes-publica.types'

interface DocumentosFormProps {
    value: DocumentoPublico[]
    onChange: (value: DocumentoPublico[]) => void
    error?: string
}

const emptyDocument: DocumentoPublico = {
    tipoDocumento: 'solicitud_principal',
    comentario: '',
    enlaceExterno: '',
}

export function DocumentosForm({ value, onChange, error }: DocumentosFormProps) {
    const update = (index: number, field: keyof DocumentoPublico, next: string | File | undefined) => {
        onChange(value.map((documento, current) => current === index ? { ...documento, [field]: next } : documento))
    }

    return (
        <section className="space-y-4">
            <div className="flex items-center justify-between gap-3">
                <h2 className="border-l-4 border-[#2a7221] pl-3 text-lg font-semibold text-[#0c211c]">Documentos</h2>
                <Button type="button" variant="outline" size="sm" onClick={() => onChange([...value, { ...emptyDocument }])}>
                    Agregar documento
                </Button>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            {value.map((documento, index) => (
                <div key={index} className="space-y-3 rounded-lg border border-[#c1d0c7] bg-white p-4 shadow-sm">
                    <Select
                        label="Tipo de documento"
                        value={documento.tipoDocumento}
                        onChange={(event) => update(index, 'tipoDocumento', event.target.value)}
                        options={[{ value: 'solicitud_principal', label: 'Solicitud principal' }, { value: 'anexo', label: 'Anexo' }, { value: 'documento_identidad', label: 'Documento de identidad' }, { value: 'poder', label: 'Poder' }, { value: 'otro', label: 'Otro' }]}
                    />
                    <Input type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" onChange={(event) => update(index, 'archivo', event.target.files?.[0])} />
                    <Input label="Enlace de Drive para archivos pesados" value={documento.enlaceExterno} onChange={(event) => update(index, 'enlaceExterno', event.target.value)} />
                    <Textarea label="Comentario" value={documento.comentario} onChange={(event) => update(index, 'comentario', event.target.value)} />
                    {value.length > 1 && (
                        <Button type="button" variant="secondary" size="sm" onClick={() => onChange(value.filter((_, current) => current !== index))}>
                            Quitar
                        </Button>
                    )}
                </div>
            ))}
        </section>
    )
}
