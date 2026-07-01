import type { InputHTMLAttributes } from 'react'
import { forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string
    error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, className = '', id, ...props }, ref) => {
        const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

        return (
            <div className="w-full">
                {label && (
                    <label
                        htmlFor={inputId}
                        className="mb-1 block text-sm font-medium text-[#0c211c]"
                    >
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    id={inputId}
                    className={`
            w-full px-3 py-2 border rounded-lg text-neutral-900
            placeholder:text-neutral-400
            focus:outline-none focus:ring-2 focus:ring-[#2a7221] focus:border-transparent
            disabled:bg-neutral-100 disabled:cursor-not-allowed
            ${error ? 'border-red-500' : 'border-[#aebfb5]'}
            ${className}
          `}
                    {...props}
                />
                {error && (
                    <p className="mt-1 text-sm text-red-600">{error}</p>
                )}
            </div>
        )
    }
)

Input.displayName = 'Input'
