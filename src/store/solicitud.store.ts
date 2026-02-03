import { create } from 'zustand'

import type {
    ComprobantePago,
    CreateComprobantePagoData,
    CreateDocumentoData,
    CreateParteData,
    CreateSolicitudData,
    Documento,
    HistorialSolicitud,
    Parte,
    Solicitud,
    SolicitudConPartes,
} from '@/types'

import {
    addComprobantePago,
    addDocumento,
    countSolicitudesByEstado,
    createParte,
    createSolicitud,
    getHistorialBySolicitud,

    getSolicitudConPartes,
    getSolicitudesByUser,
} from '@/services/solicitud.service'

interface SolicitudStats {
    total: number
    enProceso: number
    observadas: number
}

interface SolicitudStore {
    // Estado
    solicitudes: Solicitud[]
    solicitudActual: SolicitudConPartes | null
    partes: Parte[]
    historial: HistorialSolicitud[]
    stats: SolicitudStats
    isLoading: boolean
    error: string | null

    // Acciones
    fetchSolicitudes: (userId: string) => Promise<void>
    fetchSolicitudById: (solicitudId: string) => Promise<void>
    fetchStats: (userId: string) => Promise<void>
    createNewSolicitud: (userId: string, data: CreateSolicitudData) => Promise<Solicitud | null>
    addParte: (solicitudId: string, userId: string | null, data: CreateParteData) => Promise<Parte | null>
    addDocumento: (userId: string, solicitudId: string, data: CreateDocumentoData) => Promise<Documento | null>
    addComprobantePago: (userId: string, solicitudId: string, data: CreateComprobantePagoData) => Promise<ComprobantePago | null>
    clearSolicitudActual: () => void
    clearError: () => void
}


export const useSolicitudStore = create<SolicitudStore>((set, get) => ({
    solicitudes: [],
    solicitudActual: null,
    partes: [],
    historial: [],
    stats: { total: 0, enProceso: 0, observadas: 0 },
    isLoading: false,
    error: null,

    fetchSolicitudes: async (userId: string) => {
        set({ isLoading: true, error: null })

        const { data, error } = await getSolicitudesByUser(userId)

        if (error) {
            set({ isLoading: false, error: error.message })
            return
        }

        set({ solicitudes: data, isLoading: false })
    },

    fetchSolicitudById: async (solicitudId: string) => {
        set({ isLoading: true, error: null })

        const { data: solicitud, error: solicitudError } = await getSolicitudConPartes(solicitudId)

        if (solicitudError) {
            set({ isLoading: false, error: solicitudError.message })
            return
        }

        const { data: historial } = await getHistorialBySolicitud(solicitudId)

        set({
            solicitudActual: solicitud,
            partes: solicitud?.partes || [],
            historial: historial || [],
            isLoading: false,
        })
    },

    fetchStats: async (userId: string) => {
        const stats = await countSolicitudesByEstado(userId)
        set({ stats })
    },

    createNewSolicitud: async (userId: string, data: CreateSolicitudData) => {
        set({ isLoading: true, error: null })

        const { data: solicitud, error } = await createSolicitud(userId, data)

        if (error) {
            set({ isLoading: false, error: error.message })
            return null
        }

        // Actualizar la lista de solicitudes
        const { solicitudes } = get()
        set({
            solicitudes: solicitud ? [solicitud, ...solicitudes] : solicitudes,
            isLoading: false,
        })

        return solicitud
    },

    addParte: async (solicitudId: string, userId: string | null, data: CreateParteData) => {
        set({ isLoading: true, error: null })

        const { data: parte, error } = await createParte(solicitudId, userId, data)

        if (error) {
            set({ isLoading: false, error: error.message })
            return null
        }

        // Actualizar la lista de partes
        const { partes } = get()
        set({
            partes: parte ? [...partes, parte] : partes,
            isLoading: false,
        })

        return parte
    },

    addDocumento: async (userId: string, solicitudId: string, data: CreateDocumentoData) => {
        set({ isLoading: true, error: null })

        const { data: doc, error } = await addDocumento(userId, solicitudId, data)

        if (error) {
            set({ isLoading: false, error: error.message })
            return null
        }

        // Actualizar estado local
        const { solicitudActual } = get()
        if (solicitudActual && solicitudActual.id === solicitudId) {
            set({
                solicitudActual: {
                    ...solicitudActual,
                    documentos: [doc!, ...(solicitudActual.documentos || [])],
                },
                isLoading: false,
            })
        } else {
            set({ isLoading: false })
        }

        // Refrescar historial también porque cambió
        const { data: historial } = await getHistorialBySolicitud(solicitudId)
        set((state) => ({ historial: historial || state.historial }))

        return doc
    },

    addComprobantePago: async (userId: string, solicitudId: string, data: CreateComprobantePagoData) => {
        set({ isLoading: true, error: null })

        const { data: pago, error } = await addComprobantePago(userId, solicitudId, data)

        if (error) {
            set({ isLoading: false, error: error.message })
            return null
        }

        // Actualizar estado local
        const { solicitudActual } = get()
        if (solicitudActual && solicitudActual.id === solicitudId) {
            set({
                solicitudActual: {
                    ...solicitudActual,
                    comprobantes_pago: [pago!, ...(solicitudActual.comprobantes_pago || [])],
                },
                isLoading: false,
            })
        } else {
            set({ isLoading: false })
        }

        // Refrescar historial
        const { data: historial } = await getHistorialBySolicitud(solicitudId)
        set((state) => ({ historial: historial || state.historial }))

        return pago
    },

    clearSolicitudActual: () => {
        set({ solicitudActual: null, partes: [], historial: [] })
    },

    clearError: () => set({ error: null }),
}))
