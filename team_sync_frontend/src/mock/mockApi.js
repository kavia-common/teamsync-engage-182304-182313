import { ACTIVITIES } from './mockData';

let saved = [];
let feedback = [];

// derive analytics locally from shared arrays
let __importedDerive = null;
function getDerivers() {
  if (!__importedDerive) {
    try {
      // dynamic require to avoid circular during build
      // eslint-disable-next-line global-require
      __importedDerive = require('../services/analytics');
    } catch (e) {
      __importedDerive = {};
    }
  }
  return __importedDerive;
}

/**
 * Determine a playful hero alignment label for an activity when not provided.
 * Based on tags and department signals.
 */
function deriveHero(a) {
  if (a.heroHint) return a.heroHint;
  const t = a.tags || [];
  if (t.includes('strategy') || t.includes('architecture')) return 'Strategist';
  if (t.includes('creative') || t.includes('product')) return 'Innovator';
  if (t.includes('quality') || t.includes('wellness')) return 'Guardian';
  if (t.includes('games') || t.includes('outdoors')) return 'Vanguard';
  return 'Ally';
}

/**
 * Score activities with department and quiz features, ensuring at least one department-exclusive.
 */
function scoreActivities({ team, quiz }) {
  // Normalize department names to match mock data canonical values
  let dept = String(team?.department || '').trim();
  if (/^dev(elopment)?$/i.test(dept)) dept = 'Development';

  const mode = team?.mode || 'hybrid';
  const { energy, budget, interests } = quiz || { energy: 'balanced', budget: 'medium', interests: [] };

  // base scoring
  const scored = ACTIVITIES.map((a) => {
    let s = 0;

    // department relevance boost
    const isExclusiveForDept = Array.isArray(a.exclusiveDepartments) && a.exclusiveDepartments.includes(dept);
    const mentionsDept = Array.isArray(a.departments) && a.departments.includes(dept);
    if (isExclusiveForDept) s += 100; // ensure exclusives bubble up
    else if (mentionsDept) s += 26;

    // mode match
    const modes = a.mode || [];
    if (mode && modes.includes(mode)) s += 6;
    else if (mode === 'hybrid' && (modes.includes('remote') || modes.includes('in_person'))) s += 3;

    // energy
    if (energy && (a.tags || []).includes(energy)) s += 6;
    if (energy === 'balanced' && (a.tags || []).includes('chill')) s += 2;

    // budget
    if (budget === a.budget) s += 5;
    else if (budget === 'medium' && a.budget === 'low') s += 2;

    // interests overlap
    const overlaps = (interests || []).filter((t) => (a.tags || []).includes(t)).length;
    s += overlaps * 3.2;

    // diversity nudge
    if ((a.tags || []).includes('cross_department')) s += 2;

    return { ...a, score: s };
  }).sort((x, y) => y.score - x.score);

  // Ensure at least two department-exclusive items if available
  const exclusives = scored.filter(a => Array.isArray(a.exclusiveDepartments) && a.exclusiveDepartments.includes(dept));
  const nonExclusiveRanked = scored.filter(a => !(Array.isArray(a.exclusiveDepartments) && a.exclusiveDepartments.includes(dept)));

  const result = [];
  if (exclusives.length >= 2) {
    result.push(exclusives[0], exclusives[1]);
  } else if (exclusives.length === 1) {
    result.push(exclusives[0]);
    // Try to add a department-relevant (non-exclusive) item as second priority
    const deptRelevant = nonExclusiveRanked.find(a => (a.departments || []).includes(dept));
    if (deptRelevant) result.push(deptRelevant);
  } else {
    // No exclusives: add top dept-relevant item if present; otherwise top general
    const deptRelevant = nonExclusiveRanked.find(a => (a.departments || []).includes(dept));
    result.push(deptRelevant || scored[0]);
  }

  // Fill remaining 1–3 items with high scores prioritizing dept relevance
  const pool = scored.filter(a => !result.find(r => r.id === a.id));
  const prioritized = [
    ...pool.filter(a => (a.departments || []).includes(dept)).slice(0, 3),
    ...pool.filter(a => !(a.departments || []).includes(dept)).slice(0, 4),
  ];

  // target length between 3 and 5
  const needed = Math.max(3 - result.length, 0);
  const desired = Math.max(3, Math.min(5, result.length + prioritized.length));
  const finalList = [...result, ...prioritized].slice(0, desired).map(a => ({
    ...a,
    heroAlignment: deriveHero(a),
    departmentExclusive: Array.isArray(a.exclusiveDepartments) && a.exclusiveDepartments.includes(dept),
    departmentScope: (Array.isArray(a.exclusiveDepartments) && a.exclusiveDepartments.length)
      ? a.exclusiveDepartments
      : (Array.isArray(a.departments) ? a.departments : [])
  }));

  // Safety: if we still have fewer than 2 exclusives but they exist in the catalog for this dept, try to add second one
  if (exclusives.length >= 2) {
    // already satisfied
    return finalList;
  }
  if (exclusives.length === 1) {
    const hasOne = finalList.some(x => x.id === exclusives[0].id);
    if (hasOne) {
      const second = exclusives.find(x => x.id !== exclusives[0].id);
      if (second && !finalList.find(x => x.id === second.id)) {
        finalList.splice(Math.min(1, finalList.length), 0, {
          ...second,
          heroAlignment: deriveHero(second),
          departmentExclusive: true,
          departmentScope: second.exclusiveDepartments
        });
        return finalList.slice(0, 5);
      }
    }
  }
  return finalList;
}

const wait = (ms) => new Promise((res) => setTimeout(res, ms));

const mockApi = {
  // PUBLIC_INTERFACE
  async getRecommendations(payload) {
    await wait(300);
    return scoreActivities(payload);
  },

  // PUBLIC_INTERFACE
  async saveRecommendation(item) {
    await wait(150);
    if (!saved.find((s) => s.id === item.id)) {
      saved.push(item);
    }
    return { ok: true };
  },

  // PUBLIC_INTERFACE
  async giveFeedback(activityId, value) {
    await wait(150);
    const act = ACTIVITIES.find((a) => a.id === activityId);
    feedback.push({ id: `${Date.now()}`, activityId, activityTitle: act?.title || '', value });
    return { ok: true };
  },

  // PUBLIC_INTERFACE
  getSaved() { return [...saved]; },

  // PUBLIC_INTERFACE
  getFeedback() { return [...feedback]; },

  // PUBLIC_INTERFACE
  async getAnalytics(range = '4w') {
    await wait(120);
    const { deriveSuccessMetrics, deriveSentimentSummary, deriveTrendBuckets, deriveHeroAlignmentBreakdown } = getDerivers();
    const success = deriveSuccessMetrics ? deriveSuccessMetrics({ feedback, saved }) : { completionRate: 0, likeRatio: 0, avgRating: 0, totals: { feedback: feedback.length, likes: 0, dislikes: 0, saved: saved.length, rated: 0 } };
    const sentiment = deriveSentimentSummary ? deriveSentimentSummary({ feedback }) : { sentimentScore: 0, label: 'mixed', mentions: { positive: 0, negative: 0, neutral: feedback.length } };
    const trend = deriveTrendBuckets ? deriveTrendBuckets({ feedback, range }) : { buckets: [], topTagsTrend: [] };
    const heroes = deriveHeroAlignmentBreakdown ? deriveHeroAlignmentBreakdown({ saved, feedback }) : [];
    return { success, sentiment, trend, heroes, source: 'fallback' };
  },

  // PUBLIC_INTERFACE
  async generatePersona(team = {}, quiz = {}) {
    await wait(150);
    const { derivePersona } = getDerivers();
    if (derivePersona) {
      const p = derivePersona({ team, quiz, saved, feedback });
      return { ...p, source: 'fallback', model: 'rules-v1' };
    }
    return {
      persona: {
        name: `${(team.department || 'Team')} Persona`,
        summary: 'Balanced, collaborative, and up for a playful challenge.',
        tone: ['playful', 'supportive'],
        motivators: ['connection'],
        constraints: ['time-bound']
      },
      breakdown: [{ hero: 'Ally', pct: 1 }],
      source: 'fallback',
      model: 'rules-v1'
    };
  }
};

export default mockApi;
