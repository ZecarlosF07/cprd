import { FileUpload } from '@/components/ui'

import type { LegacyPaymentCardProps } from '../types/legacy-solicitud.types'

export function LegacyPaymentCard({ pago, tipoSolicitud, onPaymentFileChange }: LegacyPaymentCardProps) {
    const tipoLabel = tipoSolicitud === 'jprd'
        ? 'JPRD'
        : tipoSolicitud === 'arbitraje_emergencia' ? 'Emergencia' : 'Arbitraje'

    return (
        <section className="rounded-lg border border-neutral-200 bg-white p-6">
            <h2 className="mb-4 border-b pb-2 text-xl font-semibold text-neutral-900">Comprobante de Pago</h2>
            <div className="mb-6 space-y-4 text-sm text-neutral-700">
                <p className="font-medium">Datos para realizar el depósito</p>
                <p>Realice el depósito correspondiente y conserve el comprobante para adjuntarlo.</p>
                <div className="rounded-md border border-neutral-100 bg-neutral-50 p-4">
                    <ul className="ml-2 list-inside list-disc space-y-1">
                        <li><strong>Titular:</strong> Cámara de Comercio, Industria y Turismo de Ica</li>
                        <li><strong>Interbank:</strong> 400-2600696439</li>
                        <li><strong>BBVA:</strong> 0011-0203-0100002047</li>
                        <li><strong>BCP:</strong> 380-7000415044</li>
                    </ul>
                </div>
                <p className="font-medium text-blue-800">Monto a pagar ({tipoLabel}): consulte el tarifario vigente.</p>
            </div>
            <FileUpload label="Seleccionar comprobante" accept=".jpg,.jpeg,.png,.pdf" onFileSelect={onPaymentFileChange} />
            {pago && <p className="mt-2 text-sm font-medium text-green-600">Archivo seleccionado: {pago.file.name}</p>}
        </section>
    )
}
