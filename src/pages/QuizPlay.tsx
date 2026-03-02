import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuizStore } from '@/lib/quiz-store';
import { playCorrectSound, playWrongSound, playTickSound, playCountdownUrgent, playTransitionSound } from '@/lib/sounds';
import CircularTimer from '@/components/CircularTimer';
import AnimatedLeaderboard from '@/components/AnimatedLeaderboard';
import confetti from 'canvas-confetti';
import { Trophy, Square, ChevronRight, Sparkles, Lock, CheckCircle2 } from 'lucide-react';

const optionColors = [
  { bg: 'bg-quiz-red', hover: 'hover-quiz-red', glow: 'hsl(var(--quiz-red) / 0.4)' },
  { bg: 'bg-quiz-blue', hover: 'hover-quiz-blue', glow: 'hsl(var(--quiz-blue) / 0.4)' },
  { bg: 'bg-quiz-yellow', hover: 'hover-quiz-yellow', glow: 'hsl(var(--quiz-yellow) / 0.4)' },
  { bg: 'bg-quiz-green', hover: 'hover-quiz-green', glow: 'hsl(var(--quiz-green) / 0.4)' },
];

const optionIcons = ['◆', '●', '▲', '★'];

const QuizPlay = () => {
  const navigate = useNavigate();
  const { code } = useParams();

  const quiz = useQuizStore(s => s.quiz);
  const sessionId = useQuizStore(s => s.sessionId);
  const fetchQuiz = useQuizStore(s => s.fetchQuiz);
  const submitAnswer = useQuizStore(s => s.submitAnswer);
  const nextQuestion = useQuizStore(s => s.nextQuestion);
  const endQuiz = useQuizStore(s => s.endQuiz);
  const getCurrentQuestion = useQuizStore(s => s.getCurrentQuestion);
  const subscribeToQuiz = useQuizStore(s => s.subscribeToQuiz);

  const [timeLeft, setTimeLeft] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answerStartTime, setAnswerStartTime] = useState(0);
  const [lockedIn, setLockedIn] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [answerResult, setAnswerResult] = useState<'correct' | 'wrong' | 'timeout' | null>(null);
  const prevQuestionIndexRef = useRef<number>(-999);
  const hasSubmittedRef = useRef(false);

  const question = getCurrentQuestion();
  const myPlayer = quiz?.players.find(p => p.sessionId === sessionId);
  const isHost = myPlayer?.isHost;
  const currentQuestionIndex = quiz?.currentQuestionIndex ?? -1;

  useEffect(() => {
    if (code) fetchQuiz(code);
  }, [code]);

  useEffect(() => {
    if (quiz?.id) {
      const unsubscribe = subscribeToQuiz(quiz.id);
      return unsubscribe;
    }
  }, [quiz?.id]);

  useEffect(() => {
    if (quiz?.status === 'results') {
      confetti({ particleCount: 200, spread: 100, origin: { y: 0.5 } });
      navigate(`/results/${code}`);
    }
  }, [quiz?.status, navigate, code]);

  // Reset on question change
  useEffect(() => {
    if (currentQuestionIndex === prevQuestionIndexRef.current) return;
    prevQuestionIndexRef.current = currentQuestionIndex;

    if (currentQuestionIndex >= 0 && quiz) {
      setSelectedAnswer(null);
      setLockedIn(false);
      setShowResult(false);
      setShowLeaderboard(false);
      setAnswerResult(null);
      setTimeLeft(quiz.timePerQuestion);
      setAnswerStartTime(Date.now());
      hasSubmittedRef.current = false;
      playTransitionSound();
    }
  }, [currentQuestionIndex, quiz?.timePerQuestion]);

  // Submit answer helper (called on lock-in or timeout)
  const finalizeAnswer = useCallback(async (selected: number | null) => {
    if (hasSubmittedRef.current || !question) return;
    hasSubmittedRef.current = true;

    const timeMs = Date.now() - answerStartTime;

    if (selected === null) {
      // Timeout with no selection
      playWrongSound();
      setAnswerResult('timeout');
      setShowResult(true);
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
    setTimeout(() => setShowResult(true), 600);
  }, [question, answerStartTime, submitAnswer]);

  // Timer
  useEffect(() => {
    if (!quiz || !question || showResult || showLeaderboard || currentQuestionIndex < 0) return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          // Time's up — finalize whatever is selected
          const currentSelected = selectedAnswer;
          if (!hasSubmittedRef.current) {
            // Use setTimeout to avoid state update during render
            setTimeout(() => finalizeAnswer(currentSelected), 0);
          }
          return 0;
        }
        if (prev <= 6 && prev > 1) playCountdownUrgent();
        else if (prev % 5 === 0) playTickSound();
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentQuestionIndex, showResult, showLeaderboard, finalizeAnswer, selectedAnswer]);

  // Select an answer (just highlight, no submission)
  const handleSelect = useCallback((index: number) => {
    if (lockedIn || showResult) return;
    setSelectedAnswer(prev => prev === index ? null : index); // Toggle selection
  }, [lockedIn, showResult]);

  // Lock in the selected answer
  const handleLockIn = useCallback(async () => {
    if (selectedAnswer === null || lockedIn || showResult) return;
    setLockedIn(true);
    await finalizeAnswer(selectedAnswer);
  }, [selectedAnswer, lockedIn, showResult, finalizeAnswer]);

  const handleNext = useCallback(async () => {
    setShowResult(false);
    setShowLeaderboard(false);
    await nextQuestion();
  }, [nextQuestion]);

  const handleShowLeaderboard = useCallback(async () => {
    if (code) await fetchQuiz(code);
    setShowLeaderboard(true);
  }, [code, fetchQuiz]);

  // Loading skeleton
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

  // Leaderboard view
  if (showLeaderboard) {
    return (
      <div className="min-h-screen bg-background bg-particles flex flex-col items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="w-full max-w-md"
        >
          <motion.h2
            initial={{ y: -10 }}
            animate={{ y: 0 }}
            className="font-display text-2xl font-bold text-foreground text-center mb-6 flex items-center justify-center gap-2"
          >
            <Trophy className="w-6 h-6 text-primary" />
            <span className="text-gradient">Leaderboard</span>
          </motion.h2>

          <AnimatedLeaderboard players={quiz.players} sessionId={sessionId} />

          <div className="mt-8">
            {isHost ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleNext}
                className="w-full px-6 py-4 rounded-xl bg-primary text-primary-foreground font-display font-semibold text-lg glow-primary flex items-center justify-center gap-2"
              >
                <ChevronRight className="w-5 h-5" />
                Next Question
              </motion.button>
            ) : (
              <p className="text-center text-muted-foreground animate-pulse-glow text-sm">
                Waiting for host to continue...
              </p>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background bg-particles flex flex-col px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-2 max-w-2xl mx-auto w-full">
        <motion.span
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-sm font-medium text-muted-foreground glass px-3 py-1 rounded-full"
        >
          {quiz.currentQuestionIndex + 1} / {quiz.questions.length}
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

        {/* Options */}
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
            } else if (isSelected && lockedIn) {
              stateClass = 'ring-2 ring-primary scale-[1.02]';
              glowStyle = { boxShadow: `0 0 25px ${optionColors[i].glow}, 0 0 10px hsl(var(--primary) / 0.3)` };
            } else if (isSelected) {
              stateClass = 'ring-2 ring-foreground/50 scale-[1.02]';
              glowStyle = { boxShadow: `0 0 20px ${optionColors[i].glow}` };
            }

            return (
              <motion.button
                key={`${currentQuestionIndex}-${i}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.2 }}
                whileHover={!showResult && !lockedIn ? {
                  scale: 1.03,
                  boxShadow: `0 0 25px ${optionColors[i].glow}`,
                } : {}}
                whileTap={!showResult && !lockedIn ? { scale: 0.96 } : {}}
                onClick={() => handleSelect(i)}
                disabled={showResult || lockedIn}
                style={glowStyle}
                className={`${optionColors[i].bg} ${optionColors[i].hover} ${stateClass} p-4 sm:p-5 rounded-xl text-left transition-all duration-200 flex items-start gap-3 relative overflow-hidden`}
              >
                {/* Ripple on select */}
                {isSelected && !showResult && !lockedIn && (
                  <motion.div
                    key={`ripple-${selectedAnswer}-${i}`}
                    initial={{ scale: 0, opacity: 0.5 }}
                    animate={{ scale: 4, opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0 bg-foreground/20 rounded-full"
                    style={{ transformOrigin: 'center' }}
                  />
                )}

                <span className="w-8 h-8 rounded-lg bg-background/20 flex items-center justify-center font-bold text-sm shrink-0 backdrop-blur-sm">
                  {optionIcons[i]}
                </span>
                <span className="font-medium text-primary-foreground text-base sm:text-lg relative z-10">
                  {option}
                </span>

                {/* Selected indicator (before lock-in) */}
                {isSelected && !showResult && !lockedIn && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="ml-auto flex items-center"
                  >
                    <CheckCircle2 className="w-6 h-6 text-primary-foreground" />
                  </motion.span>
                )}

                {/* Locked indicator */}
                {isSelected && lockedIn && !showResult && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="ml-auto flex items-center"
                  >
                    <Lock className="w-5 h-5 text-primary-foreground" />
                  </motion.span>
                )}

                {/* Checkmark for correct */}
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

                {/* X for wrong selected */}
                {showResult && isSelected && !isCorrect && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="ml-auto text-2xl"
                  >
                    ✗
                  </motion.span>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Lock In Button */}
        <AnimatePresence>
          {selectedAnswer !== null && !lockedIn && !showResult && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="mt-6"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLockIn}
                className="px-8 py-4 rounded-xl bg-primary text-primary-foreground font-display font-bold text-lg glow-primary flex items-center gap-3 mx-auto"
              >
                <Lock className="w-5 h-5" />
                Lock In Answer
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Locked-in waiting state */}
        {lockedIn && !showResult && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 text-muted-foreground animate-pulse-glow text-sm text-center"
          >
            Answer locked in! Waiting for result...
          </motion.p>
        )}

        {/* Result feedback */}
        <AnimatePresence mode="wait">
          {showResult && (
            <motion.div
              key="result-feedback"
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="mt-8 text-center"
            >
              {answerResult === 'correct' && (
                <motion.p
                  initial={{ scale: 0.8 }}
                  animate={{ scale: [0.8, 1.1, 1] }}
                  className="text-accent font-display text-2xl font-bold glow-accent inline-block px-6 py-2 rounded-xl"
                >
                  🎉 Correct!
                </motion.p>
              )}
              {answerResult === 'wrong' && (
                <p className="text-destructive font-display text-2xl font-bold">✗ Wrong!</p>
              )}
              {answerResult === 'timeout' && (
                <p className="text-muted-foreground font-display text-2xl">⏱ Time's up!</p>
              )}

              <div className="mt-4">
                {isHost ? (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleShowLeaderboard}
                    className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-display font-semibold flex items-center gap-2 mx-auto glow-primary"
                  >
                    <Trophy className="w-4 h-4" /> Leaderboard
                  </motion.button>
                ) : (
                  <p className="text-muted-foreground animate-pulse-glow text-sm">Waiting for host...</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Score footer */}
      <motion.div
        className="text-center mt-4 glass rounded-full px-6 py-2 mx-auto"
        layout
      >
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
