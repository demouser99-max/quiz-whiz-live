import { create } from 'zustand';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: number;
}

export interface GamificationState {
  xp: number;
  level: number;
  streak: number;
  lastPlayedDate: string | null;
  quizzesPlayed: number;
  quizzesWon: number;
  totalCorrect: number;
  totalQuestions: number;
  badges: Badge[];
  // Actions
  addXp: (amount: number) => void;
  recordQuizResult: (correct: number, total: number, won: boolean) => void;
  checkStreak: () => void;
  getXpForNextLevel: () => number;
  getXpProgress: () => number;
}

const BADGE_DEFINITIONS: Omit<Badge, 'unlockedAt'>[] = [
  { id: 'first-quiz', name: 'First Steps', description: 'Complete your first quiz', icon: '🎯' },
  { id: 'streak-3', name: 'On Fire', description: '3-day streak', icon: '🔥' },
  { id: 'streak-7', name: 'Unstoppable', description: '7-day streak', icon: '⚡' },
  { id: 'perfect', name: 'Perfect Score', description: 'Get 100% on a quiz', icon: '💎' },
  { id: 'winner', name: 'Champion', description: 'Win a quiz', icon: '🏆' },
  { id: '5-wins', name: 'Legend', description: 'Win 5 quizzes', icon: '👑' },
  { id: '10-quizzes', name: 'Quiz Master', description: 'Play 10 quizzes', icon: '🎓' },
  { id: '50-correct', name: 'Brain Power', description: 'Answer 50 questions correctly', icon: '🧠' },
  { id: 'speed-demon', name: 'Speed Demon', description: 'Score 900+ on a single question', icon: '⚡' },
  { id: 'level-5', name: 'Rising Star', description: 'Reach level 5', icon: '⭐' },
  { id: 'level-10', name: 'Elite', description: 'Reach level 10', icon: '🌟' },
];

function getLevel(xp: number): number {
  // Each level requires progressively more XP: level N needs N*500 XP
  let level = 1;
  let needed = 500;
  let accumulated = 0;
  while (accumulated + needed <= xp) {
    accumulated += needed;
    level++;
    needed = level * 500;
  }
  return level;
}

function xpForLevel(level: number): number {
  // Total XP needed to reach this level
  let total = 0;
  for (let i = 1; i < level; i++) {
    total += i * 500;
  }
  return total;
}

function loadState(): Partial<GamificationState> {
  try {
    const saved = localStorage.getItem('quizwhiz-gamification');
    if (saved) return JSON.parse(saved);
  } catch {}
  return {};
}

function saveState(state: Partial<GamificationState>) {
  try {
    localStorage.setItem('quizwhiz-gamification', JSON.stringify({
      xp: state.xp,
      level: state.level,
      streak: state.streak,
      lastPlayedDate: state.lastPlayedDate,
      quizzesPlayed: state.quizzesPlayed,
      quizzesWon: state.quizzesWon,
      totalCorrect: state.totalCorrect,
      totalQuestions: state.totalQuestions,
      badges: state.badges,
    }));
  } catch {}
}

const saved = loadState();

export const useGamification = create<GamificationState>((set, get) => ({
  xp: saved.xp ?? 0,
  level: saved.level ?? 1,
  streak: saved.streak ?? 0,
  lastPlayedDate: saved.lastPlayedDate ?? null,
  quizzesPlayed: saved.quizzesPlayed ?? 0,
  quizzesWon: saved.quizzesWon ?? 0,
  totalCorrect: saved.totalCorrect ?? 0,
  totalQuestions: saved.totalQuestions ?? 0,
  badges: saved.badges ?? [],

  addXp: (amount: number) => {
    set(state => {
      const newXp = state.xp + amount;
      const newLevel = getLevel(newXp);
      const newBadges = [...state.badges];

      // Level badges
      if (newLevel >= 5 && !newBadges.find(b => b.id === 'level-5')) {
        const def = BADGE_DEFINITIONS.find(b => b.id === 'level-5')!;
        newBadges.push({ ...def, unlockedAt: Date.now() });
      }
      if (newLevel >= 10 && !newBadges.find(b => b.id === 'level-10')) {
        const def = BADGE_DEFINITIONS.find(b => b.id === 'level-10')!;
        newBadges.push({ ...def, unlockedAt: Date.now() });
      }

      const newState = { xp: newXp, level: newLevel, badges: newBadges };
      saveState({ ...state, ...newState });
      return newState;
    });
  },

  recordQuizResult: (correct: number, total: number, won: boolean) => {
    set(state => {
      const newBadges = [...state.badges];
      const quizzesPlayed = state.quizzesPlayed + 1;
      const quizzesWon = state.quizzesWon + (won ? 1 : 0);
      const totalCorrect = state.totalCorrect + correct;
      const totalQuestions = state.totalQuestions + total;
      const today = new Date().toISOString().slice(0, 10);

      // Streak
      let streak = state.streak;
      if (state.lastPlayedDate !== today) {
        const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
        streak = state.lastPlayedDate === yesterday ? streak + 1 : 1;
      }

      // Badge checks
      const tryUnlock = (id: string) => {
        if (!newBadges.find(b => b.id === id)) {
          const def = BADGE_DEFINITIONS.find(b => b.id === id)!;
          if (def) newBadges.push({ ...def, unlockedAt: Date.now() });
        }
      };

      if (quizzesPlayed >= 1) tryUnlock('first-quiz');
      if (quizzesPlayed >= 10) tryUnlock('10-quizzes');
      if (correct === total && total > 0) tryUnlock('perfect');
      if (won) tryUnlock('winner');
      if (quizzesWon >= 5) tryUnlock('5-wins');
      if (totalCorrect >= 50) tryUnlock('50-correct');
      if (streak >= 3) tryUnlock('streak-3');
      if (streak >= 7) tryUnlock('streak-7');

      // XP: 50 per correct + 200 bonus for winning + 100 streak bonus
      const xpGain = correct * 50 + (won ? 200 : 0) + (streak > 1 ? 100 : 0);

      const newState = {
        quizzesPlayed,
        quizzesWon,
        totalCorrect,
        totalQuestions,
        streak,
        lastPlayedDate: today,
        badges: newBadges,
      };
      
      saveState({ ...state, ...newState, xp: state.xp + xpGain, level: getLevel(state.xp + xpGain) });
      
      // Use addXp to handle level-up badges
      setTimeout(() => get().addXp(xpGain), 0);
      
      return newState;
    });
  },

  checkStreak: () => {
    set(state => {
      const today = new Date().toISOString().slice(0, 10);
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      if (state.lastPlayedDate && state.lastPlayedDate !== today && state.lastPlayedDate !== yesterday) {
        const newState = { streak: 0 };
        saveState({ ...state, ...newState });
        return newState;
      }
      return {};
    });
  },

  getXpForNextLevel: () => {
    const { level } = get();
    return level * 500;
  },

  getXpProgress: () => {
    const { xp, level } = get();
    const currentLevelXp = xpForLevel(level);
    const nextLevelXp = level * 500;
    return Math.min(((xp - currentLevelXp) / nextLevelXp) * 100, 100);
  },
}));

export { BADGE_DEFINITIONS };
