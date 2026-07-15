import { FormProvider } from 'react-hook-form'

import { ExternalLayout } from '@/components/layout'
import { Button } from '@/components/ui'
import { ArbitrajeForm } from '@/features/solicitudes/components/ArbitrajeForm'
import { JPRDForm } from '@/features/solicitudes/components/JPRDForm'
import { LegacyAttachmentsStep } from '@/features/solicitudes/components/LegacyAttachmentsStep'
import { SolicitudTypeSelector } from '@/features/solicitudes/components/SolicitudTypeSelector'
import { useLegacySolicitudFlow } from '@/features/solicitudes/hooks/useLegacySolicitudFlow'

export function NewSolicitudPage() {
    const flow = useLegacySolicitudFlow()

    return (
        <ExternalLayout>
            <div className="mx-auto max-w-4xl py-6">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-neutral-900">Nueva Solicitud</h1>
                    <p className="mt-2 text-neutral-600">
                        {flow.step === 3 ? 'Paso 3: Adjuntar requisitos y pago' : 'Complete el formulario.'}
                    </p>
                </header>
                <FormProvider {...flow.methods}>
                    <form onSubmit={flow.methods.handleSubmit(flow.saveDetails)} className="space-y-8">
                        <div className={flow.step === 1 ? 'block' : 'hidden'}>
                            <SolicitudTypeSelector />
                            <div className="mt-8 flex justify-end">
                                <Button type="button" onClick={() => void flow.nextStep()}>Continuar</Button>
                            </div>
                        </div>
                        {flow.step === 2 && (
                            <>
                                {flow.tipoSolicitud === 'jprd' ? <JPRDForm /> : <ArbitrajeForm />}
                                <div className="flex justify-between pt-6">
                                    <Button type="button" variant="outline" onClick={() => flow.setStep(1)}>Atrás</Button>
                                    <Button type="submit">Siguiente: Adjuntar Requisitos</Button>
                                </div>
                            </>
                        )}
                    </form>
                </FormProvider>
                {flow.step === 3 && (
                    <LegacyAttachmentsStep
                        documentos={flow.documentos}
                        docComentario={flow.docComentario}
                        docFile={flow.docFile}
                        docTipo={flow.docTipo}
                        isSubmitting={flow.isSubmitting}
                        pago={flow.pago}
                        tipoSolicitud={flow.tipoSolicitud}
                        onAdd={flow.addDocument}
                        onBack={() => flow.setStep(2)}
                        onComentarioChange={flow.setDocComentario}
                        onFileChange={flow.setDocFile}
                        onPaymentFileChange={(file) => flow.setPago({ file })}
                        onRemove={flow.removeDocument}
                        onSubmit={flow.submit}
                        onTipoChange={flow.setDocTipo}
                    />
                )}
            </div>
        </ExternalLayout>
    )
}
