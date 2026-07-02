import { useEffect, useRef } from 'react'

interface TurnstileWidgetProps {
    resetKey: number
    onToken: (token: string) => void
    error?: string
}

interface TurnstileApi {
    render: (container: HTMLElement, options: Record<string, unknown>) => string
    remove: (widgetId: string) => void
}

declare global {
    interface Window {
        turnstile?: TurnstileApi
    }
}

const SCRIPT_ID = 'cloudflare-turnstile-script'

export function TurnstileWidget({ resetKey, onToken, error }: TurnstileWidgetProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY

    useEffect(() => {
        if (!siteKey || !containerRef.current) return
        let widgetId: string | undefined
        let cancelled = false

        const render = () => {
            if (cancelled || !window.turnstile || !containerRef.current) return
            containerRef.current.replaceChildren()
            widgetId = window.turnstile.render(containerRef.current, {
                sitekey: siteKey,
                callback: (token: string) => onToken(token),
                'expired-callback': () => onToken(''),
                'error-callback': () => onToken(''),
                theme: 'light',
                size: 'flexible',
            })
        }

        let script = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null
        if (!script) {
            script = document.createElement('script')
            script.id = SCRIPT_ID
            script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
            script.async = true
            script.defer = true
            document.head.appendChild(script)
        }

        if (window.turnstile) render()
        else script.addEventListener('load', render, { once: true })

        return () => {
            cancelled = true
            script?.removeEventListener('load', render)
            if (widgetId && window.turnstile) window.turnstile.remove(widgetId)
        }
    }, [onToken, resetKey, siteKey])

    if (!siteKey) {
        return <p className="text-sm text-red-700">La validación de seguridad no está configurada.</p>
    }

    return (
        <div className="space-y-2">
            <div ref={containerRef} className="min-h-[65px]" />
            {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
    )
}
