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
  finishQuiz: () => Promise<void>;
  reset: () => void;
  getCurrentQuestion: () => Question | null;
  getProgress: () => number;
}

export const useSoloStore = create<SoloQuizState>((set, get) => ({
  playerName: '',
  topic: '',
  questions: [],
  currentIndex: 0,
  answers: [],
  status: 'idle',
  startedAt: 0,
  totalScore: 0,

  setPlayerName: (name) => set({ playerName: name }),

  startQuiz: (topic, count) => {
    const questions = getRandomQuestions(count, topic);
    set({
      topic,
      questions,
      currentIndex: 0,
      answers: [],
      status: 'playing',
      startedAt: Date.now(),
      totalScore: 0,
    });
  },

  submitAnswer: (selectedIndex, timeMs) => {
    const { questions, currentIndex, answers, totalScore } = get();
    const question = questions[currentIndex];
    if (!question) return;

    const correct = selectedIndex === question.correctIndex;
    const points = correct ? Math.max(100, Math.round(1000 - timeMs / 10)) : 0;

    set({
      answers: [...answers, { questionId: question.id, selectedIndex, timeMs, correct, points }],
      totalScore: totalScore + points,
    });
  },

  nextQuestion: () => {
    const { currentIndex, questions } = get();
    if (currentIndex + 1 >= questions.length) {
      set({ status: 'finished' });
    } else {
      set({ currentIndex: currentIndex + 1 });
    }
  },

  finishQuiz: async () => {
    const { playerName, topic, totalScore, questions, answers } = get();
    const correctCount = answers.filter(a => a.correct).length;
    const totalTimeMs = answers.reduce((sum, a) => sum + a.timeMs, 0);

    await supabase.from('solo_scores').insert({
      player_name: playerName,
      topic,
      score: totalScore,
      total_questions: questions.length,
      correct_answers: correctCount,
      time_taken_ms: totalTimeMs,
    });
  },

  reset: () => set({
    topic: '',
    questions: [],
    currentIndex: 0,
    answers: [],
    status: 'idle',
    startedAt: 0,
    totalScore: 0,
  }),

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
