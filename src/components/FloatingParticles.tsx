import { motion } from 'framer-motion';
import { useMemo } from 'react';

const FloatingParticles = () => {
  const particles = useMemo(
    () =>
      Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1,
        duration: Math.random() * 12 + 10,
        delay: Math.random() * 6,
      })),
    [],
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0" aria-hidden>
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-primary/10"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
          animate={{
            y: [0, -50, 0],
            x: [0, Math.random() * 30 - 15, 0],
            opacity: [0.1, 0.4, 0.1],
          }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: 'easeInOut' }}
        />
      ))}

      {/* Large ambient orbs — cinematic depth */}
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full blur-[180px]"
        style={{ top: '-10%', left: '5%', background: 'hsl(265 90% 60% / 0.06)' }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.04, 0.08, 0.04] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full blur-[160px]"
        style={{ bottom: '0%', right: '0%', background: 'hsl(172 70% 48% / 0.05)' }}
        animate={{ scale: [1.1, 0.9, 1.1], opacity: [0.03, 0.07, 0.03] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
      />
      <motion.div
        className="absolute w-[350px] h-[350px] rounded-full blur-[120px]"
        style={{ top: '50%', right: '25%', background: 'hsl(265 92% 68% / 0.04)' }}
        animate={{ scale: [0.9, 1.15, 0.9], opacity: [0.03, 0.06, 0.03] }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut', delay: 6 }}
      />
    </div>
  );
};

export default FloatingParticles;
