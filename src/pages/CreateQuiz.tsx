import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Zap, Loader2, Sparkles, ChevronRight } from 'lucide-react';
import { useQuizStore } from '@/lib/quiz-store';
import { TOPICS } from '@/data/questions';
import { toast } from 'sonner';

const CreateQuiz = () => {
  const navigate = useNavigate();
  const createQuiz = useQuizStore(s => s.createQuiz);
  const [title, setTitle] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [numQuestions, setNumQuestions] = useState(10);
  const [timePerQuestion, setTimePerQuestion] = useState(20);
  const [creating, setCreating] = useState(false);
  const [step, setStep] = useState<'topic' | 'settings'>('topic');

  const handleCreate = async () => {
    if (!title.trim() || !selectedTopic || creating) return;
    setCreating(true);
    try {
      const code = await createQuiz(title.trim(), numQuestions, timePerQuestion, selectedTopic);
      navigate(`/lobby/${code}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to create quiz');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background bg-particles flex flex-col items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <button
          onClick={() => step === 'settings' ? setStep('topic') : navigate('/home')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> {step === 'settings' ? 'Change Subject' : 'Back'}
        </button>

        {step === 'topic' ? (
          /* ─── Step 1: Subject Selection ─── */
          <motion.div key="topic" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <h1 className="font-display text-3xl font-bold text-gradient">Select Subject</h1>
            </div>
            <p className="text-muted-foreground mb-6">Choose a topic for your quiz questions.</p>

            <div className="grid grid-cols-2 gap-3">
              {TOPICS.map((topic) => (
                <motion.button
                  key={topic.id}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    setSelectedTopic(topic.id);
                    if (!title.trim()) setTitle(`${topic.name} Quiz`);
                    setStep('settings');
                  }}
                  className={`glass-card rounded-xl p-4 text-center group transition-all ${
                    selectedTopic === topic.id ? 'ring-2 ring-primary' : ''
                  }`}
                >
                  <span className="text-3xl block mb-2">{topic.icon}</span>
                  <h3 className="font-display font-semibold text-foreground text-sm">{topic.name}</h3>
                </motion.button>
              ))}
            </div>
          </motion.div>
        ) : (
          /* ─── Step 2: Quiz Settings ─── */
          <motion.div key="settings" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <h1 className="font-display text-3xl font-bold text-gradient">Create a Quiz</h1>
            </div>
            <p className="text-muted-foreground mb-2">
              Subject: <span className="text-primary font-semibold">{TOPICS.find(t => t.id === selectedTopic)?.name}</span>
            </p>
            <p className="text-muted-foreground mb-8">Set up your quiz and invite players worldwide.</p>

            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">Quiz Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Tech Trivia Night"
                  className="w-full px-4 py-3 rounded-xl glass text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground block mb-2">
                  Number of Questions: <span className="text-primary font-mono">{numQuestions}</span>
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
                  Time per Question: <span className="text-primary font-mono">{timePerQuestion}s</span>
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
                whileHover={{ scale: 1.02, boxShadow: '0 0 30px hsl(270 85% 62% / 0.5)' }}
                whileTap={{ scale: 0.97 }}
                onClick={handleCreate}
                disabled={!title.trim() || creating}
                className="w-full px-6 py-4 rounded-xl bg-primary text-primary-foreground font-display font-semibold text-lg glow-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
              >
                {creating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
                {creating ? 'Creating...' : 'Create Quiz'}
              </motion.button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default CreateQuiz;
