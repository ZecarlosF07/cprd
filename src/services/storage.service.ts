import { supabase } from './supabase.client'

const BUCKET_NAME = 'solicitudes'

export interface UploadResponse {
    path: string
    fullPath: string
    error: Error | null
}

/**
 * Subir un archivo al bucket de solicitudes
 * @param solicitudId ID de la solicitud
 * @param file Archivo a subir
 * @param folder Carpeta opcional dentro de la solicitud (ej: 'documentos', 'pagos')
 */
export async function uploadSolicitudFile(
    solicitudId: string,
    file: File,
    folder: 'documentos' | 'pagos' = 'documentos'
): Promise<UploadResponse> {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`
    const filePath = `${solicitudId}/${folder}/${fileName}`

    const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, file)

    if (error) {
        return {
            path: '',
            fullPath: '',
            error: new Error(error.message),
        }
    }

    return {
        path: data.path,
        fullPath: data.fullPath,
        error: null,
    }
}

/**
 * Obtener URL firmada para descargar/ver archivo
 */
export async function getSignedUrl(path: string): Promise<string | null> {
    const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .createSignedUrl(path, 60 * 60) // 1 hora de validez

    if (error) {
        console.error('Error getting signed url:', error)
        return null
    }

    return data.signedUrl
}
