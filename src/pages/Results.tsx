import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuizStore } from '@/lib/quiz-store';
import { useGamification } from '@/lib/gamification';
import AnimatedLeaderboard from '@/components/AnimatedLeaderboard';
import NewBadgeToast from '@/components/NewBadgeToast';
import ThemeToggle from '@/components/ThemeToggle';
import confetti from 'canvas-confetti';
import { Trophy, Home, RotateCcw, Crown, Sparkles, Star, Share2 } from 'lucide-react';
import type { Badge } from '@/lib/gamification';

const Results = () => {
  const navigate = useNavigate();
  const { code } = useParams();
  const quiz = useQuizStore(s => s.quiz);
  const sessionId = useQuizStore(s => s.sessionId);
  const fetchQuiz = useQuizStore(s => s.fetchQuiz);
  const getLeaderboard = useQuizStore(s => s.getLeaderboard);
  const playerAnswers = useQuizStore(s => s.playerAnswers);
  const recordQuizResult = useGamification(s => s.recordQuizResult);
  const gamBadges = useGamification(s => s.badges);
  const xp = useGamification(s => s.xp);
  const level = useGamification(s => s.level);

  const [newBadge, setNewBadge] = useState<Badge | null>(null);
  const recordedRef = useRef(false);

  useEffect(() => {
    if (code) fetchQuiz(code);
  }, [code]);

  const leaderboard = getLeaderboard();
  const winner = leaderboard[0];
  const myPlayer = quiz?.players.find(p => p.sessionId === sessionId);

  // Record gamification result once
  useEffect(() => {
    if (!quiz || !myPlayer || recordedRef.current) return;
    recordedRef.current = true;

    const badgesBefore = gamBadges.map(b => b.id);
    const myAnswers = playerAnswers[myPlayer.id] || [];
    const correct = myAnswers.filter(a => a.points > 0).length;
    const total = quiz.questions.length;
    const won = winner?.id === myPlayer.id;

    recordQuizResult(correct, total, won);

    // Check for new badges after a tick
    setTimeout(() => {
      const current = useGamification.getState().badges;
      const newOnes = current.filter(b => !badgesBefore.includes(b.id));
      if (newOnes.length > 0) {
        setNewBadge(newOnes[0]);
      }
    }, 500);
  }, [quiz, myPlayer]);

  useEffect(() => {
    if (!winner) return;
    const duration = 3000;
    const end = Date.now() + duration;
    const frame = () => {
      confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#a855f7', '#22d3ee', '#fbbf24'] });
      confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#a855f7', '#22d3ee', '#fbbf24'] });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  }, [winner]);

  const handleShare = () => {
    if (!quiz || !myPlayer) return;
    const text = `I scored ${myPlayer.score} points on "${quiz.title}" on QuizWhiz! 🎯`;
    if (navigator.share) {
      navigator.share({ title: 'QuizWhiz Result', text, url: window.location.origin });
    } else {
      navigator.clipboard.writeText(text);
    }
  };

  if (!quiz) {
    return (
      <div className="min-h-screen bg-background bg-particles flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-secondary animate-pulse" />
          <div className="w-48 h-4 rounded-full bg-secondary animate-pulse" />
        </div>
      </div>
    );
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
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <Trophy className="w-12 h-12 text-primary mx-auto mb-3" />
          </motion.div>
          <h1 className="font-display text-4xl font-bold mb-2">
            <span className="text-gradient">Final Results</span>
          </h1>
          <p className="text-muted-foreground">{quiz.title}</p>
        </div>

        {/* Winner spotlight */}
        {winner && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
            className="glass-strong border-2 border-primary/40 rounded-2xl p-8 text-center mb-8 glow-primary relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 pointer-events-none" />
            <div className="relative z-10">
              <Crown className="w-10 h-10 text-quiz-yellow mx-auto mb-2" />
              <Sparkles className="w-5 h-5 text-quiz-yellow mx-auto mb-1 opacity-60" />
              <h2 className="font-display text-3xl font-bold text-gradient-neon mb-1">{winner.name}</h2>
              <motion.p
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: 'spring' }}
                className="font-mono text-3xl font-bold text-primary"
              >
                {winner.score} pts
              </motion.p>
              <p className="text-sm text-muted-foreground mt-1">🏆 Champion!</p>
            </div>
          </motion.div>
        )}

        {/* XP Gained */}
        {myPlayer && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
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
        )}

        {/* Full leaderboard */}
        <AnimatedLeaderboard players={quiz.players} sessionId={sessionId} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex gap-3 justify-center mt-8"
        >
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/')}
            className="px-6 py-3 rounded-xl glass text-foreground font-display font-semibold flex items-center gap-2 hover:bg-secondary/80 transition-colors"
          >
            <Home className="w-4 h-4" /> Home
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/create')}
            className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-display font-semibold flex items-center gap-2 glow-primary"
          >
            <RotateCcw className="w-4 h-4" /> New Quiz
          </motion.button>
        </motion.div>
      </motion.div>

      {/* New badge toast */}
      <AnimatePresence>
        {newBadge && (
          <NewBadgeToast badge={newBadge} onClose={() => setNewBadge(null)} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Results;
