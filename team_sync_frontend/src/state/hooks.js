import { useZStore } from './store.zustand';

/**
 * PUBLIC_INTERFACE
 * Hook that exposes state and actions from the Zustand store.
 */
export function useStore() {
  const state = useZStore((s) => ({
    team: s.team,
    quiz: s.quiz,
    saved: s.saved,
    feedback: s.feedback,
  }));
  const actions = {
    setTeam: useZStore((s) => s.setTeam),
    setQuiz: useZStore((s) => s.setQuiz),
    saveRecommendation: useZStore((s) => s.saveRecommendation),
    // PUBLIC_INTERFACE
    // Unified feedback method allowing minimal (id,value,title) and extended (comment, rating)
    giveFeedback: (activityId, value, activityTitle = '', comment = '', rating = 0) =>
      useZStore.getState().giveFeedback({ activityId, value, activityTitle, comment, rating })
  };
  return { state, actions };
}
