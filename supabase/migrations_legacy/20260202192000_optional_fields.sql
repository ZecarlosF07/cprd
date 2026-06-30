-- Hacer opcionales celular y domicilio para permitir registro parcial
ALTER TABLE profiles ALTER COLUMN celular DROP NOT NULL;
ALTER TABLE profiles ALTER COLUMN domicilio DROP NOT NULL;
