import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode
    variant?: 'primary' | 'secondary' | 'outline'
    size?: 'sm' | 'md' | 'lg'
    isLoading?: boolean
    fullWidth?: boolean
}

const VARIANT_CLASSES = {
    primary: 'bg-[#2a7221] text-white hover:bg-[#1f5c18] disabled:bg-neutral-400',
    secondary: 'bg-[#dff3bf] text-[#0c211c] hover:bg-[#cbed99] disabled:bg-neutral-50',
    outline: 'border border-[#2a7221] bg-white text-[#1f5c18] hover:bg-[#eef8df] disabled:opacity-50',
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
    const baseClasses = 'font-semibold rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#b6eb66] focus:ring-offset-2 disabled:cursor-not-allowed'
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
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
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
