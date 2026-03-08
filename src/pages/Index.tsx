import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Zap, Users, Trophy, Sparkles, Award, BookOpen, ArrowRight, Brain, Timer, BarChart3 } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import PlayerStats from '@/components/PlayerStats';
import BadgeShowcase from '@/components/BadgeShowcase';
import FloatingParticles from '@/components/FloatingParticles';
import Logo from '@/components/Logo';
import { useGamification } from '@/lib/gamification';
import { TOPICS } from '@/data/questions';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const Index = () => {
  const navigate = useNavigate();
  const checkStreak = useGamification(s => s.checkStreak);
  const quizzesPlayed = useGamification(s => s.quizzesPlayed);

  useEffect(() => { checkStreak(); }, []);

  return (
    <div className="min-h-screen bg-gradient-mesh relative overflow-hidden">
      <FloatingParticles />

      {/* Nav bar */}
      <nav className="relative z-20 flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <Logo size="sm" />
        <ThemeToggle />
      </nav>

      {/* Hero section */}
      <section className="relative z-10 flex flex-col items-center px-4 pt-12 pb-20 sm:pt-20 sm:pb-28">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-center max-w-3xl"
        >
          {/* Pill badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-premium mb-8"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
            </span>
            <span className="text-sm font-medium text-muted-foreground">Free · No signup · Play instantly</span>
          </motion.div>

          <Logo size="xl" />

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-lg sm:text-xl text-muted-foreground mt-6 mb-12 max-w-lg mx-auto leading-relaxed"
          >
            The ultimate quiz platform. Pick a topic, challenge yourself, and climb the global leaderboard.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-3 justify-center"
          >
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/solo')}
              className="group px-8 py-4 rounded-2xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-display font-semibold text-lg shadow-premium flex items-center justify-center gap-3 transition-all"
            >
              <BookOpen className="w-5 h-5" />
              Start Playing
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/create')}
              className="px-8 py-4 rounded-2xl glass-premium text-foreground font-display font-semibold text-lg flex items-center justify-center gap-3 transition-all hover:border-primary/30"
            >
              <Zap className="w-5 h-5 text-primary" />
              Create Quiz
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/join')}
              className="px-8 py-4 rounded-2xl glass-premium text-foreground font-display font-semibold text-lg flex items-center justify-center gap-3 transition-all hover:border-accent/30"
            >
              <Users className="w-5 h-5 text-accent" />
              Join Quiz
            </motion.button>
          </motion.div>
        </motion.div>
      </section>

      {/* Topics preview */}
      <section className="relative z-10 px-4 pb-16 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
            10 Topics. <span className="text-gradient">250+ Questions.</span>
          </h2>
          <p className="text-muted-foreground mt-2">Pick your area of expertise and prove your knowledge</p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-2 sm:grid-cols-5 gap-3"
        >
          {TOPICS.map((topic) => (
            <motion.button
              key={topic.id}
              variants={item}
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(`/solo/setup/${topic.id}`)}
              className="glass-premium rounded-2xl p-4 text-center card-lift group"
            >
              <span className="text-3xl block mb-2 group-hover:animate-float">{topic.icon}</span>
              <span className="text-xs font-semibold text-foreground">{topic.name}</span>
            </motion.button>
          ))}
        </motion.div>
      </section>

      {/* Feature cards */}
      <section className="relative z-10 px-4 pb-20 max-w-5xl mx-auto">
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {[
            { icon: Brain, title: 'Smart Questions', desc: 'Curated questions with difficulty levels and detailed explanations.', color: 'text-primary' },
            { icon: Timer, title: 'Timed Challenges', desc: 'Race against the clock. Faster answers earn more points.', color: 'text-neon-cyan' },
            { icon: Trophy, title: 'Global Leaderboard', desc: 'Compete worldwide. Your scores persist across sessions.', color: 'text-gold' },
            { icon: Award, title: 'Badges & XP', desc: 'Unlock achievements, earn XP, and level up your profile.', color: 'text-neon-purple' },
          ].map((f, i) => (
            <motion.div
              key={i}
              variants={item}
              whileHover={{ y: -6 }}
              className="glass-premium rounded-2xl p-6 transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-4 group-hover:shadow-glow-primary transition-shadow">
                <f.icon className={`w-6 h-6 ${f.color}`} />
              </div>
              <h3 className="font-display font-semibold text-foreground mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Gamification section */}
      {quizzesPlayed > 0 && (
        <section className="relative z-10 pb-20 px-4 flex flex-col items-center gap-6">
          <PlayerStats />
          <BadgeShowcase />
        </section>
      )}

      {/* Footer */}
      <footer className="relative z-10 text-center pb-8 text-xs text-muted-foreground">
        Built with ♥ by Smart Minds · QuizWhiz
      </footer>
    </div>
  );
};

export default Index;
