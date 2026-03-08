import { forwardRef } from 'react';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle = forwardRef<HTMLButtonElement>((_, ref) => {
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <motion.button
      ref={ref}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.9 }}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="w-10 h-10 rounded-xl glass-card flex items-center justify-center transition-colors hover:border-primary/20"
      aria-label="Toggle theme"
    >
      <AnimatePresence mode="wait">
        {isDark ? (
          <motion.div key="sun" initial={{ rotate: -90, opacity: 0, scale: 0.5 }} animate={{ rotate: 0, opacity: 1, scale: 1 }} exit={{ rotate: 90, opacity: 0, scale: 0.5 }} transition={{ duration: 0.2 }}>
            <Sun className="w-4 h-4 text-quiz-yellow" />
          </motion.div>
        ) : (
          <motion.div key="moon" initial={{ rotate: 90, opacity: 0, scale: 0.5 }} animate={{ rotate: 0, opacity: 1, scale: 1 }} exit={{ rotate: -90, opacity: 0, scale: 0.5 }} transition={{ duration: 0.2 }}>
            <Moon className="w-4 h-4 text-primary" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
});

ThemeToggle.displayName = 'ThemeToggle';

export default ThemeToggle;
