import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuizStore } from '@/lib/quiz-store';
import { playCorrectSound, playWrongSound, playTickSound, playCountdownUrgent, playTransitionSound } from '@/lib/sounds';
import CircularTimer from '@/components/CircularTimer';
import confetti from 'canvas-confetti';
import { Square, Sparkles, CheckCircle2 } from 'lucide-react';

const optionColors = [
  { bg: 'bg-quiz-red', hover: 'hover-quiz-red', glow: 'hsl(var(--quiz-red) / 0.4)' },
  { bg: 'bg-quiz-blue', hover: 'hover-quiz-blue', glow: 'hsl(var(--quiz-blue) / 0.4)' },
  { bg: 'bg-quiz-yellow', hover: 'hover-quiz-yellow', glow: 'hsl(var(--quiz-yellow) / 0.4)' },
  { bg: 'bg-quiz-green', hover: 'hover-quiz-green', glow: 'hsl(var(--quiz-green) / 0.4)' },
];

const optionIcons = ['◆', '●', '▲', '★'];

const FEEDBACK_DELAY_MS = 1200;

const QuizPlay = () => {
  const navigate = useNavigate();
  const { code } = useParams();

  const quiz = useQuizStore(s => s.quiz);
  const sessionId = useQuizStore(s => s.sessionId);
  const fetchQuiz = useQuizStore(s => s.fetchQuiz);
  const submitAnswer = useQuizStore(s => s.submitAnswer);
  const endQuiz = useQuizStore(s => s.endQuiz);
  const subscribeToQuiz = useQuizStore(s => s.subscribeToQuiz);

  // Independent local question index per player
  const [localIndex, setLocalIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answerStartTime, setAnswerStartTime] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [answerResult, setAnswerResult] = useState<'correct' | 'wrong' | 'timeout' | null>(null);
  const [finished, setFinished] = useState(false);
  const hasSubmittedRef = useRef(false);
  const prevIndexRef = useRef(-1);

  const myPlayer = quiz?.players.find(p => p.sessionId === sessionId);
  const isHost = myPlayer?.isHost;
  const question = quiz?.questions[localIndex] ?? null;
  const totalQuestions = quiz?.questions.length ?? 0;

  // Fetch quiz data on mount
  useEffect(() => {
    if (code) fetchQuiz(code);
  }, [code]);

  // Subscribe to realtime (for status changes like host ending quiz)
  useEffect(() => {
    if (quiz?.id) {
      const unsubscribe = subscribeToQuiz(quiz.id);
      return unsubscribe;
    }
  }, [quiz?.id]);

  // If host ends quiz or status becomes results, navigate
  useEffect(() => {
    if (quiz?.status === 'results') {
      navigate(`/results/${code}`);
    }
  }, [quiz?.status, navigate, code]);

  // Reset state when localIndex changes
  useEffect(() => {
    if (localIndex === prevIndexRef.current) return;
    prevIndexRef.current = localIndex;

    if (quiz && localIndex < totalQuestions) {
      setSelectedAnswer(null);
      setShowResult(false);
      setAnswerResult(null);
      setTimeLeft(quiz.timePerQuestion);
      setAnswerStartTime(Date.now());
      hasSubmittedRef.current = false;
      playTransitionSound();
    }
  }, [localIndex, quiz?.timePerQuestion, totalQuestions]);

  // Auto-advance after showing feedback
  const advanceToNext = useCallback(() => {
    const nextIdx = localIndex + 1;
    if (nextIdx >= totalQuestions) {
      setFinished(true);
      // Navigate this player to results without ending the quiz for others
      if (code) {
        fetchQuiz(code).then(() => navigate(`/results/${code}`));
      }
    } else {
      setLocalIndex(nextIdx);
    }
  }, [localIndex, totalQuestions, code, fetchQuiz, navigate]);

  // Finalize answer (on select or timeout)
  const finalizeAnswer = useCallback(async (selected: number | null) => {
    if (hasSubmittedRef.current || !question) return;
    hasSubmittedRef.current = true;

    const timeMs = Date.now() - answerStartTime;

    if (selected === null) {
      playWrongSound();
      setAnswerResult('timeout');
      setShowResult(true);
      setTimeout(advanceToNext, FEEDBACK_DELAY_MS);
      return;
    }

    const isCorrect = selected === question.correctIndex;
    if (isCorrect) {
      playCorrectSound();
      setAnswerResult('correct');
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 }, colors: ['#22c55e', '#10b981', '#34d399'] });
    } else {
      playWrongSound();
      setAnswerResult('wrong');
    }

    await submitAnswer(question.id, selected, timeMs);
    setShowResult(true);

    // Auto-advance after brief feedback
    setTimeout(advanceToNext, FEEDBACK_DELAY_MS);
  }, [question, answerStartTime, submitAnswer, advanceToNext]);

  // Timer countdown
  useEffect(() => {
    if (!quiz || !question || showResult || finished || localIndex >= totalQuestions) return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          if (!hasSubmittedRef.current) {
            setTimeout(() => finalizeAnswer(selectedAnswer), 0);
          }
          return 0;
        }
        if (prev <= 6 && prev > 1) playCountdownUrgent();
        else if (prev % 5 === 0) playTickSound();
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [localIndex, showResult, finished, finalizeAnswer, selectedAnswer]);

  // Click an option = instant lock-in and submit
  const handleSelect = useCallback((index: number) => {
    if (showResult || hasSubmittedRef.current) return;
    setSelectedAnswer(index);
    finalizeAnswer(index);
  }, [showResult, finalizeAnswer]);

  // Loading
  if (!quiz || !question) {
    return (
      <div className="min-h-screen bg-background bg-particles flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-secondary animate-pulse" />
          <div className="w-48 h-4 rounded-full bg-secondary animate-pulse" />
          <div className="w-32 h-4 rounded-full bg-secondary animate-pulse" />
        </div>
      </div>
    );
  }

  if (finished) {
    return (
      <div className="min-h-screen bg-background bg-particles flex items-center justify-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <Sparkles className="w-10 h-10 text-primary mx-auto mb-4" />
          <p className="font-display text-2xl font-bold text-foreground">Quiz Complete!</p>
          <p className="text-muted-foreground mt-2">Loading results...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background bg-particles flex flex-col px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-2 max-w-2xl mx-auto w-full">
        <motion.span
          key={localIndex}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-sm font-medium text-muted-foreground glass px-3 py-1 rounded-full"
        >
          {localIndex + 1} / {totalQuestions}
        </motion.span>
        <span className="text-xs px-3 py-1 rounded-full glass text-neon-cyan font-medium">
          {question.category}
        </span>
        {isHost && (
          <button onClick={() => endQuiz()} className="text-xs text-destructive hover:text-destructive/80 flex items-center gap-1 glass px-3 py-1 rounded-full transition-colors">
            <Square className="w-3 h-3" /> End
          </button>
        )}
      </div>

      {/* Timer */}
      <div className="flex justify-center my-4">
        <CircularTimer timeLeft={timeLeft} totalTime={quiz.timePerQuestion} size={90} />
      </div>

      {/* Question */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={question.id}
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.97 }}
            transition={{ duration: 0.25 }}
            className="glass-strong rounded-2xl p-6 sm:p-8 mb-8 w-full text-center card-3d"
          >
            <Sparkles className="w-5 h-5 text-primary mx-auto mb-3 opacity-60" />
            <h2 className="font-display text-xl sm:text-2xl md:text-3xl font-bold text-foreground leading-tight">
              {question.text}
            </h2>
          </motion.div>
        </AnimatePresence>

        {/* Options - click to instantly answer */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
          {question.options.map((option, i) => {
            const isCorrect = i === question.correctIndex;
            const isSelected = selectedAnswer === i;
            let stateClass = '';
            let glowStyle = {};

            if (showResult) {
              if (isCorrect) {
                stateClass = 'ring-2 ring-accent scale-[1.02] glow-correct';
              } else if (isSelected && !isCorrect) {
                stateClass = 'animate-shake glow-wrong opacity-70';
              } else {
                stateClass = 'opacity-30 scale-[0.97]';
              }
            } else if (isSelected) {
              stateClass = 'ring-2 ring-primary scale-[1.02]';
              glowStyle = { boxShadow: `0 0 25px ${optionColors[i].glow}, 0 0 10px hsl(var(--primary) / 0.3)` };
            }

            return (
              <motion.button
                key={`${localIndex}-${i}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.2 }}
                whileHover={!showResult && !hasSubmittedRef.current ? {
                  scale: 1.03,
                  boxShadow: `0 0 25px ${optionColors[i].glow}`,
                } : {}}
                whileTap={!showResult && !hasSubmittedRef.current ? { scale: 0.96 } : {}}
                onClick={() => handleSelect(i)}
                disabled={showResult || hasSubmittedRef.current}
                style={glowStyle}
                className={`${optionColors[i].bg} ${optionColors[i].hover} ${stateClass} p-4 sm:p-5 rounded-xl text-left transition-all duration-200 flex items-start gap-3 relative overflow-hidden`}
              >
                <span className="w-8 h-8 rounded-lg bg-background/20 flex items-center justify-center font-bold text-sm shrink-0 backdrop-blur-sm">
                  {optionIcons[i]}
                </span>
                <span className="font-medium text-primary-foreground text-base sm:text-lg relative z-10">
                  {option}
                </span>

                {isSelected && !showResult && (
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="ml-auto flex items-center">
                    <CheckCircle2 className="w-6 h-6 text-primary-foreground" />
                  </motion.span>
                )}

                {showResult && isCorrect && (
                  <motion.span
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 15, delay: 0.1 }}
                    className="ml-auto text-2xl"
                  >
                    ✓
                  </motion.span>
                )}

                {showResult && isSelected && !isCorrect && (
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="ml-auto text-2xl">
                    ✗
                  </motion.span>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Result feedback */}
        <AnimatePresence mode="wait">
          {showResult && (
            <motion.div
              key="result-feedback"
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="mt-6 text-center"
            >
              {answerResult === 'correct' && (
                <motion.p initial={{ scale: 0.8 }} animate={{ scale: [0.8, 1.1, 1] }} className="text-accent font-display text-2xl font-bold glow-accent inline-block px-6 py-2 rounded-xl">
                  🎉 Correct!
                </motion.p>
              )}
              {answerResult === 'wrong' && (
                <p className="text-destructive font-display text-2xl font-bold">✗ Wrong!</p>
              )}
              {answerResult === 'timeout' && (
                <p className="text-muted-foreground font-display text-2xl">⏱ Time's up!</p>
              )}
              <p className="text-xs text-muted-foreground mt-2 animate-pulse">Next question loading...</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Score footer */}
      <motion.div className="text-center mt-4 glass rounded-full px-6 py-2 mx-auto" layout>
        <span className="text-sm text-muted-foreground">Score: </span>
        <motion.span
          key={myPlayer?.score}
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 0.3 }}
          className="font-mono font-bold text-primary text-lg"
        >
          {myPlayer?.score || 0}
        </motion.span>
      </motion.div>
    </div>
  );
};

export default QuizPlay;
