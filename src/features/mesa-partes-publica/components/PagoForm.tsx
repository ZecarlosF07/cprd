import { Input, Select } from '@/components/ui'

import type { PagoPublico, SeccionMesaPartes } from '../types/mesa-partes-publica.types'

interface PagoFormProps {
    value: PagoPublico
    seccion: SeccionMesaPartes
    required: boolean
    onChange: (value: PagoPublico) => void
    errorFor: (path: string) => string | undefined
}

export function PagoForm({ value, seccion, required, onChange, errorFor }: PagoFormProps) {
    if (!required) {
        return null
    }

    const update = (field: keyof PagoPublico, next: string | File | undefined) => onChange({ ...value, [field]: next })
    const options = seccion === 'arbitraje'
        ? [{ value: 'boleta', label: 'Boleta' }, { value: 'factura_contado', label: 'Factura al contado' }, { value: 'factura_credito', label: 'Factura al crédito' }]
        : [{ value: 'boleta', label: 'Boleta' }, { value: 'factura', label: 'Factura' }]

    return (
        <section className="space-y-4">
            <h2 className="border-l-4 border-[#2a7221] pl-3 text-lg font-semibold text-[#0c211c]">Pago y facturación</h2>
            <div className="grid gap-4 sm:grid-cols-2">
                <Select label="Tipo de comprobante" value={value.tipoFacturacion} onChange={(event) => update('tipoFacturacion', event.target.value)} options={options} />
                <Input label="Nombre o razón social" value={value.nombreRazonSocial} onChange={(event) => update('nombreRazonSocial', event.target.value)} error={errorFor('pago.nombreRazonSocial')} />
                <Input label="DNI o RUC" value={value.documento} onChange={(event) => update('documento', event.target.value)} error={errorFor('pago.documento')} />
                <Input label="Dirección fiscal" value={value.direccion} onChange={(event) => update('direccion', event.target.value)} error={errorFor('pago.direccion')} />
                <Input type="file" label="Comprobante de pago" accept=".pdf,.jpg,.jpeg,.png" onChange={(event) => update('archivo', event.target.files?.[0])} error={errorFor('pago.archivo')} />
            </div>
        </section>
    )
}
