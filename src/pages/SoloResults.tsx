import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useSoloStore } from '@/lib/solo-store';
import { useGamification } from '@/lib/gamification';
import { supabase } from '@/integrations/supabase/client';
import NewBadgeToast from '@/components/NewBadgeToast';
import ThemeToggle from '@/components/ThemeToggle';
import confetti from 'canvas-confetti';
import { Trophy, Home, RotateCcw, Star, Share2, Medal, Clock, Target, ChevronRight } from 'lucide-react';
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

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [newBadge, setNewBadge] = useState<Badge | null>(null);
  const recordedRef = useRef(false);

  const correctCount = answers.filter(a => a.correct).length;
  const percentage = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;
  const topicInfo = TOPICS.find(t => t.id === topic);

  // Save score and fetch leaderboard
  useEffect(() => {
    if (recordedRef.current || questions.length === 0) return;
    recordedRef.current = true;

    const badgesBefore = gamBadges.map(b => b.id);

    finishQuiz();
    recordQuizResult(correctCount, questions.length, false); // solo never "wins" multiplayer

    // Check for new badges
    setTimeout(() => {
      const current = useGamification.getState().badges;
      const newOnes = current.filter(b => !badgesBefore.includes(b.id));
      if (newOnes.length > 0) setNewBadge(newOnes[0]);
    }, 500);

    // Fetch leaderboard
    supabase
      .from('solo_scores')
      .select('player_name, score, correct_answers, total_questions')
      .eq('topic', topic)
      .order('score', { ascending: false })
      .limit(10)
      .then(({ data }) => {
        if (data) setLeaderboard(data);
      });
  }, []);

  useEffect(() => {
    if (questions.length === 0) return;
    confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 }, colors: ['#a855f7', '#22d3ee', '#fbbf24'] });
  }, []);

  const handleShare = () => {
    const text = `I scored ${totalScore} points (${correctCount}/${questions.length}) on ${topicInfo?.name || topic} in QuizWhiz! 🎯`;
    if (navigator.share) {
      navigator.share({ title: 'QuizWhiz Result', text, url: window.location.origin });
    } else {
      navigator.clipboard.writeText(text);
    }
  };

  if (questions.length === 0) {
    navigate('/solo');
    return null;
  }

  return (
    <div className="min-h-screen bg-background bg-particles flex flex-col items-center px-4 py-8">
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300 }}>
            <Trophy className="w-12 h-12 text-primary mx-auto mb-3" />
          </motion.div>
          <h1 className="font-display text-4xl font-bold mb-1">
            <span className="text-gradient">Quiz Complete!</span>
          </h1>
          <p className="text-muted-foreground">{topicInfo?.icon} {topicInfo?.name}</p>
        </div>

        {/* Score card */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="glass-strong border-2 border-primary/40 rounded-2xl p-8 text-center mb-6 glow-primary relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 pointer-events-none" />
          <div className="relative z-10">
            <motion.p
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, type: 'spring' }}
              className="font-mono text-5xl font-bold text-primary mb-2"
            >
              {totalScore}
            </motion.p>
            <p className="text-sm text-muted-foreground">points</p>

            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="text-center">
                <Target className="w-5 h-5 text-accent mx-auto mb-1" />
                <p className="font-bold text-foreground">{correctCount}/{questions.length}</p>
                <p className="text-xs text-muted-foreground">Correct</p>
              </div>
              <div className="text-center">
                <Medal className="w-5 h-5 text-quiz-yellow mx-auto mb-1" />
                <p className="font-bold text-foreground">{percentage}%</p>
                <p className="text-xs text-muted-foreground">Accuracy</p>
              </div>
              <div className="text-center">
                <Clock className="w-5 h-5 text-neon-cyan mx-auto mb-1" />
                <p className="font-bold text-foreground">{Math.round(answers.reduce((s, a) => s + a.timeMs, 0) / 1000)}s</p>
                <p className="text-xs text-muted-foreground">Total Time</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* XP + Level */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass rounded-xl p-4 mb-6 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <Star className="w-6 h-6 text-quiz-yellow" />
            <div>
              <p className="font-display font-semibold text-foreground">Level {level}</p>
              <p className="text-xs text-muted-foreground">{xp} total XP</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleShare}
            className="px-3 py-2 rounded-lg glass text-sm text-foreground flex items-center gap-2 hover:bg-secondary/80 transition-colors"
          >
            <Share2 className="w-4 h-4" /> Share
          </motion.button>
        </motion.div>

        {/* Answer review */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass rounded-xl p-4 mb-6"
        >
          <h3 className="font-display font-semibold text-foreground mb-3 text-sm">Answer Review</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {questions.map((q, i) => {
              const answer = answers[i];
              const isCorrect = answer?.correct;
              return (
                <div key={q.id} className="flex items-center gap-2 text-sm">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                    isCorrect ? 'bg-accent/20 text-accent' : answer ? 'bg-destructive/20 text-destructive' : 'bg-muted text-muted-foreground'
                  }`}>
                    {isCorrect ? '✓' : answer ? '✗' : '—'}
                  </span>
                  <span className="text-foreground truncate flex-1">{q.text}</span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Global Leaderboard */}
        {leaderboard.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="glass rounded-xl p-4 mb-6"
          >
            <h3 className="font-display font-semibold text-foreground mb-3 text-sm flex items-center gap-2">
              <Trophy className="w-4 h-4 text-primary" /> Global Top 10 — {topicInfo?.name}
            </h3>
            <div className="space-y-1.5">
              {leaderboard.map((entry, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${
                    entry.player_name === playerName && entry.score === totalScore ? 'glass border border-primary/40' : ''
                  }`}
                >
                  <span className={`w-6 text-center font-bold ${i < 3 ? 'text-quiz-yellow' : 'text-muted-foreground'}`}>
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                  </span>
                  <span className="text-foreground flex-1 truncate">{entry.player_name}</span>
                  <span className="font-mono font-bold text-primary">{entry.score}</span>
                  <span className="text-xs text-muted-foreground">{entry.correct_answers}/{entry.total_questions}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="flex gap-3 justify-center"
        >
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => { reset(); navigate('/'); }}
            className="px-6 py-3 rounded-xl glass text-foreground font-display font-semibold flex items-center gap-2 hover:bg-secondary/80 transition-colors"
          >
            <Home className="w-4 h-4" /> Home
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => { reset(); navigate('/solo'); }}
            className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-display font-semibold flex items-center gap-2 glow-primary"
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
