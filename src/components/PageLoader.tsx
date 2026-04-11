import { motion } from 'framer-motion';

const PageLoader = () => (
  <div className="min-h-screen bg-gradient-mesh flex items-center justify-center">
    <motion.div
      animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.7, 0.3] }}
      transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
      className="flex flex-col items-center gap-4"
    >
      <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center">
        <div className="w-6 h-6 rounded-lg bg-primary/40 animate-pulse" />
      </div>
      <p className="text-sm text-muted-foreground font-medium">Loading...</p>
    </motion.div>
  </div>
);

export default PageLoader;
