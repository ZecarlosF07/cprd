import { format } from 'date-fns'

import { Badge } from '@/components/ui'
import { ComprobantePagoUpload } from './ComprobantePagoUpload'
import type { SolicitudPaymentProps } from '../types/solicitud-detail.types'

function paymentVariant(estado: SolicitudPaymentProps['comprobantes'][number]['estado']) {
    if (estado === 'validado') return 'success'
    if (estado === 'observado' || estado === 'rechazado') return 'destructive'
    return 'default'
}

export function SolicitudPayment({ comprobantes, solicitudId }: SolicitudPaymentProps) {
    return (
        <section className="rounded-xl border border-neutral-200 bg-white p-6">
            <h2 className="mb-4 border-b pb-2 text-lg font-semibold text-neutral-900">Comprobante de Pago</h2>
            {comprobantes.length > 0 ? (
                <div className="space-y-4">
                    {comprobantes.map((pago) => (
                        <div key={pago.id} className="rounded-lg border border-neutral-200 p-4">
                            <div className="flex items-center gap-2">
                                <span className="font-medium text-neutral-900">Pago Registrado</span>
                                <Badge variant={paymentVariant(pago.estado)}>{pago.estado.toUpperCase()}</Badge>
                            </div>
                            <p className="mt-1 text-sm text-neutral-500">
                                Operación: {pago.numero_operacion || '-'} · Monto: {pago.monto?.toFixed(2) ?? '-'}
                            </p>
                            <p className="text-xs text-neutral-400">
                                Subido el {format(new Date(pago.created_at), 'dd/MM/yy HH:mm')}
                            </p>
                            {pago.observado_motivo && (
                                <p className="mt-2 rounded bg-red-50 p-2 text-sm text-red-600">
                                    <strong>Observación:</strong> {pago.observado_motivo}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="rounded-lg border border-neutral-100 bg-neutral-50 p-4">
                    <p className="mb-4 rounded-md bg-yellow-50 p-3 text-sm text-yellow-800">
                        Es obligatorio registrar el comprobante de pago para que la solicitud sea revisada.
                    </p>
                    <ComprobantePagoUpload solicitudId={solicitudId} />
                </div>
            )}
        </section>
    )
}
