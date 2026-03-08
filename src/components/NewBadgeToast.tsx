import { motion } from 'framer-motion';
import type { Badge } from '@/lib/gamification';

interface Props {
  badge: Badge;
  onClose: () => void;
}

const NewBadgeToast = ({ badge, onClose }: Props) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 glass-strong rounded-2xl p-4 flex items-center gap-4 glow-primary cursor-pointer"
      onClick={onClose}
    >
      <motion.span
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
        className="text-4xl"
      >
        {badge.icon}
      </motion.span>
      <div>
        <p className="text-xs text-primary font-semibold uppercase tracking-wider">Badge Unlocked!</p>
        <p className="font-display font-bold text-foreground">{badge.name}</p>
        <p className="text-xs text-muted-foreground">{badge.description}</p>
      </div>
    </motion.div>
  );
};

export default NewBadgeToast;
