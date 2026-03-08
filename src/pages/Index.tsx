import { useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useRef } from 'react';
import {
  Zap, Users, Trophy, Award, BookOpen, ArrowRight, Brain, Timer,
  BarChart3, User, Sparkles, Play, Target, Flame, Shield, Crown,
  ChevronRight, Star, TrendingUp, Globe, Rocket
} from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import PlayerStats from '@/components/PlayerStats';
import BadgeShowcase from '@/components/BadgeShowcase';
import FloatingParticles from '@/components/FloatingParticles';
import Logo from '@/components/Logo';
import { useGamification } from '@/lib/gamification';
import { useAuth } from '@/hooks/useAuth';
import { TOPICS, getTopicQuestionCount } from '@/data/questions';

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
};

/* Animated counter hook */
const useCounter = (target: number, duration = 1800) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const startTime = performance.now();
    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, target, duration]);

  return { count, ref };
};

const CounterStat = ({ value, label, icon: Icon, suffix = '' }: { value: number; label: string; icon: React.ElementType; suffix?: string }) => {
  const { count, ref } = useCounter(value);
  return (
    <div className="text-center">
      <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <p className="font-display text-3xl sm:text-4xl font-bold text-foreground">
        <span ref={ref}>{count.toLocaleString()}{suffix}</span>
      </p>
      <p className="text-xs text-muted-foreground mt-1.5 font-medium">{label}</p>
    </div>
  );
};

const Index = () => {
  const navigate = useNavigate();
  const checkStreak = useGamification(s => s.checkStreak);
  const quizzesPlayed = useGamification(s => s.quizzesPlayed);
  const { user, profile } = useAuth();

  useEffect(() => { checkStreak(); }, []);

  return (
    <div className="min-h-screen bg-gradient-mesh relative overflow-hidden">
      <FloatingParticles />

      {/* ─── Sticky Nav ─── */}
      <nav className="sticky top-0 z-30 glass-strong border-b border-border/30">
        <div className="flex items-center justify-between px-6 py-3.5 max-w-7xl mx-auto">
          <Logo size="sm" />
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/solo')}
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold shadow-glow-primary btn-ripple"
            >
              <Play className="w-3.5 h-3.5" /> Start Quiz
            </motion.button>
            {user ? (
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl glass-card text-sm font-medium text-foreground"
              >
                <User className="w-4 h-4 text-primary" />
                <span className="hidden sm:inline">{profile?.display_name || 'Dashboard'}</span>
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => navigate('/auth')}
                className="px-3.5 py-2 rounded-xl glass-card text-sm font-medium text-foreground"
              >
                Sign In
              </motion.button>
            )}
            <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* ─── Hero ─── */}
      <section className="relative z-10 flex flex-col items-center px-4 pt-14 pb-20 sm:pt-20 sm:pb-28">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center max-w-3xl"
        >
          {/* Live pill */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-8"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
            </span>
            <span className="text-xs font-semibold tracking-wide text-muted-foreground">
              {user ? `Playing as ${profile?.display_name}` : '100% Free · No signup required'}
            </span>
          </motion.div>

          {/* Headline */}
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-[1.1] mb-5">
            Test Your Knowledge{' '}
            <span className="text-gradient-primary">in Seconds</span>
          </h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-base sm:text-lg text-muted-foreground mb-10 max-w-xl mx-auto leading-relaxed"
          >
            550+ curated questions across 10 topics. Compete on the global leaderboard, earn XP & badges. Start playing — no signup needed.
          </motion.p>

          {/* Primary CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-3 justify-center"
          >
            <motion.button
              whileHover={{ scale: 1.04, boxShadow: '0 0 40px hsl(265 90% 60% / 0.35)' }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/solo')}
              className="group relative px-10 py-4.5 rounded-2xl bg-gradient-to-r from-primary via-neon-purple to-primary text-primary-foreground font-display font-bold text-lg shadow-glow-primary flex items-center justify-center gap-3 btn-ripple overflow-hidden"
              style={{ backgroundSize: '200% 100%', animation: 'gradient-shift 4s ease-in-out infinite' }}
            >
              <Rocket className="w-5 h-5" />
              Start Quiz Now
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-200" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/join')}
              className="px-8 py-4 rounded-2xl glass-premium text-foreground font-display font-semibold text-lg flex items-center justify-center gap-3 hover:border-primary/20 transition-all"
            >
              <Users className="w-5 h-5 text-accent" />
              Join a Game
            </motion.button>
          </motion.div>

          {/* Quick trust signals */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex items-center justify-center gap-4 mt-8 text-[11px] text-muted-foreground/70"
          >
            <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> No signup</span>
            <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
            <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> Instant play</span>
            <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
            <span className="flex items-center gap-1"><Globe className="w-3 h-3" /> Global leaderboard</span>
          </motion.div>
        </motion.div>
      </section>

      {/* ─── Social Proof / Stats ─── */}
      <section className="relative z-10 px-4 pb-20 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-premium rounded-3xl p-8 sm:p-10 grid grid-cols-2 sm:grid-cols-4 gap-6 shadow-elevated"
        >
          <CounterStat value={550} label="Questions" icon={Brain} suffix="+" />
          <CounterStat value={10} label="Topics" icon={BookOpen} />
          <CounterStat value={1000} label="Quizzes Played" icon={Trophy} suffix="+" />
          <CounterStat value={100} label="Active Players" icon={Users} suffix="+" />
        </motion.div>
      </section>

      {/* ─── Topic Cards ─── */}
      <section className="relative z-10 px-4 pb-20 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-card mb-4"
          >
            <Target className="w-3 h-3 text-accent" />
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Choose Your Challenge</span>
          </motion.div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground">
            Pick a <span className="text-gradient">Topic</span> & Play
          </h2>
          <p className="text-sm text-muted-foreground mt-3 max-w-md mx-auto">
            Each topic has curated questions from Easy to Hard. Questions are randomized every time.
          </p>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4"
        >
          {TOPICS.map((topic) => {
            const count = getTopicQuestionCount(topic.id);
            return (
              <motion.button
                key={topic.id}
                variants={fadeUp}
                whileHover={{ scale: 1.04, y: -6 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => navigate(`/solo/setup/${topic.id}`)}
                className="glass-card rounded-2xl p-5 text-center card-lift group relative overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${topic.color} opacity-0 group-hover:opacity-[0.08] transition-opacity duration-500`} />
                <motion.span
                  className="text-4xl block mb-2.5 relative z-10"
                  whileHover={{ scale: 1.15, rotate: [0, -5, 5, 0] }}
                  transition={{ duration: 0.3 }}
                >
                  {topic.icon}
                </motion.span>
                <h3 className="font-display font-semibold text-foreground text-sm mb-1 relative z-10">{topic.name}</h3>
                <p className="text-[11px] text-muted-foreground relative z-10 font-medium mb-3">{count} questions</p>
                <div className="flex items-center justify-center gap-1 text-primary text-[11px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity relative z-10">
                  Play Now <ChevronRight className="w-3 h-3" />
                </div>
                <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-gradient-to-r ${topic.color} group-hover:w-3/4 transition-all duration-400 rounded-full`} />
              </motion.button>
            );
          })}
        </motion.div>

        {/* Second CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-10"
        >
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/solo')}
            className="px-8 py-3.5 rounded-2xl bg-primary text-primary-foreground font-display font-semibold text-sm shadow-glow-primary inline-flex items-center gap-2 btn-ripple"
          >
            <Play className="w-4 h-4" /> Browse All Topics
          </motion.button>
        </motion.div>
      </section>

      {/* ─── How It Works ─── */}
      <section className="relative z-10 px-4 pb-20 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground">
            Play in <span className="text-gradient">3 Steps</span>
          </h2>
          <p className="text-sm text-muted-foreground mt-2">Start a quiz in under 5 seconds</p>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          {[
            { step: '01', title: 'Pick a Topic', desc: 'Choose from 10 categories covering math, code, AI, and more.', icon: Target, color: 'text-primary' },
            { step: '02', title: 'Answer Questions', desc: 'Race the clock! Faster answers earn bonus points.', icon: Timer, color: 'text-accent' },
            { step: '03', title: 'Climb the Ranks', desc: 'See your score on the global leaderboard & unlock badges.', icon: Crown, color: 'text-gold' },
          ].map((s, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              whileHover={{ y: -4 }}
              className="glass-card rounded-2xl p-6 text-center relative overflow-hidden group"
            >
              <div className="absolute top-3 right-4 font-mono text-5xl font-bold text-muted/30 group-hover:text-primary/10 transition-colors">
                {s.step}
              </div>
              <div className="w-12 h-12 rounded-2xl bg-secondary/80 flex items-center justify-center mx-auto mb-4 relative z-10 group-hover:shadow-glow-primary transition-shadow">
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <h3 className="font-display font-bold text-foreground mb-2 relative z-10">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed relative z-10">{s.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ─── Features / Why QuizWhiz ─── */}
      <section className="relative z-10 px-4 pb-20 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-card mb-4"
          >
            <Sparkles className="w-3 h-3 text-primary" />
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Why QuizWhiz</span>
          </motion.div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground">
            Built for <span className="text-gradient">Learners & Competitors</span>
          </h2>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {[
            { icon: Brain, title: 'Smart Questions', desc: 'Curated with difficulty levels, detailed explanations after each answer.', color: 'text-primary' },
            { icon: Timer, title: 'Timed Challenges', desc: 'Race against the clock — faster answers earn more points.', color: 'text-neon-cyan' },
            { icon: Trophy, title: 'Global Leaderboard', desc: 'Compete worldwide. Your scores persist across sessions.', color: 'text-gold' },
            { icon: Award, title: 'Badges & XP', desc: 'Unlock achievements, build streaks, and level up your profile.', color: 'text-neon-purple' },
            { icon: Flame, title: 'Daily Streaks', desc: 'Play every day to build your streak and earn bonus XP rewards.', color: 'text-destructive' },
            { icon: TrendingUp, title: 'Progress Tracking', desc: 'Track your accuracy, scores, and improvement over time.', color: 'text-accent' },
            { icon: Shield, title: 'No Signup Needed', desc: 'Jump straight into quizzes. Create an account only if you want to.', color: 'text-quiz-blue' },
            { icon: Star, title: 'Difficulty Levels', desc: 'Easy, Medium, and Hard questions so you always have a challenge.', color: 'text-quiz-yellow' },
          ].map((f, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              whileHover={{ y: -4 }}
              className="glass-card rounded-2xl p-5 transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-secondary/80 flex items-center justify-center mb-3.5 group-hover:shadow-glow-primary transition-shadow">
                <f.icon className={`w-5 h-5 ${f.color}`} />
              </div>
              <h3 className="font-display font-semibold text-foreground mb-1 text-[14px]">{f.title}</h3>
              <p className="text-[13px] text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ─── Gamification Teasers ─── */}
      <section className="relative z-10 px-4 pb-20 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-premium rounded-3xl p-8 sm:p-10 shadow-elevated overflow-hidden relative"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/3 pointer-events-none" />
          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-3">
                Earn Rewards as You Play
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                Every quiz you complete earns XP and brings you closer to unlocking rare badges. Build streaks, climb the leaderboard, and challenge friends.
              </p>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/solo')}
                className="px-7 py-3.5 rounded-xl bg-gradient-to-r from-primary to-neon-purple text-primary-foreground font-display font-semibold text-sm shadow-glow-primary inline-flex items-center gap-2 btn-ripple"
              >
                <Rocket className="w-4 h-4" /> Start Earning XP
              </motion.button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: '🏆', title: 'Leaderboards', desc: 'Global rankings' },
                { icon: '🏅', title: 'Badges', desc: '12+ achievements' },
                { icon: '🔥', title: 'Streaks', desc: 'Daily rewards' },
                { icon: '⚡', title: 'XP System', desc: 'Level up' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="glass-card rounded-xl p-4 text-center"
                >
                  <span className="text-2xl block mb-2">{item.icon}</span>
                  <p className="font-display font-semibold text-foreground text-xs">{item.title}</p>
                  <p className="text-[10px] text-muted-foreground">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* ─── Player Stats / Badges (returning users) ─── */}
      {quizzesPlayed > 0 && (
        <section className="relative z-10 pb-20 px-4 flex flex-col items-center gap-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-2"
          >
            <h2 className="font-display text-2xl font-bold text-foreground">Your Progress</h2>
          </motion.div>
          <PlayerStats />
          <BadgeShowcase />
        </section>
      )}

      {/* ─── Final CTA ─── */}
      <section className="relative z-10 px-4 pb-24 max-w-3xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-premium rounded-3xl p-10 shadow-elevated gradient-border overflow-hidden relative"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/8 to-neon-purple/5 pointer-events-none" />
          <div className="relative z-10">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-3">
              Ready to Challenge Yourself?
            </h2>
            <p className="text-sm text-muted-foreground mb-8 max-w-md mx-auto">
              Pick a topic and start your first quiz in seconds. It's completely free — no signup required.
            </p>
            <motion.button
              whileHover={{ scale: 1.04, boxShadow: '0 0 50px hsl(265 90% 60% / 0.4)' }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/solo')}
              className="px-12 py-5 rounded-2xl bg-gradient-to-r from-primary via-neon-purple to-primary text-primary-foreground font-display font-bold text-lg shadow-glow-primary inline-flex items-center gap-3 btn-ripple"
              style={{ backgroundSize: '200% 100%', animation: 'gradient-shift 4s ease-in-out infinite' }}
            >
              <Play className="w-5 h-5" />
              Start Quiz Now
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </div>
        </motion.div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="relative z-10 text-center pb-8 text-[11px] text-muted-foreground/50 tracking-wide">
        Built with ♥ by Smart Minds · QuizWhiz
      </footer>
    </div>
  );
};

export default Index;
