
CREATE TABLE public.solo_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_name text NOT NULL,
  topic text NOT NULL,
  score integer NOT NULL DEFAULT 0,
  total_questions integer NOT NULL,
  correct_answers integer NOT NULL,
  time_taken_ms integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.solo_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read solo scores" ON public.solo_scores FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can insert solo scores" ON public.solo_scores FOR INSERT TO anon, authenticated WITH CHECK (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.solo_scores;
