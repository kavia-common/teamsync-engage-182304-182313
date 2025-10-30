import { ACTIVITIES } from './mockData';

let saved = [];
let feedback = [];

/**
 * Simple scoring based on quiz and team mode to choose 3-5 items.
 */
function scoreActivities({ team, quiz }) {
  const { mode } = team || { mode: 'hybrid' };
  const { energy, budget, interests } = quiz || { energy: 'balanced', budget: 'medium', interests: [] };

  return ACTIVITIES.map((a) => {
    let s = 0;
    // match mode
    if (mode === 'remote' && a.tags.includes('remote')) s += 2;
    if (mode === 'in_person' && a.tags.includes('in_person')) s += 2;
    if (mode === 'hybrid' && (a.tags.includes('remote') || a.tags.includes('in_person'))) s += 1;

    // energy
    if (energy && a.tags.includes(energy)) s += 2;
    if (energy === 'balanced' && a.tags.includes('chill')) s += 1;

    // budget
    if (budget === a.budget) s += 2;
    else if (budget === 'medium' && a.budget === 'low') s += 1;

    // interests overlap
    const overlaps = (interests || []).filter((t) => a.tags.includes(t)).length;
    s += overlaps * 2;

    return { ...a, score: s };
  })
    .sort((x, y) => y.score - x.score)
    .slice(0, 5);
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
  getFeedback() { return [...feedback]; }
};

export default mockApi;
