import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuizStore } from '@/lib/quiz-store';
import confetti from 'canvas-confetti';
import { Trophy, Clock, SkipForward, Square, ChevronRight } from 'lucide-react';

const optionColors = [
  'bg-quiz-red hover-quiz-red',
  'bg-quiz-blue hover-quiz-blue',
  'bg-quiz-yellow hover-quiz-yellow',
  'bg-quiz-green hover-quiz-green',
];

const optionLabels = ['A', 'B', 'C', 'D'];

const QuizPlay = () => {
  const navigate = useNavigate();
  const { code } = useParams();
  const quiz = useQuizStore(s => s.quiz);
  const currentPlayerId = useQuizStore(s => s.currentPlayerId);
  const submitAnswer = useQuizStore(s => s.submitAnswer);
  const nextQuestion = useQuizStore(s => s.nextQuestion);
  const endQuiz = useQuizStore(s => s.endQuiz);
  const getCurrentQuestion = useQuizStore(s => s.getCurrentQuestion);
  const getLeaderboard = useQuizStore(s => s.getLeaderboard);

  const [timeLeft, setTimeLeft] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answerStartTime, setAnswerStartTime] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const question = getCurrentQuestion();
  const isHost = quiz?.players.find(p => p.id === currentPlayerId)?.isHost;

  // Redirect if quiz ended
  useEffect(() => {
    if (quiz?.status === 'results') {
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
      navigate(`/results/${code}`);
    }
  }, [quiz?.status, navigate, code]);

  // Timer
  useEffect(() => {
    if (!quiz || !question || showResult || showLeaderboard) return;
    setTimeLeft(quiz.timePerQuestion);
    setSelectedAnswer(null);
    setShowResult(false);
    setAnswerStartTime(Date.now());

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setShowResult(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [quiz?.currentQuestionIndex]);

  const handleAnswer = (index: number) => {
    if (selectedAnswer !== null || showResult || !question || !currentPlayerId) return;
    const timeMs = Date.now() - answerStartTime;
    setSelectedAnswer(index);
    submitAnswer(currentPlayerId, question.id, index, timeMs);

    if (index === question.correctIndex) {
      confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 } });
    }

    setTimeout(() => setShowResult(true), 800);
  };

  const handleNext = () => {
    setShowResult(false);
    setShowLeaderboard(false);
    nextQuestion();
  };

  const handleShowLeaderboard = () => {
    setShowLeaderboard(true);
  };

  if (!quiz || !question) return null;

  const timerPercent = (timeLeft / quiz.timePerQuestion) * 100;
  const leaderboard = getLeaderboard();
  const currentPlayer = quiz.players.find(p => p.id === currentPlayerId);

  if (showLeaderboard) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <h2 className="font-display text-2xl font-bold text-foreground text-center mb-6">
            <Trophy className="w-6 h-6 text-primary inline mr-2" />
            Leaderboard
          </h2>
          <div className="space-y-2 mb-8">
            {leaderboard.slice(0, 8).map((player, i) => (
              <motion.div
                key={player.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: i * 0.08 }}
                className={`flex items-center justify-between px-4 py-3 rounded-xl ${
                  player.id === currentPlayerId ? 'bg-primary/20 border border-primary/40' : 'bg-card border border-border'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    i === 0 ? 'bg-quiz-yellow text-background' : i === 1 ? 'bg-muted-foreground/30 text-foreground' : i === 2 ? 'bg-quiz-red/60 text-foreground' : 'bg-secondary text-muted-foreground'
                  }`}>
                    {i + 1}
                  </span>
                  <span className="text-foreground font-medium">{player.name}</span>
                </div>
                <span className="font-mono font-bold text-primary">{player.score}</span>
              </motion.div>
            ))}
          </div>

          {isHost && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleNext}
              className="w-full px-6 py-4 rounded-xl bg-primary text-primary-foreground font-display font-semibold text-lg glow-primary flex items-center justify-center gap-2"
            >
              <ChevronRight className="w-5 h-5" />
              Next Question
            </motion.button>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 max-w-2xl mx-auto w-full">
        <span className="text-sm text-muted-foreground">
          Q{quiz.currentQuestionIndex + 1}/{quiz.questions.length}
        </span>
        <span className="text-xs px-2 py-1 rounded bg-secondary text-muted-foreground">
          {question.category}
        </span>
        {isHost && (
          <button onClick={() => endQuiz()} className="text-xs text-destructive hover:underline flex items-center gap-1">
            <Square className="w-3 h-3" /> End
          </button>
        )}
      </div>

      {/* Timer bar */}
      <div className="w-full max-w-2xl mx-auto mb-6">
        <div className="h-2 rounded-full bg-secondary overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{
              backgroundColor: timerPercent > 30 ? 'hsl(var(--primary))' : timerPercent > 10 ? 'hsl(var(--quiz-yellow))' : 'hsl(var(--destructive))',
            }}
            initial={{ width: '100%' }}
            animate={{ width: `${timerPercent}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <div className="flex items-center justify-center gap-1 mt-2">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span className={`font-mono text-lg font-bold ${timeLeft <= 5 ? 'text-destructive' : 'text-foreground'}`}>
            {timeLeft}s
          </span>
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full">
        <motion.h2
          key={question.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-2xl sm:text-3xl font-bold text-foreground text-center mb-10"
        >
          {question.text}
        </motion.h2>

        {/* Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
          {question.options.map((option, i) => {
            const isCorrect = i === question.correctIndex;
            const isSelected = selectedAnswer === i;
            let extraClasses = '';

            if (showResult) {
              if (isCorrect) extraClasses = 'ring-4 ring-accent scale-[1.02]';
              else if (isSelected && !isCorrect) extraClasses = 'opacity-50 scale-95';
              else extraClasses = 'opacity-40';
            }

            return (
              <motion.button
                key={i}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                whileHover={!showResult && selectedAnswer === null ? { scale: 1.02 } : {}}
                whileTap={!showResult && selectedAnswer === null ? { scale: 0.97 } : {}}
                onClick={() => handleAnswer(i)}
                disabled={showResult || selectedAnswer !== null}
                className={`${optionColors[i]} ${extraClasses} p-5 rounded-xl text-left transition-all duration-300 flex items-start gap-3`}
              >
                <span className="w-8 h-8 rounded-lg bg-background/20 flex items-center justify-center font-bold text-sm shrink-0">
                  {optionLabels[i]}
                </span>
                <span className="font-medium text-primary-foreground text-base sm:text-lg">{option}</span>
              </motion.button>
            );
          })}
        </div>

        {/* Result feedback */}
        <AnimatePresence mode="wait">
          {showResult && (
            <motion.div
              key="result-feedback"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-8 text-center"
            >
              {selectedAnswer === question.correctIndex ? (
                <p className="text-accent font-display text-xl font-bold">🎉 Correct!</p>
              ) : selectedAnswer !== null ? (
                <p className="text-destructive font-display text-xl font-bold">✗ Wrong answer</p>
              ) : (
                <p className="text-muted-foreground font-display text-xl">⏱ Time's up!</p>
              )}

              {isHost && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleShowLeaderboard}
                  className="mt-4 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-display font-semibold flex items-center gap-2 mx-auto"
                >
                  <Trophy className="w-4 h-4" /> Show Leaderboard
                </motion.button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Score footer */}
      <div className="text-center mt-4">
        <span className="text-sm text-muted-foreground">Your Score: </span>
        <span className="font-mono font-bold text-primary">{currentPlayer?.score || 0}</span>
      </div>
    </div>
  );
};

export default QuizPlay;
