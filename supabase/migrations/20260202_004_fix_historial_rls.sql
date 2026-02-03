-- ============================================================
-- FIX: Permitir a usuarios insertar en historial_solicitud
-- Fecha: 2026-02-02
-- Descripción: Agrega política RLS SIMPLIFICADA para permitir 
-- a usuarios registrar acciones en el historial.
-- ============================================================

-- 1. Eliminar política anterior si existe (para evitar errores al re-ejecutar)
DROP POLICY IF EXISTS "Users can insert own historial" ON historial_solicitud;
DROP POLICY IF EXISTS "Users can insert creation history" ON historial_solicitud;

-- 2. Crear nueva política simplificada
-- Permite insertar cualquier registro en historial_solicitud siempre que
-- el campo 'user_id' coincida con el usuario autenticado.
-- Esto desbloquea el trigger de creación y las subidas de archivos.
CREATE POLICY "Users can insert own historial"
    ON historial_solicitud FOR INSERT
    WITH CHECK (
        auth.uid() = user_id
    );

-- Nota: Esto asume que todas las inserciones (triggers y servicios)
-- asignan correctamente user_id = auth.uid() (lo cual hacen).
