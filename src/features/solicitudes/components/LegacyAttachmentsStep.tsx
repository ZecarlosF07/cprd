import { Button } from '@/components/ui'

import type { LegacyAttachmentsStepProps } from '../types/legacy-solicitud.types'
import { LegacyDocumentsCard } from './LegacyDocumentsCard'
import { LegacyPaymentCard } from './LegacyPaymentCard'

export function LegacyAttachmentsStep(props: LegacyAttachmentsStepProps) {
    return (
        <div className="space-y-8">
            <LegacyDocumentsCard
                documentos={props.documentos}
                docComentario={props.docComentario}
                docFile={props.docFile}
                docTipo={props.docTipo}
                onAdd={props.onAdd}
                onComentarioChange={props.onComentarioChange}
                onFileChange={props.onFileChange}
                onRemove={props.onRemove}
                onTipoChange={props.onTipoChange}
            />
            <LegacyPaymentCard pago={props.pago} tipoSolicitud={props.tipoSolicitud} onPaymentFileChange={props.onPaymentFileChange} />
            <div className="flex justify-between border-t pt-6">
                <Button type="button" variant="outline" onClick={props.onBack} disabled={props.isSubmitting}>Atrás</Button>
                <Button type="button" size="lg" isLoading={props.isSubmitting} onClick={() => void props.onSubmit()}>
                    Enviar solicitud completa
                </Button>
            </div>
        </div>
    )
}
