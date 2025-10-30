import { useZStore } from './store.zustand';

/**
 * PUBLIC_INTERFACE
 * Hook that exposes state and actions from the Zustand store.
 * Required actions used by Dashboard:
 * - setTimeRange(range: '4w'|'12w'|'all')
 * - setAnalytics(payload)
 * - setPersona(payload)
 * - giveFeedback(activityId, value, activityTitle?, comment?, rating?)
 * Also exposes gamification actions/selectors.
 */
export function useStore() {
  const state = useZStore((s) => ({
    team: s.team,
    quiz: s.quiz,
    saved: s.saved,
    feedback: s.feedback,
    plan: s.plan,
    timeRange: s.timeRange,
    analytics: s.analytics,
    persona: s.persona,
    gamification: s.gamification,
  }));
  const actions = {
    setTeam: useZStore((s) => s.setTeam),
    setQuiz: useZStore((s) => s.setQuiz),
    saveRecommendation: useZStore((s) => s.saveRecommendation),
    // PUBLIC_INTERFACE
    // Unified feedback method allowing minimal (id,value,title) and extended (comment, rating)
    giveFeedback: (activityId, value, activityTitle = '', comment = '', rating = 0) =>
      useZStore.getState().giveFeedback({ activityId, value, activityTitle, comment, rating }),
    // PUBLIC_INTERFACE
    setPlan: useZStore((s) => s.setPlan),
    setTimeRange: useZStore((s) => s.setTimeRange),
    setAnalytics: useZStore((s) => s.setAnalytics),
    setPersona: useZStore((s) => s.setPersona),

    // Gamification
    // PUBLIC_INTERFACE
    refreshGamification: useZStore((s) => s.refreshGamification),
    // PUBLIC_INTERFACE
    recordAward: useZStore((s) => s.recordAward),
  };
  return { state, actions };
}
