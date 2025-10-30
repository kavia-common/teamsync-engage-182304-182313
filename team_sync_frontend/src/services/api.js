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

// Helper to perform fetch with timeout and parse JSON
async function fetchJson(path, options = {}) {
  const controller = new AbortController();
  const t0 = performance && performance.now ? performance.now() : Date.now();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });
    const t1 = performance && performance.now ? performance.now() : Date.now();
    const latency_ms = Math.round(t1 - t0);
    // Developer observability
    // eslint-disable-next-line no-console
    console.debug('[api]', { route: path, latency_ms, method: (options.method || 'GET') });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const text = await res.text();
    return text ? JSON.parse(text) : null;
  } finally {
    clearTimeout(timeout);
  }
}

// Helper to POST JSON
function postJson(path, body) {
  return fetchJson(path, { method: 'POST', body: JSON.stringify(body || {}) });
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
  },

  // PUBLIC_INTERFACE
  async getAnalytics(range = '4w', teamId) {
    // Prefer explicit teamId; allow undefined to fall back to mock
    if (!teamId) {
      try {
        return await mockApi.getAnalytics(range);
      } catch {
        // continue to backend attempt with no teamId to surface error
      }
    }
    try {
      // Backend expects GET /api/analytics?teamId=&range=
      const q = new URLSearchParams({ teamId: String(teamId || ''), range: String(range || '4w') }).toString();
      const data = await fetchJson(`/api/analytics?${q}`, { method: 'GET' });
      if (!data || !data.success) throw new Error('Invalid analytics');
      return { ...data, source: 'backend' };
    } catch (e) {
      return mockApi.getAnalytics(range);
    }
  },

  // PUBLIC_INTERFACE
  async generatePersona(team, quiz, context = { useCase: 'dashboard', locale: 'en-US' }) {
    // Prefer teamId for backend persona endpoint shape
    const teamId = team?.teamId || team?.id || team?.name || '';
    if (!teamId) {
      // fallback to mock if we cannot identify a team
      return mockApi.generatePersona(team, quiz);
    }
    try {
      // Backend expects GET /api/persona?teamId=
      const q = new URLSearchParams({ teamId: String(teamId) }).toString();
      const data = await fetchJson(`/api/persona?${q}`, { method: 'GET' });
      if (!data || !data.persona) throw new Error('Invalid persona');
      return { ...data, source: data.source || 'backend' };
    } catch (e) {
      return mockApi.generatePersona(team, quiz);
    }
  },

  // --- Gamification ---

  // PUBLIC_INTERFACE
  async getGamification(teamId) {
    try {
      const q = new URLSearchParams({ teamId: String(teamId || '') }).toString();
      const data = await fetchJson(`/api/gamification?${q}`, { method: 'GET' });
      if (!data) throw new Error('Invalid gamification');
      return data;
    } catch (e) {
      // fallback when backend not available: derive from mock store arrays if exposed
      // Since mock has no gamification, provide a neutral default
      return { points: 0, badges: [], history: [] };
    }
  },

  // PUBLIC_INTERFACE
  async awardGamification({ teamId, event, meta = {} }) {
    try {
      const payload = { teamId, event, meta };
      const data = await postJson('/api/gamification/award', payload);
      if (!data || data.ok !== true) throw new Error('Invalid award response');
      return data;
    } catch (e) {
      // fallback: pretend ok
      return { ok: true, source: 'fallback' };
    }
  },
};

export default api;
