import mockApi from '../mock/mockApi';

/**
 * PUBLIC_INTERFACE
 * API client. Uses backend if available, otherwise falls back to mockApi.
 * Reads base URL from REACT_APP_API_BASE and defaults to http://localhost:4000.
 * Each call attempts the backend first; on network/HTTP failure it falls back to mockApi.
 */
const BASE_URL =
  (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_BASE) ||
  'http://localhost:4000';

// Helper to POST JSON with timeout and parse JSON response
async function postJson(path, body) {
  const controller = new AbortController();
  // safety timeout to avoid hanging UI; backend attempt should be quick
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body || {}),
      signal: controller.signal,
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    // handle empty body safely
    const text = await res.text();
    return text ? JSON.parse(text) : null;
  } finally {
    clearTimeout(timeout);
  }
}

const api = {
  // PUBLIC_INTERFACE
  async getRecommendations(payload) {
    try {
      // expect backend endpoint: POST /api/recommendations -> [Activity]
      const data = await postJson('/api/recommendations', payload);
      if (!Array.isArray(data)) throw new Error('Invalid response');
      return data;
    } catch (e) {
      // Fallback to mock on any network/HTTP/parse error
      return mockApi.getRecommendations(payload);
    }
  },

  // PUBLIC_INTERFACE
  async saveRecommendation(item) {
    try {
      // expect backend endpoint: POST /api/recommendations/save -> { ok: true }
      const data = await postJson('/api/recommendations/save', item);
      if (!data || data.ok !== true) throw new Error('Invalid response');
      return data;
    } catch (e) {
      return mockApi.saveRecommendation(item);
    }
  },

  // PUBLIC_INTERFACE
  async giveFeedback(activityId, value, activityTitle = '', comment = '', rating = 0) {
    try {
      // expect backend endpoint: POST /api/feedback -> { ok: true }
      const data = await postJson('/api/feedback', { activityId, value, activityTitle, comment, rating });
      if (!data || data.ok !== true) throw new Error('Invalid response');
      return data;
    } catch (e) {
      return mockApi.giveFeedback(activityId, value);
    }
  }
};

export default api;
