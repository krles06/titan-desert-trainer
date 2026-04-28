-- Migration 005: align database schema with current DUNR app features

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS objetivo_carrera text DEFAULT 'terminar' CHECK (objetivo_carrera IN ('terminar', 'competir')),
ADD COLUMN IF NOT EXISTS tipo_bici text DEFAULT 'hardtail',
ADD COLUMN IF NOT EXISTS tiene_pulsometro boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS lesiones text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS terreno_habitual text DEFAULT 'mixto';

ALTER TABLE sessions
ADD COLUMN IF NOT EXISTS metadata jsonb;

CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL CHECK (char_length(content) <= 8000),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_user_created_at
ON chat_messages(user_id, created_at);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own chat messages' AND tablename = 'chat_messages') THEN
        CREATE POLICY "Users can view own chat messages" ON chat_messages
        FOR SELECT USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert own chat messages' AND tablename = 'chat_messages') THEN
        CREATE POLICY "Users can insert own chat messages" ON chat_messages
        FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete own chat messages' AND tablename = 'chat_messages') THEN
        CREATE POLICY "Users can delete own chat messages" ON chat_messages
        FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;
