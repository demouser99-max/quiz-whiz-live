import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Zap, Loader2 } from 'lucide-react';
import { useQuizStore } from '@/lib/quiz-store';
import { toast } from 'sonner';

const CreateQuiz = () => {
  const navigate = useNavigate();
  const createQuiz = useQuizStore(s => s.createQuiz);
  const [title, setTitle] = useState('');
  const [numQuestions, setNumQuestions] = useState(10);
  const [timePerQuestion, setTimePerQuestion] = useState(20);
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!title.trim() || creating) return;
    setCreating(true);
    try {
      const code = await createQuiz(title.trim(), numQuestions, timePerQuestion);
      navigate(`/lobby/${code}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to create quiz');
    } finally {
      setCreating(false);
    }
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

        <h1 className="font-display text-3xl font-bold text-foreground mb-2">Create a Quiz</h1>
        <p className="text-muted-foreground mb-8">Set up your quiz and invite players.</p>

        <div className="space-y-6">
          <div>
            <label className="text-sm font-medium text-foreground block mb-2">Quiz Title</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Tech Trivia Night"
              className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground block mb-2">
              Number of Questions: <span className="text-primary">{numQuestions}</span>
            </label>
            <input
              type="range"
              min={5}
              max={30}
              value={numQuestions}
              onChange={e => setNumQuestions(Number(e.target.value))}
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>5</span><span>30</span>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground block mb-2">
              Time per Question: <span className="text-primary">{timePerQuestion}s</span>
            </label>
            <input
              type="range"
              min={10}
              max={60}
              step={5}
              value={timePerQuestion}
              onChange={e => setTimePerQuestion(Number(e.target.value))}
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>10s</span><span>60s</span>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCreate}
            disabled={!title.trim() || creating}
            className="w-full px-6 py-4 rounded-xl bg-primary text-primary-foreground font-display font-semibold text-lg glow-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
          >
            {creating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
            {creating ? 'Creating...' : 'Create Quiz'}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default CreateQuiz;
