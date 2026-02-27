import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { Copy, Share2, Play, Users, X, Loader2 } from 'lucide-react';
import { useQuizStore } from '@/lib/quiz-store';
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

  // Fetch quiz data and subscribe to realtime
  useEffect(() => {
    if (code) {
      fetchQuiz(code);
    }
  }, [code]);

  useEffect(() => {
    if (quiz?.id) {
      const unsubscribe = subscribeToQuiz(quiz.id);
      return unsubscribe;
    }
  }, [quiz?.id]);

  // Navigate when quiz starts
  useEffect(() => {
    if (quiz?.status === 'playing') {
      navigate(`/play/${quiz.code}`);
    }
  }, [quiz?.status]);

  if (loading || (!quiz && !loading)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!quiz || quiz.code !== code) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-display text-2xl font-bold text-foreground mb-4">Quiz not found</h2>
          <button onClick={() => navigate('/')} className="text-primary underline">Go home</button>
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

  const handleStart = async () => {
    await startQuiz();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg text-center"
      >
        <p className="text-sm text-muted-foreground mb-2 uppercase tracking-wider">Quiz Lobby</p>
        <h1 className="font-display text-3xl font-bold text-foreground mb-2">{quiz.title}</h1>

        {/* Quiz code */}
        <div className="bg-card border border-border rounded-2xl p-6 my-6">
          <p className="text-sm text-muted-foreground mb-2">Share this code</p>
          <div className="font-mono text-5xl font-bold text-gradient tracking-[0.3em] mb-4">
            {quiz.code}
          </div>
          <div className="flex gap-3 justify-center">
            <button
              onClick={copyCode}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm hover:bg-muted transition-colors"
            >
              <Copy className="w-4 h-4" /> Copy Code
            </button>
            <button
              onClick={shareLink}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm hover:bg-muted transition-colors"
            >
              <Share2 className="w-4 h-4" /> Share Link
            </button>
          </div>
        </div>

        {/* Players */}
        <div className="bg-card border border-border rounded-2xl p-6 mb-6">
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
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary"
              >
                <span className="text-sm text-foreground">{player.name}</span>
                {player.isHost && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/20 text-primary font-semibold">HOST</span>
                )}
                {isHost && !player.isHost && (
                  <button onClick={() => kickPlayer(player.id)} className="text-muted-foreground hover:text-destructive">
                    <X className="w-3 h-3" />
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Info */}
        <p className="text-sm text-muted-foreground mb-6">
          {quiz.questions.length} questions · {quiz.timePerQuestion}s each
        </p>

        {isHost && (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleStart}
            className="px-10 py-4 rounded-xl bg-primary text-primary-foreground font-display font-semibold text-lg glow-primary flex items-center justify-center gap-2 mx-auto transition-all"
          >
            <Play className="w-5 h-5" />
            Start Quiz
          </motion.button>
        )}

        {!isHost && (
          <p className="text-muted-foreground animate-pulse-glow">Waiting for host to start...</p>
        )}
      </motion.div>
    </div>
  );
};

export default Lobby;
