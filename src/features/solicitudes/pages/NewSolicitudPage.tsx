import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { ExternalLayout } from '@/components/layout'
import { Button, FileUpload, Input, Select } from '@/components/ui'
import { ArbitrajeForm } from '@/features/solicitudes/components/ArbitrajeForm'
import { JPRDForm } from '@/features/solicitudes/components/JPRDForm'
import { SolicitudTypeSelector } from '@/features/solicitudes/components/SolicitudTypeSelector'
import {
    arbitrajeSchema,
    jprdSchema,
    tipoSolicitudSchema,
} from '@/features/solicitudes/schemas/solicitud.schemas'
import { uploadSolicitudFile } from '@/services/storage.service'
import { addDocumento, addComprobantePago } from '@/services/solicitud.service'
import { useAuthStore, useSolicitudStore } from '@/store'
import type { TipoDocumentoAdjunto } from '@/types'

// Constantes
const DOCUMENT_TYPES = [
    { value: 'demanda', label: 'Demanda / Solicitud' },
    { value: 'contrato', label: 'Contrato / Convenio Arbitral' },
    { value: 'poder', label: 'Poder de Representación' },
    { value: 'dni_representante', label: 'DNI del Representante' },
    { value: 'constitucion_empresa', label: 'Vigencia de Poder / Constitución' },
    { value: 'otro', label: 'Otro Documento' },
]

// Tipos locales
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FormData = any

interface LocalDocumento {
    id: string
    file: File
    tipo: string
    comentario: string
}

interface LocalPago {
    file: File
}

export function NewSolicitudPage() {
    const navigate = useNavigate()
    const { profile, user } = useAuthStore()
    const { createNewSolicitud, addParte } = useSolicitudStore()

    // Estados del flujo
    const [step, setStep] = useState<1 | 2 | 3>(1)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Datos acumulados
    const [solicitudData, setSolicitudData] = useState<FormData>(null)
    const [documentos, setDocumentos] = useState<LocalDocumento[]>([])
    const [pago, setPago] = useState<LocalPago | null>(null)

    // Estados temporales UI Paso 3
    const [docFile, setDocFile] = useState<File | null>(null)
    const [docTipo, setDocTipo] = useState<string>('')
    const [docComentario, setDocComentario] = useState('')

    const methods = useForm<FormData>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: (values, context, options) => {
            if (values.tipo_solicitud === 'jprd') {
                return zodResolver(jprdSchema)(values, context, options)
            }
            if (step === 1) {
                return zodResolver(tipoSolicitudSchema)(values, context, options)
            }
            return zodResolver(arbitrajeSchema)(values, context, options)
        },
        defaultValues: {
            moneda: 'PEN',
        },
    })

    const { watch, handleSubmit, reset, trigger } = methods
    const tipoSolicitud = watch('tipo_solicitud')

    // Precargar datos del usuario
    useEffect(() => {
        if (step === 2 && profile) {
            const commonData = {
                tipo_persona: profile.tipo_persona,
                tipo_documento: profile.tipo_documento,
                numero_documento: profile.numero_documento,
                nombres_apellidos: profile.nombres_apellidos,
                razon_social: profile.razon_social,
                celular: profile.celular,
                domicilio: profile.domicilio,
            }

            if (tipoSolicitud === 'jprd') {
                reset((prev: any) => ({
                    ...prev,
                    contratista: commonData
                }))
            } else {
                reset((prev: any) => ({
                    ...prev,
                    demandante: commonData
                }))
            }
        }
    }, [step, tipoSolicitud, profile, reset])

    // Handler Paso 1 -> 2
    const onNextStep = async () => {
        const valid = await trigger('tipo_solicitud')
        if (valid) setStep(2)
    }

    // Handler Paso 2 -> 3 (Guardar data temporal)
    const onFormSubmit = async (data: FormData) => {
        setSolicitudData(data)
        setStep(3)
        window.scrollTo(0, 0)
        toast.info('Datos guardados. Ahora adjunte los requisitos.')
    }

    // Helpers Paso 3
    const handleAddDocumento = () => {
        if (!docFile || !docTipo) {
            toast.error('Seleccione un archivo y tipo de documento')
            return
        }
        setDocumentos([
            ...documentos,
            {
                id: Math.random().toString(36).slice(2),
                file: docFile,
                tipo: docTipo,
                comentario: docComentario
            }
        ])
        // Reset inputs doc
        setDocFile(null)
        setDocTipo('')
        setDocComentario('')
        toast.success('Documento agregado a la lista')
    }

    const handleRemoveDocumento = (id: string) => {
        setDocumentos(documentos.filter(d => d.id !== id))
    }

    // SUBMIT FINAL
    const onFinalSubmit = async () => {
        if (!user || !solicitudData) return

        // Validaciones finales
        if (documentos.length === 0) {
            toast.error('Debe adjuntar al menos un documento (ej. Demanda)')
            return
        }
        if (!pago) {
            toast.error('Debe registrar la información del pago')
            return
        }

        setIsSubmitting(true)
        try {
            console.log('--- INTENTO DE CREACIÓN ---')
            console.log('User Auth ID:', user.id)
            console.log('Payload Solicitud:', {
                tipo: solicitudData.tipo_solicitud,
                raw: solicitudData
            })

            // 1. Crear Solicitud en BD
            const tipoFinal = solicitudData.tipo_solicitud || tipoSolicitud

            if (!tipoFinal) {
                toast.error('Error: Tipo de solicitud no seleccionado')
                return
            }

            const nuevaSolicitud = await createNewSolicitud(user.id, {
                tipo_solicitud: tipoFinal,
            })

            if (!nuevaSolicitud) throw new Error('Error al crear la solicitud inicial')

            const solicitudId = nuevaSolicitud.id

            // 2. Crear Partes
            if (solicitudData.tipo_solicitud === 'jprd') {
                await addParte(solicitudId, user.id, {
                    ...solicitudData.contratista,
                    rol: 'contratista'
                })
                await addParte(solicitudId, null, {
                    rol: 'entidad',
                    tipo_persona: 'juridica',
                    tipo_documento: 'ruc',
                    numero_documento: solicitudData.entidad.ruc_entidad,
                    razon_social: solicitudData.entidad.nombre_entidad,
                    domicilio: solicitudData.entidad.direccion_entidad,
                    correo_electronico: solicitudData.entidad.correo_contacto
                })
            } else {
                await addParte(solicitudId, user.id, {
                    ...solicitudData.demandante,
                    rol: 'demandante'
                })
                await addParte(solicitudId, null, {
                    ...solicitudData.demandado,
                    rol: 'demandado'
                })
            }

            // 3. Subir y registrar Documentos
            for (const doc of documentos) {
                const uploadRes = await uploadSolicitudFile(solicitudId, doc.file, 'documentos')
                if (!uploadRes.error) {
                    await addDocumento(user.id, solicitudId, {
                        tipo_documento: doc.tipo as TipoDocumentoAdjunto,
                        nombre_archivo: doc.file.name,
                        archivo_url: uploadRes.path,
                        tamano_bytes: doc.file.size,
                        mime_type: doc.file.type,
                        comentario: doc.comentario
                    })
                }
            }

            // 4. Subir y registrar Pago
            const pagoUploadRes = await uploadSolicitudFile(solicitudId, pago.file, 'pagos')
            if (!pagoUploadRes.error) {
                // Registrar pago con valores dummy ya que no se piden al usuario
                await addComprobantePago(user.id, solicitudId, {
                    archivo_url: pagoUploadRes.path,
                    numero_operacion: 'PENDIENTE',
                    monto: 0,
                    fecha_pago: new Date().toISOString(),
                })
            } else {
                toast.error('Error al subir comprobante de pago')
            }

            toast.success('Solicitud completada y enviada correctamente')
            navigate(`/solicitudes/${solicitudId}`)

        } catch (error) {
            console.error(error)
            toast.error('Error al procesar la solicitud. Por favor contacte soporte.')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <ExternalLayout>
            <div className="mx-auto max-w-4xl py-6">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-neutral-900">Nueva Solicitud</h1>
                    <p className="mt-2 text-neutral-600">
                        {step === 3
                            ? 'Paso 3: Adjuntar requisitos y pago'
                            : 'Complete el formulario para iniciar un nuevo procedimiento.'}
                    </p>
                </div>

                <FormProvider {...methods}>
                    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8">

                        {/* Paso 1: Selección de Tipo */}
                        <div className={step === 1 ? 'block' : 'hidden'}>
                            <SolicitudTypeSelector />
                            <div className="mt-8 flex justify-end">
                                <Button type="button" onClick={onNextStep}>
                                    Continuar
                                </Button>
                            </div>
                        </div>

                        {/* Paso 2: Formulario de Partes */}
                        {step === 2 && (
                            <>
                                {tipoSolicitud === 'jprd' ? <JPRDForm /> : <ArbitrajeForm />}
                                <div className="flex justify-between pt-6">
                                    <Button type="button" variant="outline" onClick={() => setStep(1)}>
                                        Atrás
                                    </Button>
                                    <Button type="submit">
                                        Siguiente: Adjuntar Requisitos
                                    </Button>
                                </div>
                            </>
                        )}
                    </form>
                </FormProvider>

                {/* Paso 3: Documentos y Pago */}
                {step === 3 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

                        {/* 1. Lista de Documentos Agregados */}
                        <div className="bg-white p-6 rounded-lg border border-neutral-200">
                            <h2 className="text-xl font-semibold mb-4 text-neutral-900">1. Documentos Adjuntos</h2>

                            {/* Formulario Doc */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 bg-neutral-50 rounded-md">
                                <Select
                                    label="Tipo Doc."
                                    options={DOCUMENT_TYPES}
                                    value={docTipo}
                                    onChange={(e) => setDocTipo(e.target.value)}
                                    placeholder="Seleccione..."
                                />
                                <div className="mt-1">
                                    <FileUpload
                                        label="Archivo"
                                        accept=".pdf,.doc,.docx"
                                        onFileSelect={setDocFile}
                                        error={undefined}
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <Input
                                        label="Comentario"
                                        value={docComentario}
                                        onChange={(e) => setDocComentario(e.target.value)}
                                        placeholder="Descripción opcional"
                                    />
                                </div>
                                <div className="md:col-span-2 flex justify-end">
                                    <Button type="button" variant="secondary" onClick={handleAddDocumento} disabled={!docFile}>
                                        Agregar a la lista
                                    </Button>
                                </div>
                            </div>

                            {/* Lista */}
                            {documentos.length > 0 ? (
                                <ul className="space-y-2">
                                    {documentos.map((d) => (
                                        <li key={d.id} className="flex justify-between items-center bg-neutral-50 p-2 rounded border">
                                            <div>
                                                <span className="font-medium text-sm block">{DOCUMENT_TYPES.find(t => t.value === d.tipo)?.label || d.tipo}</span>
                                                <span className="text-xs text-neutral-500">{d.file.name}</span>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                className="text-red-700 bg-red-50 hover:bg-red-100 border border-red-200"
                                                size="sm"
                                                onClick={() => handleRemoveDocumento(d.id)}
                                            >
                                                Eliminar
                                            </Button>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-neutral-500 text-center py-4">No hay documentos agregados aún.</p>
                            )}
                        </div>

                        {/* 2. Comprobante de Pago */}
                        <div className="bg-white p-6 rounded-lg border border-neutral-200">
                            <h2 className="text-xl font-semibold mb-4 text-neutral-900 border-b pb-2">Comprobante de Pago</h2>

                            <div className="space-y-4 mb-6 text-sm text-neutral-700">
                                <p className="font-medium">Datos para realizar el depósito</p>
                                <p>
                                    Por favor realiza el depósito correspondiente a la siguiente cuenta bancaria.
                                    Recuerda conservar el comprobante para adjuntarlo en esta sección.
                                </p>

                                <div className="bg-neutral-50 p-4 rounded-md border border-neutral-100">
                                    <ul className="list-disc list-inside space-y-1 ml-2">
                                        <li><span className="font-medium">Titular:</span> Lidera Centro de Arbitraje</li>
                                        <li><span className="font-medium">Banco:</span> Scotiabank</li>
                                        <li><span className="font-medium">Cta.:</span> 000-1829570</li>
                                        <li><span className="font-medium">CCI:</span> 009-121-000001829570-59</li>
                                    </ul>
                                </div>

                                <div className="mt-2 text-blue-800 font-medium">
                                    {tipoSolicitud === 'jprd' ? (
                                        <p>Monto a pagar (JPRD): S/ 1,000.00 (Inc. IGV)</p>
                                    ) : (
                                        <p>Monto a pagar ({tipoSolicitud === 'arbitraje_emergencia' ? 'Emergencia' : 'Arbitraje'}): S/ 590.00 (Inc. IGV)</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <p className="font-medium text-neutral-900">Adjunte el comprobante en pdf o jpeg</p>
                                <FileUpload
                                    label="Seleccionar archivo"
                                    accept=".jpg,.jpeg,.png,.pdf"
                                    onFileSelect={(file) => setPago({ file })}
                                    error={undefined}
                                />
                                {pago && (
                                    <p className="text-sm text-green-600 font-medium mt-2">
                                        Archivo seleccionado: {pago.file.name}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Botones Finales */}
                        <div className="flex justify-between pt-6 border-t">
                            <Button type="button" variant="outline" onClick={() => setStep(2)} disabled={isSubmitting}>
                                Atrás (Corregir datos)
                            </Button>
                            <Button onClick={onFinalSubmit} size="lg" isLoading={isSubmitting}>
                                ENVIAR SOLICITUD COMPLETA
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </ExternalLayout>
    )
}
