import mockApi from '../mock/mockApi';

/**
 * PUBLIC_INTERFACE
 * API client. Uses backend if available, otherwise falls back to mockApi.
 * In this MVP we directly defer to mockApi.
 */
const api = {
  // PUBLIC_INTERFACE
  async getRecommendations(payload) {
    // In a real app, attempt fetch('/api/recommendations', { method:'POST', body: JSON.stringify(payload) })
    return mockApi.getRecommendations(payload);
  },

  // PUBLIC_INTERFACE
  async saveRecommendation(item) {
    return mockApi.saveRecommendation(item);
  },

  // PUBLIC_INTERFACE
  async giveFeedback(activityId, value) {
    return mockApi.giveFeedback(activityId, value);
  }
};

export default api;
