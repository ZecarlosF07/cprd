-- Hito 6 - Hardening para Edge Functions publicas
-- Ejecutar una vez DESPUES de hito_6_public_intake.sql.

BEGIN;

CREATE TABLE IF NOT EXISTS public.public_intake_requests (
    idempotency_key uuid PRIMARY KEY,
    payload_hash text NOT NULL,
    solicitud_id uuid UNIQUE REFERENCES public.solicitudes(id) ON DELETE CASCADE,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.public_rate_limits (
    accion text NOT NULL,
    key_hash text NOT NULL,
    window_start timestamptz NOT NULL,
    intentos integer NOT NULL DEFAULT 1,
    PRIMARY KEY (accion, key_hash, window_start)
);

ALTER TABLE public.webhook_outbox
    ADD COLUMN IF NOT EXISTS next_attempt_at timestamptz NOT NULL DEFAULT now(),
    ADD COLUMN IF NOT EXISTS locked_at timestamptz,
    ADD COLUMN IF NOT EXISTS response_status integer;

CREATE UNIQUE INDEX IF NOT EXISTS webhook_outbox_solicitud_evento_unique
    ON public.webhook_outbox(solicitud_id, evento);

CREATE INDEX IF NOT EXISTS webhook_outbox_pending_idx
    ON public.webhook_outbox(next_attempt_at, created_at)
    WHERE estado = 'pendiente';

ALTER TABLE public.public_intake_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.public_rate_limits ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.check_public_rate_limit(
    p_accion text,
    p_key_hash text,
    p_limit integer,
    p_window_seconds integer
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    current_window timestamptz;
    current_attempts integer;
BEGIN
    IF p_limit < 1 OR p_window_seconds < 1 THEN
        RAISE EXCEPTION 'Configuracion de rate limit invalida';
    END IF;

    current_window := to_timestamp(
        floor(extract(epoch FROM now()) / p_window_seconds) * p_window_seconds
    );

    INSERT INTO public.public_rate_limits(accion, key_hash, window_start, intentos)
    VALUES (p_accion, p_key_hash, current_window, 1)
    ON CONFLICT (accion, key_hash, window_start)
    DO UPDATE SET intentos = public.public_rate_limits.intentos + 1
    RETURNING intentos INTO current_attempts;

    RETURN current_attempts <= p_limit;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_public_intake_result(
    p_idempotency_key uuid,
    p_payload_hash text
)
RETURNS TABLE (solicitud_id uuid, codigo text, estado text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM public.public_intake_requests r
        WHERE r.idempotency_key = p_idempotency_key
          AND r.payload_hash <> p_payload_hash
    ) THEN
        RAISE EXCEPTION 'La clave de idempotencia ya fue utilizada con otros datos';
    END IF;

    RETURN QUERY
    SELECT s.id, s.codigo_expediente::text, s.estado::text
    FROM public.public_intake_requests r
    JOIN public.solicitudes s ON s.id = r.solicitud_id
    WHERE r.idempotency_key = p_idempotency_key
      AND r.payload_hash = p_payload_hash;
END;
$$;

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

    INSERT INTO public.solicitudes (
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
    RETURNING id, codigo_expediente, estado::text
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

    RETURN QUERY SELECT new_solicitud_id, new_codigo, new_estado, new_outbox_id, new_webhook_payload;
END;
$$;

CREATE OR REPLACE FUNCTION public.claim_webhook_outbox(p_limit integer DEFAULT 20)
RETURNS TABLE (id uuid, payload jsonb, intentos integer)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    WITH candidates AS (
        SELECT w.id
        FROM public.webhook_outbox w
        WHERE w.estado = 'pendiente'
          AND w.intentos < 5
          AND w.next_attempt_at <= now()
          AND (w.locked_at IS NULL OR w.locked_at < now() - interval '5 minutes')
        ORDER BY w.created_at
        FOR UPDATE SKIP LOCKED
        LIMIT LEAST(GREATEST(p_limit, 1), 50)
    )
    UPDATE public.webhook_outbox w
    SET locked_at = now()
    FROM candidates c
    WHERE w.id = c.id
    RETURNING w.id, w.payload, w.intentos;
$$;

CREATE OR REPLACE FUNCTION public.complete_webhook_attempt(
    p_id uuid,
    p_success boolean,
    p_status integer,
    p_error text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    next_attempt integer;
BEGIN
    SELECT intentos + 1 INTO next_attempt
    FROM public.webhook_outbox
    WHERE id = p_id
    FOR UPDATE;

    UPDATE public.webhook_outbox
    SET intentos = next_attempt,
        estado = CASE
            WHEN p_success THEN 'enviado'
            WHEN next_attempt >= 5 THEN 'fallido'
            ELSE 'pendiente'
        END,
        ultimo_error = CASE WHEN p_success THEN NULL ELSE left(p_error, 1000) END,
        response_status = p_status,
        processed_at = CASE WHEN p_success THEN now() ELSE NULL END,
        next_attempt_at = CASE
            WHEN p_success THEN next_attempt_at
            ELSE now() + make_interval(secs => CASE next_attempt
                WHEN 1 THEN 60
                WHEN 2 THEN 300
                WHEN 3 THEN 900
                ELSE 3600
            END)
        END,
        locked_at = NULL
    WHERE id = p_id;
END;
$$;

REVOKE ALL ON FUNCTION public.check_public_rate_limit(text, text, integer, integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_public_intake_result(uuid, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.finalize_public_intake(uuid, text, jsonb, jsonb, jsonb, inet, text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.claim_webhook_outbox(integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.complete_webhook_attempt(uuid, boolean, integer, text) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.check_public_rate_limit(text, text, integer, integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_public_intake_result(uuid, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.finalize_public_intake(uuid, text, jsonb, jsonb, jsonb, inet, text, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.claim_webhook_outbox(integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.complete_webhook_attempt(uuid, boolean, integer, text) TO service_role;

DROP FUNCTION IF EXISTS public.enqueue_recepcion_webhook(uuid);

COMMIT;

-- Validacion manual:
-- SELECT table_name FROM information_schema.tables
-- WHERE table_schema = 'public' AND table_name IN ('public_intake_requests', 'public_rate_limits');
-- SELECT column_name FROM information_schema.columns
-- WHERE table_schema = 'public' AND table_name = 'webhook_outbox' ORDER BY ordinal_position;
