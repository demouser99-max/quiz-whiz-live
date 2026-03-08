import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Play, Loader2, User, Hash, Sparkles } from 'lucide-react';
import { TOPICS, getTopicQuestionCount } from '@/data/questions';
import { useSoloStore } from '@/lib/solo-store';
import ThemeToggle from '@/components/ThemeToggle';
import FloatingParticles from '@/components/FloatingParticles';

const questionCounts = [5, 10, 15, 20, 25];

const SoloSetup = () => {
  const navigate = useNavigate();
  const { topic: topicId } = useParams();
  const setPlayerName = useSoloStore(s => s.setPlayerName);
  const startQuiz = useSoloStore(s => s.startQuiz);
  const storedName = useSoloStore(s => s.playerName);

  const [name, setName] = useState(storedName || '');
  const [count, setCount] = useState(10);
  const [starting, setStarting] = useState(false);

  const topic = TOPICS.find(t => t.id === topicId);
  const maxQuestions = topicId ? getTopicQuestionCount(topicId) : 0;

  if (!topic) {
    return (
      <div className="min-h-screen bg-gradient-mesh flex items-center justify-center">
        <div className="text-center glass-premium rounded-2xl p-8">
          <h2 className="font-display text-2xl font-bold text-foreground mb-4">Topic not found</h2>
          <button onClick={() => navigate('/solo')} className="text-primary underline">Go back</button>
        </div>
      </div>
    );
  }

  const handleStart = () => {
    if (!name.trim() || starting) return;
    setStarting(true);
    setPlayerName(name.trim());
    startQuiz(topicId!, Math.min(count, maxQuestions));
    navigate('/solo/play');
  };

  return (
    <div className="min-h-screen bg-gradient-mesh relative overflow-hidden flex flex-col items-center justify-center px-4">
      <FloatingParticles />

      <div className="absolute top-4 left-6 z-20">
        <button
          onClick={() => navigate('/solo')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
      </div>
      <div className="absolute top-4 right-6 z-20">
        <ThemeToggle />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-10">
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, delay: 0.1 }}
            className="text-6xl block mb-4"
          >
            {topic.icon}
          </motion.span>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-gradient">{topic.name}</h1>
          <p className="text-muted-foreground text-sm mt-2">{maxQuestions} questions available</p>
        </div>

        <div className="space-y-8">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <label className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
              <User className="w-4 h-4 text-primary" /> Player Name
            </label>
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Enter your nickname"
                maxLength={20}
                className="w-full px-5 py-4 rounded-2xl glass-premium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all text-lg"
              />
              {name.trim() && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute right-4 top-1/2 -translate-y-1/2">
                  <Sparkles className="w-5 h-5 text-accent" />
                </motion.div>
              )}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
            <label className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Hash className="w-4 h-4 text-accent" /> Questions
            </label>
            <div className="grid grid-cols-5 gap-2">
              {questionCounts.filter(c => c <= maxQuestions).map(c => (
                <motion.button
                  key={c}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => setCount(c)}
                  className={`py-3.5 rounded-xl font-display font-bold text-lg transition-all ${
                    count === c
                      ? 'bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-premium'
                      : 'glass-premium text-foreground hover:border-primary/30'
                  }`}
                >
                  {c}
                </motion.button>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleStart}
              disabled={!name.trim() || starting}
              className="w-full px-6 py-5 rounded-2xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-display font-bold text-xl shadow-premium disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-3 transition-all"
            >
              {starting ? <Loader2 className="w-6 h-6 animate-spin" /> : <Play className="w-6 h-6" />}
              {starting ? 'Loading...' : 'Start Quiz'}
            </motion.button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default SoloSetup;
