import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { submitLegacySolicitud } from '@/services/legacy-solicitud-submit.service'
import { useAuthStore } from '@/store'
import type { TipoDocumentoAdjunto } from '@/types'

import { legacySolicitudSchema } from '../schemas/solicitud.schemas'
import type { LegacyDocumento, LegacyPago, LegacySolicitudFormData } from '../types/legacy-solicitud.types'
import { createLegacyFormDefaults, profileToLegacyPart } from '../utils/legacy-form.utils'

export function useLegacySolicitudFlow() {
    const navigate = useNavigate()
    const { profile, user } = useAuthStore()
    const [step, setStep] = useState<1 | 2 | 3>(1)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [solicitudData, setSolicitudData] = useState<LegacySolicitudFormData | null>(null)
    const [documentos, setDocumentos] = useState<LegacyDocumento[]>([])
    const [pago, setPago] = useState<LegacyPago | null>(null)
    const [docFile, setDocFile] = useState<File | null>(null)
    const [docTipo, setDocTipo] = useState<TipoDocumentoAdjunto | ''>('')
    const [docComentario, setDocComentario] = useState('')
    const methods = useForm<LegacySolicitudFormData>({
        resolver: zodResolver(legacySolicitudSchema),
        defaultValues: createLegacyFormDefaults(),
    })
    const tipoSolicitud = methods.watch('tipo_solicitud')

    useEffect(() => {
        if (step !== 2 || !profile) return
        const current = methods.getValues()
        const profilePart = profileToLegacyPart(profile)
        methods.reset(tipoSolicitud === 'jprd'
            ? { ...current, contratista: profilePart }
            : { ...current, demandante: profilePart })
    }, [methods, profile, step, tipoSolicitud])

    const nextStep = async () => {
        if (!await methods.trigger('tipo_solicitud')) return
        methods.setValue('formStep', 2)
        setStep(2)
    }

    const saveDetails = (data: LegacySolicitudFormData) => {
        setSolicitudData(data)
        setStep(3)
        window.scrollTo(0, 0)
        toast.info('Datos guardados. Ahora adjunte los requisitos.')
    }

    const addDocument = () => {
        if (!docFile || !docTipo) {
            toast.error('Seleccione un archivo y tipo de documento')
            return
        }
        setDocumentos((current) => [...current, {
            id: crypto.randomUUID(), file: docFile, tipo: docTipo, comentario: docComentario,
        }])
        setDocFile(null)
        setDocTipo('')
        setDocComentario('')
    }

    const submit = async () => {
        if (!user || !solicitudData) return
        if (documentos.length === 0 || !pago) {
            toast.error(documentos.length === 0 ? 'Debe adjuntar al menos un documento' : 'Debe adjuntar el pago')
            return
        }
        setIsSubmitting(true)
        try {
            const solicitudId = await submitLegacySolicitud(user.id, solicitudData, documentos, pago)
            toast.success('Solicitud completada y enviada correctamente')
            void navigate(`/solicitudes/${solicitudId}`)
        } catch (error) {
            console.error(error)
            toast.error('Error al procesar la solicitud. Por favor contacte soporte.')
        } finally {
            setIsSubmitting(false)
        }
    }

    return {
        addDocument, docComentario, docFile, docTipo, documentos, isSubmitting, methods,
        nextStep, pago, removeDocument: (id: string) => setDocumentos((items) => items.filter((item) => item.id !== id)),
        saveDetails, setDocComentario, setDocFile, setDocTipo, setPago, setStep, step, submit, tipoSolicitud,
    }
}
