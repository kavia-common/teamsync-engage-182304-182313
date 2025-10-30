import { create } from 'zustand';

/**
 * PUBLIC_INTERFACE
 * Zustand store for global app state.
 * State shape:
 * {
 *   team: { name, size, department, mode },
 *   quiz: { energy, budget, duration, interests, collaboration },
 *   saved: [activity],
 *   feedback: [{ id, activityId, activityTitle, value, comment, rating }],
 *   gamification: {
 *     points: number,
 *     badges: { id, title, earnedAt }[],
 *     history: { id, event, meta, points, createdAt }[]
 *   }
 * }
 */
export const useZStore = create((set, get) => ({
  // Core state
  team: { name: '', size: 0, department: '', mode: 'hybrid' },
  quiz: { energy: 'balanced', budget: 'medium', duration: '60', interests: ['games'], collaboration: 3 },
  saved: [],
  feedback: [],
  // Minimal subscription state used for plan badges and CTA reflection
  plan: {
    tier: 'free', // 'free' | 'pro'
    billing: 'monthly', // reserved for future
    demo: false, // demo mode indicator
  },

  // Analytics & persona slices
  analytics: null, // { success, sentiment, trend, heroes, source }
  persona: null,   // { persona, breakdown, source }
  timeRange: '4w', // '4w' | '12w' | 'all'

  // Gamification slice
  gamification: {
    points: 0,
    badges: [], // [{ id:'first_save', title:'First Save', earnedAt: ISO }]
    history: [], // [{ id, event, meta, points, createdAt }]
    lastEarnedBadgeId: null, // transient helper for UI confetti
  },

  // PUBLIC_INTERFACE
  setTeam: (team) => set((s) => ({ team: { ...s.team, ...team } })),

  // PUBLIC_INTERFACE
  setQuiz: (quiz) => set((s) => ({ quiz: { ...s.quiz, ...quiz } })),

  // PUBLIC_INTERFACE
  saveRecommendation: (item) =>
    set((s) => (s.saved.find((x) => x.id === item.id) ? s : { saved: [...s.saved, item] })),

  // PUBLIC_INTERFACE
  giveFeedback: (payload) =>
    set((s) => ({
      feedback: [
        ...s.feedback,
        { id: `${Date.now()}_${Math.random().toString(36).slice(2)}`, createdAt: new Date().toISOString(), ...payload },
      ],
    })),

  // PUBLIC_INTERFACE
  clearRecommendations: () => set(() => ({})), // placeholder for parity

  // PUBLIC_INTERFACE
  setPlan: (plan) => set((s) => ({ plan: { ...s.plan, ...plan } })),

  // PUBLIC_INTERFACE
  setTimeRange: (r) => set(() => ({ timeRange: r })),

  // PUBLIC_INTERFACE
  setAnalytics: (a) => set(() => ({ analytics: a })),

  // PUBLIC_INTERFACE
  setPersona: (p) => set(() => ({ persona: p })),

  // --- Gamification public actions ---

  // PUBLIC_INTERFACE
  refreshGamification: async (teamId) => {
    try {
      // defer to api call via dynamic import to avoid cycle
      const api = (await import('../services/api')).default;
      const data = await api.getGamification(teamId);
      if (!data) return;
      set((s) => ({
        gamification: {
          points: Number(data.points || 0),
          badges: Array.isArray(data.badges) ? data.badges : [],
          history: Array.isArray(data.history) ? data.history : [],
          lastEarnedBadgeId: s.gamification?.lastEarnedBadgeId || null,
        },
      }));
    } catch {
      // noop on failure
    }
  },

  // PUBLIC_INTERFACE
  recordAward: async (event, meta = {}) => {
    // optimistic local update aligned with backend defaults
    const now = new Date().toISOString();
    const id = `${event}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

    // Backend-aligned points:
    // save: +5
    // feedback: +3 base (+1 if longComment)
    // like/dislike/rating used as markers; keep small nudge
    let inc = 1;
    if (event === 'save') inc = 5;
    else if (event === 'feedback') {
      inc = 3 + (meta?.longComment ? 1 : 0);
      // Optional streak bonus estimation is backend-derived; omit locally to avoid mismatch
    } else if (event === 'like') inc = 1;
    else if (event === 'dislike') inc = 1;
    else if (event === 'rating') inc = 2;

    const s = get();
    const prevPoints = s.gamification.points || 0;
    const nextPoints = prevPoints + inc;
    const newHistory = [
      ...(s.gamification.history || []),
      { id, event, meta, points: inc, createdAt: now },
    ];

    // Remove local-only badge inference; rely on backend-synced badges for accuracy.
    const newBadges = [...(s.gamification.badges || [])];

    set(() => ({
      gamification: {
        points: nextPoints,
        badges: newBadges,
        history: newHistory,
        lastEarnedBadgeId: null, // will be set on refresh if backend awarded a badge
      },
    }));

    // Clear transient badge pulse flag just in case
    setTimeout(() => {
      const g = get().gamification || {};
      if (g.lastEarnedBadgeId) {
        set((st) => ({ gamification: { ...st.gamification, lastEarnedBadgeId: null } }));
      }
    }, 800);
  },
}));

/**
 * PUBLIC_INTERFACE
 * Gamification selectors
 */
export const selectGamification = (s) => s.gamification || { points: 0, badges: [], history: [] };
export const selectPoints = (s) => (s.gamification?.points ?? 0);
export const selectBadges = (s) => (s.gamification?.badges ?? []);
export const selectHistory = (s) => (s.gamification?.history ?? []);
export const selectLastEarnedBadgeId = (s) => s.gamification?.lastEarnedBadgeId || null;
