import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Zap, Users, Trophy, Globe, Sparkles, Flame, Star, Award } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import PlayerStats from '@/components/PlayerStats';
import BadgeShowcase from '@/components/BadgeShowcase';
import { useGamification } from '@/lib/gamification';

const Index = () => {
  const navigate = useNavigate();
  const checkStreak = useGamification(s => s.checkStreak);
  const quizzesPlayed = useGamification(s => s.quizzesPlayed);

  useEffect(() => {
    checkStreak();
  }, []);

  return (
    <div className="min-h-screen bg-background bg-particles flex flex-col items-center px-4 py-8 overflow-hidden relative">
      {/* Theme toggle */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 text-center max-w-2xl mt-8"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8"
        >
          <Globe className="w-4 h-4 text-neon-cyan" />
          <span className="text-sm text-muted-foreground">Global real-time competition</span>
          <Sparkles className="w-3 h-3 text-primary" />
        </motion.div>

        <h1 className="font-display text-6xl sm:text-7xl md:text-8xl font-bold mb-6 tracking-tight">
          Quiz<span className="text-gradient-neon">Whiz</span>
        </h1>

        <p className="text-lg sm:text-xl text-muted-foreground mb-12 max-w-md mx-auto">
          Create quizzes, challenge anyone worldwide, and compete in real-time. Fast, fun, and free.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <motion.button
            whileHover={{ scale: 1.03, boxShadow: '0 0 30px hsl(270 85% 62% / 0.5)' }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/create')}
            className="px-8 py-4 rounded-xl bg-primary text-primary-foreground font-display font-semibold text-lg glow-primary flex items-center justify-center gap-2 transition-all"
          >
            <Zap className="w-5 h-5" />
            Create Quiz
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/join')}
            className="px-8 py-4 rounded-xl glass text-foreground font-display font-semibold text-lg hover:border-primary/50 flex items-center justify-center gap-2 transition-all"
          >
            <Users className="w-5 h-5" />
            Join Quiz
          </motion.button>
        </div>
      </motion.div>

      {/* Feature cards */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-4 mt-16 max-w-3xl w-full"
      >
        {[
          { icon: Zap, title: 'Instant Play', desc: 'No signup needed. Just a name and a code.', color: 'text-neon-cyan' },
          { icon: Trophy, title: 'Live Scoring', desc: 'Faster answers earn more points.', color: 'text-quiz-yellow' },
          { icon: Award, title: 'Earn Badges', desc: 'Unlock achievements and climb levels.', color: 'text-primary' },
        ].map((f, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -4, boxShadow: '0 10px 30px hsl(var(--primary) / 0.15)' }}
            className="glass rounded-xl p-6 text-center transition-all card-3d"
          >
            <f.icon className={`w-8 h-8 ${f.color} mx-auto mb-3`} />
            <h3 className="font-display font-semibold text-foreground mb-1">{f.title}</h3>
            <p className="text-sm text-muted-foreground">{f.desc}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Gamification section */}
      {quizzesPlayed > 0 && (
        <div className="relative z-10 mt-12 w-full flex flex-col items-center gap-6">
          <PlayerStats />
          <BadgeShowcase />
        </div>
      )}
    </div>
  );
};

export default Index;
