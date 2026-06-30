-- ============================================================
-- MIGRACIÓN INICIAL: Sistema de Mesa de Partes Virtual CPRD
-- ============================================================
-- Este script crea toda la estructura de base de datos necesaria
-- para el sistema de mesa de partes virtual.
-- ============================================================

-- ============================================================
-- 1. TIPOS ENUMERADOS (ENUMS)
-- ============================================================

-- Tipo de persona: natural o jurídica
CREATE TYPE tipo_persona AS ENUM ('natural', 'juridica');

-- Tipo de documento de identidad
CREATE TYPE tipo_documento AS ENUM ('dni', 'ce', 'pasaporte', 'ruc');

-- Rol de usuario en el sistema
CREATE TYPE rol_usuario AS ENUM ('externo', 'interno', 'administrador');

-- Tipo de solicitud
CREATE TYPE tipo_solicitud AS ENUM ('arbitraje', 'arbitraje_emergencia', 'jprd');

-- Estado de la solicitud/expediente
CREATE TYPE estado_solicitud AS ENUM (
    'recibida',
    'en_revision',
    'observada',
    'subsanada',
    'admitida',
    'rechazada',
    'archivada'
);

-- Rol dentro de una parte del proceso
CREATE TYPE rol_parte AS ENUM ('demandante', 'demandado', 'contratista', 'entidad');

-- Estado del comprobante de pago
CREATE TYPE estado_pago AS ENUM ('pendiente', 'validado', 'observado', 'rechazado');

-- Tipo de documento adjunto
CREATE TYPE tipo_documento_adjunto AS ENUM (
    'demanda',
    'contrato',
    'poder',
    'dni_representante',
    'constitucion_empresa',
    'otro'
);

-- Tipo de acción en el historial
CREATE TYPE tipo_accion AS ENUM (
    'creacion',
    'cambio_estado',
    'observacion',
    'subsanacion',
    'documento_adjunto',
    'pago_adjunto',
    'pago_validado',
    'pago_observado'
);

-- Tipo de notificación
CREATE TYPE tipo_notificacion AS ENUM (
    'confirmacion_recepcion',
    'cambio_estado',
    'observacion',
    'subsanacion_recibida',
    'admision',
    'rechazo'
);


-- ============================================================
-- 2. TABLAS PRINCIPALES
-- ============================================================

-- ------------------------------------------------------------
-- 2.1 PROFILES: Perfiles de usuarios
-- ------------------------------------------------------------
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tipo_persona tipo_persona NOT NULL,
    tipo_documento tipo_documento NOT NULL,
    numero_documento VARCHAR(20) NOT NULL,
    nombres_apellidos VARCHAR(255),
    razon_social VARCHAR(255),
    celular VARCHAR(15) NOT NULL,
    domicilio TEXT NOT NULL,
    rol rol_usuario NOT NULL DEFAULT 'externo',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    
    -- Constraints
    CONSTRAINT unique_user_profile UNIQUE (user_id),
    CONSTRAINT unique_documento UNIQUE (tipo_documento, numero_documento),
    CONSTRAINT check_persona_natural CHECK (
        tipo_persona != 'natural' OR nombres_apellidos IS NOT NULL
    ),
    CONSTRAINT check_persona_juridica CHECK (
        tipo_persona != 'juridica' OR razon_social IS NOT NULL
    )
);

-- Índices para profiles
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_rol ON profiles(rol);
CREATE INDEX idx_profiles_tipo_documento ON profiles(tipo_documento, numero_documento);
CREATE INDEX idx_profiles_deleted_at ON profiles(deleted_at) WHERE deleted_at IS NULL;

COMMENT ON TABLE profiles IS 'Perfiles de usuarios del sistema';

-- ------------------------------------------------------------
-- 2.2 SOLICITUDES: Solicitudes/Expedientes
-- ------------------------------------------------------------
CREATE TABLE solicitudes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo_expediente VARCHAR(50) NOT NULL UNIQUE,
    tipo_solicitud tipo_solicitud NOT NULL,
    estado estado_solicitud NOT NULL DEFAULT 'recibida',
    user_id UUID NOT NULL REFERENCES auth.users(id),
    materia TEXT,
    cuantia DECIMAL(15, 2),
    moneda VARCHAR(3) DEFAULT 'PEN',
    descripcion_controversia TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    
    -- Constraint para asegurar código único
    CONSTRAINT solicitudes_codigo_unique UNIQUE (codigo_expediente)
);

-- Índices para solicitudes
CREATE INDEX idx_solicitudes_user_id ON solicitudes(user_id);
CREATE INDEX idx_solicitudes_estado ON solicitudes(estado);
CREATE INDEX idx_solicitudes_tipo ON solicitudes(tipo_solicitud);
CREATE INDEX idx_solicitudes_codigo ON solicitudes(codigo_expediente);
CREATE INDEX idx_solicitudes_created_at ON solicitudes(created_at DESC);
CREATE INDEX idx_solicitudes_deleted_at ON solicitudes(deleted_at) WHERE deleted_at IS NULL;

COMMENT ON TABLE solicitudes IS 'Solicitudes y expedientes del sistema';

-- ------------------------------------------------------------
-- 2.3 PARTES: Partes involucradas en una solicitud
-- ------------------------------------------------------------
CREATE TABLE partes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    solicitud_id UUID NOT NULL REFERENCES solicitudes(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    rol rol_parte NOT NULL,
    tipo_persona tipo_persona NOT NULL,
    tipo_documento tipo_documento NOT NULL,
    numero_documento VARCHAR(20) NOT NULL,
    nombres_apellidos VARCHAR(255),
    razon_social VARCHAR(255),
    celular VARCHAR(15),
    domicilio TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    
    -- Constraints
    CONSTRAINT check_parte_persona_natural CHECK (
        tipo_persona != 'natural' OR nombres_apellidos IS NOT NULL
    ),
    CONSTRAINT check_parte_persona_juridica CHECK (
        tipo_persona != 'juridica' OR razon_social IS NOT NULL
    ),
    -- Demandante y contratista deben tener user_id
    CONSTRAINT check_user_id_required CHECK (
        (rol NOT IN ('demandante', 'contratista')) OR user_id IS NOT NULL
    )
);

-- Índices para partes
CREATE INDEX idx_partes_solicitud_id ON partes(solicitud_id);
CREATE INDEX idx_partes_user_id ON partes(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_partes_rol ON partes(rol);
CREATE INDEX idx_partes_deleted_at ON partes(deleted_at) WHERE deleted_at IS NULL;

COMMENT ON TABLE partes IS 'Partes involucradas en cada solicitud';

-- ------------------------------------------------------------
-- 2.4 CORREOS_PARTE: Correos electrónicos de las partes
-- ------------------------------------------------------------
CREATE TABLE correos_parte (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parte_id UUID NOT NULL REFERENCES partes(id) ON DELETE CASCADE,
    correo VARCHAR(255) NOT NULL,
    es_principal BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Índices para correos_parte
CREATE INDEX idx_correos_parte_parte_id ON correos_parte(parte_id);
CREATE INDEX idx_correos_parte_principal ON correos_parte(parte_id, es_principal) 
    WHERE es_principal = true AND deleted_at IS NULL;

COMMENT ON TABLE correos_parte IS 'Correos electrónicos asociados a las partes';

-- ------------------------------------------------------------
-- 2.5 DOCUMENTOS: Documentos adjuntos a solicitudes
-- ------------------------------------------------------------
CREATE TABLE documentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    solicitud_id UUID NOT NULL REFERENCES solicitudes(id) ON DELETE CASCADE,
    tipo_documento tipo_documento_adjunto NOT NULL,
    nombre_archivo VARCHAR(255) NOT NULL,
    archivo_url TEXT,
    link_externo TEXT,
    tamano_bytes BIGINT,
    mime_type VARCHAR(100),
    comentario TEXT,
    es_subsanacion BOOLEAN NOT NULL DEFAULT false,
    documento_original_id UUID REFERENCES documentos(id),
    created_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    
    -- Al menos uno de archivo_url o link_externo debe estar presente
    CONSTRAINT check_documento_url CHECK (
        archivo_url IS NOT NULL OR link_externo IS NOT NULL
    )
);

-- Índices para documentos
CREATE INDEX idx_documentos_solicitud_id ON documentos(solicitud_id);
CREATE INDEX idx_documentos_tipo ON documentos(tipo_documento);
CREATE INDEX idx_documentos_created_by ON documentos(created_by);
CREATE INDEX idx_documentos_subsanacion ON documentos(documento_original_id) 
    WHERE es_subsanacion = true;
CREATE INDEX idx_documentos_deleted_at ON documentos(deleted_at) WHERE deleted_at IS NULL;

COMMENT ON TABLE documentos IS 'Documentos adjuntados a las solicitudes';

-- ------------------------------------------------------------
-- 2.6 COMPROBANTES_PAGO: Comprobantes de pago
-- ------------------------------------------------------------
CREATE TABLE comprobantes_pago (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    solicitud_id UUID NOT NULL REFERENCES solicitudes(id) ON DELETE CASCADE,
    numero_operacion VARCHAR(100),
    monto DECIMAL(15, 2),
    fecha_pago DATE,
    archivo_url TEXT NOT NULL,
    estado estado_pago NOT NULL DEFAULT 'pendiente',
    observado_motivo TEXT,
    revisado_por UUID REFERENCES auth.users(id),
    revisado_at TIMESTAMPTZ,
    created_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Índices para comprobantes_pago
CREATE INDEX idx_comprobantes_solicitud_id ON comprobantes_pago(solicitud_id);
CREATE INDEX idx_comprobantes_estado ON comprobantes_pago(estado);
CREATE INDEX idx_comprobantes_created_by ON comprobantes_pago(created_by);
CREATE INDEX idx_comprobantes_deleted_at ON comprobantes_pago(deleted_at) WHERE deleted_at IS NULL;

COMMENT ON TABLE comprobantes_pago IS 'Comprobantes de pago asociados a las solicitudes';

-- ------------------------------------------------------------
-- 2.7 HISTORIAL_SOLICITUD: Trazabilidad de acciones
-- ------------------------------------------------------------
CREATE TABLE historial_solicitud (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    solicitud_id UUID NOT NULL REFERENCES solicitudes(id) ON DELETE CASCADE,
    accion tipo_accion NOT NULL,
    estado_anterior estado_solicitud,
    estado_nuevo estado_solicitud,
    descripcion TEXT,
    metadata JSONB,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Índices para historial_solicitud
CREATE INDEX idx_historial_solicitud_id ON historial_solicitud(solicitud_id);
CREATE INDEX idx_historial_accion ON historial_solicitud(accion);
CREATE INDEX idx_historial_user_id ON historial_solicitud(user_id);
CREATE INDEX idx_historial_created_at ON historial_solicitud(created_at DESC);

COMMENT ON TABLE historial_solicitud IS 'Registro de trazabilidad de todas las acciones';

-- ------------------------------------------------------------
-- 2.8 NOTIFICACIONES: Notificaciones a usuarios
-- ------------------------------------------------------------
CREATE TABLE notificaciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    solicitud_id UUID REFERENCES solicitudes(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    tipo tipo_notificacion NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    mensaje TEXT NOT NULL,
    leido BOOLEAN NOT NULL DEFAULT false,
    leido_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Índices para notificaciones
CREATE INDEX idx_notificaciones_user_id ON notificaciones(user_id);
CREATE INDEX idx_notificaciones_solicitud_id ON notificaciones(solicitud_id) 
    WHERE solicitud_id IS NOT NULL;
CREATE INDEX idx_notificaciones_leido ON notificaciones(user_id, leido) 
    WHERE leido = false AND deleted_at IS NULL;
CREATE INDEX idx_notificaciones_created_at ON notificaciones(created_at DESC);

COMMENT ON TABLE notificaciones IS 'Notificaciones enviadas a los usuarios';


-- ============================================================
-- 3. FUNCIONES Y TRIGGERS
-- ============================================================

-- ------------------------------------------------------------
-- 3.1 Función para actualizar updated_at automáticamente
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_solicitudes_updated_at
    BEFORE UPDATE ON solicitudes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_partes_updated_at
    BEFORE UPDATE ON partes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comprobantes_pago_updated_at
    BEFORE UPDATE ON comprobantes_pago
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ------------------------------------------------------------
-- 3.2 Función para generar código de expediente
-- ------------------------------------------------------------
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
$$ LANGUAGE plpgsql;

-- Trigger para generar código de expediente
CREATE TRIGGER generate_solicitud_codigo
    BEFORE INSERT ON solicitudes
    FOR EACH ROW
    WHEN (NEW.codigo_expediente IS NULL OR NEW.codigo_expediente = '')
    EXECUTE FUNCTION generate_codigo_expediente();

-- ------------------------------------------------------------
-- 3.3 Función para registrar historial automáticamente
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION log_solicitud_state_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Solo registrar si el estado cambió
    IF OLD.estado IS DISTINCT FROM NEW.estado THEN
        INSERT INTO historial_solicitud (
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
            'Cambio de estado automático',
            COALESCE(auth.uid(), NEW.user_id)
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para registrar cambios de estado
CREATE TRIGGER log_solicitud_estado_change
    AFTER UPDATE ON solicitudes
    FOR EACH ROW
    EXECUTE FUNCTION log_solicitud_state_change();

-- ------------------------------------------------------------
-- 3.4 Función para crear historial en creación de solicitud
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION log_solicitud_creation()
RETURNS TRIGGER AS $$
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
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para registrar creación
CREATE TRIGGER log_solicitud_created
    AFTER INSERT ON solicitudes
    FOR EACH ROW
    EXECUTE FUNCTION log_solicitud_creation();


-- ============================================================
-- 4. ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE solicitudes ENABLE ROW LEVEL SECURITY;
ALTER TABLE partes ENABLE ROW LEVEL SECURITY;
ALTER TABLE correos_parte ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE comprobantes_pago ENABLE ROW LEVEL SECURITY;
ALTER TABLE historial_solicitud ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificaciones ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- 4.1 Políticas para PROFILES
-- ------------------------------------------------------------

-- El usuario puede ver su propio perfil
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = user_id);

-- El usuario puede crear su propio perfil
CREATE POLICY "Users can insert own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- El usuario puede actualizar su propio perfil
CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Usuarios internos y admins pueden ver todos los perfiles
CREATE POLICY "Internal users can view all profiles"
    ON profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.user_id = auth.uid()
            AND p.rol IN ('interno', 'administrador')
            AND p.deleted_at IS NULL
        )
    );

-- ------------------------------------------------------------
-- 4.2 Políticas para SOLICITUDES
-- ------------------------------------------------------------

-- El usuario puede ver sus propias solicitudes
CREATE POLICY "Users can view own solicitudes"
    ON solicitudes FOR SELECT
    USING (
        auth.uid() = user_id
        OR EXISTS (
            SELECT 1 FROM partes p
            WHERE p.solicitud_id = solicitudes.id
            AND p.user_id = auth.uid()
            AND p.deleted_at IS NULL
        )
    );

-- El usuario puede crear solicitudes
CREATE POLICY "Users can create solicitudes"
    ON solicitudes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- El usuario puede actualizar sus solicitudes en estado inicial
CREATE POLICY "Users can update own draft solicitudes"
    ON solicitudes FOR UPDATE
    USING (
        auth.uid() = user_id 
        AND estado = 'recibida'
    );

-- Usuarios internos pueden ver todas las solicitudes
CREATE POLICY "Internal users can view all solicitudes"
    ON solicitudes FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.user_id = auth.uid()
            AND p.rol IN ('interno', 'administrador')
            AND p.deleted_at IS NULL
        )
    );

-- Usuarios internos pueden actualizar solicitudes
CREATE POLICY "Internal users can update solicitudes"
    ON solicitudes FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.user_id = auth.uid()
            AND p.rol IN ('interno', 'administrador')
            AND p.deleted_at IS NULL
        )
    );

-- ------------------------------------------------------------
-- 4.3 Políticas para PARTES
-- ------------------------------------------------------------

-- Ver partes de solicitudes propias
CREATE POLICY "Users can view partes of own solicitudes"
    ON partes FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM solicitudes s
            WHERE s.id = partes.solicitud_id
            AND (s.user_id = auth.uid() OR EXISTS (
                SELECT 1 FROM partes p2
                WHERE p2.solicitud_id = s.id
                AND p2.user_id = auth.uid()
            ))
        )
    );

-- Crear partes en solicitudes propias
CREATE POLICY "Users can create partes in own solicitudes"
    ON partes FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM solicitudes s
            WHERE s.id = partes.solicitud_id
            AND s.user_id = auth.uid()
        )
    );

-- Usuarios internos pueden ver todas las partes
CREATE POLICY "Internal users can view all partes"
    ON partes FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.user_id = auth.uid()
            AND p.rol IN ('interno', 'administrador')
            AND p.deleted_at IS NULL
        )
    );

-- ------------------------------------------------------------
-- 4.4 Políticas para CORREOS_PARTE
-- ------------------------------------------------------------

-- Ver correos de partes accesibles
CREATE POLICY "Users can view correos of accessible partes"
    ON correos_parte FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM partes p
            JOIN solicitudes s ON s.id = p.solicitud_id
            WHERE p.id = correos_parte.parte_id
            AND (s.user_id = auth.uid() OR p.user_id = auth.uid())
        )
    );

-- Crear correos en partes propias
CREATE POLICY "Users can create correos in own partes"
    ON correos_parte FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM partes p
            JOIN solicitudes s ON s.id = p.solicitud_id
            WHERE p.id = correos_parte.parte_id
            AND s.user_id = auth.uid()
        )
    );

-- Usuarios internos pueden ver todos los correos
CREATE POLICY "Internal users can view all correos"
    ON correos_parte FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.user_id = auth.uid()
            AND p.rol IN ('interno', 'administrador')
            AND p.deleted_at IS NULL
        )
    );

-- ------------------------------------------------------------
-- 4.5 Políticas para DOCUMENTOS
-- ------------------------------------------------------------

-- Ver documentos de solicitudes propias
CREATE POLICY "Users can view documentos of own solicitudes"
    ON documentos FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM solicitudes s
            WHERE s.id = documentos.solicitud_id
            AND s.user_id = auth.uid()
        )
    );

-- Crear documentos en solicitudes propias
CREATE POLICY "Users can create documentos in own solicitudes"
    ON documentos FOR INSERT
    WITH CHECK (
        auth.uid() = created_by
        AND EXISTS (
            SELECT 1 FROM solicitudes s
            WHERE s.id = documentos.solicitud_id
            AND s.user_id = auth.uid()
        )
    );

-- Usuarios internos pueden ver todos los documentos
CREATE POLICY "Internal users can view all documentos"
    ON documentos FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.user_id = auth.uid()
            AND p.rol IN ('interno', 'administrador')
            AND p.deleted_at IS NULL
        )
    );

-- ------------------------------------------------------------
-- 4.6 Políticas para COMPROBANTES_PAGO
-- ------------------------------------------------------------

-- Ver comprobantes de solicitudes propias
CREATE POLICY "Users can view comprobantes of own solicitudes"
    ON comprobantes_pago FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM solicitudes s
            WHERE s.id = comprobantes_pago.solicitud_id
            AND s.user_id = auth.uid()
        )
    );

-- Crear comprobantes en solicitudes propias
CREATE POLICY "Users can create comprobantes in own solicitudes"
    ON comprobantes_pago FOR INSERT
    WITH CHECK (
        auth.uid() = created_by
        AND EXISTS (
            SELECT 1 FROM solicitudes s
            WHERE s.id = comprobantes_pago.solicitud_id
            AND s.user_id = auth.uid()
        )
    );

-- Usuarios internos pueden ver y actualizar comprobantes
CREATE POLICY "Internal users can view all comprobantes"
    ON comprobantes_pago FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.user_id = auth.uid()
            AND p.rol IN ('interno', 'administrador')
            AND p.deleted_at IS NULL
        )
    );

CREATE POLICY "Internal users can update comprobantes"
    ON comprobantes_pago FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.user_id = auth.uid()
            AND p.rol IN ('interno', 'administrador')
            AND p.deleted_at IS NULL
        )
    );

-- ------------------------------------------------------------
-- 4.7 Políticas para HISTORIAL_SOLICITUD
-- ------------------------------------------------------------

-- Ver historial de solicitudes propias
CREATE POLICY "Users can view historial of own solicitudes"
    ON historial_solicitud FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM solicitudes s
            WHERE s.id = historial_solicitud.solicitud_id
            AND s.user_id = auth.uid()
        )
    );

-- Usuarios internos pueden ver todo el historial
CREATE POLICY "Internal users can view all historial"
    ON historial_solicitud FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.user_id = auth.uid()
            AND p.rol IN ('interno', 'administrador')
            AND p.deleted_at IS NULL
        )
    );

-- Usuarios internos pueden insertar historial
CREATE POLICY "Internal users can insert historial"
    ON historial_solicitud FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.user_id = auth.uid()
            AND p.rol IN ('interno', 'administrador')
            AND p.deleted_at IS NULL
        )
    );

-- ------------------------------------------------------------
-- 4.8 Políticas para NOTIFICACIONES
-- ------------------------------------------------------------

-- Ver notificaciones propias
CREATE POLICY "Users can view own notificaciones"
    ON notificaciones FOR SELECT
    USING (auth.uid() = user_id);

-- Actualizar notificaciones propias (marcar como leídas)
CREATE POLICY "Users can update own notificaciones"
    ON notificaciones FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);


-- ============================================================
-- 5. FUNCIONES AUXILIARES
-- ============================================================

-- ------------------------------------------------------------
-- 5.1 Función para obtener el rol del usuario actual
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_current_user_role()
RETURNS rol_usuario AS $$
DECLARE
    user_role rol_usuario;
BEGIN
    SELECT rol INTO user_role
    FROM profiles
    WHERE user_id = auth.uid()
    AND deleted_at IS NULL
    LIMIT 1;
    
    RETURN COALESCE(user_role, 'externo');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ------------------------------------------------------------
-- 5.2 Función para verificar si el usuario es interno
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION is_internal_user()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles
        WHERE user_id = auth.uid()
        AND rol IN ('interno', 'administrador')
        AND deleted_at IS NULL
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ------------------------------------------------------------
-- 5.3 Función para verificar si el usuario es administrador
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles
        WHERE user_id = auth.uid()
        AND rol = 'administrador'
        AND deleted_at IS NULL
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ------------------------------------------------------------
-- 5.4 Función para contar solicitudes por estado
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION count_solicitudes_by_estado()
RETURNS TABLE (estado estado_solicitud, count BIGINT) AS $$
BEGIN
    RETURN QUERY
    SELECT s.estado, COUNT(*)::BIGINT
    FROM solicitudes s
    WHERE s.deleted_at IS NULL
    GROUP BY s.estado;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================================
-- 6. STORAGE (Buckets y Políticas)
-- ============================================================

-- 6.1 Crear Buckets
-- Bucket: documentos (privado, max 10MB, PDF/Imágenes)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES ('documentos', 'documentos', false, 10485760, ARRAY['application/pdf', 'image/jpeg', 'image/png'])
ON CONFLICT (id) DO UPDATE SET 
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Bucket: comprobantes (privado, max 5MB, PDF/Imágenes)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES ('comprobantes', 'comprobantes', false, 5242880, ARRAY['application/pdf', 'image/jpeg', 'image/png'])
ON CONFLICT (id) DO UPDATE SET 
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 6.2 Políticas de Seguridad para Storage (RSL en storage.objects)
-- IMPORTANTE: Supabase Storage usa la tabla storage.objects

-- NOTA: RLS ya está habilitado por defecto en storage.objects.
-- No es necesario ejecutar ALTER TABLE... ENABLE ROW LEVEL SECURITY.

-- ------------------------------------------------------------
-- Políticas para 'documentos'
-- ------------------------------------------------------------

-- SELECT: Usuarios pueden ver sus propios documentos (carpeta = user_id)
CREATE POLICY "Usuarios ven sus propios documentos"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'documentos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- INSERT: Usuarios pueden subir a su propia carpeta
CREATE POLICY "Usuarios suben sus propios documentos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documentos' AND
  (storage.foldername(name))[1] = auth.uid()::text AND
  auth.uid() = owner
);

-- SELECT/INSERT/UPDATE: Usuarios internos y admins tienen acceso total
CREATE POLICY "Staff acceso total a documentos"
ON storage.objects
TO authenticated
USING (
  bucket_id = 'documentos' AND
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND rol IN ('interno', 'administrador')
  )
)
WITH CHECK (
  bucket_id = 'documentos' AND
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND rol IN ('interno', 'administrador')
  )
);

-- ------------------------------------------------------------
-- Políticas para 'comprobantes'
-- ------------------------------------------------------------

-- SELECT: Usuarios ven sus propios comprobantes
CREATE POLICY "Usuarios ven sus propios comprobantes"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'comprobantes' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- INSERT: Usuarios suben sus propios comprobantes
CREATE POLICY "Usuarios suben sus propios comprobantes"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'comprobantes' AND
  (storage.foldername(name))[1] = auth.uid()::text AND
  auth.uid() = owner
);

-- SELECT/INSERT/UPDATE: Staff acceso total a comprobantes
CREATE POLICY "Staff acceso total a comprobantes"
ON storage.objects
TO authenticated
USING (
  bucket_id = 'comprobantes' AND
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND rol IN ('interno', 'administrador')
  )
)
WITH CHECK (
  bucket_id = 'comprobantes' AND
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND rol IN ('interno', 'administrador')
  )
);


-- ============================================================
-- FIN DE LA MIGRACIÓN
-- ============================================================
