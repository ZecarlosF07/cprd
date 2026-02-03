-- ============================================================
-- FINAL RESTORE: Triggers a prueba de fallos
-- Fecha: 2026-02-02
-- Descripción:
-- Reinstala triggers con manejo de errores extremo (TRY-CATCH)
-- para garantizar que la inserción de solicitud nunca falle por 
-- efectos secundarios (logs, generación de códigos).
-- ============================================================

-- 1. Limpieza total de triggers en solicitudes
DROP TRIGGER IF EXISTS log_solicitud_created ON solicitudes;
DROP TRIGGER IF EXISTS log_solicitud_estado_change ON solicitudes;
DROP TRIGGER IF EXISTS generate_solicitud_codigo ON solicitudes;

-- 2. Función Generadora de Código (SECURITY DEFINER + MANEJO DE ERRORES)
CREATE OR REPLACE FUNCTION generate_codigo_expediente()
RETURNS TRIGGER AS $$
DECLARE
    seq INTEGER;
    year_str TEXT;
BEGIN
    year_str := TO_CHAR(NOW(), 'YYYY');
    
    -- Bloque seguro de cálculo
    BEGIN
        -- Usamos SECURITY DEFINER para ver toda la tabla y asegurar unicidad
        SELECT COALESCE(MAX(CAST(substring(codigo_expediente from '[0-9]+$') AS INTEGER)), 0) + 1
        INTO seq
        FROM solicitudes
        WHERE codigo_expediente LIKE '%-' || year_str || '-%'; -- Filtrar por año actual para optimizar
        
    EXCEPTION WHEN OTHERS THEN
        -- Fallback de emergencia: Número aleatorio para no romper el flujo
        seq := floor(random() * 800000 + 100000)::int;
    END;
    
    -- Formato estándar: TIPO-YYYY-NNNNNN (usando prefix genérico EXP si falla lógica de tipos)
    NEW.codigo_expediente := 'EXP-' || year_str || '-' || LPAD(seq::TEXT, 6, '0');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Trigger Generador
CREATE TRIGGER generate_solicitud_codigo
    BEFORE INSERT ON solicitudes
    FOR EACH ROW
    WHEN (NEW.codigo_expediente IS NULL OR NEW.codigo_expediente = '')
    EXECUTE FUNCTION generate_codigo_expediente();

-- 4. Función Historial (SILENT FAIL)
-- Si falla el historial, NO debe fallar la creación de solicitud
CREATE OR REPLACE FUNCTION log_solicitud_creation()
RETURNS TRIGGER AS $$
BEGIN
    BEGIN
        INSERT INTO historial_solicitud (solicitud_id, accion, descripcion, user_id)
        VALUES (NEW.id, 'creacion', 'Solicitud creada', NEW.user_id);
    EXCEPTION WHEN OTHERS THEN
        -- Ignorar error silenciosamente. 
        -- La prioridad es que la solicitud se cree.
        RAISE WARNING 'Fallo al crear historial: %', SQLERRM;
    END;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Trigger Historial
CREATE TRIGGER log_solicitud_created
    AFTER INSERT ON solicitudes
    FOR EACH ROW
    EXECUTE FUNCTION log_solicitud_creation();
