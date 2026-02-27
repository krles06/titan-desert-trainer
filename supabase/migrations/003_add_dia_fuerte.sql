-- Add dia_fuerte to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS dia_fuerte text;

-- Add comment explaining the field
COMMENT ON COLUMN profiles.dia_fuerte IS 'El día preferido del usuario para los entrenamientos más exigentes.';
