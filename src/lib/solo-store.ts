import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import { Question, getRandomQuestions } from '@/data/questions';

export interface SoloQuizState {
  playerName: string;
  topic: string;
  questions: Question[];
  currentIndex: number;
  answers: { questionId: string; selectedIndex: number; timeMs: number; correct: boolean; points: number }[];
  status: 'idle' | 'playing' | 'finished';
  startedAt: number;
  totalScore: number;

  setPlayerName: (name: string) => void;
  startQuiz: (topic: string, count: number) => void;
  submitAnswer: (selectedIndex: number, timeMs: number) => void;
  nextQuestion: () => void;
  finishQuiz: (userId?: string) => Promise<void>;
  reset: () => void;
  getCurrentQuestion: () => Question | null;
  getProgress: () => number;
}

const SESSION_KEY = 'quizwhiz-solo-state';

function saveToSession(state: Partial<SoloQuizState>) {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({
      playerName: state.playerName,
      topic: state.topic,
      questions: state.questions,
      currentIndex: state.currentIndex,
      answers: state.answers,
      status: state.status,
      startedAt: state.startedAt,
      totalScore: state.totalScore,
    }));
  } catch {}
}

function loadFromSession(): Partial<SoloQuizState> | null {
  try {
    const saved = sessionStorage.getItem(SESSION_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.status === 'playing' && parsed.questions?.length > 0) {
        return parsed;
      }
    }
  } catch {}
  return null;
}

function clearSession() {
  try { sessionStorage.removeItem(SESSION_KEY); } catch {}
}

const restored = loadFromSession();

export const useSoloStore = create<SoloQuizState>((set, get) => ({
  playerName: restored?.playerName ?? '',
  topic: restored?.topic ?? '',
  questions: restored?.questions ?? [],
  currentIndex: restored?.currentIndex ?? 0,
  answers: restored?.answers ?? [],
  status: restored?.status ?? 'idle',
  startedAt: restored?.startedAt ?? 0,
  totalScore: restored?.totalScore ?? 0,

  setPlayerName: (name) => {
    set({ playerName: name });
    saveToSession({ ...get(), playerName: name });
  },

  startQuiz: (topic, count) => {
    const questions = getRandomQuestions(count, topic);
    const newState = {
      topic,
      questions,
      currentIndex: 0,
      answers: [],
      status: 'playing' as const,
      startedAt: Date.now(),
      totalScore: 0,
    };
    set(newState);
    saveToSession({ ...get(), ...newState });
  },

  submitAnswer: (selectedIndex, timeMs) => {
    const { questions, currentIndex, answers, totalScore } = get();
    const question = questions[currentIndex];
    if (!question) return;

    const correct = selectedIndex === question.correctIndex;
    const points = correct ? Math.max(100, Math.round(1000 - timeMs / 10)) : 0;

    const newAnswers = [...answers, { questionId: question.id, selectedIndex, timeMs, correct, points }];
    const newScore = totalScore + points;

    set({ answers: newAnswers, totalScore: newScore });
    saveToSession({ ...get(), answers: newAnswers, totalScore: newScore });
  },

  nextQuestion: () => {
    const { currentIndex, questions } = get();
    if (currentIndex + 1 >= questions.length) {
      set({ status: 'finished' });
      clearSession();
    } else {
      const newIndex = currentIndex + 1;
      set({ currentIndex: newIndex });
      saveToSession({ ...get(), currentIndex: newIndex });
    }
  },

  finishQuiz: async (userId?: string) => {
    const { playerName, topic, totalScore, questions, answers } = get();
    const correctCount = answers.filter(a => a.correct).length;
    const totalTimeMs = answers.reduce((sum, a) => sum + a.timeMs, 0);

    clearSession();

    // Save to solo_scores (guest leaderboard)
    try {
      await supabase.from('solo_scores').insert({
        player_name: playerName || 'Anonymous',
        topic,
        score: totalScore,
        total_questions: questions.length,
        correct_answers: correctCount,
        time_taken_ms: totalTimeMs,
      });
    } catch (err) {
      console.error('Failed to save solo score:', err);
    }

    // If logged in, also save to quiz_attempts
    if (userId) {
      try {
        await supabase.from('quiz_attempts').insert({
          user_id: userId,
          topic,
          score: totalScore,
          total_questions: questions.length,
          correct_answers: correctCount,
          time_taken_ms: totalTimeMs,
        });
      } catch (err) {
        console.error('Failed to save quiz attempt:', err);
      }
    }
  },

  reset: () => {
    clearSession();
    set({
      topic: '',
      questions: [],
      currentIndex: 0,
      answers: [],
      status: 'idle',
      startedAt: 0,
      totalScore: 0,
    });
  },

  getCurrentQuestion: () => {
    const { questions, currentIndex } = get();
    return questions[currentIndex] || null;
  },

  getProgress: () => {
    const { currentIndex, questions } = get();
    if (questions.length === 0) return 0;
    return ((currentIndex + 1) / questions.length) * 100;
  },
}));
