-- Add server-managed timestamps to players
ALTER TABLE public.players
  ADD COLUMN IF NOT EXISTS score_updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_players_quiz_score
  ON public.players (quiz_id, score DESC, score_updated_at ASC);

-- Atomic, server-authoritative answer submission + scoring
CREATE OR REPLACE FUNCTION public.submit_answer_and_score(
  p_player_id UUID,
  p_quiz_id UUID,
  p_question_id TEXT,
  p_selected_index INT,
  p_time_ms INT,
  p_points INT
)
RETURNS TABLE(new_score INT, score_updated_at TIMESTAMPTZ)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_already_answered BOOLEAN;
  v_new_score INT;
  v_now TIMESTAMPTZ := now();
BEGIN
  -- Prevent duplicate scoring for same question by same player
  SELECT EXISTS (
    SELECT 1 FROM public.answers
    WHERE player_id = p_player_id AND question_id = p_question_id
  ) INTO v_already_answered;

  IF v_already_answered THEN
    SELECT score, players.score_updated_at INTO v_new_score, score_updated_at
    FROM public.players WHERE id = p_player_id;
    new_score := v_new_score;
    RETURN NEXT;
    RETURN;
  END IF;

  INSERT INTO public.answers (player_id, quiz_id, question_id, selected_index, time_ms, points)
  VALUES (p_player_id, p_quiz_id, p_question_id, p_selected_index, p_time_ms, GREATEST(p_points, 0));

  UPDATE public.players
  SET
    score = score + GREATEST(p_points, 0),
    score_updated_at = CASE WHEN p_points > 0 THEN v_now ELSE players.score_updated_at END
  WHERE id = p_player_id
  RETURNING score, players.score_updated_at INTO v_new_score, score_updated_at;

  new_score := v_new_score;
  RETURN NEXT;
END;
$$;

-- Server-ranked leaderboard (single source of truth)
CREATE OR REPLACE FUNCTION public.get_quiz_leaderboard(p_quiz_id UUID)
RETURNS TABLE(
  id UUID,
  name TEXT,
  score INT,
  is_host BOOLEAN,
  session_id TEXT,
  score_updated_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  rank INT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p.id,
    p.name,
    p.score,
    p.is_host,
    p.session_id,
    p.score_updated_at,
    p.completed_at,
    (ROW_NUMBER() OVER (ORDER BY p.score DESC, p.score_updated_at ASC, p.created_at ASC))::INT AS rank
  FROM public.players p
  WHERE p.quiz_id = p_quiz_id
  ORDER BY p.score DESC, p.score_updated_at ASC, p.created_at ASC;
$$;

-- Mark player as completed (they stay on leaderboard, others can still pass them)
CREATE OR REPLACE FUNCTION public.mark_player_completed(p_player_id UUID)
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.players
  SET completed_at = COALESCE(completed_at, now())
  WHERE id = p_player_id;
$$;

GRANT EXECUTE ON FUNCTION public.submit_answer_and_score(UUID, UUID, TEXT, INT, INT, INT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_quiz_leaderboard(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.mark_player_completed(UUID) TO anon, authenticated;