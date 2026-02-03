import { ChangeEvent, useRef, useState } from 'react'

import { Button } from './Button'
import { cn } from '@/lib/utils'

interface FileUploadProps {
    accept?: string
    maxSizeMB?: number
    onFileSelect: (file: File) => void
    error?: string
    label?: string
    id?: string
    disabled?: boolean
    isLoading?: boolean
}

export function FileUpload({
    accept,
    maxSizeMB = 10,
    onFileSelect,
    error,
    label = 'Seleccionar archivo',
    id,
    disabled,
    isLoading,
}: FileUploadProps) {
    const inputRef = useRef<HTMLInputElement>(null)
    const [fileName, setFileName] = useState<string | null>(null)
    const [localError, setLocalError] = useState<string | null>(null)

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        setLocalError(null)

        if (!file) return

        // Validar tamaño
        if (file.size > maxSizeMB * 1024 * 1024) {
            setLocalError(`El archivo excede el tamaño máximo de ${maxSizeMB}MB`)
            return
        }

        setFileName(file.name)
        onFileSelect(file)
    }

    const handleClick = () => {
        inputRef.current?.click()
    }

    return (
        <div className="flex flex-col gap-2">
            {label && (
                <label
                    htmlFor={id}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-neutral-700"
                >
                    {label}
                </label>
            )}

            <div className="flex items-center gap-3">
                <input
                    ref={inputRef}
                    id={id}
                    type="file"
                    className="hidden"
                    accept={accept}
                    onChange={handleFileChange}
                    disabled={disabled || isLoading}
                />

                <Button
                    type="button"
                    variant="outline"
                    onClick={handleClick}
                    disabled={disabled || isLoading}
                    className="shrink-0"
                >
                    {isLoading ? 'Cargando...' : 'Elegir archivo'}
                </Button>

                <div className="flex-1 truncate text-sm text-neutral-500">
                    {fileName || 'Ningún archivo seleccionado'}
                </div>
            </div>

            {(error || localError) && (
                <p className="text-sm font-medium text-red-500">
                    {error || localError}
                </p>
            )}

            <p className="text-xs text-neutral-400">
                Máximo {maxSizeMB}MB. {accept ? `Formatos: ${accept}` : ''}
            </p>
        </div>
    )
}
