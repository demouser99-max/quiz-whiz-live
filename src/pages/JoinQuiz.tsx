import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Users, Loader2 } from 'lucide-react';
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
    if (result.success) {
      navigate(`/lobby/${code.trim().toUpperCase()}`);
    } else {
      setError(result.error || 'Failed to join');
    }
    setJoining(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <h1 className="font-display text-3xl font-bold text-foreground mb-2">Join a Quiz</h1>
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
              className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-mono text-center text-2xl tracking-widest"
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
              className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>

          {error && (
            <p className="text-destructive text-sm text-center">{error}</p>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
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
