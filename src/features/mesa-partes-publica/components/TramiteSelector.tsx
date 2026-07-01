import { Select } from '@/components/ui'

import type { SeccionMesaPartes } from '../types/mesa-partes-publica.types'
import { getTramitesBySeccion, getTramiteByCodigo } from '../utils/tramites.utils'

interface TramiteSelectorProps {
    seccion: SeccionMesaPartes
    value: string
    onChange: (value: string) => void
    error?: string
}

export function TramiteSelector({ seccion, value, onChange, error }: TramiteSelectorProps) {
    const tramites = getTramitesBySeccion(seccion)
    const selected = getTramiteByCodigo(value)

    return (
        <section className="space-y-3">
            <Select
                label="Tipo de trámite"
                value={value}
                onChange={(event) => onChange(event.target.value)}
                options={tramites.map((tramite) => ({ value: tramite.codigo, label: tramite.nombre }))}
                error={error}
            />
            {selected && (
                <div className="flex flex-wrap gap-3 text-sm">
                    {selected.enlaceRequisitos && (
                        <a className="font-semibold text-[#2a7221] underline decoration-[#83bd45] underline-offset-4" href={selected.enlaceRequisitos} target="_blank" rel="noreferrer">
                            Ver requisitos
                        </a>
                    )}
                    {selected.enlaceTarifario && (
                        <a className="font-semibold text-[#2a7221] underline decoration-[#83bd45] underline-offset-4" href={selected.enlaceTarifario} target="_blank" rel="noreferrer">
                            Ver tarifario
                        </a>
                    )}
                </div>
            )}
        </section>
    )
}
