-- ============================================================
-- EMERGENCY FIX: Reparación robusta de triggers
-- Fecha: 2026-02-02
-- Descripción:
-- 1. Envuelve la inserción de historial en un bloque TRY-CATCH
--    para que si falla el log, NO bloquee la creación de la solicitud.
-- 2. Reasegura que generate_codigo_expediente sea SECURITY DEFINER.
-- ============================================================

-- 1. Limpiar triggers viejos
DROP TRIGGER IF EXISTS log_solicitud_created ON solicitudes;
DROP TRIGGER IF EXISTS generate_solicitud_codigo ON solicitudes;

-- 2. Función de historial tolerante a fallos
CREATE OR REPLACE FUNCTION log_solicitud_creation()
RETURNS TRIGGER AS $$
BEGIN
    -- Bloque para capturar errores y evitar rollback de la solicitud
    BEGIN
        INSERT INTO historial_solicitud (
            solicitud_id,
            accion,
            estado_nuevo,
            descripcion,
            user_id
        ) VALUES (
            NEW.id,
            'creacion',
            NEW.estado,
            'Solicitud creada',
            NEW.user_id
        );
    EXCEPTION WHEN OTHERS THEN
        -- Si falla, solo registramos un warning en el log del servidor
        -- pero permitimos que la transacción continúe.
        RAISE WARNING 'Error al crear historial: %', SQLERRM;
    END;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Reconectar trigger de historial
CREATE TRIGGER log_solicitud_created
    AFTER INSERT ON solicitudes
    FOR EACH ROW
    EXECUTE FUNCTION log_solicitud_creation();

-- 4. Función de código de expediente asegurada
CREATE OR REPLACE FUNCTION generate_codigo_expediente()
RETURNS TRIGGER AS $$
DECLARE
    year_part VARCHAR(4);
    sequence_num INTEGER;
    tipo_prefix VARCHAR(3);
BEGIN
    year_part := TO_CHAR(NOW(), 'YYYY');
    
    CASE NEW.tipo_solicitud
        WHEN 'arbitraje' THEN tipo_prefix := 'ARB';
        WHEN 'arbitraje_emergencia' THEN tipo_prefix := 'AEM';
        WHEN 'jprd' THEN tipo_prefix := 'JPR';
        ELSE tipo_prefix := 'EXP';
    END CASE;
    
    -- SECURITY DEFINER permite ver todos los registros
    SELECT COALESCE(MAX(CAST(SUBSTRING(codigo_expediente FROM '[0-9]+$') AS INTEGER)), 0) + 1
    INTO sequence_num
    FROM solicitudes
    WHERE codigo_expediente LIKE tipo_prefix || '-' || year_part || '%';
    
    NEW.codigo_expediente := tipo_prefix || '-' || year_part || '-' || LPAD(sequence_num::TEXT, 6, '0');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Reconectar trigger de código
CREATE TRIGGER generate_solicitud_codigo
    BEFORE INSERT ON solicitudes
    FOR EACH ROW
    WHEN (NEW.codigo_expediente IS NULL OR NEW.codigo_expediente = '')
    EXECUTE FUNCTION generate_codigo_expediente();
