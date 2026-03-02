import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import { Question, getRandomQuestions, generateQuizCode } from '@/data/questions';

export interface Player {
  id: string;
  name: string;
  score: number;
  isHost: boolean;
  sessionId: string;
}

export interface Answer {
  questionId: string;
  selectedIndex: number;
  timeMs: number;
  points: number;
}

export interface Quiz {
  id: string;
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
  sessionId: string;
  loading: boolean;
  error: string | null;
  playerAnswers: Record<string, Answer[]>;

  createQuiz: (title: string, numQuestions: number, timePerQuestion: number) => Promise<string>;
  joinQuiz: (code: string, name: string) => Promise<{ success: boolean; error?: string }>;
  fetchQuiz: (code: string) => Promise<boolean>;
  startQuiz: () => Promise<void>;
  nextQuestion: () => Promise<void>;
  submitAnswer: (questionId: string, selectedIndex: number, timeMs: number) => Promise<void>;
  kickPlayer: (playerId: string) => Promise<void>;
  endQuiz: () => Promise<void>;
  getLeaderboard: () => Player[];
  getCurrentQuestion: () => Question | null;
  subscribeToQuiz: (quizId: string) => () => void;
  getMyPlayer: () => Player | null;
}

function getSessionId(): string {
  let id = sessionStorage.getItem('quizwhiz-session-id');
  if (!id) {
    id = Math.random().toString(36).substring(2, 15);
    sessionStorage.setItem('quizwhiz-session-id', id);
  }
  return id;
}

export const useQuizStore = create<QuizStore>((set, get) => ({
  quiz: null,
  sessionId: getSessionId(),
  loading: false,
  error: null,
  playerAnswers: {},

  createQuiz: async (title, numQuestions, timePerQuestion) => {
    const code = generateQuizCode();
    const questions = getRandomQuestions(numQuestions);
    const sessionId = get().sessionId;

    const { data: quizData, error: quizError } = await supabase
      .from('quizzes')
      .insert({
        code,
        title,
        questions: questions as any,
        time_per_question: timePerQuestion,
        status: 'lobby',
        current_question_index: -1,
      })
      .select()
      .single();

    if (quizError || !quizData) throw new Error(quizError?.message || 'Failed to create quiz');

    const { data: playerData, error: playerError } = await supabase
      .from('players')
      .insert({
        quiz_id: quizData.id,
        session_id: sessionId,
        name: 'Host',
        is_host: true,
        score: 0,
      })
      .select()
      .single();

    if (playerError) throw new Error(playerError.message);

    set({
      quiz: {
        id: quizData.id,
        code,
        title,
        questions,
        timePerQuestion,
        players: [{
          id: playerData.id,
          name: 'Host',
          score: 0,
          isHost: true,
          sessionId,
        }],
        currentQuestionIndex: -1,
        status: 'lobby',
      },
    });

    return code;
  },

  joinQuiz: async (code, name) => {
    const sessionId = get().sessionId;

    const { data: quizData, error: quizError } = await supabase
      .from('quizzes')
      .select('*')
      .eq('code', code)
      .single();

    if (quizError || !quizData) {
      return { success: false, error: 'Quiz not found. Check the code and try again.' };
    }

    if (quizData.status !== 'lobby') {
      return { success: false, error: 'Quiz has already started.' };
    }

    const { data: existingPlayers } = await supabase
      .from('players')
      .select('*')
      .eq('quiz_id', quizData.id);

    if (existingPlayers?.some(p => p.name.toLowerCase() === name.toLowerCase())) {
      return { success: false, error: 'Name already taken. Choose a different name.' };
    }

    const existingPlayer = existingPlayers?.find(p => p.session_id === sessionId);
    if (existingPlayer) {
      await get().fetchQuiz(code);
      return { success: true };
    }

    const { error: playerError } = await supabase
      .from('players')
      .insert({
        quiz_id: quizData.id,
        session_id: sessionId,
        name,
        is_host: false,
        score: 0,
      });

    if (playerError) {
      return { success: false, error: playerError.message };
    }

    await get().fetchQuiz(code);
    return { success: true };
  },

  fetchQuiz: async (code) => {
    set({ loading: true, error: null });

    const { data: quizData, error: quizError } = await supabase
      .from('quizzes')
      .select('*')
      .eq('code', code)
      .single();

    if (quizError || !quizData) {
      set({ loading: false, error: 'Quiz not found' });
      return false;
    }

    const { data: playersData } = await supabase
      .from('players')
      .select('*')
      .eq('quiz_id', quizData.id)
      .order('created_at', { ascending: true });

    const { data: answersData } = await supabase
      .from('answers')
      .select('*')
      .eq('quiz_id', quizData.id);

    const playerAnswers: Record<string, Answer[]> = {};
    answersData?.forEach(a => {
      if (!playerAnswers[a.player_id]) playerAnswers[a.player_id] = [];
      playerAnswers[a.player_id].push({
        questionId: a.question_id,
        selectedIndex: a.selected_index,
        timeMs: a.time_ms,
        points: a.points,
      });
    });

    const players: Player[] = (playersData || []).map(p => ({
      id: p.id,
      name: p.name,
      score: p.score,
      isHost: p.is_host,
      sessionId: p.session_id,
    }));

    set({
      quiz: {
        id: quizData.id,
        code: quizData.code,
        title: quizData.title,
        questions: quizData.questions as unknown as Question[],
        timePerQuestion: quizData.time_per_question,
        players,
        currentQuestionIndex: quizData.current_question_index,
        status: quizData.status as Quiz['status'],
        startedAt: quizData.started_at ? new Date(quizData.started_at).getTime() : undefined,
      },
      playerAnswers,
      loading: false,
    });

    return true;
  },

  startQuiz: async () => {
    const { quiz } = get();
    if (!quiz) return;

    await supabase
      .from('quizzes')
      .update({
        status: 'playing',
        current_question_index: 0,
        started_at: new Date().toISOString(),
      })
      .eq('id', quiz.id);
  },

  nextQuestion: async () => {
    const { quiz } = get();
    if (!quiz) return;
    const nextIndex = quiz.currentQuestionIndex + 1;

    if (nextIndex >= quiz.questions.length) {
      await supabase
        .from('quizzes')
        .update({ status: 'results' })
        .eq('id', quiz.id);
    } else {
      await supabase
        .from('quizzes')
        .update({
          current_question_index: nextIndex,
          started_at: new Date().toISOString(),
        })
        .eq('id', quiz.id);
    }
  },

  submitAnswer: async (questionId, selectedIndex, timeMs) => {
    const { quiz, sessionId } = get();
    if (!quiz) return;

    const myPlayer = quiz.players.find(p => p.sessionId === sessionId);
    if (!myPlayer) return;

    const question = quiz.questions.find(q => q.id === questionId);
    if (!question) return;

    const correct = selectedIndex === question.correctIndex;
    const points = correct ? Math.max(100, Math.round(1000 - timeMs / 10)) : 0;

    // Fire and forget - don't await to prevent UI blocking
    supabase.from('answers').insert({
      player_id: myPlayer.id,
      quiz_id: quiz.id,
      question_id: questionId,
      selected_index: selectedIndex,
      time_ms: timeMs,
      points,
    }).then(({ error }) => {
      if (error) console.error('Failed to submit answer:', error);
    });

    // Update score optimistically in local state
    const newScore = myPlayer.score + points;
    set(state => {
      if (!state.quiz) return state;
      return {
        quiz: {
          ...state.quiz,
          players: state.quiz.players.map(p =>
            p.id === myPlayer.id ? { ...p, score: newScore } : p
          ),
        },
      };
    });

    // Update score in DB (fire and forget)
    supabase
      .from('players')
      .update({ score: newScore })
      .eq('id', myPlayer.id)
      .then(({ error }) => {
        if (error) console.error('Failed to update score:', error);
      });
  },

  kickPlayer: async (playerId) => {
    await supabase.from('players').delete().eq('id', playerId);
  },

  endQuiz: async () => {
    const { quiz } = get();
    if (!quiz) return;
    await supabase
      .from('quizzes')
      .update({ status: 'results' })
      .eq('id', quiz.id);
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

  getMyPlayer: () => {
    const { quiz, sessionId } = get();
    if (!quiz) return null;
    return quiz.players.find(p => p.sessionId === sessionId) || null;
  },

  subscribeToQuiz: (quizId: string) => {
    const channel = supabase
      .channel(`quiz-${quizId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'quizzes',
        filter: `id=eq.${quizId}`,
      }, (payload) => {
        const data = payload.new as any;
        if (!data) return;
        set(state => {
          if (!state.quiz) return state;
          return {
            quiz: {
              ...state.quiz,
              status: data.status,
              currentQuestionIndex: data.current_question_index,
              startedAt: data.started_at ? new Date(data.started_at).getTime() : undefined,
            },
          };
        });
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'players',
        filter: `quiz_id=eq.${quizId}`,
      }, () => {
        // Refetch players on any change
        supabase.from('players').select('*').eq('quiz_id', quizId).order('created_at', { ascending: true }).then(({ data }) => {
          if (!data) return;
          set(state => {
            if (!state.quiz) return state;
            return {
              quiz: {
                ...state.quiz,
                players: data.map(p => ({
                  id: p.id,
                  name: p.name,
                  score: p.score,
                  isHost: p.is_host,
                  sessionId: p.session_id,
                })),
              },
            };
          });
        });
      })
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR') {
          // Auto-reconnect after 2 seconds
          setTimeout(() => {
            supabase.removeChannel(channel);
            const store = get();
            if (store.quiz?.id === quizId) {
              store.subscribeToQuiz(quizId);
            }
          }, 2000);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  },
}));
