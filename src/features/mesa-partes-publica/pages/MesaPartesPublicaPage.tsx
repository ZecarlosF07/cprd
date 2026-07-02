import { useCallback, useMemo, useState } from 'react'
import type { ZodIssue } from 'zod'

import { Button } from '@/components/ui'
import { submitSolicitudPublica } from '@/services'

import {
    ConsentimientosForm,
    DocumentoPrincipalForm,
    DocumentosForm,
    PagoForm,
    PublicLayout,
    SeccionSelector,
    SolicitanteForm,
    TramiteSelector,
    TurnstileWidget,
} from '../components'
import { validarSolicitudPublica } from '../schemas/mesa-partes-publica.schemas'
import type { SolicitudPublicaFormData } from '../types/mesa-partes-publica.types'
import { createInitialPublicIntakeForm } from '../utils/initial-form.utils'
import { getTramiteByCodigo, getTramitesBySeccion } from '../utils/tramites.utils'

export function MesaPartesPublicaPage() {
    const [form, setForm] = useState<SolicitudPublicaFormData>(createInitialPublicIntakeForm)
    const [issues, setIssues] = useState<ZodIssue[]>([])
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [result, setResult] = useState<string | null>(null)
    const [submitError, setSubmitError] = useState<string | null>(null)
    const [captchaResetKey, setCaptchaResetKey] = useState(0)
    const tramite = useMemo(() => getTramiteByCodigo(form.tramiteCodigo), [form.tramiteCodigo])
    const errorFor = (path: string) => issues.find((issue) => issue.path.join('.') === path)?.message
    const handleCaptchaToken = useCallback((captchaToken: string) => {
        setForm((current) => ({ ...current, captchaToken }))
    }, [])

    const handleSeccionChange = (seccion: SolicitudPublicaFormData['seccion']) => {
        const firstTramite = getTramitesBySeccion(seccion)[0]
        setForm({ ...form, seccion, tramiteCodigo: firstTramite.codigo, pago: { ...form.pago, tipoFacturacion: 'boleta' } })
    }

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setSubmitError(null)
        setResult(null)
        const validation = validarSolicitudPublica(form)

        if (!validation.success) {
            setIssues(validation.error.issues)
            return
        }

        setIssues([])
        setIsSubmitting(true)
        try {
            const response = await submitSolicitudPublica(form)
            setResult(response.codigo)
        } catch (error) {
            setSubmitError(error instanceof Error ? error.message : 'No se pudo registrar la solicitud')
            setForm((current) => ({ ...current, captchaToken: '' }))
            setCaptchaResetKey((current) => current + 1)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <PublicLayout>
            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="relative overflow-hidden rounded-lg bg-[#0c211c] px-6 py-7 text-white sm:px-8">
                    <div className="absolute inset-y-0 left-0 w-2 bg-[#b6eb66]" />
                    <p className="mb-2 text-sm font-semibold uppercase text-[#b6eb66]">Centro de Prevención y Resolución de Disputas</p>
                    <h1 className="text-3xl font-semibold">Mesa de partes virtual</h1>
                    <p className="mt-2 max-w-3xl text-[#dce8e2]">
                        Presente documentos sin crear cuenta. Al finalizar recibirá un código único para consultar la trazabilidad.
                    </p>
                </div>
                {result && (
                    <div className="rounded-lg border border-[#83bd45] bg-[#e9f8d2] p-4 text-[#194d16]">
                        Solicitud recibida. Código de seguimiento: <strong>{result}</strong>
                    </div>
                )}
                {submitError && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{submitError}</div>}
                <SeccionSelector value={form.seccion} onChange={handleSeccionChange} />
                <TramiteSelector seccion={form.seccion} value={form.tramiteCodigo} onChange={(tramiteCodigo) => setForm({ ...form, tramiteCodigo })} error={errorFor('tramiteCodigo')} />
                <SolicitanteForm value={form.solicitante} onChange={(solicitante) => setForm({ ...form, solicitante })} errorFor={errorFor} />
                <DocumentoPrincipalForm value={form} tramite={tramite} onChange={setForm} errorFor={errorFor} />
                <DocumentosForm value={form.documentos} onChange={(documentos) => setForm({ ...form, documentos })} errorFor={errorFor} />
                <PagoForm value={form.pago} seccion={form.seccion} required={Boolean(tramite?.requierePago)} onChange={(pago) => setForm({ ...form, pago })} errorFor={errorFor} />
                <ConsentimientosForm value={form} onChange={setForm} errorFor={errorFor} />
                <TurnstileWidget
                    resetKey={captchaResetKey}
                    onToken={handleCaptchaToken}
                    error={errorFor('captchaToken')}
                />
                <Button type="submit" isLoading={isSubmitting} fullWidth>
                    Enviar documento
                </Button>
            </form>
        </PublicLayout>
    )
}
