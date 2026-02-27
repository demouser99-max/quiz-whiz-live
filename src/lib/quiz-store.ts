import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Question, getRandomQuestions, generateQuizCode } from '@/data/questions';

export interface Player {
  id: string;
  name: string;
  score: number;
  isHost: boolean;
  answers: { questionId: string; selectedIndex: number; timeMs: number }[];
}

export interface Quiz {
  code: string;
  title: string;
  questions: Question[];
  timePerQuestion: number;
  players: Player[];
  currentQuestionIndex: number;
  status: 'lobby' | 'playing' | 'results';
  startedAt?: number;
}

interface QuizStore {
  quiz: Quiz | null;
  currentPlayerId: string | null;

  createQuiz: (title: string, numQuestions: number, timePerQuestion: number) => string;
  joinQuiz: (code: string, name: string) => { success: boolean; error?: string; playerId?: string };
  startQuiz: () => void;
  nextQuestion: () => void;
  submitAnswer: (playerId: string, questionId: string, selectedIndex: number, timeMs: number) => void;
  kickPlayer: (playerId: string) => void;
  resetLeaderboard: () => void;
  endQuiz: () => void;
  getLeaderboard: () => Player[];
  getCurrentQuestion: () => Question | null;
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 10);
}

// Simulated bot players for demo
const botNames = ['Alex', 'Jordan', 'Sam', 'Taylor', 'Casey', 'Morgan', 'Riley', 'Quinn'];

export const useQuizStore = create<QuizStore>()(persist((set, get) => ({
  quiz: null,
  currentPlayerId: null,

  createQuiz: (title, numQuestions, timePerQuestion) => {
    const code = generateQuizCode();
    const hostId = generateId();
    const questions = getRandomQuestions(numQuestions);

    // Add some bot players for demo
    const bots: Player[] = botNames.slice(0, 4).map(name => ({
      id: generateId(),
      name,
      score: 0,
      isHost: false,
      answers: [],
    }));

    set({
      quiz: {
        code,
        title,
        questions,
        timePerQuestion,
        players: [
          { id: hostId, name: 'Host', score: 0, isHost: true, answers: [] },
          ...bots,
        ],
        currentQuestionIndex: -1,
        status: 'lobby',
      },
      currentPlayerId: hostId,
    });

    return code;
  },

  joinQuiz: (code, name) => {
    const { quiz } = get();
    if (!quiz || quiz.code !== code) {
      return { success: false, error: 'Quiz not found' };
    }
    if (quiz.players.some(p => p.name.toLowerCase() === name.toLowerCase())) {
      return { success: false, error: 'Name already taken' };
    }
    const playerId = generateId();
    set({
      quiz: {
        ...quiz,
        players: [...quiz.players, { id: playerId, name, score: 0, isHost: false, answers: [] }],
      },
      currentPlayerId: playerId,
    });
    return { success: true, playerId };
  },

  startQuiz: () => {
    const { quiz } = get();
    if (!quiz) return;
    set({
      quiz: { ...quiz, status: 'playing', currentQuestionIndex: 0, startedAt: Date.now() },
    });
  },

  nextQuestion: () => {
    const { quiz } = get();
    if (!quiz) return;
    const nextIndex = quiz.currentQuestionIndex + 1;

    // Simulate bot answers for previous question
    const currentQ = quiz.questions[quiz.currentQuestionIndex];
    const updatedPlayers = quiz.players.map(p => {
      if (p.isHost || p.id === get().currentPlayerId) return p;
      if (p.answers.some(a => a.questionId === currentQ.id)) return p;

      const correct = Math.random() > 0.4;
      const selectedIndex = correct ? currentQ.correctIndex : (currentQ.correctIndex + 1 + Math.floor(Math.random() * 3)) % 4;
      const timeMs = 1000 + Math.random() * (quiz.timePerQuestion * 1000 - 2000);
      const points = correct ? Math.max(100, Math.round(1000 - timeMs / 10)) : 0;

      return {
        ...p,
        score: p.score + points,
        answers: [...p.answers, { questionId: currentQ.id, selectedIndex, timeMs }],
      };
    });

    if (nextIndex >= quiz.questions.length) {
      set({ quiz: { ...quiz, players: updatedPlayers, status: 'results' } });
    } else {
      set({
        quiz: { ...quiz, players: updatedPlayers, currentQuestionIndex: nextIndex, startedAt: Date.now() },
      });
    }
  },

  submitAnswer: (playerId, questionId, selectedIndex, timeMs) => {
    const { quiz } = get();
    if (!quiz) return;
    const question = quiz.questions.find(q => q.id === questionId);
    if (!question) return;

    const correct = selectedIndex === question.correctIndex;
    const points = correct ? Math.max(100, Math.round(1000 - timeMs / 10)) : 0;

    set({
      quiz: {
        ...quiz,
        players: quiz.players.map(p =>
          p.id === playerId
            ? {
                ...p,
                score: p.score + points,
                answers: [...p.answers, { questionId, selectedIndex, timeMs }],
              }
            : p
        ),
      },
    });
  },

  kickPlayer: (playerId) => {
    const { quiz } = get();
    if (!quiz) return;
    set({ quiz: { ...quiz, players: quiz.players.filter(p => p.id !== playerId) } });
  },

  resetLeaderboard: () => {
    const { quiz } = get();
    if (!quiz) return;
    set({
      quiz: {
        ...quiz,
        players: quiz.players.map(p => ({ ...p, score: 0, answers: [] })),
      },
    });
  },

  endQuiz: () => {
    const { quiz } = get();
    if (!quiz) return;
    set({ quiz: { ...quiz, status: 'results' } });
  },

  getLeaderboard: () => {
    const { quiz } = get();
    if (!quiz) return [];
    return [...quiz.players].sort((a, b) => b.score - a.score);
  },

  getCurrentQuestion: () => {
    const { quiz } = get();
    if (!quiz || quiz.currentQuestionIndex < 0) return null;
    return quiz.questions[quiz.currentQuestionIndex] || null;
  },
}), {
  name: 'quizwhiz-store',
  partialize: (state) => ({ quiz: state.quiz, currentPlayerId: state.currentPlayerId }),
}));
