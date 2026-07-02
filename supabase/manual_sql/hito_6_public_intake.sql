-- Hito 6 - Mesa de partes publica sin registro
-- Ejecutar manualmente en Supabase SQL Editor sobre el baseline inicial.
-- Nota: ADD VALUE de enums se deja fuera de BEGIN porque PostgreSQL puede requerir commit
-- antes de usar el nuevo valor en constraints, defaults o datos.

ALTER TYPE public.estado_solicitud ADD VALUE IF NOT EXISTS 'borrador';

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

ALTER TABLE public.solicitudes
    ALTER COLUMN user_id DROP NOT NULL,
    ALTER COLUMN codigo_expediente DROP NOT NULL,
    ADD COLUMN IF NOT EXISTS origen text NOT NULL DEFAULT 'autenticado',
    ADD COLUMN IF NOT EXISTS tipo_tramite text,
    ADD COLUMN IF NOT EXISTS numero_expediente_referido text,
    ADD COLUMN IF NOT EXISTS sumilla text,
    ADD COLUMN IF NOT EXISTS asunto text,
    ADD COLUMN IF NOT EXISTS correo_seguimiento text;

ALTER TABLE public.partes
    ADD COLUMN IF NOT EXISTS representante_legal text,
    ADD COLUMN IF NOT EXISTS cargo_representante text,
    ADD COLUMN IF NOT EXISTS correo text;

ALTER TABLE public.documentos
    ALTER COLUMN created_by DROP NOT NULL,
    ADD COLUMN IF NOT EXISTS actor_tipo text NOT NULL DEFAULT 'usuario';

ALTER TABLE public.comprobantes_pago
    ALTER COLUMN created_by DROP NOT NULL,
    ADD COLUMN IF NOT EXISTS actor_tipo text NOT NULL DEFAULT 'usuario',
    ADD COLUMN IF NOT EXISTS tipo_facturacion text,
    ADD COLUMN IF NOT EXISTS nombre_razon_social text,
    ADD COLUMN IF NOT EXISTS documento_facturacion text,
    ADD COLUMN IF NOT EXISTS direccion_facturacion text;

ALTER TABLE public.historial_solicitud
    ALTER COLUMN user_id DROP NOT NULL,
    ADD COLUMN IF NOT EXISTS actor_tipo text NOT NULL DEFAULT 'usuario',
    ADD COLUMN IF NOT EXISTS visibilidad text NOT NULL DEFAULT 'interna';

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'solicitudes_origen_check') THEN
        ALTER TABLE public.solicitudes
            ADD CONSTRAINT solicitudes_origen_check CHECK (origen IN ('autenticado', 'publico'));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'documentos_actor_tipo_check') THEN
        ALTER TABLE public.documentos
            ADD CONSTRAINT documentos_actor_tipo_check CHECK (actor_tipo IN ('usuario', 'publico', 'admin', 'sistema'));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'comprobantes_actor_tipo_check') THEN
        ALTER TABLE public.comprobantes_pago
            ADD CONSTRAINT comprobantes_actor_tipo_check CHECK (actor_tipo IN ('usuario', 'publico', 'admin', 'sistema'));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'historial_actor_tipo_check') THEN
        ALTER TABLE public.historial_solicitud
            ADD CONSTRAINT historial_actor_tipo_check CHECK (actor_tipo IN ('usuario', 'publico', 'admin', 'sistema'));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'historial_visibilidad_check') THEN
        ALTER TABLE public.historial_solicitud
            ADD CONSTRAINT historial_visibilidad_check CHECK (visibilidad IN ('publica', 'interna'));
    END IF;
END $$;

ALTER TABLE public.partes DROP CONSTRAINT IF EXISTS partes_user_by_role;
-- La validacion de partes publicas se hace en Edge Function con service_role.
-- El CHECK historico exigia user_id y bloqueaba presentaciones sin registro.

CREATE TABLE IF NOT EXISTS public.codigo_documento_counter (
    anio integer PRIMARY KEY,
    ultimo_numero integer NOT NULL DEFAULT 0,
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.consentimientos_solicitud (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    solicitud_id uuid NOT NULL REFERENCES public.solicitudes(id) ON DELETE CASCADE,
    acepta_notificaciones boolean NOT NULL,
    acepta_datos_personales boolean NOT NULL,
    ip inet,
    user_agent text,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.observaciones_solicitud (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    solicitud_id uuid NOT NULL REFERENCES public.solicitudes(id) ON DELETE CASCADE,
    mensaje text NOT NULL,
    visibilidad text NOT NULL DEFAULT 'interna' CHECK (visibilidad IN ('publica', 'interna')),
    created_by uuid REFERENCES auth.users(id),
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.webhook_outbox (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    solicitud_id uuid NOT NULL REFERENCES public.solicitudes(id) ON DELETE CASCADE,
    evento text NOT NULL,
    payload jsonb NOT NULL,
    estado text NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'enviado', 'fallido')),
    intentos integer NOT NULL DEFAULT 0,
    ultimo_error text,
    created_at timestamptz NOT NULL DEFAULT now(),
    processed_at timestamptz
);

CREATE OR REPLACE FUNCTION public.is_admin(uid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.profiles p
        WHERE p.user_id = uid
        AND p.rol = 'administrador'
    );
$$;

CREATE OR REPLACE FUNCTION public.can_manage_solicitudes()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT public.is_admin(auth.uid());
$$;

CREATE OR REPLACE FUNCTION public.next_public_codigo()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    current_year integer := EXTRACT(YEAR FROM now())::integer;
    next_number integer;
BEGIN
    INSERT INTO public.codigo_documento_counter(anio, ultimo_numero)
    VALUES (current_year, 1)
    ON CONFLICT (anio)
    DO UPDATE SET
        ultimo_numero = public.codigo_documento_counter.ultimo_numero + 1,
        updated_at = now()
    RETURNING ultimo_numero INTO next_number;

    RETURN current_year::text || '-' || lpad(next_number::text, 7, '0');
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_codigo_expediente()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NEW.codigo_expediente IS NULL AND NEW.estado::text <> 'borrador' THEN
        NEW.codigo_expediente := public.next_public_codigo();
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS generate_solicitud_codigo ON public.solicitudes;
CREATE TRIGGER generate_solicitud_codigo
    BEFORE INSERT OR UPDATE OF estado ON public.solicitudes
    FOR EACH ROW
    EXECUTE FUNCTION public.generate_codigo_expediente();

CREATE OR REPLACE FUNCTION public.log_solicitud_created()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NEW.estado::text <> 'borrador' THEN
        BEGIN
            INSERT INTO public.historial_solicitud (
                solicitud_id, accion, estado_anterior, estado_nuevo, descripcion, user_id, actor_tipo, visibilidad
            )
            VALUES (
                NEW.id, 'creacion', NULL, NEW.estado, 'Documento recibido por mesa de partes', auth.uid(), 'sistema', 'publica'
            );
        EXCEPTION WHEN OTHERS THEN
            RAISE WARNING 'No se pudo registrar historial inicial para solicitud %: %', NEW.id, SQLERRM;
        END;
    END IF;

    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.log_solicitud_estado_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF OLD.estado IS DISTINCT FROM NEW.estado THEN
        INSERT INTO public.historial_solicitud (
            solicitud_id, accion, estado_anterior, estado_nuevo, descripcion, user_id, actor_tipo, visibilidad
        )
        VALUES (
            NEW.id, 'cambio_estado', OLD.estado, NEW.estado, 'Cambio de estado administrativo', auth.uid(), 'admin', 'publica'
        );
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS log_solicitud_created ON public.solicitudes;
CREATE TRIGGER log_solicitud_created
    AFTER INSERT ON public.solicitudes
    FOR EACH ROW
    EXECUTE FUNCTION public.log_solicitud_created();

DROP TRIGGER IF EXISTS log_solicitud_estado_change ON public.solicitudes;
CREATE TRIGGER log_solicitud_estado_change
    AFTER UPDATE OF estado ON public.solicitudes
    FOR EACH ROW
    EXECUTE FUNCTION public.log_solicitud_estado_change();

CREATE OR REPLACE FUNCTION public.buscar_trazabilidad_publica(codigo text)
RETURNS TABLE (
    codigo text,
    seccion text,
    tramite text,
    fecha_ingreso timestamptz,
    estado text,
    observaciones text[]
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT
        s.codigo_expediente,
        s.tipo_solicitud::text,
        COALESCE(s.tipo_tramite, s.tipo_solicitud::text),
        s.created_at,
        s.estado::text,
        COALESCE(
            array_agg(o.mensaje ORDER BY o.created_at) FILTER (WHERE o.id IS NOT NULL),
            ARRAY[]::text[]
        )
    FROM public.solicitudes s
    LEFT JOIN public.observaciones_solicitud o
        ON o.solicitud_id = s.id
        AND o.visibilidad = 'publica'
    WHERE s.codigo_expediente = codigo
    AND s.origen = 'publico'
    AND s.estado::text <> 'borrador'
    GROUP BY s.id;
$$;

CREATE OR REPLACE FUNCTION public.enqueue_recepcion_webhook(solicitud_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    payload jsonb;
    outbox_id uuid;
BEGIN
    SELECT jsonb_build_object(
        'evento', 'recepcion_documento',
        'solicitud_id', s.id,
        'codigo', s.codigo_expediente,
        'seccion', s.tipo_solicitud,
        'tramite', s.tipo_tramite,
        'fecha_recepcion', s.created_at,
        'estado', s.estado,
        'correo_destino', s.correo_seguimiento,
        'solicitante', jsonb_build_object(
            'nombres_apellidos', p.nombres_apellidos,
            'razon_social', p.razon_social,
            'correo', p.correo,
            'celular', p.celular
        )
    )
    INTO payload
    FROM public.solicitudes s
    LEFT JOIN public.partes p ON p.solicitud_id = s.id
    WHERE s.id = solicitud_id
    LIMIT 1;

    IF payload IS NOT NULL THEN
        INSERT INTO public.webhook_outbox(solicitud_id, evento, payload)
        VALUES (solicitud_id, 'recepcion_documento', payload)
        RETURNING id INTO outbox_id;
    END IF;

    RETURN outbox_id;
END;
$$;

ALTER TABLE public.consentimientos_solicitud ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.observaciones_solicitud ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_outbox ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS solicitudes_select_owner_or_staff ON public.solicitudes;
DROP POLICY IF EXISTS solicitudes_select_owner_or_admin ON public.solicitudes;
DROP POLICY IF EXISTS solicitudes_insert_own ON public.solicitudes;
DROP POLICY IF EXISTS solicitudes_update_staff ON public.solicitudes;
DROP POLICY IF EXISTS solicitudes_update_admin ON public.solicitudes;

CREATE POLICY solicitudes_select_owner_or_admin ON public.solicitudes
    FOR SELECT TO authenticated
    USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY solicitudes_insert_own ON public.solicitudes
    FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid() AND origen = 'autenticado');

CREATE POLICY solicitudes_update_admin ON public.solicitudes
    FOR UPDATE TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS observaciones_admin_all ON public.observaciones_solicitud;
CREATE POLICY observaciones_admin_all ON public.observaciones_solicitud
    FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS consentimientos_admin_select ON public.consentimientos_solicitud;
CREATE POLICY consentimientos_admin_select ON public.consentimientos_solicitud
    FOR SELECT TO authenticated
    USING (public.is_admin());

DROP POLICY IF EXISTS webhook_admin_select ON public.webhook_outbox;
CREATE POLICY webhook_admin_select ON public.webhook_outbox
    FOR SELECT TO authenticated
    USING (public.is_admin());

GRANT EXECUTE ON FUNCTION public.buscar_trazabilidad_publica(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.next_public_codigo() TO service_role;
GRANT EXECUTE ON FUNCTION public.enqueue_recepcion_webhook(uuid) TO service_role;

UPDATE storage.buckets
SET public = false,
    file_size_limit = 20971520,
    allowed_mime_types = ARRAY[
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/png'
    ]
WHERE id = 'solicitudes';

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'solicitudes',
    'solicitudes',
    false,
    20971520,
    ARRAY[
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/png'
    ]
)
ON CONFLICT (id) DO NOTHING;

COMMIT;
