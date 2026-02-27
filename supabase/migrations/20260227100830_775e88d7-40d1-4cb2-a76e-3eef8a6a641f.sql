
-- Quizzes table
CREATE TABLE public.quizzes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  questions JSONB NOT NULL DEFAULT '[]',
  time_per_question INTEGER NOT NULL DEFAULT 15,
  current_question_index INTEGER NOT NULL DEFAULT -1,
  status TEXT NOT NULL DEFAULT 'lobby' CHECK (status IN ('lobby', 'playing', 'results')),
  started_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Players table
CREATE TABLE public.players (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  name TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  is_host BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(quiz_id, name)
);

-- Answers table
CREATE TABLE public.answers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  selected_index INTEGER NOT NULL,
  time_ms INTEGER NOT NULL,
  points INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(player_id, question_id)
);

-- Enable RLS
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;

-- Public read/write policies (no auth required - quiz app uses session IDs)
CREATE POLICY "Anyone can read quizzes" ON public.quizzes FOR SELECT USING (true);
CREATE POLICY "Anyone can create quizzes" ON public.quizzes FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update quizzes" ON public.quizzes FOR UPDATE USING (true);

CREATE POLICY "Anyone can read players" ON public.players FOR SELECT USING (true);
CREATE POLICY "Anyone can join as player" ON public.players FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update players" ON public.players FOR UPDATE USING (true);
CREATE POLICY "Anyone can remove players" ON public.players FOR DELETE USING (true);

CREATE POLICY "Anyone can read answers" ON public.answers FOR SELECT USING (true);
CREATE POLICY "Anyone can submit answers" ON public.answers FOR INSERT WITH CHECK (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.quizzes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.players;
ALTER PUBLICATION supabase_realtime ADD TABLE public.answers;

-- Indexes
CREATE INDEX idx_players_quiz_id ON public.players(quiz_id);
CREATE INDEX idx_players_session_id ON public.players(session_id);
CREATE INDEX idx_answers_player_id ON public.answers(player_id);
CREATE INDEX idx_answers_quiz_id ON public.answers(quiz_id);
CREATE INDEX idx_quizzes_code ON public.quizzes(code);
