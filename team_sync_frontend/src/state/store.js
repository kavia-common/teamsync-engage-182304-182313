import React, { createContext, useContext, useMemo, useReducer } from 'react';

/**
 * Shape:
 * {
 *   team: { name, size, mode },
 *   quiz: { energy, budget, duration, interests },
 *   saved: [activity],
 *   feedback: [{ id, activityId, activityTitle, value }]
 * }
 */
const initialState = {
  team: { name: '', size: 0, mode: 'hybrid' },
  quiz: { energy: 'balanced', budget: 'medium', duration: '60', interests: ['games'] },
  saved: [],
  feedback: []
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_TEAM':
      return { ...state, team: { ...state.team, ...action.payload } };
    case 'SET_QUIZ':
      return { ...state, quiz: { ...state.quiz, ...action.payload } };
    case 'SAVE_RECOMMENDATION':
      if (state.saved.find((s) => s.id === action.payload.id)) return state;
      return { ...state, saved: [...state.saved, action.payload] };
    case 'ADD_FEEDBACK':
      return { ...state, feedback: [...state.feedback, action.payload] };
    default:
      return state;
  }
}

const StoreContext = createContext({ state: initialState, actions: {} });

/**
 * PUBLIC_INTERFACE
 * Provider wrapping the app with global store.
 */
export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const actions = useMemo(
    () => ({
      // PUBLIC_INTERFACE
      async setTeam(team) {
        dispatch({ type: 'SET_TEAM', payload: team });
      },
      // PUBLIC_INTERFACE
      async setQuiz(quiz) {
        dispatch({ type: 'SET_QUIZ', payload: quiz });
      },
      // PUBLIC_INTERFACE
      async saveRecommendation(item) {
        dispatch({ type: 'SAVE_RECOMMENDATION', payload: item });
      },
      // PUBLIC_INTERFACE
      async giveFeedback(activityId, value, activityTitle = '') {
        const entry = {
          id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
          activityId,
          activityTitle,
          value
        };
        dispatch({ type: 'ADD_FEEDBACK', payload: entry });
      }
    }),
    []
  );

  const contextValue = useMemo(() => ({ state, actions }), [state, actions]);

  return <StoreContext.Provider value={contextValue}>{children}</StoreContext.Provider>;
}

/**
 * PUBLIC_INTERFACE
 * Access to raw store (state + actions)
 */
export function useStoreContext() {
  return useContext(StoreContext);
}
