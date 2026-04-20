import { useEffect, useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, CheckCircle2, TrendingUp, TrendingDown, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

/**
 * LiveLeaderboard — premium competition arena
 * - Polls backend RPC `get_quiz_leaderboard` every 1s.
 * - Backend is the SINGLE SOURCE OF TRUTH for sorting & ranking.
 * - Frontend NEVER sorts — renders array as returned.
 * - Adds: tier glow (gold/silver/bronze), spotlight on #1, energy bars,
 *   floating "+pts" deltas, count-up score, overtake (rank-change) arrows,
 *   persistent pulse on current user, smooth layout transitions.
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

/** Smooth count-up that interpolates between successive backend values. */
const CountUpScore = ({ target, duration = 700 }: { target: number; duration?: number }) => {
  const [current, setCurrent] = useState(target);
  const prevTargetRef = useRef(target);
  const fromRef = useRef(target);

  useEffect(() => {
    if (target === prevTargetRef.current) return;
    fromRef.current = current;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.round(fromRef.current + (target - fromRef.current) * eased));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    prevTargetRef.current = target;
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, duration]);

  return <span>{current.toLocaleString()}</span>;
};

/** Tier metadata derived from rank. */
const tierFor = (rank: number) => {
  if (rank === 1) return { label: 'GOLD', glow: 'tier-gold-glow', text: 'text-gold', bar: 'from-gold to-quiz-yellow' };
  if (rank === 2) return { label: 'SILVER', glow: 'tier-silver-glow', text: 'text-silver', bar: 'from-silver to-foreground/60' };
  if (rank === 3) return { label: 'BRONZE', glow: 'tier-bronze-glow', text: 'text-bronze', bar: 'from-bronze to-quiz-yellow/70' };
  return { label: 'ELITE', glow: '', text: 'text-muted-foreground', bar: 'from-primary to-accent' };
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

  // Track previous score & rank per player to drive +pts and rank-change FX.
  const prevScoresRef = useRef<Map<string, number>>(new Map());
  const prevRanksRef = useRef<Map<string, number>>(new Map());
  const [deltas, setDeltas] = useState<Record<string, { value: number; key: number }>>({});
  const [rankShifts, setRankShifts] = useState<Record<string, { dir: 'up' | 'down'; key: number }>>({});

  useEffect(() => {
    if (!quizId) return;
    let cancelled = false;

    const fetchLeaderboard = async () => {
      if (inFlightRef.current) return;
      inFlightRef.current = true;
      try {
        const { data, error } = await supabase.rpc('get_quiz_leaderboard', { p_quiz_id: quizId });
        if (cancelled) return;
        if (error) {
          console.error('[LiveLeaderboard] fetch error:', error.message);
          return;
        }
        const next = (data ?? []) as LeaderboardEntry[];

        // Compute deltas vs previous snapshot (purely visual; no sorting).
        const newDeltas: Record<string, { value: number; key: number }> = {};
        const newShifts: Record<string, { dir: 'up' | 'down'; key: number }> = {};
        const now = Date.now();

        next.forEach(p => {
          const prevScore = prevScoresRef.current.get(p.id);
          if (prevScore !== undefined && p.score > prevScore) {
            newDeltas[p.id] = { value: p.score - prevScore, key: now };
          }
          const prevRank = prevRanksRef.current.get(p.id);
          if (prevRank !== undefined && prevRank !== p.rank) {
            newShifts[p.id] = { dir: p.rank < prevRank ? 'up' : 'down', key: now };
          }
          prevScoresRef.current.set(p.id, p.score);
          prevRanksRef.current.set(p.id, p.rank);
        });

        if (Object.keys(newDeltas).length) {
          setDeltas(prev => ({ ...prev, ...newDeltas }));
          // auto-clear individual deltas after animation
          Object.keys(newDeltas).forEach(id => {
            setTimeout(() => {
              setDeltas(prev => {
                const { [id]: _, ...rest } = prev;
                return rest;
              });
            }, 1400);
          });
        }
        if (Object.keys(newShifts).length) {
          setRankShifts(prev => ({ ...prev, ...newShifts }));
          Object.keys(newShifts).forEach(id => {
            setTimeout(() => {
              setRankShifts(prev => {
                const { [id]: _, ...rest } = prev;
                return rest;
              });
            }, 1800);
          });
        }

        setEntries(next);
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

  const visible = useMemo(() => entries.slice(0, maxShow), [entries, maxShow]);
  const topScore = visible[0]?.score ?? 0;

  if (!loaded) {
    return (
      <div className="space-y-2">
        {[0, 1, 2].map(i => (
          <div key={i} className="h-14 rounded-xl skeleton-shimmer" />
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
    <div className={compact ? 'space-y-2' : 'space-y-2.5'}>
      <AnimatePresence mode="popLayout" initial={false}>
        {visible.map(player => {
          const isMe = player.session_id === sessionId;
          const rank = player.rank;
          const tier = tierFor(rank);
          const isTop3 = rank <= 3;
          const energyPct = topScore > 0 ? Math.max(4, Math.min(100, (player.score / topScore) * 100)) : 4;
          const delta = deltas[player.id];
          const shift = rankShifts[player.id];

          return (
            <motion.div
              key={player.id}
              layout
              layoutId={player.id}
              initial={{ opacity: 0, x: -20, scale: 0.96 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.96 }}
              transition={{
                layout: { type: 'spring', stiffness: 380, damping: 32, mass: 0.8 },
                opacity: { duration: 0.25 },
              }}
              className={`relative ${isTop3 ? tier.glow : ''} ${
                isMe ? 'me-pulse gradient-border' : ''
              } rounded-xl overflow-hidden`}
            >
              {/* Spotlight sweep for #1 */}
              {rank === 1 && <div className="spotlight-sweep absolute inset-0 pointer-events-none" />}

              {/* Card body */}
              <div
                className={`relative ${
                  isTop3 ? 'glass-premium' : 'glass-card'
                } ${compact ? 'px-3 py-2.5' : 'px-3.5 py-3'} flex items-center gap-3`}
              >
                {/* Rank badge */}
                <div className="relative shrink-0">
                  <motion.div
                    key={`rank-${rank}-${player.id}`}
                    initial={{ scale: 0.8, rotate: -8 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 420, damping: 22 }}
                    className={`${compact ? 'w-9 h-9 text-base' : 'w-10 h-10 text-lg'} rounded-lg flex items-center justify-center font-bold ${
                      rank === 1
                        ? 'bg-gold/20 text-gold'
                        : rank === 2
                        ? 'bg-silver/20 text-silver'
                        : rank === 3
                        ? 'bg-bronze/20 text-bronze'
                        : 'bg-secondary/70 text-muted-foreground'
                    }`}
                  >
                    {isTop3 ? medals[rank - 1] : <span className="font-mono text-sm">{rank}</span>}
                  </motion.div>
                  {/* Crown floating above #1 */}
                  {rank === 1 && (
                    <motion.div
                      initial={{ y: -2, opacity: 0 }}
                      animate={{ y: [-4, -7, -4], opacity: 1 }}
                      transition={{ y: { duration: 2, repeat: Infinity, ease: 'easeInOut' }, opacity: { duration: 0.4 } }}
                      className="absolute -top-3 left-1/2 -translate-x-1/2 pointer-events-none"
                    >
                      <Crown className="w-3.5 h-3.5 text-gold drop-shadow-[0_0_8px_hsl(var(--gold)/0.7)]" fill="currentColor" />
                    </motion.div>
                  )}
                  {/* Rank-change arrow */}
                  <AnimatePresence>
                    {shift && (
                      <motion.div
                        key={shift.key}
                        initial={{ opacity: 0, y: shift.dir === 'up' ? 6 : -6, scale: 0.6 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.6 }}
                        className={`absolute -right-1.5 -bottom-1 rounded-full p-0.5 ${
                          shift.dir === 'up' ? 'bg-accent/90' : 'bg-destructive/80'
                        } shadow-lg`}
                      >
                        {shift.dir === 'up' ? (
                          <TrendingUp className="w-2.5 h-2.5 text-background" />
                        ) : (
                          <TrendingDown className="w-2.5 h-2.5 text-background" />
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Name + meta + energy bar */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`font-semibold text-sm truncate ${
                        rank === 1 ? 'text-shimmer-gold' : 'text-foreground'
                      }`}
                    >
                      {player.name}
                    </span>
                    {player.is_host && <Crown className="w-3 h-3 text-quiz-yellow shrink-0" />}
                    {player.completed_at && (
                      <CheckCircle2
                        className="w-3.5 h-3.5 text-accent shrink-0"
                        aria-label="Completed"
                      />
                    )}
                    {isMe && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/20 text-primary font-bold uppercase tracking-wide shrink-0">
                        You
                      </span>
                    )}
                  </div>

                  {/* Energy bar */}
                  <div className="mt-1.5 flex items-center gap-2">
                    <div className="relative h-1 flex-1 rounded-full bg-secondary/60 overflow-hidden">
                      <motion.div
                        className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${tier.bar}`}
                        initial={false}
                        animate={{ width: `${energyPct}%` }}
                        transition={{ type: 'spring', stiffness: 140, damping: 24 }}
                        style={{ animation: isTop3 ? 'energy-pulse 2.4s ease-in-out infinite' : undefined }}
                      />
                    </div>
                    <span className={`text-[9px] font-bold uppercase tracking-wider ${tier.text} shrink-0`}>
                      {tier.label}
                    </span>
                  </div>
                </div>

                {/* Score + floating delta */}
                <div className="relative shrink-0 text-right">
                  <motion.div
                    key={player.score}
                    initial={{ scale: 1 }}
                    animate={{ scale: delta ? [1, 1.2, 1] : 1 }}
                    transition={{ duration: 0.4 }}
                    className={`font-mono font-bold text-base leading-none ${
                      rank === 1 ? 'text-gold' : 'text-primary'
                    }`}
                  >
                    <CountUpScore target={player.score} />
                  </motion.div>
                  <div className="text-[9px] uppercase tracking-wider text-muted-foreground mt-1 flex items-center justify-end gap-0.5">
                    <Zap className="w-2 h-2" /> pts
                  </div>

                  <AnimatePresence>
                    {delta && (
                      <motion.div
                        key={delta.key}
                        initial={{ opacity: 0, y: 0, scale: 0.6 }}
                        animate={{ opacity: [0, 1, 1, 0], y: -48, scale: [0.6, 1.15, 1, 0.95] }}
                        transition={{ duration: 1.3, ease: 'easeOut' }}
                        className="absolute -top-1 right-0 pointer-events-none font-mono font-extrabold text-sm text-accent drop-shadow-[0_0_8px_hsl(var(--accent)/0.6)]"
                      >
                        +{delta.value}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default LiveLeaderboard;
