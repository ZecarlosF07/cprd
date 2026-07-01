import type { SeccionMesaPartes } from '../types/mesa-partes-publica.types'

interface SeccionSelectorProps {
    value: SeccionMesaPartes
    onChange: (value: SeccionMesaPartes) => void
}

const OPTIONS: { value: SeccionMesaPartes; label: string; description: string }[] = [
    { value: 'arbitraje', label: 'Arbitraje', description: 'Solicitudes, escritos y copias certificadas' },
    { value: 'jprd', label: 'JPRD', description: 'Solicitudes y escritos de juntas de disputas' },
]

export function SeccionSelector({ value, onChange }: SeccionSelectorProps) {
    return (
        <section className="space-y-3">
            <h2 className="text-lg font-semibold text-[#0c211c]">Seleccione sección</h2>
            <div className="grid gap-3 sm:grid-cols-2">
                {OPTIONS.map((option) => (
                    <button
                        key={option.value}
                        type="button"
                        onClick={() => onChange(option.value)}
                        className={`rounded-lg border p-4 text-left transition ${value === option.value ? 'border-[#2a7221] bg-[#dff3bf] shadow-sm ring-1 ring-[#2a7221]' : 'border-[#c7d3cc] bg-white hover:border-[#6da766] hover:bg-[#f4faed]'}`}
                    >
                        <span className="block font-semibold text-[#0c211c]">{option.label}</span>
                        <span className="mt-1 block text-sm text-[#3f554c]">{option.description}</span>
                    </button>
                ))}
            </div>
        </section>
    )
}
