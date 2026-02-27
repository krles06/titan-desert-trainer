-- Titan Desert Trainer — Initial Schema
-- Run this in Supabase SQL Editor

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre text NOT NULL,
  edad integer NOT NULL CHECK (edad BETWEEN 16 AND 80),
  peso integer NOT NULL CHECK (peso BETWEEN 40 AND 150),
  altura integer NOT NULL CHECK (altura BETWEEN 140 AND 210),
  nivel_experiencia text NOT NULL CHECK (nivel_experiencia IN ('principiante', 'intermedio', 'avanzado')),
  velocidad_media decimal NOT NULL CHECK (velocidad_media BETWEEN 10 AND 50),
  distancia_maxima integer NOT NULL CHECK (distancia_maxima BETWEEN 10 AND 500),
  fc_reposo integer NOT NULL CHECK (fc_reposo BETWEEN 30 AND 100),
  dias_entreno_semana integer NOT NULL CHECK (dias_entreno_semana BETWEEN 2 AND 6),
  minutos_dia integer NOT NULL CHECK (minutos_dia BETWEEN 30 AND 180),
  participado_antes boolean DEFAULT false,
  dias_preferidos text[] DEFAULT '{}',
  carrera_id text DEFAULT 'morocco-2026',
  subscription_status text DEFAULT 'trialing' CHECK (subscription_status IN ('active', 'trialing', 'canceled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Training plans table
CREATE TABLE IF NOT EXISTS training_plans (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  plan_json jsonb NOT NULL,
  activo boolean DEFAULT true,
  UNIQUE (user_id, activo) -- Only one active plan per user
);

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id uuid NOT NULL REFERENCES training_plans(id) ON DELETE CASCADE,
  semana integer NOT NULL,
  dia_semana text NOT NULL,
  fecha date NOT NULL,
  tipo text NOT NULL CHECK (tipo IN ('rodaje', 'intervalos', 'fuerza', 'descanso activo', 'largo')),
  duracion_min integer NOT NULL,
  distancia_km decimal NOT NULL,
  duracion_real integer,
  distancia_real decimal,
  intensidad_zona integer NOT NULL CHECK (intensidad_zona BETWEEN 1 AND 5),
  descripcion text NOT NULL,
  completada boolean DEFAULT false,
  dificultad_percibida text CHECK (dificultad_percibida IN ('muy_facil', 'normal', 'muy_dificil', 'no_realizada')),
  nota_usuario text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX idx_sessions_plan_id ON sessions(plan_id);
CREATE INDEX idx_sessions_fecha ON sessions(fecha);
CREATE INDEX idx_training_plans_user_id ON training_plans(user_id);

-- Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Profiles: users can only CRUD their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- Training plans: users can only access their own plans
CREATE POLICY "Users can view own plans"
  ON training_plans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own plans"
  ON training_plans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own plans"
  ON training_plans FOR UPDATE USING (auth.uid() = user_id);

-- Sessions: users can access sessions from their own plans
CREATE POLICY "Users can view own sessions"
  ON sessions FOR SELECT USING (
    plan_id IN (SELECT id FROM training_plans WHERE user_id = auth.uid())
  );
CREATE POLICY "Users can update own sessions"
  ON sessions FOR UPDATE USING (
    plan_id IN (SELECT id FROM training_plans WHERE user_id = auth.uid())
  );
CREATE POLICY "Users can insert own sessions"
  ON sessions FOR INSERT WITH CHECK (
    plan_id IN (SELECT id FROM training_plans WHERE user_id = auth.uid())
  );

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_sessions_updated_at
  BEFORE UPDATE ON sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
