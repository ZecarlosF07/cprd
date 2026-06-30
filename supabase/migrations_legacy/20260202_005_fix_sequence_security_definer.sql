-- ============================================================
-- FIX: Hacer generate_codigo_expediente SECURITY DEFINER
-- Fecha: 2026-02-02
-- Descripción: La función para generar códigos fallaba porque el usuario
-- solo podía ver sus propias solicitudes (RLS), causando duplicidad de códigos
-- (siempre calculaba 1) y violando la constraint UNIQUE.
-- Al hacerla SECURITY DEFINER, se ejecuta con privilegios de postgres
-- y puede ver toda la tabla para calcular el correlativo correcto.
-- ============================================================

CREATE OR REPLACE FUNCTION generate_codigo_expediente()
RETURNS TRIGGER AS $$
DECLARE
    year_part VARCHAR(4);
    sequence_num INTEGER;
    tipo_prefix VARCHAR(3);
BEGIN
    -- Obtener el año actual
    year_part := TO_CHAR(NOW(), 'YYYY');
    
    -- Definir prefijo según tipo de solicitud
    CASE NEW.tipo_solicitud
        WHEN 'arbitraje' THEN tipo_prefix := 'ARB';
        WHEN 'arbitraje_emergencia' THEN tipo_prefix := 'AEM';
        WHEN 'jprd' THEN tipo_prefix := 'JPR';
        ELSE tipo_prefix := 'EXP';
    END CASE;
    
    -- Obtener el siguiente número de secuencia para el año
    -- Al ser SECURITY DEFINER, este SELECT verá TODAS las filas
    SELECT COALESCE(MAX(
        CAST(SUBSTRING(codigo_expediente FROM '[0-9]+$') AS INTEGER)
    ), 0) + 1
    INTO sequence_num
    FROM solicitudes
    WHERE codigo_expediente LIKE tipo_prefix || '-' || year_part || '-%';
    
    -- Generar código: TIPO-YYYY-NNNNNN
    NEW.codigo_expediente := tipo_prefix || '-' || year_part || '-' || LPAD(sequence_num::TEXT, 6, '0');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
