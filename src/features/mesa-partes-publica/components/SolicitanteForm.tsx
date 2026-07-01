import { Input, Select } from '@/components/ui'

import type { SolicitantePublico } from '../types/mesa-partes-publica.types'

interface SolicitanteFormProps {
    value: SolicitantePublico
    onChange: (value: SolicitantePublico) => void
    errorFor: (path: string) => string | undefined
}

export function SolicitanteForm({ value, onChange, errorFor }: SolicitanteFormProps) {
    const update = (field: keyof SolicitantePublico, next: string) => onChange({ ...value, [field]: next })

    return (
        <section className="space-y-4">
            <h2 className="border-l-4 border-[#2a7221] pl-3 text-lg font-semibold text-[#0c211c]">Datos del solicitante</h2>
            <div className="grid gap-4 sm:grid-cols-2">
                <Select
                    label="Tipo de persona"
                    value={value.tipoPersona}
                    onChange={(event) => update('tipoPersona', event.target.value)}
                    options={[{ value: 'natural', label: 'Persona natural' }, { value: 'juridica', label: 'Persona jurídica' }]}
                />
                <Select
                    label="Tipo de documento"
                    value={value.tipoDocumento}
                    onChange={(event) => update('tipoDocumento', event.target.value)}
                    options={[{ value: 'dni', label: 'DNI' }, { value: 'ce', label: 'Carné de extranjería' }, { value: 'pasaporte', label: 'Pasaporte' }, { value: 'ruc', label: 'RUC' }]}
                />
                <Input label="Número de documento" value={value.numeroDocumento} onChange={(event) => update('numeroDocumento', event.target.value)} error={errorFor('solicitante.numeroDocumento')} />
                <Input label="Nombres y apellidos" value={value.nombresApellidos} onChange={(event) => update('nombresApellidos', event.target.value)} error={errorFor('solicitante.nombresApellidos')} />
                {value.tipoPersona === 'juridica' && (
                    <>
                        <Input label="Razón social" value={value.razonSocial} onChange={(event) => update('razonSocial', event.target.value)} error={errorFor('solicitante.razonSocial')} />
                        <Input label="Representante legal" value={value.representanteLegal} onChange={(event) => update('representanteLegal', event.target.value)} error={errorFor('solicitante.representanteLegal')} />
                        <Input label="Cargo del representante" value={value.cargoRepresentante} onChange={(event) => update('cargoRepresentante', event.target.value)} error={errorFor('solicitante.cargoRepresentante')} />
                    </>
                )}
                <Input label="Celular" value={value.celular} onChange={(event) => update('celular', event.target.value)} error={errorFor('solicitante.celular')} />
                <Input label="Correo electrónico" type="email" value={value.correo} onChange={(event) => update('correo', event.target.value)} error={errorFor('solicitante.correo')} />
                <Input label="Domicilio" value={value.domicilio} onChange={(event) => update('domicilio', event.target.value)} error={errorFor('solicitante.domicilio')} />
            </div>
        </section>
    )
}
