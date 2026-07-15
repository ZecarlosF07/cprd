-- Hito 7 - Trazabilidad pública con historial cronológico.
-- Ejecutar manualmente después de hito_7_fix_finalize_public_intake.sql.
-- No expone datos personales, documentos ni eventos con visibilidad interna.

BEGIN;

CREATE OR REPLACE FUNCTION public.buscar_trazabilidad_publica_v2(p_codigo text)
RETURNS TABLE (
    codigo text,
    seccion text,
    tramite text,
    fecha_ingreso timestamptz,
    estado text,
    eventos jsonb
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT
        s.codigo_expediente::text,
        s.tipo_solicitud::text,
        COALESCE(s.tipo_tramite, s.tipo_solicitud::text),
        s.created_at,
        s.estado::text,
        COALESCE((
            SELECT jsonb_agg(
                jsonb_build_object(
                    'id', event.id::text,
                    'tipo', event.tipo,
                    'titulo', event.titulo,
                    'descripcion', event.descripcion,
                    'estadoAnterior', event.estado_anterior,
                    'estadoNuevo', event.estado_nuevo,
                    'fecha', event.fecha
                )
                ORDER BY event.fecha, event.source_order, event.id
            )
            FROM (
                SELECT
                    h.id,
                    h.accion::text AS tipo,
                    CASE h.accion::text
                        WHEN 'creacion' THEN 'Documento recibido'
                        WHEN 'cambio_estado' THEN 'Estado actualizado'
                        WHEN 'observacion' THEN 'Observación registrada'
                        WHEN 'subsanacion' THEN 'Subsanación registrada'
                        WHEN 'documento_adjunto' THEN 'Documento adjuntado'
                        WHEN 'pago_adjunto' THEN 'Comprobante adjuntado'
                        WHEN 'pago_validado' THEN 'Pago validado'
                        WHEN 'pago_observado' THEN 'Pago observado'
                        ELSE 'Actualización del trámite'
                    END AS titulo,
                    h.descripcion,
                    h.estado_anterior::text,
                    h.estado_nuevo::text,
                    h.created_at AS fecha,
                    0 AS source_order
                FROM public.historial_solicitud h
                WHERE h.solicitud_id = s.id
                  AND h.deleted_at IS NULL
                  AND h.visibilidad = 'publica'

                UNION ALL

                SELECT
                    o.id,
                    'observacion' AS tipo,
                    'Observación pública' AS titulo,
                    o.mensaje AS descripcion,
                    NULL::text AS estado_anterior,
                    NULL::text AS estado_nuevo,
                    o.created_at AS fecha,
                    1 AS source_order
                FROM public.observaciones_solicitud o
                WHERE o.solicitud_id = s.id
                  AND o.visibilidad = 'publica'
            ) AS event
        ), '[]'::jsonb)
    FROM public.solicitudes s
    WHERE s.codigo_expediente = p_codigo
      AND s.origen = 'publico'
      AND s.estado::text <> 'borrador';
$$;

REVOKE ALL ON FUNCTION public.buscar_trazabilidad_publica_v2(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.buscar_trazabilidad_publica_v2(text) TO service_role;

DO $$
BEGIN
    IF to_regprocedure('public.buscar_trazabilidad_publica_v2(text)') IS NULL THEN
        RAISE EXCEPTION 'No se creó buscar_trazabilidad_publica_v2(text)';
    END IF;
END;
$$;

COMMIT;

-- Validación manual posterior, usando un código público conocido:
-- SELECT codigo, estado, jsonb_pretty(eventos)
-- FROM public.buscar_trazabilidad_publica_v2('AAAA-0000000');
-- Confirmar que cada evento tenga fecha y que no aparezcan registros internos.
--
-- Rollback coordinado:
-- 1. Replegar public-tracking a la versión que llama buscar_trazabilidad_publica.
-- 2. Ejecutar: DROP FUNCTION IF EXISTS public.buscar_trazabilidad_publica_v2(text);
