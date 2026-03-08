import { motion } from 'framer-motion';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizes = {
  sm: { text: 'text-2xl', icon: 'w-7 h-7' },
  md: { text: 'text-4xl', icon: 'w-10 h-10' },
  lg: { text: 'text-6xl sm:text-7xl', icon: 'w-14 h-14' },
  xl: { text: 'text-7xl sm:text-8xl md:text-9xl', icon: 'w-16 h-16' },
};

const Logo = ({ size = 'lg' }: LogoProps) => {
  const s = sizes[size];

  return (
    <div className="inline-flex items-center gap-3">
      <motion.div
        className={`${s.icon} relative`}
        animate={{ rotate: [0, 5, -5, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary to-accent opacity-90" />
        <div className="absolute inset-0 rounded-xl flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="none" className="w-2/3 h-2/3">
            <path d="M12 2L2 7l10 5 10-5-10-5z" fill="white" opacity="0.9" />
            <path d="M2 17l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
            <path d="M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.85" />
          </svg>
        </div>
      </motion.div>
      <h1 className={`font-display ${s.text} font-bold tracking-tight`}>
        Quiz<span className="text-gradient-neon">Whiz</span>
      </h1>
    </div>
  );
};

export default Logo;
