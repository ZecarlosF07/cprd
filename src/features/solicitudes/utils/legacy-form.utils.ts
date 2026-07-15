import type { Profile } from '@/types'

import type { LegacySolicitudFormData } from '../types/legacy-solicitud.types'

const EMPTY_PART = {
    tipo_persona: 'natural' as const,
    tipo_documento: 'dni' as const,
    numero_documento: '',
    nombres_apellidos: '',
    razon_social: '',
    celular: '',
    domicilio: '',
    correo_electronico: '',
}

export function createLegacyFormDefaults(): LegacySolicitudFormData {
    return {
        formStep: 1,
        tipo_solicitud: '',
        moneda: 'PEN',
        demandante: { ...EMPTY_PART },
        demandado: { ...EMPTY_PART },
        contratista: { ...EMPTY_PART },
        entidad: {
            nombre_entidad: '',
            ruc_entidad: '',
            direccion_entidad: '',
            correo_contacto: '',
        },
    }
}

export function profileToLegacyPart(profile: Profile) {
    return {
        tipo_persona: profile.tipo_persona,
        tipo_documento: profile.tipo_documento,
        numero_documento: profile.numero_documento,
        nombres_apellidos: profile.nombres_apellidos ?? '',
        razon_social: profile.razon_social ?? '',
        celular: profile.celular,
        domicilio: profile.domicilio,
        correo_electronico: '',
    }
}
