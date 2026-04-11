import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { TOPICS, getTopicQuestionCount } from '@/data/questions';
import ThemeToggle from '@/components/ThemeToggle';
import FloatingParticles from '@/components/FloatingParticles';

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 28, scale: 0.92 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } },
};

const SoloTopicSelect = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-mesh relative overflow-hidden">
      <FloatingParticles />

      <nav className="relative z-20 flex items-center justify-between px-6 py-5 max-w-7xl mx-auto">
        <button
          onClick={() => navigate('/home')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <ThemeToggle />
      </nav>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 px-4 pb-16 max-w-5xl mx-auto"
      >
        <div className="text-center mb-12 mt-2">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6"
          >
            <span className="text-xs font-semibold text-muted-foreground tracking-wide">🎯 SOLO CHALLENGE</span>
          </motion.div>
          <h1 className="font-display text-3xl sm:text-5xl font-bold">
            Choose Your <span className="text-gradient">Topic</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-3 max-w-md mx-auto">
            Select a category to begin. Questions are randomized every time.
          </p>
        </div>

        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4"
        >
          {TOPICS.map((topic) => {
            const count = getTopicQuestionCount(topic.id);
            return (
              <motion.button
                key={topic.id}
                variants={fadeUp}
                whileHover={{ scale: 1.05, y: -6 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => navigate(`/solo/setup/${topic.id}`)}
                className="glass-card rounded-2xl p-6 text-center card-lift group relative overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${topic.color} opacity-0 group-hover:opacity-[0.06] transition-opacity duration-500`} />
                <motion.span
                  className="text-4xl sm:text-5xl block mb-3 relative z-10"
                  whileHover={{ scale: 1.1, rotate: [0, -4, 4, 0] }}
                  transition={{ duration: 0.3 }}
                >
                  {topic.icon}
                </motion.span>
                <h3 className="font-display font-semibold text-foreground text-sm mb-1 relative z-10">{topic.name}</h3>
                <p className="text-[11px] text-muted-foreground relative z-10 font-medium">{count} questions</p>
                <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r ${topic.color} group-hover:w-2/3 transition-all duration-400 rounded-full`} />
              </motion.button>
            );
          })}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default SoloTopicSelect;
