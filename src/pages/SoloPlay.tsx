import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useSoloStore } from '@/lib/solo-store';
import { playCorrectSound, playWrongSound, playTickSound, playCountdownUrgent, playTransitionSound } from '@/lib/sounds';
import CircularTimer from '@/components/CircularTimer';
import confetti from 'canvas-confetti';
import { Lock, CheckCircle2, ChevronRight, Lightbulb, Zap } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';

const TIME_PER_QUESTION = 20;

const optionColors = [
  { bg: 'bg-quiz-red', hover: 'hover-quiz-red', glow: 'hsl(var(--quiz-red) / 0.4)' },
  { bg: 'bg-quiz-blue', hover: 'hover-quiz-blue', glow: 'hsl(var(--quiz-blue) / 0.4)' },
  { bg: 'bg-quiz-yellow', hover: 'hover-quiz-yellow', glow: 'hsl(var(--quiz-yellow) / 0.4)' },
  { bg: 'bg-quiz-green', hover: 'hover-quiz-green', glow: 'hsl(var(--quiz-green) / 0.4)' },
];
const optionLabels = ['A', 'B', 'C', 'D'];

const SoloPlay = () => {
  const navigate = useNavigate();
  const questions = useSoloStore(s => s.questions);
  const currentIndex = useSoloStore(s => s.currentIndex);
  const status = useSoloStore(s => s.status);
  const totalScore = useSoloStore(s => s.totalScore);
  const submitAnswer = useSoloStore(s => s.submitAnswer);
  const nextQuestion = useSoloStore(s => s.nextQuestion);
  const getCurrentQuestion = useSoloStore(s => s.getCurrentQuestion);
  const getProgress = useSoloStore(s => s.getProgress);

  const [timeLeft, setTimeLeft] = useState(TIME_PER_QUESTION);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [lockedIn, setLockedIn] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [answerResult, setAnswerResult] = useState<'correct' | 'wrong' | 'timeout' | null>(null);
  const [answerStartTime, setAnswerStartTime] = useState(Date.now());
  const hasSubmittedRef = useRef(false);
  const prevIndexRef = useRef(-1);

  const question = getCurrentQuestion();

  useEffect(() => { if (questions.length === 0) navigate('/solo'); }, [questions.length]);
  useEffect(() => { if (status === 'finished') navigate('/solo/results'); }, [status]);

  useEffect(() => {
    if (currentIndex === prevIndexRef.current) return;
    prevIndexRef.current = currentIndex;
    setSelectedAnswer(null);
    setLockedIn(false);
    setShowResult(false);
    setAnswerResult(null);
    setTimeLeft(TIME_PER_QUESTION);
    setAnswerStartTime(Date.now());
    hasSubmittedRef.current = false;
    playTransitionSound();
  }, [currentIndex]);

  const finalizeAnswer = useCallback((selected: number | null) => {
    if (hasSubmittedRef.current || !question) return;
    hasSubmittedRef.current = true;

    const timeMs = Date.now() - answerStartTime;

    if (selected === null) {
      playWrongSound();
      setAnswerResult('timeout');
      setShowResult(true);
      return;
    }

    const isCorrect = selected === question.correctIndex;
    if (isCorrect) {
      playCorrectSound();
      setAnswerResult('correct');
      confetti({ particleCount: 50, spread: 70, origin: { y: 0.7 }, colors: ['#22c55e', '#10b981', '#a855f7'] });
    } else {
      playWrongSound();
      setAnswerResult('wrong');
    }

    submitAnswer(selected, timeMs);
    setTimeout(() => setShowResult(true), 500);
  }, [question, answerStartTime, submitAnswer]);

  useEffect(() => {
    if (!question || showResult) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          if (!hasSubmittedRef.current) setTimeout(() => finalizeAnswer(selectedAnswer), 0);
          return 0;
        }
        if (prev <= 6 && prev > 1) playCountdownUrgent();
        else if (prev % 5 === 0) playTickSound();
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [currentIndex, showResult, finalizeAnswer, selectedAnswer]);

  const handleSelect = useCallback((index: number) => {
    if (lockedIn || showResult) return;
    setSelectedAnswer(prev => prev === index ? null : index);
  }, [lockedIn, showResult]);

  const handleLockIn = useCallback(() => {
    if (selectedAnswer === null || lockedIn || showResult) return;
    setLockedIn(true);
    finalizeAnswer(selectedAnswer);
  }, [selectedAnswer, lockedIn, showResult, finalizeAnswer]);

  const handleNext = useCallback(() => { nextQuestion(); }, [nextQuestion]);

  if (!question) {
    return (
      <div className="min-h-screen bg-gradient-mesh flex items-center justify-center">
        <div className="w-16 h-16 rounded-2xl bg-secondary animate-pulse" />
      </div>
    );
  }

  const difficultyColor = question.difficulty === 'Easy' ? 'text-accent' : question.difficulty === 'Medium' ? 'text-quiz-yellow' : 'text-destructive';

  return (
    <div className="min-h-screen bg-gradient-mesh relative flex flex-col px-4 py-6">
      <div className="absolute top-4 right-4 z-20"><ThemeToggle /></div>

      {/* Header */}
      <div className="max-w-2xl mx-auto w-full mb-3 relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="text-sm font-mono font-bold text-foreground glass-premium px-3 py-1.5 rounded-xl">
              {currentIndex + 1}<span className="text-muted-foreground">/{questions.length}</span>
            </span>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg glass-premium ${difficultyColor}`}>
              {question.difficulty}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            <motion.span
              key={totalScore}
              initial={{ scale: 1 }}
              animate={{ scale: [1, 1.2, 1] }}
              className="font-mono font-bold text-primary text-lg"
            >
              {totalScore}
            </motion.span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="relative h-2 rounded-full bg-secondary/50 overflow-hidden">
          <motion.div
            animate={{ width: `${getProgress()}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary via-accent to-primary"
            style={{ backgroundSize: '200% 100%', animation: 'gradient-shift 3s ease-in-out infinite' }}
          />
        </div>
      </div>

      {/* Timer */}
      <div className="flex justify-center my-3 relative z-10">
        <CircularTimer timeLeft={timeLeft} totalTime={TIME_PER_QUESTION} size={96} />
      </div>

      {/* Question + Options */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={question.id}
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.97 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="glass-premium rounded-2xl p-6 sm:p-8 mb-6 w-full text-center shadow-premium"
          >
            <h2 className="font-display text-xl sm:text-2xl md:text-3xl font-bold text-foreground leading-tight">
              {question.text}
            </h2>
          </motion.div>
        </AnimatePresence>

        {/* Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
          {question.options.map((option, i) => {
            const isCorrect = i === question.correctIndex;
            const isSelected = selectedAnswer === i;
            let stateClass = '';
            let glowStyle = {};

            if (showResult) {
              if (isCorrect) stateClass = 'ring-2 ring-accent scale-[1.02] glow-correct';
              else if (isSelected && !isCorrect) stateClass = 'animate-shake glow-wrong opacity-70';
              else stateClass = 'opacity-25 scale-[0.97]';
            } else if (isSelected && lockedIn) {
              stateClass = 'ring-2 ring-primary scale-[1.02]';
              glowStyle = { boxShadow: `0 0 25px ${optionColors[i].glow}` };
            } else if (isSelected) {
              stateClass = 'ring-2 ring-foreground/40 scale-[1.02]';
              glowStyle = { boxShadow: `0 0 20px ${optionColors[i].glow}` };
            }

            return (
              <motion.button
                key={`${currentIndex}-${i}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.25 }}
                whileHover={!showResult && !lockedIn ? { scale: 1.03, boxShadow: `0 0 30px ${optionColors[i].glow}` } : {}}
                whileTap={!showResult && !lockedIn ? { scale: 0.96 } : {}}
                onClick={() => handleSelect(i)}
                disabled={showResult || lockedIn}
                style={glowStyle}
                className={`${optionColors[i].bg} ${optionColors[i].hover} ${stateClass} p-4 sm:p-5 rounded-2xl text-left transition-all duration-200 flex items-start gap-3 relative overflow-hidden group`}
              >
                <span className="w-9 h-9 rounded-xl bg-background/20 flex items-center justify-center font-bold text-sm shrink-0 backdrop-blur-sm font-mono">
                  {optionLabels[i]}
                </span>
                <span className="font-medium text-primary-foreground text-base sm:text-lg relative z-10 pt-1">
                  {option}
                </span>
                {isSelected && !showResult && !lockedIn && (
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="ml-auto flex items-center pt-1">
                    <CheckCircle2 className="w-6 h-6 text-primary-foreground" />
                  </motion.span>
                )}
                {isSelected && lockedIn && !showResult && (
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="ml-auto flex items-center pt-1">
                    <Lock className="w-5 h-5 text-primary-foreground" />
                  </motion.span>
                )}
                {showResult && isCorrect && (
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400 }} className="ml-auto text-2xl pt-1">✓</motion.span>
                )}
                {showResult && isSelected && !isCorrect && (
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="ml-auto text-2xl pt-1">✗</motion.span>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Lock In */}
        <AnimatePresence>
          {selectedAnswer !== null && !lockedIn && !showResult && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="mt-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLockIn}
                className="px-10 py-4 rounded-2xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-display font-bold text-lg shadow-premium flex items-center gap-3 mx-auto"
              >
                <Lock className="w-5 h-5" />
                Lock In Answer
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {lockedIn && !showResult && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 text-muted-foreground animate-pulse-glow text-sm text-center">
            Answer locked in!
          </motion.p>
        )}

        {/* Result + Explanation */}
        <AnimatePresence mode="wait">
          {showResult && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-6 w-full max-w-lg mx-auto text-center"
            >
              {answerResult === 'correct' && (
                <motion.p initial={{ scale: 0.8 }} animate={{ scale: [0.8, 1.1, 1] }} className="text-accent font-display text-2xl font-bold mb-3">
                  🎉 Correct!
                </motion.p>
              )}
              {answerResult === 'wrong' && (
                <p className="text-destructive font-display text-2xl font-bold mb-3">✗ Wrong!</p>
              )}
              {answerResult === 'timeout' && (
                <p className="text-muted-foreground font-display text-2xl mb-3">⏱ Time's up!</p>
              )}

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-premium rounded-2xl p-4 mb-5 text-left"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-quiz-yellow/20 flex items-center justify-center shrink-0">
                    <Lightbulb className="w-4 h-4 text-quiz-yellow" />
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{question.explanation}</p>
                </div>
              </motion.div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleNext}
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-display font-semibold flex items-center gap-2 mx-auto shadow-premium"
              >
                <ChevronRight className="w-5 h-5" />
                {currentIndex + 1 >= questions.length ? 'See Results' : 'Next Question'}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SoloPlay;
