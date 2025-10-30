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
    // optimistic local update; backend sync handled by services/api award call sites
    const now = new Date().toISOString();
    const id = `${event}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    // simple rules: assign small points per event; badges via thresholds
    const pointsMap = { save: 10, feedback: 5, like: 3, dislike: 1, rating: 6 };
    const inc = pointsMap[event] ?? 2;

    const s = get();
    const prevPoints = s.gamification.points || 0;
    const nextPoints = prevPoints + inc;
    const newHistory = [
      ...(s.gamification.history || []),
      { id, event, meta, points: inc, createdAt: now },
    ];

    // Check badge rules (idempotent)
    const had = (bid) => (s.gamification.badges || []).some((b) => b.id === bid);
    const newBadges = [...(s.gamification.badges || [])];
    let newlyEarned = null;

    // Rule: First Save
    if (event === 'save' && !had('first_save')) {
      newlyEarned = { id: 'first_save', title: 'First Save', earnedAt: now };
      newBadges.push(newlyEarned);
    }
    // Rule: Feedback Apprentice at 5 feedback entries
    const feedbackCount =
      newHistory.filter((h) => h.event === 'feedback' || (h.event === 'rating')).length;
    if (feedbackCount >= 5 && !had('feedback_apprentice')) {
      newlyEarned = { id: 'feedback_apprentice', title: 'Feedback Apprentice', earnedAt: now };
      newBadges.push(newlyEarned);
    }
    // Rule: Points Milestone 100
    if (nextPoints >= 100 && !had('points_100')) {
      newlyEarned = { id: 'points_100', title: 'Level 100 Points', earnedAt: now };
      newBadges.push(newlyEarned);
    }

    set(() => ({
      gamification: {
        points: nextPoints,
        badges: newBadges,
        history: newHistory,
        lastEarnedBadgeId: newlyEarned?.id || null,
      },
    }));

    // Auto-clear the transient lastEarnedBadgeId after short delay for UI pulse
    setTimeout(() => {
      const g = get().gamification || {};
      if (g.lastEarnedBadgeId) {
        set((st) => ({ gamification: { ...st.gamification, lastEarnedBadgeId: null } }));
      }
    }, 1200);
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
