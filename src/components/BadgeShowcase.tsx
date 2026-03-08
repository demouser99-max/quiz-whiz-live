import { motion, AnimatePresence } from 'framer-motion';
import { useGamification, BADGE_DEFINITIONS } from '@/lib/gamification';
import { Lock } from 'lucide-react';

const BadgeShowcase = () => {
  const badges = useGamification(s => s.badges);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8 }}
      className="w-full max-w-3xl"
    >
      <h3 className="font-display text-lg font-semibold text-foreground mb-3 text-center">Badges</h3>
      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
        {BADGE_DEFINITIONS.map((def) => {
          const unlocked = badges.find(b => b.id === def.id);
          return (
            <motion.div
              key={def.id}
              whileHover={{ scale: 1.1 }}
              className={`relative flex flex-col items-center p-2 rounded-xl transition-all ${
                unlocked ? 'glass' : 'opacity-30'
              }`}
              title={`${def.name}: ${def.description}`}
            >
              <span className="text-2xl mb-1">{def.icon}</span>
              <span className="text-[10px] text-muted-foreground text-center leading-tight">{def.name}</span>
              {!unlocked && (
                <Lock className="w-3 h-3 text-muted-foreground absolute top-1 right-1" />
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default BadgeShowcase;
