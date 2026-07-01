import { useState } from 'react'

import { Button, Input } from '@/components/ui'
import { buscarTrazabilidadPublica } from '@/services'

import { PublicLayout } from '../components'
import type { TrazabilidadPublica } from '../types/mesa-partes-publica.types'

export function TrazabilidadPublicaPage() {
    const [codigo, setCodigo] = useState('')
    const [result, setResult] = useState<TrazabilidadPublica | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setError(null)
        setResult(null)
        setIsLoading(true)
        try {
            setResult(await buscarTrazabilidadPublica(codigo.trim()))
        } catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : 'No se encontró el documento')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <PublicLayout>
            <div className="mx-auto max-w-2xl space-y-6">
                <div className="relative overflow-hidden rounded-lg bg-[#0c211c] px-6 py-7 text-white sm:px-8">
                    <div className="absolute inset-y-0 left-0 w-2 bg-[#b6eb66]" />
                    <p className="mb-2 text-sm font-semibold uppercase text-[#b6eb66]">Consulta pública</p>
                    <h1 className="text-3xl font-semibold">Trazabilidad</h1>
                    <p className="mt-2 text-[#dce8e2]">Ingrese el código único generado al presentar su documento.</p>
                </div>
                <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
                    <Input value={codigo} onChange={(event) => setCodigo(event.target.value)} placeholder="2026-0000001" />
                    <Button type="submit" isLoading={isLoading}>Consultar</Button>
                </form>
                {error && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>}
                {result && (
                    <section className="rounded-lg border border-[#b9cbbf] border-t-4 border-t-[#2a7221] bg-white p-5">
                        <dl className="grid gap-4 sm:grid-cols-2">
                            <Item label="Código" value={result.codigo} />
                            <Item label="Estado" value={result.estado} />
                            <Item label="Sección" value={result.seccion} />
                            <Item label="Trámite" value={result.tramite} />
                            <Item label="Fecha de ingreso" value={new Date(result.fechaIngreso).toLocaleString()} />
                        </dl>
                        {result.observaciones.length > 0 && (
                            <div className="mt-5 space-y-2">
                                <h2 className="font-medium text-[#0c211c]">Observaciones públicas</h2>
                                {result.observaciones.map((observacion, index) => (
                                    <p key={index} className="rounded-md bg-neutral-50 p-3 text-sm text-neutral-700">{observacion}</p>
                                ))}
                            </div>
                        )}
                    </section>
                )}
            </div>
        </PublicLayout>
    )
}

function Item({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <dt className="text-sm font-medium text-neutral-500">{label}</dt>
            <dd className="mt-1 text-neutral-950">{value}</dd>
        </div>
    )
}
