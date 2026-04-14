import { useEffect, useState, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Zap, Users, Trophy, Award, BookOpen, ArrowRight, Brain, Timer,
  BarChart3, User, Sparkles, Play, Target, Flame, Shield, Crown,
  ChevronRight, Star, TrendingUp, Globe, Rocket, Gamepad2
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

/* Animated counter */
const useCounter = (target: number, duration = 1800) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const startTime = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
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
    <div className="text-center group">
      <motion.div
        whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
        className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3 transition-shadow group-hover:shadow-glow-primary"
      >
        <Icon className="w-5 h-5 text-primary" />
      </motion.div>
      <p className="font-display text-3xl sm:text-4xl font-bold text-foreground">
        <span ref={ref}>{count.toLocaleString()}{suffix}</span>
      </p>
      <p className="text-xs text-muted-foreground mt-1.5 font-medium">{label}</p>
    </div>
  );
};

/* Action card for main CTAs */
const ActionCard = ({ icon: Icon, title, description, gradient, glowClass, tags, ctaText, ctaColor, onClick }: {
  icon: React.ElementType; title: string; description: string; gradient: string;
  glowClass: string; tags: { icon: React.ElementType; label: string }[];
  ctaText: string; ctaColor: string; onClick: () => void;
}) => (
  <motion.button
    whileHover={{ scale: 1.02, y: -6 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className="glass-premium rounded-2xl p-6 sm:p-7 text-left card-lift group relative overflow-hidden w-full"
  >
    <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
    <div className="relative z-10">
      <div className={`w-13 h-13 rounded-xl bg-gradient-to-br ${glowClass} flex items-center justify-center mb-5 shadow-elevated group-hover:shadow-glow-primary transition-shadow`}>
        <Icon className="w-6 h-6 text-primary-foreground" />
      </div>
      <h3 className="font-display text-xl font-bold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed mb-5">{description}</p>
      <div className="flex flex-wrap gap-1.5 mb-4">
        {tags.map(t => (
          <span key={t.label} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-secondary/60 text-[11px] text-muted-foreground font-medium">
            <t.icon className="w-3 h-3" /> {t.label}
          </span>
        ))}
      </div>
      <div className={`flex items-center gap-1.5 ${ctaColor} text-sm font-semibold`}>
        {ctaText} <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform" />
      </div>
    </div>
  </motion.button>
);

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
            {user && (
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl glass-card text-sm font-medium text-foreground"
              >
                <User className="w-4 h-4 text-primary" />
                <span className="hidden sm:inline">{profile?.display_name || 'Dashboard'}</span>
              </motion.button>
            )}
            <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* ─── Hero ─── */}
      <section className="relative z-10 flex flex-col items-center px-4 pt-16 pb-8 sm:pt-24 sm:pb-14">
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
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-[1.08] mb-5">
            The Knowledge{' '}
            <span className="text-gradient-primary">Arena</span>
          </h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-base sm:text-lg text-muted-foreground mb-12 max-w-xl mx-auto leading-relaxed"
          >
            550+ curated questions · 10 topics · Global leaderboard · XP & badges. Choose your path below.
          </motion.p>
        </motion.div>
      </section>

      {/* ─── Command Center — 3 Action Cards ─── */}
      <section className="relative z-10 px-4 pb-20 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          <ActionCard
            icon={Play}
            title="Play Solo"
            description="Pick a topic and challenge yourself. Earn XP, unlock badges, and climb the leaderboard."
            gradient="from-primary/8 to-neon-purple/4"
            glowClass="from-primary to-neon-purple"
            tags={[
              { icon: Brain, label: '550+ Questions' },
              { icon: Trophy, label: 'Leaderboard' },
            ]}
            ctaText="Start playing"
            ctaColor="text-primary"
            onClick={() => navigate('/solo')}
          />
          <ActionCard
            icon={Zap}
            title="Create Quiz"
            description="Build a custom quiz, get a share code, and challenge friends to compete live."
            gradient="from-neon-purple/8 to-primary/4"
            glowClass="from-neon-purple to-primary"
            tags={[
              { icon: Users, label: 'Multiplayer' },
              { icon: BarChart3, label: 'Live Results' },
            ]}
            ctaText="Create now"
            ctaColor="text-neon-purple"
            onClick={() => navigate('/create')}
          />
          <ActionCard
            icon={Gamepad2}
            title="Join Quiz"
            description="Enter a quiz code to join an existing game and compete against other players."
            gradient="from-accent/8 to-neon-cyan/4"
            glowClass="from-accent to-neon-cyan"
            tags={[
              { icon: Zap, label: 'Instant Join' },
              { icon: Gamepad2, label: 'Real-time' },
            ]}
            ctaText="Join now"
            ctaColor="text-accent"
            onClick={() => navigate('/join')}
          />
        </motion.div>

        {/* Trust signals */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="flex items-center justify-center gap-5 mt-8 text-[11px] text-muted-foreground/60"
        >
          <span className="flex items-center gap-1.5"><Shield className="w-3 h-3" /> No signup</span>
          <span className="w-1 h-1 rounded-full bg-muted-foreground/20" />
          <span className="flex items-center gap-1.5"><Zap className="w-3 h-3" /> Instant play</span>
          <span className="w-1 h-1 rounded-full bg-muted-foreground/20" />
          <span className="flex items-center gap-1.5"><Globe className="w-3 h-3" /> Global leaderboard</span>
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
          <CounterStat value={100} label="Quizzes Played" icon={Trophy} suffix="+" />
          <CounterStat value={50} label="Active Players" icon={Users} suffix="+" />
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
                  whileHover={{ scale: 1.05, y: -2 }}
                  className="glass-card rounded-xl p-4 text-center cursor-default"
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
