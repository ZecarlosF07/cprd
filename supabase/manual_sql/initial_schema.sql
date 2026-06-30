-- ============================================================
-- CPRD Mesa de Partes Virtual
-- Initial schema for a NEW Supabase project
-- Execute this file once from Supabase SQL Editor.
-- ============================================================

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================
-- 1. DOMAIN ENUMS
-- ============================================================

CREATE TYPE public.tipo_persona AS ENUM ('natural', 'juridica');
CREATE TYPE public.tipo_documento AS ENUM ('dni', 'ce', 'pasaporte', 'ruc');
CREATE TYPE public.rol_usuario AS ENUM ('externo', 'interno', 'administrador');
CREATE TYPE public.tipo_solicitud AS ENUM ('arbitraje', 'arbitraje_emergencia', 'jprd');

CREATE TYPE public.estado_solicitud AS ENUM (
    'recibida',
    'en_revision',
    'observada',
    'subsanada',
    'admitida',
    'rechazada',
    'archivada'
);

CREATE TYPE public.rol_parte AS ENUM ('demandante', 'demandado', 'contratista', 'entidad');
CREATE TYPE public.estado_pago AS ENUM ('pendiente', 'validado', 'observado', 'rechazado');

CREATE TYPE public.tipo_documento_adjunto AS ENUM (
    'demanda',
    'contrato',
    'poder',
    'dni_representante',
    'constitucion_empresa',
    'otro'
);

CREATE TYPE public.tipo_accion AS ENUM (
    'creacion',
    'cambio_estado',
    'observacion',
    'subsanacion',
    'documento_adjunto',
    'pago_adjunto',
    'pago_validado',
    'pago_observado'
);

CREATE TYPE public.tipo_notificacion AS ENUM (
    'confirmacion_recepcion',
    'cambio_estado',
    'observacion',
    'subsanacion_recibida',
    'admision',
    'rechazo'
);

-- ============================================================
-- 2. TABLES
-- ============================================================

CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tipo_persona public.tipo_persona NOT NULL,
    tipo_documento public.tipo_documento NOT NULL,
    numero_documento VARCHAR(20) NOT NULL,
    nombres_apellidos VARCHAR(255),
    razon_social VARCHAR(255),
    celular VARCHAR(30) NOT NULL,
    domicilio TEXT NOT NULL,
    rol public.rol_usuario NOT NULL DEFAULT 'externo',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT profiles_unique_user UNIQUE (user_id),
    CONSTRAINT profiles_unique_documento UNIQUE (tipo_documento, numero_documento),
    CONSTRAINT profiles_natural_nombre_required CHECK (
        tipo_persona != 'natural' OR NULLIF(TRIM(nombres_apellidos), '') IS NOT NULL
    ),
    CONSTRAINT profiles_juridica_razon_required CHECK (
        tipo_persona != 'juridica' OR NULLIF(TRIM(razon_social), '') IS NOT NULL
    )
);

CREATE TABLE public.solicitudes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo_expediente VARCHAR(50) NOT NULL UNIQUE,
    tipo_solicitud public.tipo_solicitud NOT NULL,
    estado public.estado_solicitud NOT NULL DEFAULT 'recibida',
    user_id UUID NOT NULL REFERENCES auth.users(id),
    materia TEXT,
    cuantia DECIMAL(15, 2),
    moneda VARCHAR(3) NOT NULL DEFAULT 'PEN',
    descripcion_controversia TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE public.partes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    solicitud_id UUID NOT NULL REFERENCES public.solicitudes(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    rol public.rol_parte NOT NULL,
    tipo_persona public.tipo_persona NOT NULL,
    tipo_documento public.tipo_documento NOT NULL,
    numero_documento VARCHAR(20) NOT NULL,
    nombres_apellidos VARCHAR(255),
    razon_social VARCHAR(255),
    celular VARCHAR(30),
    domicilio TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT partes_natural_nombre_required CHECK (
        tipo_persona != 'natural' OR NULLIF(TRIM(nombres_apellidos), '') IS NOT NULL
    ),
    CONSTRAINT partes_juridica_razon_required CHECK (
        tipo_persona != 'juridica' OR NULLIF(TRIM(razon_social), '') IS NOT NULL
    ),
    CONSTRAINT partes_user_by_role CHECK (
        (
            rol IN ('demandante', 'contratista')
            AND user_id IS NOT NULL
        )
        OR (
            rol IN ('demandado', 'entidad')
            AND user_id IS NULL
        )
    )
);

CREATE TABLE public.correos_parte (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parte_id UUID NOT NULL REFERENCES public.partes(id) ON DELETE CASCADE,
    correo VARCHAR(255) NOT NULL,
    es_principal BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE public.documentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    solicitud_id UUID NOT NULL REFERENCES public.solicitudes(id) ON DELETE CASCADE,
    tipo_documento public.tipo_documento_adjunto NOT NULL,
    nombre_archivo VARCHAR(255) NOT NULL,
    archivo_url TEXT,
    link_externo TEXT,
    tamano_bytes BIGINT,
    mime_type VARCHAR(100),
    comentario TEXT,
    es_subsanacion BOOLEAN NOT NULL DEFAULT false,
    documento_original_id UUID REFERENCES public.documentos(id),
    created_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT documentos_file_or_link_required CHECK (
        archivo_url IS NOT NULL OR link_externo IS NOT NULL
    )
);

CREATE TABLE public.comprobantes_pago (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    solicitud_id UUID NOT NULL REFERENCES public.solicitudes(id) ON DELETE CASCADE,
    numero_operacion VARCHAR(100),
    monto DECIMAL(15, 2),
    fecha_pago TIMESTAMPTZ,
    archivo_url TEXT NOT NULL,
    estado public.estado_pago NOT NULL DEFAULT 'pendiente',
    observado_motivo TEXT,
    revisado_por UUID REFERENCES auth.users(id),
    revisado_at TIMESTAMPTZ,
    created_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE public.historial_solicitud (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    solicitud_id UUID NOT NULL REFERENCES public.solicitudes(id) ON DELETE CASCADE,
    accion public.tipo_accion NOT NULL,
    estado_anterior public.estado_solicitud,
    estado_nuevo public.estado_solicitud,
    descripcion TEXT,
    metadata JSONB,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE public.notificaciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    solicitud_id UUID REFERENCES public.solicitudes(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    tipo public.tipo_notificacion NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    mensaje TEXT NOT NULL,
    leido BOOLEAN NOT NULL DEFAULT false,
    leido_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- ============================================================
-- 3. INDEXES
-- ============================================================

CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_profiles_rol ON public.profiles(rol);
CREATE INDEX idx_profiles_documento ON public.profiles(tipo_documento, numero_documento);
CREATE INDEX idx_profiles_active ON public.profiles(deleted_at) WHERE deleted_at IS NULL;

CREATE INDEX idx_solicitudes_user_id ON public.solicitudes(user_id);
CREATE INDEX idx_solicitudes_estado ON public.solicitudes(estado);
CREATE INDEX idx_solicitudes_tipo ON public.solicitudes(tipo_solicitud);
CREATE INDEX idx_solicitudes_codigo ON public.solicitudes(codigo_expediente);
CREATE INDEX idx_solicitudes_created_at ON public.solicitudes(created_at DESC);
CREATE INDEX idx_solicitudes_active ON public.solicitudes(deleted_at) WHERE deleted_at IS NULL;

CREATE INDEX idx_partes_solicitud_id ON public.partes(solicitud_id);
CREATE INDEX idx_partes_user_id ON public.partes(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_partes_rol ON public.partes(rol);
CREATE INDEX idx_partes_active ON public.partes(deleted_at) WHERE deleted_at IS NULL;

CREATE INDEX idx_correos_parte_id ON public.correos_parte(parte_id);
CREATE INDEX idx_correos_parte_principal ON public.correos_parte(parte_id, es_principal)
    WHERE es_principal = true AND deleted_at IS NULL;

CREATE INDEX idx_documentos_solicitud_id ON public.documentos(solicitud_id);
CREATE INDEX idx_documentos_tipo ON public.documentos(tipo_documento);
CREATE INDEX idx_documentos_created_by ON public.documentos(created_by);
CREATE INDEX idx_documentos_subsanacion ON public.documentos(documento_original_id)
    WHERE es_subsanacion = true;
CREATE INDEX idx_documentos_active ON public.documentos(deleted_at) WHERE deleted_at IS NULL;

CREATE INDEX idx_comprobantes_solicitud_id ON public.comprobantes_pago(solicitud_id);
CREATE INDEX idx_comprobantes_estado ON public.comprobantes_pago(estado);
CREATE INDEX idx_comprobantes_created_by ON public.comprobantes_pago(created_by);
CREATE INDEX idx_comprobantes_active ON public.comprobantes_pago(deleted_at) WHERE deleted_at IS NULL;

CREATE INDEX idx_historial_solicitud_id ON public.historial_solicitud(solicitud_id);
CREATE INDEX idx_historial_accion ON public.historial_solicitud(accion);
CREATE INDEX idx_historial_user_id ON public.historial_solicitud(user_id);
CREATE INDEX idx_historial_created_at ON public.historial_solicitud(created_at DESC);
CREATE INDEX idx_historial_active ON public.historial_solicitud(deleted_at) WHERE deleted_at IS NULL;

CREATE INDEX idx_notificaciones_user_id ON public.notificaciones(user_id);
CREATE INDEX idx_notificaciones_solicitud_id ON public.notificaciones(solicitud_id)
    WHERE solicitud_id IS NOT NULL;
CREATE INDEX idx_notificaciones_unread ON public.notificaciones(user_id, leido)
    WHERE leido = false AND deleted_at IS NULL;
CREATE INDEX idx_notificaciones_created_at ON public.notificaciones(created_at DESC);

-- ============================================================
-- 4. API PRIVILEGES
-- ============================================================

GRANT USAGE ON SCHEMA public TO authenticated;

GRANT USAGE ON TYPE
    public.tipo_persona,
    public.tipo_documento,
    public.rol_usuario,
    public.tipo_solicitud,
    public.estado_solicitud,
    public.rol_parte,
    public.estado_pago,
    public.tipo_documento_adjunto,
    public.tipo_accion,
    public.tipo_notificacion
TO authenticated;

GRANT SELECT, INSERT, UPDATE ON
    public.profiles,
    public.solicitudes,
    public.partes,
    public.correos_parte,
    public.documentos,
    public.comprobantes_pago,
    public.historial_solicitud,
    public.notificaciones
TO authenticated;

-- ============================================================
-- 5. HELPER FUNCTIONS
-- ============================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS public.rol_usuario AS $$
DECLARE
    user_role public.rol_usuario;
BEGIN
    SELECT p.rol
    INTO user_role
    FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.deleted_at IS NULL
    LIMIT 1;

    RETURN COALESCE(user_role, 'externo'::public.rol_usuario);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_internal_user()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN public.current_user_role() IN ('interno', 'administrador');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN public.current_user_role() = 'administrador';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_solicitud_owner(sol_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM public.solicitudes s
        WHERE s.id = sol_id
          AND s.user_id = auth.uid()
          AND s.deleted_at IS NULL
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION public.can_access_solicitud(sol_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN public.is_internal_user() OR public.is_solicitud_owner(sol_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION public.can_modify_solicitud(sol_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM public.solicitudes s
        WHERE s.id = sol_id
          AND s.deleted_at IS NULL
          AND s.estado NOT IN ('admitida', 'rechazada', 'archivada')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION public.can_access_parte(parte_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    sol_id UUID;
BEGIN
    SELECT p.solicitud_id
    INTO sol_id
    FROM public.partes p
    WHERE p.id = parte_uuid
      AND p.deleted_at IS NULL
    LIMIT 1;

    RETURN sol_id IS NOT NULL AND public.can_access_solicitud(sol_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION public.can_modify_parte(parte_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    sol_id UUID;
BEGIN
    SELECT p.solicitud_id
    INTO sol_id
    FROM public.partes p
    WHERE p.id = parte_uuid
      AND p.deleted_at IS NULL
    LIMIT 1;

    RETURN sol_id IS NOT NULL AND public.can_modify_solicitud(sol_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION public.solicitud_id_from_storage_path(object_name TEXT)
RETURNS UUID AS $$
DECLARE
    folders TEXT[];
    sol_id UUID;
BEGIN
    folders := storage.foldername(object_name);

    IF folders IS NULL OR array_length(folders, 1) < 1 THEN
        RETURN NULL;
    END IF;

    BEGIN
        sol_id := folders[1]::UUID;
    EXCEPTION WHEN invalid_text_representation THEN
        RETURN NULL;
    END;

    RETURN sol_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public, storage;

CREATE OR REPLACE FUNCTION public.is_valid_solicitud_storage_path(object_name TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    folders TEXT[];
BEGIN
    folders := storage.foldername(object_name);

    RETURN folders IS NOT NULL
       AND array_length(folders, 1) >= 2
       AND public.solicitud_id_from_storage_path(object_name) IS NOT NULL
       AND folders[2] IN ('documentos', 'pagos');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public, storage;

CREATE OR REPLACE FUNCTION public.can_access_solicitud_storage_path(object_name TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    sol_id UUID;
BEGIN
    sol_id := public.solicitud_id_from_storage_path(object_name);

    RETURN sol_id IS NOT NULL
       AND public.is_valid_solicitud_storage_path(object_name)
       AND public.can_access_solicitud(sol_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public, storage;

CREATE OR REPLACE FUNCTION public.protect_profile_system_fields()
RETURNS TRIGGER AS $$
BEGIN
    -- auth.uid() is NULL for trusted server-side sessions such as SQL Editor.
    IF auth.uid() IS NOT NULL
       AND NOT public.is_admin_user()
       AND (
           OLD.user_id IS DISTINCT FROM NEW.user_id
           OR OLD.rol IS DISTINCT FROM NEW.rol
           OR OLD.created_at IS DISTINCT FROM NEW.created_at
           OR OLD.deleted_at IS DISTINCT FROM NEW.deleted_at
       ) THEN
        RAISE EXCEPTION 'Only administrators can change profile system fields';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.generate_codigo_expediente()
RETURNS TRIGGER AS $$
DECLARE
    year_part TEXT;
    sequence_num INTEGER;
    tipo_prefix TEXT;
BEGIN
    year_part := TO_CHAR(NOW(), 'YYYY');

    CASE NEW.tipo_solicitud
        WHEN 'arbitraje' THEN tipo_prefix := 'ARB';
        WHEN 'arbitraje_emergencia' THEN tipo_prefix := 'AEM';
        WHEN 'jprd' THEN tipo_prefix := 'JPR';
        ELSE tipo_prefix := 'EXP';
    END CASE;

    PERFORM pg_advisory_xact_lock(hashtext('cprd_codigo_' || tipo_prefix || '_' || year_part));

    SELECT COALESCE(MAX(CAST(SUBSTRING(s.codigo_expediente FROM '[0-9]+$') AS INTEGER)), 0) + 1
    INTO sequence_num
    FROM public.solicitudes s
    WHERE s.codigo_expediente LIKE tipo_prefix || '-' || year_part || '-%';

    NEW.codigo_expediente := tipo_prefix || '-' || year_part || '-' || LPAD(sequence_num::TEXT, 6, '0');

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.log_solicitud_creation()
RETURNS TRIGGER AS $$
BEGIN
    BEGIN
        INSERT INTO public.historial_solicitud (
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
        RAISE WARNING 'Failed to create solicitud history: %', SQLERRM;
    END;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.log_solicitud_state_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.estado IS DISTINCT FROM NEW.estado THEN
        BEGIN
            INSERT INTO public.historial_solicitud (
                solicitud_id,
                accion,
                estado_anterior,
                estado_nuevo,
                descripcion,
                user_id
            ) VALUES (
                NEW.id,
                'cambio_estado',
                OLD.estado,
                NEW.estado,
                'Cambio de estado de ' || OLD.estado::TEXT || ' a ' || NEW.estado::TEXT,
                COALESCE(auth.uid(), NEW.user_id)
            );
        EXCEPTION WHEN OTHERS THEN
            RAISE WARNING 'Failed to create state-change history: %', SQLERRM;
        END;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION public.current_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_internal_user() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin_user() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_solicitud_owner(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_access_solicitud(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_modify_solicitud(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_access_parte(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_modify_parte(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.solicitud_id_from_storage_path(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_valid_solicitud_storage_path(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_access_solicitud_storage_path(TEXT) TO authenticated;

-- ============================================================
-- 6. TRIGGERS
-- ============================================================

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_solicitudes_updated_at
    BEFORE UPDATE ON public.solicitudes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_partes_updated_at
    BEFORE UPDATE ON public.partes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_comprobantes_pago_updated_at
    BEFORE UPDATE ON public.comprobantes_pago
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER protect_profile_system_fields
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.protect_profile_system_fields();

CREATE TRIGGER generate_solicitud_codigo
    BEFORE INSERT ON public.solicitudes
    FOR EACH ROW
    EXECUTE FUNCTION public.generate_codigo_expediente();

CREATE TRIGGER log_solicitud_created
    AFTER INSERT ON public.solicitudes
    FOR EACH ROW
    EXECUTE FUNCTION public.log_solicitud_creation();

CREATE TRIGGER log_solicitud_estado_change
    AFTER UPDATE OF estado ON public.solicitudes
    FOR EACH ROW
    EXECUTE FUNCTION public.log_solicitud_state_change();

-- ============================================================
-- 7. ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solicitudes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.correos_parte ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comprobantes_pago ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historial_solicitud ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notificaciones ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY profiles_select_self_or_staff
    ON public.profiles FOR SELECT
    TO authenticated
    USING (
        (
            auth.uid() = user_id
            AND deleted_at IS NULL
        )
        OR public.is_internal_user()
    );

CREATE POLICY profiles_insert_self
    ON public.profiles FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() = user_id
        AND rol = 'externo'
        AND deleted_at IS NULL
    );

CREATE POLICY profiles_update_self_or_admin
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (
        (
            auth.uid() = user_id
            AND deleted_at IS NULL
        )
        OR public.is_admin_user()
    )
    WITH CHECK (
        (
            auth.uid() = user_id
            AND deleted_at IS NULL
        )
        OR public.is_admin_user()
    );

-- Solicitudes
CREATE POLICY solicitudes_select_owner_or_staff
    ON public.solicitudes FOR SELECT
    TO authenticated
    USING (
        (
            auth.uid() = user_id
            AND deleted_at IS NULL
        )
        OR public.is_internal_user()
    );

CREATE POLICY solicitudes_insert_owner
    ON public.solicitudes FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() = user_id
        AND estado = 'recibida'
        AND deleted_at IS NULL
    );

CREATE POLICY solicitudes_update_staff
    ON public.solicitudes FOR UPDATE
    TO authenticated
    USING (public.is_internal_user())
    WITH CHECK (public.is_internal_user());

-- Partes
CREATE POLICY partes_select_accessible
    ON public.partes FOR SELECT
    TO authenticated
    USING (
        deleted_at IS NULL
        AND public.can_access_solicitud(solicitud_id)
    );

CREATE POLICY partes_insert_owner
    ON public.partes FOR INSERT
    TO authenticated
    WITH CHECK (
        public.is_solicitud_owner(solicitud_id)
        AND public.can_modify_solicitud(solicitud_id)
        AND deleted_at IS NULL
        AND (
            (
                rol IN ('demandante', 'contratista')
                AND user_id = auth.uid()
            )
            OR (
                rol IN ('demandado', 'entidad')
                AND user_id IS NULL
            )
        )
    );

CREATE POLICY partes_update_staff
    ON public.partes FOR UPDATE
    TO authenticated
    USING (
        public.is_internal_user()
        AND deleted_at IS NULL
    )
    WITH CHECK (public.is_internal_user());

-- Correos de parte
CREATE POLICY correos_parte_select_accessible
    ON public.correos_parte FOR SELECT
    TO authenticated
    USING (
        deleted_at IS NULL
        AND public.can_access_parte(parte_id)
    );

CREATE POLICY correos_parte_insert_accessible
    ON public.correos_parte FOR INSERT
    TO authenticated
    WITH CHECK (
        public.can_access_parte(parte_id)
        AND public.can_modify_parte(parte_id)
        AND deleted_at IS NULL
    );

-- Documentos
CREATE POLICY documentos_select_accessible
    ON public.documentos FOR SELECT
    TO authenticated
    USING (
        deleted_at IS NULL
        AND public.can_access_solicitud(solicitud_id)
    );

CREATE POLICY documentos_insert_owner
    ON public.documentos FOR INSERT
    TO authenticated
    WITH CHECK (
        public.is_solicitud_owner(solicitud_id)
        AND public.can_modify_solicitud(solicitud_id)
        AND created_by = auth.uid()
        AND deleted_at IS NULL
    );

CREATE POLICY documentos_update_staff
    ON public.documentos FOR UPDATE
    TO authenticated
    USING (
        public.is_internal_user()
        AND deleted_at IS NULL
    )
    WITH CHECK (public.is_internal_user());

-- Comprobantes de pago
CREATE POLICY comprobantes_select_accessible
    ON public.comprobantes_pago FOR SELECT
    TO authenticated
    USING (
        deleted_at IS NULL
        AND public.can_access_solicitud(solicitud_id)
    );

CREATE POLICY comprobantes_insert_owner
    ON public.comprobantes_pago FOR INSERT
    TO authenticated
    WITH CHECK (
        public.is_solicitud_owner(solicitud_id)
        AND public.can_modify_solicitud(solicitud_id)
        AND created_by = auth.uid()
        AND deleted_at IS NULL
    );

CREATE POLICY comprobantes_update_staff
    ON public.comprobantes_pago FOR UPDATE
    TO authenticated
    USING (
        public.is_internal_user()
        AND deleted_at IS NULL
    )
    WITH CHECK (public.is_internal_user());

-- Historial
CREATE POLICY historial_select_accessible
    ON public.historial_solicitud FOR SELECT
    TO authenticated
    USING (
        deleted_at IS NULL
        AND public.can_access_solicitud(solicitud_id)
    );

CREATE POLICY historial_insert_actor
    ON public.historial_solicitud FOR INSERT
    TO authenticated
    WITH CHECK (
        user_id = auth.uid()
        AND deleted_at IS NULL
        AND public.can_access_solicitud(solicitud_id)
        AND (
            public.is_internal_user()
            OR (
                public.is_solicitud_owner(solicitud_id)
                AND public.can_modify_solicitud(solicitud_id)
                AND accion IN ('documento_adjunto', 'pago_adjunto', 'subsanacion')
                AND estado_anterior IS NULL
                AND estado_nuevo IS NULL
            )
        )
    );

-- Notificaciones
CREATE POLICY notificaciones_select_own_or_staff
    ON public.notificaciones FOR SELECT
    TO authenticated
    USING (
        (
            user_id = auth.uid()
            AND deleted_at IS NULL
        )
        OR public.is_internal_user()
    );

CREATE POLICY notificaciones_update_own
    ON public.notificaciones FOR UPDATE
    TO authenticated
    USING (
        user_id = auth.uid()
        AND deleted_at IS NULL
    )
    WITH CHECK (
        user_id = auth.uid()
        AND deleted_at IS NULL
    );

CREATE POLICY notificaciones_insert_staff
    ON public.notificaciones FOR INSERT
    TO authenticated
    WITH CHECK (
        public.is_internal_user()
        AND deleted_at IS NULL
    );

-- ============================================================
-- 8. STORAGE
-- ============================================================

GRANT USAGE ON SCHEMA storage TO authenticated;
GRANT SELECT, INSERT, UPDATE ON storage.objects TO authenticated;

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
        'image/pjpeg',
        'image/png'
    ]
)
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

CREATE POLICY solicitudes_storage_select_accessible
    ON storage.objects FOR SELECT
    TO authenticated
    USING (
        bucket_id = 'solicitudes'
        AND public.can_access_solicitud_storage_path(name)
    );

CREATE POLICY solicitudes_storage_insert_accessible
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'solicitudes'
        AND public.can_access_solicitud_storage_path(name)
        AND public.can_modify_solicitud(public.solicitud_id_from_storage_path(name))
    );

CREATE POLICY solicitudes_storage_update_accessible
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (
        bucket_id = 'solicitudes'
        AND public.can_access_solicitud_storage_path(name)
    )
    WITH CHECK (
        bucket_id = 'solicitudes'
        AND public.can_access_solicitud_storage_path(name)
        AND public.can_modify_solicitud(public.solicitud_id_from_storage_path(name))
    );

COMMIT;

-- ============================================================
-- 9. MANUAL VALIDATION QUERIES
-- ============================================================
-- SELECT typname FROM pg_type WHERE typnamespace = 'public'::regnamespace ORDER BY typname;
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
-- SELECT id, public, file_size_limit, allowed_mime_types FROM storage.buckets WHERE id = 'solicitudes';
-- SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname IN ('public', 'storage') ORDER BY schemaname, tablename, policyname;
