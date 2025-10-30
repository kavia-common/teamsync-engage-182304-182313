import { create } from 'zustand';

/**
 * PUBLIC_INTERFACE
 * Zustand store for global app state.
 * State shape:
 * {
 *   team: { name, size, department, mode },
 *   quiz: { energy, budget, duration, interests, collaboration },
 *   saved: [activity],
 *   feedback: [{ id, activityId, activityTitle, value, comment, rating }]
 * }
 */
export const useZStore = create((set, get) => ({
  team: { name: '', size: 0, department: '', mode: 'hybrid' },
  quiz: { energy: 'balanced', budget: 'medium', duration: '60', interests: ['games'], collaboration: 3 },
  saved: [],
  feedback: [],

  // PUBLIC_INTERFACE
  setTeam: (team) => set((s) => ({ team: { ...s.team, ...team } })),

  // PUBLIC_INTERFACE
  setQuiz: (quiz) => set((s) => ({ quiz: { ...s.quiz, ...quiz } })),

  // PUBLIC_INTERFACE
  saveRecommendation: (item) =>
    set((s) => (s.saved.find((x) => x.id === item.id) ? s : { saved: [...s.saved, item] })),

  // PUBLIC_INTERFACE
  giveFeedback: (payload) =>
    set((s) => ({ feedback: [...s.feedback, { id: `${Date.now()}_${Math.random().toString(36).slice(2)}`, ...payload }] })),

  // PUBLIC_INTERFACE
  clearRecommendations: () => set(() => ({})), // placeholder for parity
}));
