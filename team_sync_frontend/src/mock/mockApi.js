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
 * Score activities with department and quiz features,
 * and produce an ordered list that aims for:
 * - At least 4 items total
 * - Prefer 2 department-exclusive (when available)
 * - Prefer 2 general/common (non-exclusive and not department-scoped)
 * Fall back gracefully by filling with department-relevant or other high scores.
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

  // Pools
  const isExclusive = (a) => Array.isArray(a.exclusiveDepartments) && a.exclusiveDepartments.includes(dept);
  const isDeptRelevant = (a) => Array.isArray(a.departments) && a.departments.includes(dept);
  const isCommon = (a) => !isExclusive(a) && (!Array.isArray(a.departments) || a.departments.length === 0);

  const exclusives = scored.filter(isExclusive);
  const commons = scored.filter(isCommon);
  const deptRelevantNonExclusive = scored.filter((a) => !isExclusive(a) && isDeptRelevant(a));
  const others = scored.filter((a) => !isExclusive(a) && !isDeptRelevant(a) && !isCommon(a));

  // Build ordered list:
  // 1) Up to 2 exclusives
  const pick = [];
  exclusives.slice(0, 2).forEach((a) => pick.push(a));

  // 2) Up to 2 commons
  commons.slice(0, 2).forEach((a) => {
    if (!pick.find((p) => p.id === a.id)) pick.push(a);
  });

  // If still less than 4, fill with dept-relevant non-exclusive first
  if (pick.length < 4) {
    for (const a of deptRelevantNonExclusive) {
      if (pick.length >= 4) break;
      if (!pick.find((p) => p.id === a.id)) pick.push(a);
    }
  }

  // If still less than 4, fill with remaining high-score others or commons
  if (pick.length < 4) {
    const filler = scored.filter((a) => !pick.find((p) => p.id === a.id));
    for (const a of filler) {
      if (pick.length >= 4) break;
      pick.push(a);
    }
  }

  // Cap to 5 total, keep current ordering (exclusives -> commons -> others by score)
  const final = pick.slice(0, 5).map((a) => ({
    ...a,
    heroAlignment: deriveHero(a),
    departmentExclusive: isExclusive(a),
    departmentScope: isExclusive(a)
      ? (Array.isArray(a.exclusiveDepartments) ? a.exclusiveDepartments : [])
      : (Array.isArray(a.departments) ? a.departments : [])
  }));

  return final;
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
