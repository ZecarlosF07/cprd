-- ============================================================
-- FIX DEFINITIVO: Eliminar TODA recursión en políticas RLS
-- Fecha: 2026-02-02
-- ============================================================

-- ESTRATEGIA: Las políticas de SELECT no deben referenciar otras tablas
-- que tengan políticas que referencien a esta tabla.
-- Solución: Usar solo verificaciones directas en cada tabla.

-- ============================================================
-- 1. LIMPIAR TODAS LAS POLÍTICAS PROBLEMÁTICAS
-- ============================================================

-- Solicitudes
DROP POLICY IF EXISTS "Users can view own solicitudes" ON solicitudes;
DROP POLICY IF EXISTS "Users can view solicitudes where they are parte" ON solicitudes;
DROP POLICY IF EXISTS "Users can create solicitudes" ON solicitudes;
DROP POLICY IF EXISTS "Users can update own draft solicitudes" ON solicitudes;
DROP POLICY IF EXISTS "Internal users can view all solicitudes" ON solicitudes;
DROP POLICY IF EXISTS "Internal users can update solicitudes" ON solicitudes;

-- Partes
DROP POLICY IF EXISTS "Users can view partes of own solicitudes" ON partes;
DROP POLICY IF EXISTS "Users can create partes in own solicitudes" ON partes;
DROP POLICY IF EXISTS "Internal users can view all partes" ON partes;

-- ============================================================
-- 2. POLÍTICAS DE SOLICITUDES (SIN REFERENCIAS A OTRAS TABLAS)
-- ============================================================

-- SELECT: Usuario ve sus propias solicitudes
CREATE POLICY "solicitudes_select_owner"
    ON solicitudes FOR SELECT
    USING (auth.uid() = user_id);

-- SELECT: Usuarios internos ven todo (usando función helper)
CREATE POLICY "solicitudes_select_internal"
    ON solicitudes FOR SELECT
    USING (
        (SELECT rol FROM profiles WHERE user_id = auth.uid() AND deleted_at IS NULL) 
        IN ('interno', 'administrador')
    );

-- INSERT: Usuario puede crear solicitudes
CREATE POLICY "solicitudes_insert_owner"
    ON solicitudes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- UPDATE: Usuario puede actualizar sus solicitudes en estado inicial
CREATE POLICY "solicitudes_update_owner"
    ON solicitudes FOR UPDATE
    USING (auth.uid() = user_id AND estado = 'recibida');

-- UPDATE: Usuarios internos pueden actualizar
CREATE POLICY "solicitudes_update_internal"
    ON solicitudes FOR UPDATE
    USING (
        (SELECT rol FROM profiles WHERE user_id = auth.uid() AND deleted_at IS NULL) 
        IN ('interno', 'administrador')
    );

-- ============================================================
-- 3. POLÍTICAS DE PARTES (SIN REFERENCIAS CRUZADAS)
-- ============================================================

-- SELECT: Usuario es la parte directamente vinculada
CREATE POLICY "partes_select_self"
    ON partes FOR SELECT
    USING (user_id = auth.uid());

-- SELECT: Usuario es dueño de la solicitud (subquery simple, sin RLS en solicitudes)
-- Usamos security definer function para evitar recursión
CREATE OR REPLACE FUNCTION is_solicitud_owner(sol_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM solicitudes 
        WHERE id = sol_id AND user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE POLICY "partes_select_solicitud_owner"
    ON partes FOR SELECT
    USING (is_solicitud_owner(solicitud_id));

-- SELECT: Usuarios internos ven todo
CREATE POLICY "partes_select_internal"
    ON partes FOR SELECT
    USING (
        (SELECT rol FROM profiles WHERE user_id = auth.uid() AND deleted_at IS NULL) 
        IN ('interno', 'administrador')
    );

-- INSERT: Usuario puede crear partes en sus solicitudes
CREATE POLICY "partes_insert_owner"
    ON partes FOR INSERT
    WITH CHECK (is_solicitud_owner(solicitud_id));

-- ============================================================
-- 4. GRANT PERMISOS A LA FUNCIÓN
-- ============================================================
GRANT EXECUTE ON FUNCTION is_solicitud_owner(UUID) TO authenticated;
