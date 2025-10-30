State layer: Zustand-based store. Use useStore() from state/hooks to access { state, actions }.
State shape:
- team: { name, size, department, mode }
- quiz: { energy, budget, duration, interests, collaboration }
- saved: Activity[]
- feedback: { id, activityId, activityTitle, value, comment?, rating? }[]

Actions: setTeam, setQuiz, saveRecommendation, giveFeedback.
Note: giveFeedback accepts payload with { activityId, value, activityTitle?, comment?, rating? } and stores it in feedback.
