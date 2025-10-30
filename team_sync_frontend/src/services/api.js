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
    // payload may contain { team, quiz, limit }; backend only requires teamId and optional limit
    try {
      const teamId =
        payload?.team?.teamId || payload?.team?.id || payload?.team?.name || '';
      const limit = Math.max(
        3,
        Math.min(5, Number(payload?.limit || 5) || 5)
      );
      if (!teamId) throw new Error('Missing teamId');
      const q = new URLSearchParams({ teamId: String(teamId), limit: String(limit) }).toString();
      // Backend: GET /api/recommendations?teamId=&limit=
      const data = await fetchJson(`/api/recommendations?${q}`, { method: 'GET' });
      // Expected shape: { teamId, recommendations: [{ activity, score }] }
      const list = Array.isArray(data?.recommendations)
        ? data.recommendations.map((r) => ({
            id: r.activity?.id || `rec-${Math.random().toString(36).slice(2, 8)}`,
            title: r.activity?.title || 'Activity',
            description:
              r.activity?.description ||
              `Great for ${r.activity?.mode || 'hybrid'} teams`,
            duration: Number(r.activity?.duration || 30),
            tags: Array.isArray(r.activity?.tags) ? r.activity.tags : [],
            suggestedSize: r.activity?.suggestedSize || '',
            budget: r.activity?.budget || 'medium',
            departmentExclusive: false,
            departmentScope: [],
            heroAlignment: 'Ally',
            _score: Number(r.score || 0),
          }))
        : [];
      return list;
    } catch (e) {
      return mockApi.getRecommendations(payload);
    }
  },

  // PUBLIC_INTERFACE
  async saveRecommendation(item) {
    try {
      // Backend: POST /api/save with { teamId, activityId }
      const teamId =
        item?.teamId ||
        item?._teamId ||
        (typeof window !== 'undefined' && window.__TS_TEAM_ID__) ||
        undefined;
      const payload = {
        teamId,
        activityId: item?.id,
      };
      const data = await postJson('/api/save', payload);
      if (!data || data.success !== true) throw new Error('Invalid response');
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

  // --- AI ---

  // PUBLIC_INTERFACE
  async postAIRecommendations(payload) {
    // Calls backend AI endpoint; falls back to mock recommendations if backend is unavailable.
    try {
      const data = await postJson('/api/ai/recommendations', payload);

      // Normalize response: some providers/versions might return array root or missing metadata
      const rawIdeas = Array.isArray(data?.ideas)
        ? data.ideas
        : Array.isArray(data)
          ? data
          : [];

      if (!Array.isArray(rawIdeas) || rawIdeas.length === 0) throw new Error('Invalid AI response');

      // Source/model defaults
      const source = data?.source || 'openai';
      const model =
        data?.model ||
        (source === 'openai'
          ? (typeof process !== 'undefined' && process.env && process.env.REACT_APP_OPENAI_MODEL) || 'gpt-4o-mini'
          : 'rules-v1');
      const usage = data?.usage || null;
      const error = data?.error || null;

      // Ensure each idea has expected fields and fit_score in 0..1, departmentScope array, heroAlignment string
      const ideas = rawIdeas.map((x, idx) => ({
        id: x.id || `ai-${idx}-${Math.random().toString(36).slice(2, 8)}`,
        title: String(x.title || '').trim(),
        description: String(x.description || '').trim(),
        duration: Number(x.duration || 30),
        tags: Array.isArray(x.tags) ? x.tags.map((t) => String(t).toLowerCase()) : [],
        departmentScope: Array.isArray(x.departmentScope) ? x.departmentScope : [],
        heroAlignment: x.heroAlignment || 'Ally',
        // normalize provider-sent 0..100 to 0..1 if needed
        fit_score: (() => {
          const fs = Number(x.fit_score);
          if (Number.isNaN(fs)) return 0.5;
          return fs > 1 ? Math.max(0, Math.min(1, fs / 100)) : Math.max(0, Math.min(1, fs));
        })(),
        reasoning: String(x.reasoning || '').trim(),
        durationBucket: x.durationBucket || (Number(x.duration || 30) <= 20 ? 'short' : Number(x.duration || 30) <= 60 ? 'medium' : 'long'),
        mode: x.mode || 'hybrid'
      }));

      // Cap to 5 and stable sort by fit_score desc
      const sortedIdeas = ideas
        .slice(0, 5)
        .sort((a, b) => (Number(b.fit_score || 0) - Number(a.fit_score || 0)));

      return { ideas: sortedIdeas, source, model, usage, error };
    } catch (e) {
      // Fallback: use existing getRecommendations mock to avoid blocking UX
      const ideas = await mockApi.getRecommendations(payload);
      return {
        ideas: Array.isArray(ideas) ? ideas : [],
        source: 'fallback',
        model: 'rules-v1'
      };
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
