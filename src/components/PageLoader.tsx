import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

const PageLoader = () => {
  const [phase, setPhase] = useState<'loading' | 'exit'>('loading');

  return (
    <AnimatePresence>
      {phase === 'loading' && (
        <motion.div
          key="loader"
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[200] bg-background flex items-center justify-center overflow-hidden"
        >
          {/* Ambient orbs */}
          <div className="absolute inset-0 pointer-events-none">
            <motion.div
              className="absolute w-[600px] h-[600px] rounded-full blur-[180px]"
              style={{ top: '-15%', left: '20%', background: 'hsl(265 90% 60% / 0.12)' }}
              animate={{ scale: [1, 1.2, 1], opacity: [0.08, 0.15, 0.08] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute w-[400px] h-[400px] rounded-full blur-[140px]"
              style={{ bottom: '0%', right: '10%', background: 'hsl(172 70% 48% / 0.08)' }}
              animate={{ scale: [1.1, 0.9, 1.1], opacity: [0.06, 0.12, 0.06] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            />
          </div>

          <div className="relative z-10 flex flex-col items-center gap-8">
            {/* Logo icon */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="relative"
            >
              <motion.div
                className="absolute inset-[-20px] rounded-full"
                style={{ background: 'radial-gradient(circle, hsl(265 90% 60% / 0.2), transparent 70%)' }}
                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.2, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary via-neon-purple to-accent shadow-glow-primary flex items-center justify-center relative">
                <svg viewBox="0 0 24 24" fill="none" className="w-[55%] h-[55%]">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" fill="white" opacity="0.95" />
                  <path d="M2 17l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
                  <path d="M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.85" />
                </svg>
              </div>
            </motion.div>

            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-center"
            >
              <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
                Quiz<span className="text-gradient-primary">Whiz</span>
              </h1>
              <p className="text-xs text-muted-foreground/60 font-medium mt-1.5 tracking-wide">
                Online Quiz Platform
              </p>
            </motion.div>

            {/* Intelligent loader — 3 morphing dots */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex items-center gap-2"
            >
              {[0, 1, 2].map(i => (
                <motion.div
                  key={i}
                  className="w-2 h-2 rounded-full bg-primary"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.3, 1, 0.3],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.15,
                    ease: 'easeInOut',
                  }}
                />
              ))}
            </motion.div>

            {/* Team credit */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-[10px] text-muted-foreground/40 font-medium tracking-widest uppercase"
            >
              Developed by Team Smart Minds
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PageLoader;
