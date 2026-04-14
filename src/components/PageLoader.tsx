import { motion } from 'framer-motion';

/** Branded preloader — appears only during real Suspense/data loading, no artificial delays */
const PageLoader = () => (
  <div className="min-h-screen bg-gradient-mesh flex items-center justify-center">
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center gap-6"
    >
      {/* Brand title */}
      <h1 className="font-display text-3xl sm:text-4xl font-bold text-gradient-primary tracking-tight">
        QuizWhiz
      </h1>
      <p className="text-xs text-muted-foreground/70 font-medium -mt-4">
        Online Quiz Platform
      </p>

      {/* Spinner */}
      <div className="relative w-10 h-10">
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-primary/20"
        />
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary"
          animate={{ rotate: 360 }}
          transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
        />
      </div>

      {/* Team credit */}
      <p className="text-[10px] text-muted-foreground/50 font-medium tracking-wide">
        Developed by Team Smart Minds
      </p>
    </motion.div>
  </div>
);

export default PageLoader;
