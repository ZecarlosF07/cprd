import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode
    variant?: 'primary' | 'secondary' | 'outline'
    size?: 'sm' | 'md' | 'lg'
    isLoading?: boolean
    fullWidth?: boolean
}

const VARIANT_CLASSES = {
    primary: 'bg-neutral-900 text-white hover:bg-neutral-800 disabled:bg-neutral-400',
    secondary: 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200 disabled:bg-neutral-50',
    outline: 'border border-neutral-300 text-neutral-900 hover:bg-neutral-50 disabled:opacity-50',
} as const

const SIZE_CLASSES = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
} as const

export function Button({
    children,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    fullWidth = false,
    className = '',
    disabled,
    ...props
}: ButtonProps) {
    const baseClasses = 'font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2 disabled:cursor-not-allowed'
    const variantClasses = VARIANT_CLASSES[variant]
    const sizeClasses = SIZE_CLASSES[size]
    const widthClasses = fullWidth ? 'w-full' : ''

    return (
        <button
            className={`${baseClasses} ${variantClasses} ${sizeClasses} ${widthClasses} ${className}`}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4\" viewBox="0 0 24 24">
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                        />
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                    </svg>
                    Cargando...
                </span>
            ) : (
                children
            )}
        </button>
    )
}
