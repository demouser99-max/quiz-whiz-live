import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Play, Loader2, User } from 'lucide-react';
import { TOPICS, getTopicQuestionCount } from '@/data/questions';
import { useSoloStore } from '@/lib/solo-store';
import ThemeToggle from '@/components/ThemeToggle';

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
      <div className="min-h-screen bg-background bg-particles flex items-center justify-center">
        <div className="text-center glass-strong rounded-2xl p-8">
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
    <div className="min-h-screen bg-background bg-particles flex flex-col items-center justify-center px-4">
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <button
          onClick={() => navigate('/solo')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="text-center mb-8">
          <span className="text-5xl mb-3 block">{topic.icon}</span>
          <h1 className="font-display text-3xl font-bold text-gradient">{topic.name}</h1>
          <p className="text-muted-foreground text-sm mt-1">{maxQuestions} questions available</p>
        </div>

        <div className="space-y-6">
          {/* Player name */}
          <div>
            <label className="text-sm font-medium text-foreground block mb-2 flex items-center gap-2">
              <User className="w-4 h-4" /> Your Name
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Enter your nickname"
              maxLength={20}
              className="w-full px-4 py-3 rounded-xl glass text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>

          {/* Question count */}
          <div>
            <label className="text-sm font-medium text-foreground block mb-3">Number of Questions</label>
            <div className="grid grid-cols-5 gap-2">
              {questionCounts.filter(c => c <= maxQuestions).map(c => (
                <motion.button
                  key={c}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCount(c)}
                  className={`py-3 rounded-xl font-display font-bold text-lg transition-all ${
                    count === c
                      ? 'bg-primary text-primary-foreground glow-primary'
                      : 'glass text-foreground hover:bg-secondary/80'
                  }`}
                >
                  {c}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Start button */}
          <motion.button
            whileHover={{ scale: 1.02, boxShadow: '0 0 30px hsl(270 85% 62% / 0.5)' }}
            whileTap={{ scale: 0.97 }}
            onClick={handleStart}
            disabled={!name.trim() || starting}
            className="w-full px-6 py-4 rounded-xl bg-primary text-primary-foreground font-display font-semibold text-lg glow-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
          >
            {starting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
            {starting ? 'Starting...' : 'Start Quiz'}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default SoloSetup;
