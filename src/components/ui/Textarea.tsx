import { forwardRef } from 'react'

import { cn } from '@/lib/utils'

export interface TextareaProps
    extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string
    error?: string
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, label, error, ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label
                        className="mb-1.5 block text-sm font-medium text-[#0c211c]"
                        htmlFor={props.id}
                    >
                        {label}
                    </label>
                )}
                <textarea
                    className={cn(
                        'flex min-h-[80px] w-full rounded-md border border-[#aebfb5] bg-white px-3 py-2 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#2a7221] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
                        error && 'border-red-500 focus:ring-red-500',
                        className
                    )}
                    ref={ref}
                    {...props}
                />
                {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
            </div>
        )
    }
)
Textarea.displayName = 'Textarea'

export { Textarea }
