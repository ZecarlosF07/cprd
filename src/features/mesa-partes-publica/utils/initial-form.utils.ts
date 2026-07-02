import type { SolicitudPublicaFormData } from '../types/mesa-partes-publica.types'

export function createInitialPublicIntakeForm(): SolicitudPublicaFormData {
    return {
        idempotencyKey: crypto.randomUUID(),
        seccion: 'arbitraje',
        tramiteCodigo: 'arbitraje_institucional',
        solicitante: {
            tipoPersona: 'natural',
            tipoDocumento: 'dni',
            numeroDocumento: '',
            nombresApellidos: '',
            razonSocial: '',
            representanteLegal: '',
            cargoRepresentante: '',
            celular: '',
            correo: '',
            domicilio: '',
        },
        numeroExpedienteReferido: '',
        sumilla: '',
        asunto: '',
        documentos: [{ tipoDocumento: 'solicitud_principal', comentario: '', enlaceExterno: '' }],
        pago: { tipoFacturacion: 'boleta', nombreRazonSocial: '', documento: '', direccion: '' },
        aceptaNotificaciones: false,
        aceptaDatosPersonales: false,
        captchaToken: '',
    }
}
