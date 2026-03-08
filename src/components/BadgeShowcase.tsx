import { motion } from 'framer-motion';
import { useGamification, BADGE_DEFINITIONS } from '@/lib/gamification';
import { Lock } from 'lucide-react';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};
const item = { hidden: { opacity: 0, scale: 0.8 }, show: { opacity: 1, scale: 1 } };

const BadgeShowcase = () => {
  const badges = useGamification(s => s.badges);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8 }}
      className="w-full max-w-3xl"
    >
      <h3 className="font-display text-sm font-semibold text-foreground mb-3 text-center">Achievements</h3>
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-4 sm:grid-cols-6 gap-2"
      >
        {BADGE_DEFINITIONS.map((def) => {
          const unlocked = badges.find(b => b.id === def.id);
          return (
            <motion.div
              key={def.id}
              variants={item}
              whileHover={{ scale: 1.12 }}
              className={`relative flex flex-col items-center p-3 rounded-2xl transition-all ${
                unlocked ? 'glass-premium' : 'opacity-25'
              }`}
              title={`${def.name}: ${def.description}`}
            >
              <span className="text-2xl mb-1.5">{def.icon}</span>
              <span className="text-[10px] text-muted-foreground text-center leading-tight font-medium">{def.name}</span>
              {!unlocked && (
                <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-muted flex items-center justify-center">
                  <Lock className="w-2.5 h-2.5 text-muted-foreground" />
                </div>
              )}
            </motion.div>
          );
        })}
      </motion.div>
    </motion.div>
  );
};

export default BadgeShowcase;
