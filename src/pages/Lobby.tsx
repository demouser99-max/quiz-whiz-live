import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { Copy, Share2, Play, Users, X, Crown, Sparkles } from 'lucide-react';
import { useQuizStore } from '@/lib/quiz-store';
import { playJoinSound } from '@/lib/sounds';
import { toast } from 'sonner';

const Lobby = () => {
  const navigate = useNavigate();
  const { code } = useParams();
  const quiz = useQuizStore(s => s.quiz);
  const loading = useQuizStore(s => s.loading);
  const sessionId = useQuizStore(s => s.sessionId);
  const fetchQuiz = useQuizStore(s => s.fetchQuiz);
  const startQuiz = useQuizStore(s => s.startQuiz);
  const kickPlayer = useQuizStore(s => s.kickPlayer);
  const subscribeToQuiz = useQuizStore(s => s.subscribeToQuiz);

  const myPlayer = quiz?.players.find(p => p.sessionId === sessionId);
  const isHost = myPlayer?.isHost;
  const prevPlayerCount = useQuizStore(s => s.quiz?.players.length);

  useEffect(() => {
    if (code) fetchQuiz(code);
  }, [code]);

  useEffect(() => {
    if (quiz?.id) {
      const unsubscribe = subscribeToQuiz(quiz.id);
      return unsubscribe;
    }
  }, [quiz?.id]);

  // Play sound when new player joins
  useEffect(() => {
    if (quiz && quiz.players.length > 1) {
      playJoinSound();
    }
  }, [quiz?.players.length]);

  // Navigate when quiz starts (realtime or polling)
  useEffect(() => {
    if (quiz?.status === 'playing') {
      navigate(`/play/${quiz.code}`);
    }
  }, [quiz?.status]);

  // Polling fallback: check quiz status every 3s in case realtime misses an event
  useEffect(() => {
    if (!code || !quiz || quiz.status !== 'lobby') return;
    const interval = setInterval(() => {
      fetchQuiz(code);
    }, 3000);
    return () => clearInterval(interval);
  }, [code, quiz?.status]);

  if (loading || (!quiz && !loading)) {
    return (
      <div className="min-h-screen bg-background bg-particles flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-secondary animate-pulse" />
          <div className="w-48 h-4 rounded-full bg-secondary animate-pulse" />
          <div className="w-32 h-4 rounded-full bg-secondary animate-pulse" />
        </div>
      </div>
    );
  }

  if (!quiz || quiz.code !== code) {
    return (
      <div className="min-h-screen bg-background bg-particles flex items-center justify-center">
        <div className="text-center glass-strong rounded-2xl p-8">
          <h2 className="font-display text-2xl font-bold text-foreground mb-4">Quiz not found</h2>
          <button onClick={() => navigate('/home')} className="text-primary underline">Go home</button>
        </div>
      </div>
    );
  }

  const joinLink = `${window.location.origin}/join/${quiz.code}`;

  const copyCode = () => {
    navigator.clipboard.writeText(quiz.code);
    toast.success('Code copied!');
  };

  const shareLink = () => {
    if (navigator.share) {
      navigator.share({ title: quiz.title, text: `Join my quiz on QuizWhiz!`, url: joinLink });
    } else {
      navigator.clipboard.writeText(joinLink);
      toast.success('Link copied!');
    }
  };

  return (
    <div className="min-h-screen bg-background bg-particles flex flex-col items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg text-center"
      >
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <p className="text-sm text-muted-foreground mb-2 uppercase tracking-widest">Quiz Lobby</p>
          <h1 className="font-display text-3xl font-bold text-gradient mb-2">{quiz.title}</h1>
        </motion.div>

        {/* Quiz code */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="glass-strong rounded-2xl p-6 my-6 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 pointer-events-none" />
          <div className="relative z-10">
            <p className="text-sm text-muted-foreground mb-2">Share this code</p>
            <div className="font-mono text-5xl font-bold text-gradient-neon tracking-[0.3em] mb-4">
              {quiz.code}
            </div>
            <div className="flex gap-3 justify-center">
              <button
                onClick={copyCode}
                className="flex items-center gap-2 px-4 py-2 rounded-lg glass text-foreground text-sm hover:bg-secondary/80 transition-colors"
              >
                <Copy className="w-4 h-4" /> Copy
              </button>
              <button
                onClick={shareLink}
                className="flex items-center gap-2 px-4 py-2 rounded-lg glass text-foreground text-sm hover:bg-secondary/80 transition-colors"
              >
                <Share2 className="w-4 h-4" /> Share
              </button>
            </div>
          </div>
        </motion.div>

        {/* Players */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-strong rounded-2xl p-6 mb-6"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Users className="w-5 h-5 text-primary" />
            <span className="font-display font-semibold text-foreground">
              Players ({quiz.players.length})
            </span>
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            {quiz.players.map((player, i) => (
              <motion.div
                key={player.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.05, type: 'spring', stiffness: 400 }}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                  player.sessionId === sessionId ? 'glass border border-primary/40' : 'glass'
                }`}
              >
                <span className="text-sm text-foreground">{player.name}</span>
                {player.isHost && (
                  <Crown className="w-3.5 h-3.5 text-quiz-yellow" />
                )}
                {isHost && !player.isHost && (
                  <button onClick={() => kickPlayer(player.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                    <X className="w-3 h-3" />
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        <p className="text-sm text-muted-foreground mb-6 flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4 text-primary opacity-60" />
          {quiz.questions.length} questions · {quiz.timePerQuestion}s each
        </p>

        {isHost && (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => startQuiz()}
            className="px-10 py-4 rounded-xl bg-primary text-primary-foreground font-display font-semibold text-lg glow-primary flex items-center justify-center gap-2 mx-auto transition-all"
          >
            <Play className="w-5 h-5" />
            Start Quiz
          </motion.button>
        )}

        {!isHost && (
          <motion.p
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="text-muted-foreground"
          >
            Waiting for host to start...
          </motion.p>
        )}
      </motion.div>
    </div>
  );
};

export default Lobby;
