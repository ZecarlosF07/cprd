-- ============================================================
-- STORAGE: Crear bucket y políticas
-- Fecha: 2026-02-02
-- ============================================================

-- Intentar crear el bucket si no existe (esto puede fallar si no hay permisos, 
-- mejor verificar en Dashboard > Storage)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('solicitudes', 'solicitudes', false) 
ON CONFLICT (id) DO NOTHING;

-- Políticas de Seguridad para Storage

-- 1. Permitir a usuarios autenticados subir archivos
CREATE POLICY "Authenticated users can upload files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'solicitudes' );

-- 2. Permitir a usuarios autenticados ver archivos
CREATE POLICY "Authenticated users can view files"
ON storage.objects FOR SELECT
TO authenticated
USING ( bucket_id = 'solicitudes' );

-- 3. Permitir a usuarios autenticados actualizar sus archivos
CREATE POLICY "Authenticated users can update files"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'solicitudes' );
