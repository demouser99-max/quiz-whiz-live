import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

/**
 * LiveLeaderboard
 * - Polls the backend RPC `get_quiz_leaderboard` every 1 second.
 * - Backend is the SINGLE SOURCE OF TRUTH for sorting & ranking.
 * - Frontend NEVER sorts — it renders the array as returned.
 * - Players who have completed the quiz remain visible (others can still surpass them).
 */

export interface LeaderboardEntry {
  id: string;
  name: string;
  score: number;
  is_host: boolean;
  session_id: string;
  score_updated_at: string;
  completed_at: string | null;
  rank: number;
}

interface Props {
  quizId: string | undefined;
  sessionId: string;
  maxShow?: number;
  pollIntervalMs?: number;
  compact?: boolean;
}

const CountUpScore = ({ target, duration = 500 }: { target: number; duration?: number }) => {
  const [current, setCurrent] = useState(target);
  const prevTargetRef = useRef(target);

  useEffect(() => {
    if (target === prevTargetRef.current) return;
    const startVal = current;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.round(startVal + (target - startVal) * eased));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    prevTargetRef.current = target;
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return <span>{current.toLocaleString()}</span>;
};

const medals = ['🥇', '🥈', '🥉'];

const LiveLeaderboard = ({
  quizId,
  sessionId,
  maxShow = 10,
  pollIntervalMs = 1000,
  compact = false,
}: Props) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loaded, setLoaded] = useState(false);
  const inFlightRef = useRef(false);

  useEffect(() => {
    if (!quizId) return;

    let cancelled = false;

    const fetchLeaderboard = async () => {
      if (inFlightRef.current) return; // skip if previous request still pending
      inFlightRef.current = true;
      try {
        const { data, error } = await supabase.rpc('get_quiz_leaderboard', {
          p_quiz_id: quizId,
        });
        if (cancelled) return;
        if (error) {
          console.error('[LiveLeaderboard] fetch error:', error.message);
          return;
        }
        // IMPORTANT: backend already returns rows ordered by score DESC, score_updated_at ASC.
        // Frontend must NOT re-sort.
        setEntries((data ?? []) as LeaderboardEntry[]);
        setLoaded(true);
      } finally {
        inFlightRef.current = false;
      }
    };

    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, pollIntervalMs);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [quizId, pollIntervalMs]);

  const visible = entries.slice(0, maxShow);

  if (!loaded) {
    return (
      <div className="space-y-2">
        {[0, 1, 2].map(i => (
          <div key={i} className="h-12 rounded-xl bg-secondary/40 animate-pulse" />
        ))}
      </div>
    );
  }

  if (visible.length === 0) {
    return (
      <div className="text-center text-sm text-muted-foreground py-6 glass-card rounded-xl">
        Waiting for players to score...
      </div>
    );
  }

  return (
    <div className={compact ? 'space-y-1.5' : 'space-y-2'}>
      <AnimatePresence mode="popLayout">
        {visible.map(player => {
          const isMe = player.session_id === sessionId;
          const rank = player.rank;
          return (
            <motion.div
              key={player.id}
              layout
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              transition={{
                layout: { type: 'spring', stiffness: 500, damping: 35 },
              }}
              className={`flex items-center justify-between ${compact ? 'px-3 py-2' : 'px-4 py-3'} rounded-xl transition-all duration-300 ${
                isMe ? 'glass-premium gradient-border' : 'glass-card'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className={`${compact ? 'w-8 h-8 text-xs' : 'w-9 h-9 text-sm'} rounded-lg flex items-center justify-center font-bold shrink-0 ${
                    rank === 1
                      ? 'bg-gold/15 text-gold'
                      : rank === 2
                      ? 'bg-silver/15 text-silver'
                      : rank === 3
                      ? 'bg-bronze/15 text-bronze'
                      : 'bg-secondary text-muted-foreground'
                  }`}
                >
                  {rank <= 3 ? medals[rank - 1] : rank}
                </span>
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-foreground font-medium text-sm truncate">{player.name}</span>
                  {player.is_host && <Crown className="w-3 h-3 text-quiz-yellow shrink-0" />}
                  {player.completed_at && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-accent shrink-0" aria-label="Completed" />
                  )}
                  {isMe && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/15 text-primary font-bold uppercase tracking-wide shrink-0">
                      You
                    </span>
                  )}
                </div>
              </div>
              <motion.div
                key={player.score}
                initial={{ scale: 1 }}
                animate={{ scale: [1, 1.12, 1] }}
                transition={{ duration: 0.3 }}
                className="font-mono font-bold text-primary text-base shrink-0"
              >
                <CountUpScore target={player.score} />
              </motion.div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default LiveLeaderboard;
