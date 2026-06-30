-- Trigger para crear perfil automáticamente al registrar usuario
-- Esto evita problemas de RLS desde el cliente

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_tipo_persona tipo_persona;
  v_tipo_documento tipo_documento;
BEGIN
  -- Convertir texto a enum de manera segura
  v_tipo_persona := (NEW.raw_user_meta_data->>'tipo_persona')::tipo_persona;
  
  -- Para tipo documento, si viene nulo asumimos dni, pero validamos
  BEGIN
    v_tipo_documento := (COALESCE(NEW.raw_user_meta_data->>'tipo_documento', 'dni'))::tipo_documento;
  EXCEPTION WHEN OTHERS THEN
    v_tipo_documento := 'dni';
  END;

  INSERT INTO public.profiles (
    user_id,
    tipo_persona,
    tipo_documento,
    numero_documento,
    nombres_apellidos,
    razon_social,
    celular,
    domicilio,
    rol
  )
  VALUES (
    NEW.id,
    v_tipo_persona,
    v_tipo_documento,
    NEW.raw_user_meta_data->>'numero_documento',
    NEW.raw_user_meta_data->>'nombres_apellidos',
    NEW.raw_user_meta_data->>'razon_social',
    '', -- Celular temporalmente vacío
    '', -- Domicilio temporalmente vacío
    'externo'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Eliminar trigger si existe para recrearlo
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Crear el trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
