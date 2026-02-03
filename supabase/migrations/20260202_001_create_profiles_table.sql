-- Migración: Crear tabla de perfiles de usuario
-- Hito 1: Login y Gestión de Usuarios

-- Crear enum para tipo de persona
CREATE TYPE tipo_persona AS ENUM ('natural', 'juridica');

-- Crear enum para tipo de documento
CREATE TYPE tipo_documento AS ENUM ('dni', 'ce', 'pasaporte', 'ruc');

-- Crear enum para rol de usuario
CREATE TYPE rol_usuario AS ENUM ('externo', 'interno', 'administrador');

-- Crear tabla de perfiles
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
    
    -- Validación: persona natural debe tener nombres_apellidos
    CONSTRAINT check_persona_natural CHECK (
        tipo_persona != 'natural' OR nombres_apellidos IS NOT NULL
    ),
    
    -- Validación: persona jurídica debe tener razon_social
    CONSTRAINT check_persona_juridica CHECK (
        tipo_persona != 'juridica' OR razon_social IS NOT NULL
    )
);

-- Crear índices
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_rol ON profiles(rol);
CREATE INDEX idx_profiles_tipo_documento ON profiles(tipo_documento, numero_documento);

-- Habilitar RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios pueden ver su propio perfil
CREATE POLICY "Users can view own profile"
    ON profiles
    FOR SELECT
    USING (auth.uid() = user_id);

-- Política: Los usuarios pueden insertar su propio perfil
CREATE POLICY "Users can insert own profile"
    ON profiles
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Política: Los usuarios pueden actualizar su propio perfil
CREATE POLICY "Users can update own profile"
    ON profiles
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Política: Administradores pueden ver todos los perfiles
CREATE POLICY "Admins can view all profiles"
    ON profiles
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.user_id = auth.uid()
            AND p.rol = 'administrador'
            AND p.deleted_at IS NULL
        )
    );

-- Política: Usuarios internos pueden ver todos los perfiles
CREATE POLICY "Internal users can view all profiles"
    ON profiles
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.user_id = auth.uid()
            AND p.rol IN ('interno', 'administrador')
            AND p.deleted_at IS NULL
        )
    );

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comentarios de la tabla
COMMENT ON TABLE profiles IS 'Perfiles de usuarios del sistema de mesa de partes';
COMMENT ON COLUMN profiles.tipo_persona IS 'Tipo de persona: natural o jurídica';
COMMENT ON COLUMN profiles.tipo_documento IS 'Tipo de documento de identidad';
COMMENT ON COLUMN profiles.numero_documento IS 'Número del documento de identidad';
COMMENT ON COLUMN profiles.nombres_apellidos IS 'Nombres y apellidos (solo persona natural)';
COMMENT ON COLUMN profiles.razon_social IS 'Razón social (solo persona jurídica)';
COMMENT ON COLUMN profiles.rol IS 'Rol del usuario en el sistema';
