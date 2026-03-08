import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { TOPICS, getTopicQuestionCount } from '@/data/questions';
import ThemeToggle from '@/components/ThemeToggle';

const SoloTopicSelect = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background bg-particles flex flex-col items-center px-4 py-8">
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl"
      >
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="w-6 h-6 text-primary" />
            <h1 className="font-display text-4xl font-bold text-gradient">Choose Your Topic</h1>
          </div>
          <p className="text-muted-foreground">Select a category to start your solo quiz challenge</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {TOPICS.map((topic, i) => {
            const count = getTopicQuestionCount(topic.id);
            return (
              <motion.button
                key={topic.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(`/solo/setup/${topic.id}`)}
                className="glass rounded-2xl p-5 text-center transition-all card-3d group relative overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${topic.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
                <span className="text-4xl mb-3 block">{topic.icon}</span>
                <h3 className="font-display font-semibold text-foreground text-sm mb-1">{topic.name}</h3>
                <p className="text-xs text-muted-foreground">{count} questions</p>
              </motion.button>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};

export default SoloTopicSelect;
