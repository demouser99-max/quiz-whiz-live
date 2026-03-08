import { motion } from 'framer-motion';

interface CircularTimerProps {
  timeLeft: number;
  totalTime: number;
  size?: number;
}

const CircularTimer = ({ timeLeft, totalTime, size = 100 }: CircularTimerProps) => {
  const progress = timeLeft / totalTime;
  const radius = (size - 10) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  const getColor = () => {
    if (progress > 0.5) return 'hsl(var(--accent))';
    if (progress > 0.25) return 'hsl(var(--quiz-yellow))';
    return 'hsl(var(--destructive))';
  };

  const getGlowColor = () => {
    if (progress > 0.5) return 'hsl(var(--accent) / 0.5)';
    if (progress > 0.25) return 'hsl(var(--quiz-yellow) / 0.5)';
    return 'hsl(var(--destructive) / 0.5)';
  };

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Outer pulse ring when time is low */}
      {timeLeft <= 5 && (
        <motion.div
          className="absolute inset-[-4px] rounded-full border-2 border-destructive/30"
          animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      )}

      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--secondary))"
          strokeWidth="5"
          opacity="0.5"
        />
        {/* Progress arc */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getColor()}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{
            filter: `drop-shadow(0 0 10px ${getGlowColor()})`,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.span
          key={timeLeft}
          initial={{ scale: 1.3, opacity: 0.6 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className={`font-mono text-2xl font-bold ${
            timeLeft <= 5 ? 'text-destructive' : 'text-foreground'
          }`}
        >
          {timeLeft}
        </motion.span>
      </div>
    </div>
  );
};

export default CircularTimer;
