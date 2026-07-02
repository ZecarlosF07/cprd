import { Input, Textarea } from '@/components/ui'

import type { SolicitudPublicaFormData, TramiteMesaPartes } from '../types/mesa-partes-publica.types'

interface DocumentoPrincipalFormProps {
    value: SolicitudPublicaFormData
    tramite?: TramiteMesaPartes
    onChange: (value: SolicitudPublicaFormData) => void
    errorFor: (path: string) => string | undefined
}

export function DocumentoPrincipalForm({ value, tramite, onChange, errorFor }: DocumentoPrincipalFormProps) {
    const update = (field: 'numeroExpedienteReferido' | 'sumilla' | 'asunto', next: string) => {
        onChange({ ...value, [field]: next })
    }

    if (!tramite?.requiereExpediente && !tramite?.requiereSumilla && !tramite?.requiereAsunto) {
        return null
    }

    return (
        <section className="space-y-4">
            <h2 className="border-l-4 border-[#2a7221] pl-3 text-lg font-semibold text-[#0c211c]">Datos del documento</h2>
            {tramite?.requiereExpediente && (
                <Input label="Número de expediente" value={value.numeroExpedienteReferido} onChange={(event) => update('numeroExpedienteReferido', event.target.value)} error={errorFor('numeroExpedienteReferido')} />
            )}
            {tramite?.requiereSumilla && (
                <Input label="Sumilla" value={value.sumilla} onChange={(event) => update('sumilla', event.target.value)} error={errorFor('sumilla')} />
            )}
            {tramite?.requiereAsunto && (
                <Textarea label="Asunto" value={value.asunto} onChange={(event) => update('asunto', event.target.value)} error={errorFor('asunto')} />
            )}
        </section>
    )
}
