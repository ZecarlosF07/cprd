import { cva } from 'class-variance-authority'

export const badgeVariants = cva(
    'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2',
    {
        variants: {
            variant: {
                default: 'border-transparent bg-neutral-900 text-neutral-50 hover:bg-neutral-900/80',
                destructive: 'border-transparent bg-red-500 text-neutral-50 hover:bg-red-500/80',
                outline: 'text-neutral-950',
                secondary: 'border-transparent bg-neutral-100 text-neutral-900 hover:bg-neutral-100/80',
                success: 'border-transparent bg-green-600 text-neutral-50 hover:bg-green-600/80',
            },
        },
        defaultVariants: { variant: 'default' },
    }
)
