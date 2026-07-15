import type { StatCardProps } from '../types/dashboard.types'

export function StatCard({ label, value, description, valueClassName = 'text-neutral-900' }: StatCardProps) {
    return (
        <div className="rounded-xl border border-neutral-200 bg-white p-6">
            <h3 className="mb-2 text-lg font-medium text-neutral-900">{label}</h3>
            <p className={`text-3xl font-bold ${valueClassName}`}>{value}</p>
            <p className="mt-1 text-sm text-neutral-500">{description}</p>
        </div>
    )
}
