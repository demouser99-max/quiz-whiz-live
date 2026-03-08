import { motion } from 'framer-motion';
import { useGamification } from '@/lib/gamification';
import { Flame, Star, Trophy, Brain } from 'lucide-react';

const PlayerStats = () => {
  const xp = useGamification(s => s.xp);
  const level = useGamification(s => s.level);
  const streak = useGamification(s => s.streak);
  const quizzesPlayed = useGamification(s => s.quizzesPlayed);
  const xpProgress = useGamification(s => s.getXpProgress());
  const xpForNext = useGamification(s => s.getXpForNextLevel());

  if (quizzesPlayed === 0) return null;

  const stats = [
    { icon: Star, label: 'Level', value: level, color: 'text-quiz-yellow' },
    { icon: Flame, label: 'Streak', value: `${streak}d`, color: 'text-quiz-red' },
    { icon: Trophy, label: 'Played', value: quizzesPlayed, color: 'text-primary' },
    { icon: Brain, label: 'XP', value: xp, color: 'text-accent' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="w-full max-w-3xl"
    >
      <div className="glass rounded-2xl p-5">
        <div className="grid grid-cols-4 gap-3 mb-3">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 + i * 0.05 }}
              className="text-center"
            >
              <s.icon className={`w-5 h-5 ${s.color} mx-auto mb-1`} />
              <p className="font-mono font-bold text-foreground text-lg">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* XP Progress bar */}
        <div className="relative h-2 rounded-full bg-secondary overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${xpProgress}%` }}
            transition={{ duration: 1, delay: 0.8, ease: 'easeOut' }}
            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary to-accent"
          />
        </div>
        <p className="text-xs text-muted-foreground mt-1 text-center">
          {Math.round(xpProgress)}% to Level {level + 1} ({xpForNext} XP needed)
        </p>
      </div>
    </motion.div>
  );
};

export default PlayerStats;
