-- Migration 002: Add detailed metrics and device stats to sessions
-- Fix schema if initial ones weren't exactly as expected and add new device stats

ALTER TABLE sessions 
ADD COLUMN IF NOT EXISTS tiempo_real_min integer,
ADD COLUMN IF NOT EXISTS distancia_real_km decimal,
ADD COLUMN IF NOT EXISTS percepcion_esfuerzo integer CHECK (percepcion_esfuerzo BETWEEN 1 AND 10),
ADD COLUMN IF NOT EXISTS completada_entera boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS nota_post text,
ADD COLUMN IF NOT EXISTS fc_media decimal,
ADD COLUMN IF NOT EXISTS fc_maxima decimal,
ADD COLUMN IF NOT EXISTS desnivel_m decimal,
ADD COLUMN IF NOT EXISTS velocidad_media_real decimal, -- user asked for velocidad_media but I'll call it _real to avoid confusion if any
ADD COLUMN IF NOT EXISTS cadencia_media decimal;

-- Cleanup/Rename old columns to avoid confusion (Optional but cleaner)
-- ALTER TABLE sessions RENAME COLUMN duracion_real TO _old_duracion_real;
-- ALTER TABLE sessions RENAME COLUMN distancia_real TO _old_distancia_real;
-- ALTER TABLE sessions RENAME COLUMN nota_usuario TO _old_nota_usuario;
-- ALTER TABLE sessions RENAME COLUMN dificultad_percibida TO _old_dificultad_percibida;

COMMENT ON COLUMN sessions.velocidad_media_real IS 'Velocidad media real registrada por el dispositivo';
