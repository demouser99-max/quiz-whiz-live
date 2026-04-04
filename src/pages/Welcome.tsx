import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Gamepad2, Trophy, BarChart3, Zap, ArrowRight, Sparkles } from 'lucide-react';
import FloatingParticles from '@/components/FloatingParticles';
import Logo from '@/components/Logo';
import ThemeToggle from '@/components/ThemeToggle';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';

const Welcome = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) navigate('/home');
  }, [user, loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-mesh flex items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-14 h-14 rounded-2xl bg-primary/20"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-mesh relative overflow-hidden flex flex-col">
      <FloatingParticles />

      <nav className="relative z-20 flex items-center justify-between px-6 py-5 max-w-7xl mx-auto w-full">
        <Logo size="sm" />
        <ThemeToggle />
      </nav>

      <section className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center max-w-2xl"
        >
          {/* Status pill */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-10"
          >
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">The Ultimate Quiz Experience</span>
          </motion.div>

          <Logo size="xl" />

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="text-base sm:text-lg text-muted-foreground mt-6 mb-16 max-w-md mx-auto leading-relaxed"
          >
            Challenge yourself across 10 topics, earn XP, unlock badges, and climb the global leaderboard.
          </motion.p>

          {/* Two entry cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-xl mx-auto"
          >
            {/* Create Quiz */}
            <motion.button
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/create')}
              className="glass-premium rounded-2xl p-6 text-left card-lift group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/8 to-accent/4 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-neon-purple flex items-center justify-center mb-5 shadow-glow-primary">
                  <Zap className="w-5 h-5 text-primary-foreground" />
                </div>
                <h3 className="font-display text-lg font-bold text-foreground mb-2">Create Quiz</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                  Build your own quiz, set a code, and invite friends to play together.
                </p>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {[
                    { icon: Trophy, label: 'Compete' },
                    { icon: BarChart3, label: 'Live Results' },
                  ].map(f => (
                    <span key={f.label} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-secondary/60 text-[11px] text-muted-foreground font-medium">
                      <f.icon className="w-3 h-3" /> {f.label}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-1 text-primary text-sm font-semibold">
                  Create now <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </motion.button>

            {/* Join Quiz */}
            <motion.button
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/join')}
              className="glass-premium rounded-2xl p-6 text-left card-lift group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-accent/8 to-neon-cyan/4 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent to-neon-cyan flex items-center justify-center mb-5 shadow-elevated">
                  <Gamepad2 className="w-5 h-5 text-primary-foreground" />
                </div>
                <h3 className="font-display text-lg font-bold text-foreground mb-2">Join Quiz</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                  Enter a quiz code to join an existing game and compete live!
                </p>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {[
                    { icon: Zap, label: 'Instant Join' },
                    { icon: Gamepad2, label: 'Multiplayer' },
                  ].map(f => (
                    <span key={f.label} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-secondary/60 text-[11px] text-muted-foreground font-medium">
                      <f.icon className="w-3 h-3" /> {f.label}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-1 text-accent text-sm font-semibold">
                  Join now <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </motion.button>
          </motion.div>
        </motion.div>
      </section>

      <footer className="relative z-10 text-center pb-6 text-[11px] text-muted-foreground/60 tracking-wide">
        Built with ♥ by Smart Minds · QuizWhiz
      </footer>
    </div>
  );
};

export default Welcome;
