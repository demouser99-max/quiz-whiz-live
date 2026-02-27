import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuizStore } from '@/lib/quiz-store';
import confetti from 'canvas-confetti';
import { Trophy, Home, RotateCcw, Crown, Loader2 } from 'lucide-react';

const Results = () => {
  const navigate = useNavigate();
  const { code } = useParams();
  const quiz = useQuizStore(s => s.quiz);
  const sessionId = useQuizStore(s => s.sessionId);
  const fetchQuiz = useQuizStore(s => s.fetchQuiz);
  const getLeaderboard = useQuizStore(s => s.getLeaderboard);

  useEffect(() => {
    if (code) fetchQuiz(code);
  }, [code]);

  const leaderboard = getLeaderboard();
  const isHost = quiz?.players.find(p => p.sessionId === sessionId)?.isHost;
  const winner = leaderboard[0];

  useEffect(() => {
    if (!winner) return;
    const duration = 3000;
    const end = Date.now() + duration;
    const frame = () => {
      confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 } });
      confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 } });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  }, [winner]);

  if (!quiz) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl font-bold text-foreground mb-2">
            <Trophy className="w-8 h-8 text-primary inline mr-2" />
            Final Results
          </h1>
          <p className="text-muted-foreground">{quiz.title}</p>
        </div>

        {/* Winner spotlight */}
        {winner && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, type: 'spring' }}
            className="bg-card border-2 border-primary/40 rounded-2xl p-8 text-center mb-8 glow-primary"
          >
            <Crown className="w-10 h-10 text-quiz-yellow mx-auto mb-2" />
            <h2 className="font-display text-3xl font-bold text-gradient mb-1">{winner.name}</h2>
            <p className="font-mono text-2xl font-bold text-primary">{winner.score} pts</p>
            <p className="text-sm text-muted-foreground mt-1">🏆 Winner!</p>
          </motion.div>
        )}

        {/* Full leaderboard */}
        <div className="space-y-2 mb-8">
          {leaderboard.map((player, i) => (
            <motion.div
              key={player.id}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5 + i * 0.08 }}
              className={`flex items-center justify-between px-4 py-3 rounded-xl ${
                player.sessionId === sessionId ? 'bg-primary/20 border border-primary/40' : 'bg-card border border-border'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  i === 0 ? 'bg-quiz-yellow text-background' : i === 1 ? 'bg-muted-foreground/30 text-foreground' : i === 2 ? 'bg-quiz-red/60 text-foreground' : 'bg-secondary text-muted-foreground'
                }`}>
                  {i + 1}
                </span>
                <span className="text-foreground font-medium">{player.name}</span>
                {player.isHost && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/20 text-primary font-semibold">HOST</span>
                )}
              </div>
              <div className="text-right">
                <span className="font-mono font-bold text-primary">{player.score}</span>
                <span className="text-xs text-muted-foreground ml-1">pts</span>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="flex gap-3 justify-center">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/')}
            className="px-6 py-3 rounded-xl bg-secondary text-secondary-foreground font-display font-semibold flex items-center gap-2"
          >
            <Home className="w-4 h-4" /> Home
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/create')}
            className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-display font-semibold flex items-center gap-2 glow-primary"
          >
            <RotateCcw className="w-4 h-4" /> New Quiz
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default Results;
