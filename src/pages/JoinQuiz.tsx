import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Users, Loader2, Sparkles } from 'lucide-react';
import { useQuizStore } from '@/lib/quiz-store';

const JoinQuiz = () => {
  const navigate = useNavigate();
  const { code: urlCode } = useParams();
  const joinQuiz = useQuizStore(s => s.joinQuiz);
  const [code, setCode] = useState(urlCode || '');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [joining, setJoining] = useState(false);

  const handleJoin = async () => {
    if (!code.trim() || !name.trim() || joining) return;
    setJoining(true);
    setError('');
    const result = await joinQuiz(code.trim().toUpperCase(), name.trim());
    const upperCode = code.trim().toUpperCase();
    if (result.success) {
      // Check if quiz is already playing - go straight to play
      const quiz = useQuizStore.getState().quiz;
      if (quiz?.status === 'playing') {
        navigate(`/play/${upperCode}`);
      } else {
        navigate(`/lobby/${upperCode}`);
      }
    } else {
      setError(result.error || 'Failed to join');
    }
    setJoining(false);
  };

  return (
    <div className="min-h-screen bg-background bg-particles flex flex-col items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <button
          onClick={() => navigate('/home')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-accent" />
          <h1 className="font-display text-3xl font-bold text-gradient">Join a Quiz</h1>
        </div>
        <p className="text-muted-foreground mb-8">Enter the quiz code and your display name.</p>

        <div className="space-y-6">
          <div>
            <label className="text-sm font-medium text-foreground block mb-2">Quiz Code</label>
            <input
              type="text"
              value={code}
              onChange={e => { setCode(e.target.value.toUpperCase()); setError(''); }}
              placeholder="e.g. QZ47KP"
              maxLength={6}
              className="w-full px-4 py-3 rounded-xl glass text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-mono text-center text-2xl tracking-widest"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground block mb-2">Display Name</label>
            <input
              type="text"
              value={name}
              onChange={e => { setName(e.target.value); setError(''); }}
              placeholder="Your name"
              maxLength={20}
              className="w-full px-4 py-3 rounded-xl glass text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-destructive text-sm text-center glass rounded-lg px-3 py-2"
            >
              {error}
            </motion.p>
          )}

          <motion.button
            whileHover={{ scale: 1.02, boxShadow: '0 0 25px hsl(170 75% 45% / 0.5)' }}
            whileTap={{ scale: 0.97 }}
            onClick={handleJoin}
            disabled={!code.trim() || !name.trim() || joining}
            className="w-full px-6 py-4 rounded-xl bg-accent text-accent-foreground font-display font-semibold text-lg glow-accent disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
          >
            {joining ? <Loader2 className="w-5 h-5 animate-spin" /> : <Users className="w-5 h-5" />}
            {joining ? 'Joining...' : 'Join Quiz'}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default JoinQuiz;
