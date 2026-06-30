-- Run this script after the user has registered in the app and completed
-- their profile. Authentication credentials remain managed by Supabase Auth.

BEGIN;

-- Keep the deployed trigger compatible with trusted SQL Editor sessions.
CREATE OR REPLACE FUNCTION public.protect_profile_system_fields()
RETURNS TRIGGER AS $$
BEGIN
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

DO $$
DECLARE
    target_email CONSTANT TEXT := 'elcentro@camaraica.org.pe';
    target_user_id UUID;
BEGIN
    SELECT id
    INTO target_user_id
    FROM auth.users
    WHERE LOWER(email) = LOWER(target_email);

    IF target_user_id IS NULL THEN
        RAISE EXCEPTION
            'No Supabase Auth user exists for %. Register it first.',
            target_email;
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE user_id = target_user_id
          AND deleted_at IS NULL
    ) THEN
        RAISE EXCEPTION
            'User % has no active profile. Log in and complete the profile first.',
            target_email;
    END IF;

    UPDATE public.profiles
    SET rol = 'administrador',
        updated_at = NOW()
    WHERE user_id = target_user_id
      AND deleted_at IS NULL;
END;
$$;

COMMIT;

SELECT
    u.email,
    p.rol,
    p.nombres_apellidos,
    p.razon_social
FROM auth.users AS u
JOIN public.profiles AS p ON p.user_id = u.id
WHERE p.rol = 'administrador'
  AND p.deleted_at IS NULL
ORDER BY u.email;
