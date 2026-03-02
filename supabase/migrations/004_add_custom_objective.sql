-- Migration 004: Add custom objective fields to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS objetivo_distancia integer,
ADD COLUMN IF NOT EXISTS objetivo_desnivel integer,
ADD COLUMN IF NOT EXISTS objetivo_fecha date,
ADD COLUMN IF NOT EXISTS objetivo_terreno text;

COMMENT ON COLUMN profiles.objetivo_distancia IS 'Distancia objetivo en km para el plan personalizado';
COMMENT ON COLUMN profiles.objetivo_desnivel IS 'Desnivel acumulado objetivo en metros para el plan personalizado';
COMMENT ON COLUMN profiles.objetivo_fecha IS 'Fecha límite para alcanzar el objetivo personalizado';
COMMENT ON COLUMN profiles.objetivo_terreno IS 'Tipo de terreno: carretera, mtb, gravel';
