import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useSoloStore } from '@/lib/solo-store';
import { useGamification } from '@/lib/gamification';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import NewBadgeToast from '@/components/NewBadgeToast';
import ThemeToggle from '@/components/ThemeToggle';
import FloatingParticles from '@/components/FloatingParticles';
import confetti from 'canvas-confetti';
import { Trophy, Home, RotateCcw, Star, Share2, Medal, Clock, Target, CheckCircle2, XCircle } from 'lucide-react';
import { TOPICS } from '@/data/questions';
import type { Badge } from '@/lib/gamification';

interface LeaderboardEntry {
  player_name: string;
  score: number;
  correct_answers: number;
  total_questions: number;
}

const SoloResults = () => {
  const navigate = useNavigate();
  const { playerName, topic, totalScore, questions, answers, finishQuiz, reset } = useSoloStore();
  const recordQuizResult = useGamification(s => s.recordQuizResult);
  const gamBadges = useGamification(s => s.badges);
  const level = useGamification(s => s.level);
  const xp = useGamification(s => s.xp);
  const { user } = useAuth();

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [newBadge, setNewBadge] = useState<Badge | null>(null);
  const recordedRef = useRef(false);

  const correctCount = answers.filter(a => a.correct).length;
  const percentage = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;
  const topicInfo = TOPICS.find(t => t.id === topic);

  useEffect(() => {
    if (recordedRef.current || questions.length === 0) return;
    recordedRef.current = true;

    const badgesBefore = gamBadges.map(b => b.id);
    finishQuiz(user?.id);
    recordQuizResult(correctCount, questions.length, false);

    setTimeout(() => {
      const current = useGamification.getState().badges;
      const newOnes = current.filter(b => !badgesBefore.includes(b.id));
      if (newOnes.length > 0) setNewBadge(newOnes[0]);
    }, 500);

    supabase
      .from('solo_scores')
      .select('player_name, score, correct_answers, total_questions')
      .eq('topic', topic)
      .order('score', { ascending: false })
      .limit(10)
      .then(({ data }) => { if (data) setLeaderboard(data); });
  }, []);

  useEffect(() => {
    if (questions.length === 0) return;
    confetti({ particleCount: 100, spread: 85, origin: { y: 0.5 }, colors: ['#a855f7', '#22d3ee', '#fbbf24', '#22c55e'] });
  }, []);

  const handleShare = () => {
    const text = `I scored ${totalScore} pts (${correctCount}/${questions.length}) on ${topicInfo?.name || topic} in QuizWhiz! 🎯`;
    if (navigator.share) {
      navigator.share({ title: 'QuizWhiz', text, url: window.location.origin });
    } else {
      navigator.clipboard.writeText(text);
    }
  };

  if (questions.length === 0) { navigate('/solo'); return null; }

  return (
    <div className="min-h-screen bg-gradient-mesh relative overflow-hidden flex flex-col items-center px-4 py-8">
      <FloatingParticles />
      <div className="absolute top-5 right-6 z-20"><ThemeToggle /></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg relative z-10"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300 }}>
            <div className="w-18 h-18 rounded-full bg-gradient-to-br from-primary to-neon-purple flex items-center justify-center mx-auto mb-4 shadow-glow-primary" style={{ width: 72, height: 72 }}>
              <Trophy className="w-9 h-9 text-primary-foreground" />
            </div>
          </motion.div>
          <h1 className="font-display text-3xl font-bold mb-1">
            <span className="text-gradient">Quiz Complete!</span>
          </h1>
          <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
            <span className="text-lg">{topicInfo?.icon}</span> {topicInfo?.name}
          </p>
        </div>

        {/* Score */}
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.15, type: 'spring' }}
          className="glass-premium rounded-2xl p-7 text-center mb-5 shadow-elevated relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/3 pointer-events-none" />
          <div className="relative z-10">
            <motion.p
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring' }}
              className="font-mono text-5xl font-bold text-gradient mb-1"
            >
              {totalScore}
            </motion.p>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">points earned</p>

            <div className="grid grid-cols-3 gap-4 mt-7">
              {[
                { icon: Target, value: `${correctCount}/${questions.length}`, label: 'Correct', color: 'text-accent' },
                { icon: Medal, value: `${percentage}%`, label: 'Accuracy', color: 'text-quiz-yellow' },
                { icon: Clock, value: `${Math.round(answers.reduce((s, a) => s + a.timeMs, 0) / 1000)}s`, label: 'Time', color: 'text-neon-cyan' },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.08 }}
                  className="text-center"
                >
                  <div className="w-9 h-9 rounded-lg bg-secondary/80 flex items-center justify-center mx-auto mb-2">
                    <stat.icon className={`w-4 h-4 ${stat.color}`} />
                  </div>
                  <p className="font-bold text-foreground text-base">{stat.value}</p>
                  <p className="text-[11px] text-muted-foreground">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Guest info */}

        {/* XP + Level */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="glass-card rounded-xl p-4 mb-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-quiz-yellow/10 flex items-center justify-center">
              <Star className="w-4 h-4 text-quiz-yellow" />
            </div>
            <div>
              <p className="font-display font-semibold text-foreground text-sm">Level {level}</p>
              <p className="text-[11px] text-muted-foreground">{xp} total XP</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleShare}
            className="px-3.5 py-2 rounded-lg glass-card text-xs text-foreground flex items-center gap-1.5 hover:border-primary/20 transition-colors font-medium"
          >
            <Share2 className="w-3.5 h-3.5" /> Share
          </motion.button>
        </motion.div>

        {/* Answer review */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card rounded-xl p-4 mb-4"
        >
          <h3 className="font-display font-semibold text-foreground mb-3 text-xs uppercase tracking-wide">Answer Review</h3>
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {questions.map((q, i) => {
              const answer = answers[i];
              const isCorrect = answer?.correct;
              return (
                <div key={q.id} className="flex items-center gap-2.5 py-1">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                    isCorrect ? 'bg-accent/15' : answer ? 'bg-destructive/15' : 'bg-muted'
                  }`}>
                    {isCorrect ? <CheckCircle2 className="w-3 h-3 text-accent" /> :
                     answer ? <XCircle className="w-3 h-3 text-destructive" /> :
                     <span className="text-[10px] text-muted-foreground">—</span>}
                  </div>
                  <span className="text-xs text-foreground truncate flex-1">{q.text}</span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Leaderboard */}
        {leaderboard.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-card rounded-xl p-4 mb-5"
          >
            <h3 className="font-display font-semibold text-foreground mb-3 text-xs flex items-center gap-2 uppercase tracking-wide">
              <Trophy className="w-3.5 h-3.5 text-primary" /> Global Top 10 — {topicInfo?.name}
            </h3>
            <div className="space-y-1">
              {leaderboard.map((entry, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.55 + i * 0.03 }}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${
                    entry.player_name === playerName && entry.score === totalScore
                      ? 'glass border border-primary/25'
                      : 'hover:bg-secondary/20'
                  }`}
                >
                  <span className={`w-6 text-center font-bold text-xs ${
                    i === 0 ? 'text-gold' : i === 1 ? 'text-silver' : i === 2 ? 'text-bronze' : 'text-muted-foreground'
                  }`}>
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                  </span>
                  <span className="text-foreground flex-1 truncate font-medium text-xs">{entry.player_name}</span>
                  <span className="font-mono font-bold text-primary text-xs">{entry.score}</span>
                  <span className="text-[10px] text-muted-foreground">{entry.correct_answers}/{entry.total_questions}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex gap-3 justify-center"
        >
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => { reset(); navigate(user ? '/dashboard' : '/home'); }}
            className="px-6 py-3 rounded-xl glass-card text-foreground font-display font-semibold text-sm flex items-center gap-2"
          >
            <Home className="w-4 h-4" /> Home
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => { reset(); navigate('/solo'); }}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-neon-purple text-primary-foreground font-display font-semibold text-sm flex items-center gap-2 shadow-glow-primary btn-ripple"
          >
            <RotateCcw className="w-4 h-4" /> Play Again
          </motion.button>
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {newBadge && <NewBadgeToast badge={newBadge} onClose={() => setNewBadge(null)} />}
      </AnimatePresence>
    </div>
  );
};

export default SoloResults;
