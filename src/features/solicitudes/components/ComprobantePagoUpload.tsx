import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { Button, FileUpload, Input } from '@/components/ui'
import { uploadSolicitudFile } from '@/services/storage.service'
import { useAuthStore, useSolicitudStore } from '@/store'

const pagoSchema = z.object({
    numero_operacion: z.string().min(4, 'Ingrese el número de operación'),
    monto: z.coerce.number().min(0.01, 'Monto inválido'),
    fecha_pago: z.string().refine((val) => !isNaN(Date.parse(val)), 'Fecha inválida'),
})

type PagoFormData = z.infer<typeof pagoSchema>

interface ComprobantePagoUploadProps {
    solicitudId: string
    onSuccess?: () => void
}

export function ComprobantePagoUpload({ solicitudId, onSuccess }: ComprobantePagoUploadProps) {
    const { user } = useAuthStore()
    const { addComprobantePago } = useSolicitudStore()
    const [file, setFile] = useState<File | null>(null)
    const [isUploading, setIsUploading] = useState(false)
    const [fileError, setFileError] = useState<string | null>(null)

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(pagoSchema),
    })

    const onSubmit = async (data: PagoFormData) => {
        if (!user) return
        if (!file) {
            setFileError('Debe adjuntar el comprobante')
            return
        }

        setIsUploading(true)
        setFileError(null)

        try {
            // 1. Subir a Storage
            const uploadRes = await uploadSolicitudFile(solicitudId, file, 'pagos')

            if (uploadRes.error) {
                throw new Error('Error al subir el archivo: ' + uploadRes.error.message)
            }

            // 2. Crear registro
            const pago = await addComprobantePago(user.id, solicitudId, {
                archivo_url: uploadRes.path,
                numero_operacion: data.numero_operacion,
                monto: data.monto,
                fecha_pago: data.fecha_pago,
            })

            if (!pago) {
                throw new Error('Error al registrar el pago')
            }

            toast.success('Comprobante registrado correctamente')
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
            <h3 className="font-medium text-neutral-900">Registrar Comprobante de Pago</h3>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Input
                    label="Número de Operación"
                    placeholder="Ej: 123456"
                    error={errors.numero_operacion?.message}
                    {...register('numero_operacion')}
                />

                <Input
                    label="Monto Pagado"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    error={errors.monto?.message}
                    {...register('monto')}
                />
            </div>

            <Input
                label="Fecha de Pago"
                type="date"
                error={errors.fecha_pago?.message}
                {...register('fecha_pago')}
            />

            <FileUpload
                label="Adjuntar Voucher / Comprobante"
                accept=".pdf,.jpg,.png,.jpeg"
                maxSizeMB={10}
                onFileSelect={(selectedFile) => {
                    setFile(selectedFile)
                    setFileError(null)
                }}
                error={fileError || undefined}
                disabled={isUploading}
            />

            <div className="flex justify-end">
                <Button type="submit" isLoading={isUploading} disabled={isUploading}>
                    Registrar Pago
                </Button>
            </div>
        </form>
    )
}
