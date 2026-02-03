import { useFormContext } from 'react-hook-form'

import { ParteForm } from './ParteForm'

export function ArbitrajeForm() {
    useFormContext()

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* El demandante se crea en base al perfil del usuario, 
                pero podríamos mostrar un resumen o permitir editar datos de contacto específicos para este caso.
                Por ahora asumimos que el backend vincula al usuario logueado como demandante.
                PERO según los requerimientos: "**Datos del demandante** (precargados desde el perfil)"
                Así que mostraremos un formulario deshabilitado o de solo lectura, o permitiremos editar.
                Vamos a permitir editar para actualizar datos de contacto específicos del caso.
            */}

            <ParteForm
                prefix="demandante"
                title="Datos del Demandante"
                description="Verifique sus datos. Estos serán utilizados para las notificaciones del proceso."
            />

            <hr className="border-neutral-200" />

            <ParteForm
                prefix="demandado"
                title="Datos del Demandado"
                description="Ingrese los datos de la contraparte a quien se dirige la solicitud."
            />

            {/* Información del Procedimiento eliminada por requerimiento */}

        </div>
    )
}
