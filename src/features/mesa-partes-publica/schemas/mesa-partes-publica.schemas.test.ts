import { describe, expect, it } from 'vitest'

import type { SolicitudPublicaFormData } from '../types/mesa-partes-publica.types'
import { solicitudPublicaSchema, validarSolicitudPublica } from './mesa-partes-publica.schemas'

const PDF_TYPE = 'application/pdf'

function pdfFile(name = 'documento.pdf', size = 10): File {
    return new File([new Uint8Array(size)], name, { type: PDF_TYPE })
}

function validForm(tramiteCodigo = 'arbitraje_institucional'): SolicitudPublicaFormData {
    const requierePago = [
        'arbitraje_institucional',
        'arbitraje_emergencia',
        'incorporacion_arbitros',
        'renovacion_arbitros',
        'jprd_solicitud',
        'incorporacion_adjudicadores',
    ].includes(tramiteCodigo)
    const seccion = ['jprd_solicitud', 'incorporacion_adjudicadores', 'escrito_expediente_jprd', 'otro_jprd']
        .includes(tramiteCodigo) ? 'jprd' : 'arbitraje'

    return {
        idempotencyKey: crypto.randomUUID(),
        seccion,
        tramiteCodigo,
        solicitante: {
            tipoPersona: 'natural',
            tipoDocumento: 'dni',
            numeroDocumento: '12345678',
            nombresApellidos: 'Persona Solicitante',
            razonSocial: '',
            representanteLegal: '',
            cargoRepresentante: '',
            celular: '999999999',
            correo: 'persona@example.com',
            domicilio: 'Domicilio conocido',
        },
        numeroExpedienteReferido: tramiteCodigo.startsWith('escrito_') ? 'EXP-001' : '',
        sumilla: tramiteCodigo.startsWith('escrito_') ? 'Presento escrito' : '',
        asunto: tramiteCodigo.startsWith('otro_') ? 'Consulta administrativa' : '',
        documentos: [{
            tipoDocumento: 'solicitud_principal',
            comentario: '',
            enlaceExterno: '',
            archivo: pdfFile(),
        }],
        pago: {
            tipoFacturacion: seccion === 'jprd' ? 'factura' : 'boleta',
            nombreRazonSocial: requierePago ? 'Persona Solicitante' : '',
            documento: requierePago ? '12345678' : '',
            direccion: requierePago ? 'Domicilio conocido' : '',
            archivo: requierePago ? pdfFile('pago.pdf') : undefined,
        },
        aceptaNotificaciones: true,
        aceptaDatosPersonales: true,
        captchaToken: 'captcha-token',
    }
}

describe('validación de solicitud pública', () => {
    it('acepta los once trámites con sus reglas vigentes', () => {
        const codigos = [
            'arbitraje_institucional', 'arbitraje_emergencia', 'incorporacion_arbitros',
            'renovacion_arbitros', 'copia_certificada', 'escrito_expediente_arbitraje',
            'otro_arbitraje', 'jprd_solicitud', 'incorporacion_adjudicadores',
            'escrito_expediente_jprd', 'otro_jprd',
        ]

        codigos.forEach((codigo) => expect(validarSolicitudPublica(validForm(codigo)).success).toBe(true))
    })

    it.each([
        'arbitraje_institucional', 'arbitraje_emergencia', 'incorporacion_arbitros',
        'renovacion_arbitros', 'jprd_solicitud', 'incorporacion_adjudicadores',
    ])('rechaza el trámite con pago %s cuando falta el comprobante', (codigo) => {
        const form = validForm(codigo)
        form.pago.archivo = undefined
        expect(validarSolicitudPublica(form).success).toBe(false)
    })

    it('exige expediente y sumilla para un escrito', () => {
        const form = validForm('escrito_expediente_arbitraje')
        form.numeroExpedienteReferido = ''
        form.sumilla = ''
        const result = solicitudPublicaSchema.safeParse(form)

        expect(result.success).toBe(false)
        if (!result.success) {
            expect(result.error.issues.map((issue) => issue.path.join('.')))
                .toEqual(expect.arrayContaining(['numeroExpedienteReferido', 'sumilla']))
        }
    })

    it('exige asunto para otro trámite', () => {
        const form = validForm('otro_jprd')
        form.asunto = ''
        expect(validarSolicitudPublica(form).success).toBe(false)
    })

    it('exige identificación completa de persona jurídica', () => {
        const form = validForm()
        form.solicitante.tipoPersona = 'juridica'
        form.solicitante.tipoDocumento = 'ruc'
        expect(validarSolicitudPublica(form).success).toBe(false)

        form.solicitante.razonSocial = 'Empresa de Prueba SAC'
        form.solicitante.representanteLegal = 'Representante Legal'
        form.solicitante.cargoRepresentante = 'Gerente'
        expect(validarSolicitudPublica(form).success).toBe(true)
    })

    it('acepta un enlace externo cuando no existe archivo', () => {
        const form = validForm('copia_certificada')
        form.documentos[0] = {
            tipoDocumento: 'solicitud_principal',
            comentario: '',
            enlaceExterno: 'https://drive.google.com/file/d/prueba',
        }
        expect(validarSolicitudPublica(form).success).toBe(true)
    })

    it('rechaza documentos sin archivo ni enlace y anexos mal tipados', () => {
        const form = validForm('copia_certificada')
        form.documentos = [
            { tipoDocumento: 'solicitud_principal', comentario: '', enlaceExterno: '' },
            { tipoDocumento: 'otro', comentario: '', enlaceExterno: '', archivo: pdfFile('otro.pdf') },
        ]
        expect(validarSolicitudPublica(form).success).toBe(false)
    })

    it('rechaza un trámite que no corresponde a la sección', () => {
        const form = validForm('jprd_solicitud')
        form.seccion = 'arbitraje'
        expect(validarSolicitudPublica(form).success).toBe(false)
    })

    it('rechaza archivos con formato no permitido', () => {
        const form = validForm('copia_certificada')
        form.documentos[0].archivo = new File(['contenido'], 'archivo.txt', { type: 'text/plain' })
        expect(validarSolicitudPublica(form).success).toBe(false)
    })
})
