-- Hito 7 - Corrige la referencia ambigua de estado en finalize_public_intake.
-- Ejecutar manualmente en Supabase SQL Editor después de:
--   1. hito_6_public_intake.sql
--   2. hito_6_edge_functions_hardening.sql
--
-- Causa corregida:
-- PostgreSQL 42702 porque `estado` podía referirse tanto a la columna de
-- solicitudes como al parámetro de salida de RETURNS TABLE.

BEGIN;

CREATE OR REPLACE FUNCTION public.finalize_public_intake(
    p_idempotency_key uuid,
    p_payload_hash text,
    p_payload jsonb,
    p_documentos jsonb,
    p_pago jsonb,
    p_ip inet,
    p_user_agent text,
    p_public_app_url text
)
RETURNS TABLE (
    solicitud_id uuid,
    codigo text,
    estado text,
    outbox_id uuid,
    webhook_payload jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    request_inserted uuid;
    new_solicitud_id uuid;
    new_parte_id uuid;
    new_codigo text;
    new_estado text;
    new_outbox_id uuid;
    new_webhook_payload jsonb;
    doc jsonb;
    tipo_solicitud_value public.tipo_solicitud;
BEGIN
    SELECT r.idempotency_key
    INTO request_inserted
    FROM public.public_intake_requests r
    WHERE r.idempotency_key = p_idempotency_key;

    IF request_inserted IS NOT NULL THEN
        IF EXISTS (
            SELECT 1 FROM public.public_intake_requests r
            WHERE r.idempotency_key = p_idempotency_key
              AND r.payload_hash <> p_payload_hash
        ) THEN
            RAISE EXCEPTION 'La clave de idempotencia ya fue utilizada con otros datos';
        END IF;

        RETURN QUERY
        SELECT s.id, s.codigo_expediente::text, s.estado::text, w.id, w.payload
        FROM public.public_intake_requests r
        JOIN public.solicitudes s ON s.id = r.solicitud_id
        LEFT JOIN public.webhook_outbox w
          ON w.solicitud_id = s.id AND w.evento = 'recepcion_solicitud'
        WHERE r.idempotency_key = p_idempotency_key;
        RETURN;
    END IF;

    INSERT INTO public.public_intake_requests(idempotency_key, payload_hash)
    VALUES (p_idempotency_key, p_payload_hash)
    ON CONFLICT (idempotency_key) DO NOTHING
    RETURNING idempotency_key INTO request_inserted;

    IF request_inserted IS NULL THEN
        RETURN QUERY
        SELECT * FROM public.finalize_public_intake(
            p_idempotency_key, p_payload_hash, p_payload, p_documentos,
            p_pago, p_ip, p_user_agent, p_public_app_url
        );
        RETURN;
    END IF;

    tipo_solicitud_value := CASE
        WHEN p_payload->>'tramiteCodigo' = 'arbitraje_emergencia'
            THEN 'arbitraje_emergencia'::public.tipo_solicitud
        ELSE (p_payload->>'seccion')::public.tipo_solicitud
    END;

    INSERT INTO public.solicitudes AS inserted (
        tipo_solicitud, estado, origen, tipo_tramite,
        numero_expediente_referido, sumilla, asunto,
        correo_seguimiento, descripcion_controversia
    ) VALUES (
        tipo_solicitud_value,
        'recibida',
        'publico',
        p_payload->>'tramiteCodigo',
        NULLIF(p_payload->>'numeroExpedienteReferido', ''),
        NULLIF(p_payload->>'sumilla', ''),
        NULLIF(p_payload->>'asunto', ''),
        p_payload#>>'{solicitante,correo}',
        COALESCE(NULLIF(p_payload->>'asunto', ''), NULLIF(p_payload->>'sumilla', ''), p_payload->>'tramiteCodigo')
    )
    RETURNING inserted.id, inserted.codigo_expediente, inserted.estado::text
    INTO new_solicitud_id, new_codigo, new_estado;

    INSERT INTO public.partes (
        solicitud_id, rol, tipo_persona, tipo_documento, numero_documento,
        nombres_apellidos, razon_social, representante_legal,
        cargo_representante, celular, correo, domicilio
    ) VALUES (
        new_solicitud_id,
        CASE WHEN p_payload->>'seccion' = 'jprd'
            THEN 'contratista'::public.rol_parte
            ELSE 'demandante'::public.rol_parte END,
        (p_payload#>>'{solicitante,tipoPersona}')::public.tipo_persona,
        (p_payload#>>'{solicitante,tipoDocumento}')::public.tipo_documento,
        p_payload#>>'{solicitante,numeroDocumento}',
        NULLIF(p_payload#>>'{solicitante,nombresApellidos}', ''),
        NULLIF(p_payload#>>'{solicitante,razonSocial}', ''),
        NULLIF(p_payload#>>'{solicitante,representanteLegal}', ''),
        NULLIF(p_payload#>>'{solicitante,cargoRepresentante}', ''),
        p_payload#>>'{solicitante,celular}',
        p_payload#>>'{solicitante,correo}',
        p_payload#>>'{solicitante,domicilio}'
    ) RETURNING id INTO new_parte_id;

    INSERT INTO public.correos_parte(parte_id, correo, es_principal)
    VALUES (new_parte_id, p_payload#>>'{solicitante,correo}', true);

    FOR doc IN SELECT value FROM jsonb_array_elements(p_documentos)
    LOOP
        INSERT INTO public.documentos (
            solicitud_id, tipo_documento, nombre_archivo, archivo_url,
            link_externo, tamano_bytes, mime_type, comentario, actor_tipo
        ) VALUES (
            new_solicitud_id,
            (doc->>'tipo_documento')::public.tipo_documento_adjunto,
            doc->>'nombre_archivo',
            NULLIF(doc->>'archivo_url', ''),
            NULLIF(doc->>'link_externo', ''),
            NULLIF(doc->>'tamano_bytes', '')::bigint,
            NULLIF(doc->>'mime_type', ''),
            NULLIF(doc->>'comentario', ''),
            'publico'
        );
    END LOOP;

    IF p_pago IS NOT NULL AND p_pago <> 'null'::jsonb THEN
        INSERT INTO public.comprobantes_pago (
            solicitud_id, archivo_url, actor_tipo, tipo_facturacion,
            nombre_razon_social, documento_facturacion, direccion_facturacion
        ) VALUES (
            new_solicitud_id,
            p_pago->>'archivo_url',
            'publico',
            p_pago->>'tipo_facturacion',
            p_pago->>'nombre_razon_social',
            p_pago->>'documento_facturacion',
            p_pago->>'direccion_facturacion'
        );
    END IF;

    INSERT INTO public.consentimientos_solicitud (
        solicitud_id, acepta_notificaciones, acepta_datos_personales, ip, user_agent
    ) VALUES (new_solicitud_id, true, true, p_ip, p_user_agent);

    new_webhook_payload := jsonb_build_object(
        'event_type', 'recepcion_solicitud',
        'version', 1,
        'codigo', new_codigo,
        'fecha_recepcion', now(),
        'trazabilidad_url', rtrim(p_public_app_url, '/') || '/trazabilidad',
        'solicitante', jsonb_build_object(
            'tipo_persona', p_payload#>>'{solicitante,tipoPersona}',
            'nombres_apellidos', NULLIF(p_payload#>>'{solicitante,nombresApellidos}', ''),
            'razon_social', NULLIF(p_payload#>>'{solicitante,razonSocial}', ''),
            'representante_legal', NULLIF(p_payload#>>'{solicitante,representanteLegal}', ''),
            'cargo_representante', NULLIF(p_payload#>>'{solicitante,cargoRepresentante}', ''),
            'correo', p_payload#>>'{solicitante,correo}',
            'tipo_documento', p_payload#>>'{solicitante,tipoDocumento}',
            'numero_documento', p_payload#>>'{solicitante,numeroDocumento}'
        ),
        'solicitud', jsonb_build_object(
            'seccion', p_payload->>'seccion',
            'tramite_codigo', p_payload->>'tramiteCodigo',
            'tramite_nombre', p_payload->>'tramiteNombre',
            'numero_expediente_referido', NULLIF(p_payload->>'numeroExpedienteReferido', ''),
            'sumilla', NULLIF(p_payload->>'sumilla', ''),
            'asunto', NULLIF(p_payload->>'asunto', ''),
            'requiere_pago', (p_payload->>'requierePago')::boolean
        ),
        'documentos', jsonb_build_object(
            'cantidad_archivos', (
                SELECT count(*) FROM jsonb_array_elements(p_documentos) d
                WHERE NULLIF(d->>'archivo_url', '') IS NOT NULL
            ),
            'cantidad_enlaces_externos', (
                SELECT count(*) FROM jsonb_array_elements(p_documentos) d
                WHERE NULLIF(d->>'link_externo', '') IS NOT NULL
            )
        )
    );

    INSERT INTO public.webhook_outbox(solicitud_id, evento, payload)
    VALUES (new_solicitud_id, 'recepcion_solicitud', new_webhook_payload)
    RETURNING id INTO new_outbox_id;

    UPDATE public.public_intake_requests
    SET solicitud_id = new_solicitud_id
    WHERE idempotency_key = p_idempotency_key;

    RETURN QUERY
    SELECT new_solicitud_id, new_codigo, new_estado, new_outbox_id, new_webhook_payload;
END;
$$;

REVOKE ALL ON FUNCTION public.finalize_public_intake(
    uuid, text, jsonb, jsonb, jsonb, inet, text, text
) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.finalize_public_intake(
    uuid, text, jsonb, jsonb, jsonb, inet, text, text
) TO service_role;

DO $$
DECLARE
    function_definition text;
BEGIN
    SELECT pg_get_functiondef(p.oid)
    INTO function_definition
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname = 'finalize_public_intake'
      AND pg_get_function_identity_arguments(p.oid) =
          'p_idempotency_key uuid, p_payload_hash text, p_payload jsonb, p_documentos jsonb, p_pago jsonb, p_ip inet, p_user_agent text, p_public_app_url text';

    IF function_definition IS NULL THEN
        RAISE EXCEPTION 'No se encontró finalize_public_intake con la firma esperada';
    END IF;

    IF position('INSERT INTO public.solicitudes AS inserted' IN function_definition) = 0
       OR position('inserted.estado::text' IN function_definition) = 0 THEN
        RAISE EXCEPTION 'La corrección de la referencia ambigua no quedó aplicada';
    END IF;
END;
$$;

COMMIT;

-- Validación manual posterior:
-- SELECT pg_get_function_identity_arguments(p.oid), prosecdef
-- FROM pg_proc p
-- JOIN pg_namespace n ON n.oid = p.pronamespace
-- WHERE n.nspname = 'public' AND p.proname = 'finalize_public_intake';
--
-- Probar el formulario público y confirmar que se creen, de forma atómica:
-- public_intake_requests, solicitudes, partes, documentos, comprobantes_pago,
-- consentimientos_solicitud y webhook_outbox.
--
-- Rollback operativo posterior al COMMIT:
-- Reaplicar la definición previa desde hito_6_edge_functions_hardening.sql solo
-- durante una reversión de emergencia coordinada. Esa definición restaura el
-- error 42702, por lo que el rollback funcional recomendado es restaurar un
-- backup anterior y detener temporalmente public-intake.
