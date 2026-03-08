import { motion } from 'framer-motion';

const particles = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 3 + 1,
  duration: Math.random() * 8 + 6,
  delay: Math.random() * 4,
}));

const FloatingParticles = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
    {particles.map(p => (
      <motion.div
        key={p.id}
        className="absolute rounded-full bg-primary/20"
        style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
        animate={{
          y: [0, -30, 0],
          x: [0, Math.random() * 20 - 10, 0],
          opacity: [0.2, 0.6, 0.2],
        }}
        transition={{
          duration: p.duration,
          repeat: Infinity,
          delay: p.delay,
          ease: 'easeInOut',
        }}
      />
    ))}
    {/* Larger accent orbs */}
    <motion.div
      className="absolute w-72 h-72 rounded-full blur-[120px] bg-primary/10"
      style={{ top: '10%', left: '20%' }}
      animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.15, 0.1] }}
      transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
    />
    <motion.div
      className="absolute w-60 h-60 rounded-full blur-[100px] bg-accent/10"
      style={{ bottom: '15%', right: '15%' }}
      animate={{ scale: [1.1, 0.9, 1.1], opacity: [0.08, 0.12, 0.08] }}
      transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
    />
    <motion.div
      className="absolute w-40 h-40 rounded-full blur-[80px] bg-neon-cyan/8"
      style={{ top: '50%', right: '30%' }}
      animate={{ scale: [0.9, 1.15, 0.9], opacity: [0.05, 0.1, 0.05] }}
      transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
    />
  </div>
);

export default FloatingParticles;
