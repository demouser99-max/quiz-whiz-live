import { motion } from 'framer-motion';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animate?: boolean;
}

const sizes = {
  sm: { text: 'text-xl', icon: 'w-8 h-8', gap: 'gap-2', iconRadius: 'rounded-lg' },
  md: { text: 'text-3xl', icon: 'w-10 h-10', gap: 'gap-2.5', iconRadius: 'rounded-xl' },
  lg: { text: 'text-5xl sm:text-6xl', icon: 'w-13 h-13', gap: 'gap-3', iconRadius: 'rounded-xl' },
  xl: { text: 'text-6xl sm:text-7xl md:text-8xl', icon: 'w-16 h-16', gap: 'gap-3', iconRadius: 'rounded-2xl' },
};

const Logo = ({ size = 'lg', animate = true }: LogoProps) => {
  const s = sizes[size];

  return (
    <div className={`inline-flex items-center ${s.gap}`}>
      <motion.div
        className={`${s.icon} relative`}
        animate={animate ? { rotate: [0, 2, -2, 0] } : undefined}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className={`absolute inset-0 ${s.iconRadius} bg-gradient-to-br from-primary via-neon-purple to-accent shadow-glow-primary`} />
        <div className={`absolute inset-0 ${s.iconRadius} flex items-center justify-center`}>
          <svg viewBox="0 0 24 24" fill="none" className="w-[55%] h-[55%]">
            <path d="M12 2L2 7l10 5 10-5-10-5z" fill="white" opacity="0.95" />
            <path d="M2 17l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
            <path d="M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.85" />
          </svg>
        </div>
      </motion.div>
      <h1 className={`font-display ${s.text} font-bold tracking-tight`}>
        Quiz<span className="text-gradient-primary">Whiz</span>
      </h1>
    </div>
  );
};

export default Logo;
