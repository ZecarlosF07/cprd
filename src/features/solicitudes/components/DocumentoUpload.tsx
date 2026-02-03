import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { Button, FileUpload, Select, Textarea } from '@/components/ui'
import { uploadSolicitudFile } from '@/services/storage.service'
import { useAuthStore, useSolicitudStore } from '@/store'
import type { TipoDocumentoAdjunto } from '@/types'

const documentoSchema = z.object({
    tipo_documento: z.enum([
        'demanda',
        'contrato',
        'poder',
        'dni_representante',
        'constitucion_empresa',
        'otro',
    ]),
    comentario: z.string().optional(),
})

type DocumentoFormData = z.infer<typeof documentoSchema>

const DOCUMENT_TYPES: { value: string; label: string }[] = [
    { value: 'demanda', label: 'Demanda / Solicitud' },
    { value: 'contrato', label: 'Contrato / Convenio Arbitral' },
    { value: 'poder', label: 'Poder de Representación' },
    { value: 'dni_representante', label: 'DNI del Representante' },
    { value: 'constitucion_empresa', label: 'Vigencia de Poder / Constitución' },
    { value: 'otro', label: 'Otro Documento' },
]

interface DocumentoUploadProps {
    solicitudId: string
    onSuccess?: () => void
}

export function DocumentoUpload({ solicitudId, onSuccess }: DocumentoUploadProps) {
    const { user } = useAuthStore()
    const { addDocumento } = useSolicitudStore()
    const [file, setFile] = useState<File | null>(null)
    const [isUploading, setIsUploading] = useState(false)
    const [fileError, setFileError] = useState<string | null>(null)

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<DocumentoFormData>({
        resolver: zodResolver(documentoSchema),
    })

    const onSubmit = async (data: DocumentoFormData) => {
        if (!user) return
        if (!file) {
            setFileError('Debe seleccionar un archivo')
            return
        }

        setIsUploading(true)
        setFileError(null)

        try {
            // 1. Subir a Storage
            const uploadRes = await uploadSolicitudFile(solicitudId, file, 'documentos')

            if (uploadRes.error) {
                throw new Error('Error al subir el archivo: ' + uploadRes.error.message)
            }

            // 2. Crear registro en DB
            const doc = await addDocumento(user.id, solicitudId, {
                tipo_documento: data.tipo_documento as TipoDocumentoAdjunto,
                nombre_archivo: file.name,
                archivo_url: uploadRes.path, // Guardamos el path relativo
                tamano_bytes: file.size,
                mime_type: file.type,
                comentario: data.comentario,
            })

            if (!doc) {
                throw new Error('Error al registrar el documento')
            }

            toast.success('Documento adjuntado correctamente')
            reset()
            setFile(null)
            onSuccess?.()
        } catch (error) {
            console.error(error)
            toast.error(error instanceof Error ? error.message : 'Error desconocido')
        } finally {
            setIsUploading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-lg border border-neutral-200 p-4">
            <h3 className="font-medium text-neutral-900">Adjuntar Documento</h3>

            <Select
                label="Tipo de Documento"
                placeholder="Seleccione el tipo..."
                options={DOCUMENT_TYPES}
                error={errors.tipo_documento?.message}
                {...register('tipo_documento')}
            />

            <Textarea
                label="Comentario (Opcional)"
                placeholder="Descripción adicional del documento..."
                rows={2}
                error={errors.comentario?.message}
                {...register('comentario')}
            />

            <FileUpload
                label="Archivo"
                accept=".pdf,.doc,.docx,.jpg,.png"
                maxSizeMB={20}
                onFileSelect={(selectedFile) => {
                    setFile(selectedFile)
                    setFileError(null)
                }}
                error={fileError || undefined}
                disabled={isUploading}
            />

            <div className="flex justify-end">
                <Button type="submit" isLoading={isUploading} disabled={isUploading}>
                    Adjuntar
                </Button>
            </div>
        </form>
    )
}
