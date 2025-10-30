//
//
// Lightweight analytics derivation from local state feedback and saved items.
// Provides success metrics, improved sentiment heuristic, trends, and persona hints.
//
// PUBLIC_INTERFACE
export function deriveSuccessMetrics({ feedback = [], saved = [] }) {
  /**
   * Tighter metric definitions:
   * - completionRate: rated feedback (has rating) divided by saved count (cap at 1). If no saved, fallback to 0 unless feedback exists (then small baseline 0.1).
   * - likeRatio: likes / (likes + dislikes). Ignores neutral/no reaction entries.
   * - avgRating: arithmetic mean of rating values; if none, estimate from reactions (like=4.5, dislike=2.0).
   */
  const totalFeedback = feedback.length;
  const likes = feedback.filter(f => f.value === 'like').length;
  const dislikes = feedback.filter(f => f.value === 'dislike').length;
  const reactionTotal = likes + dislikes;

  const ratedList = feedback.filter(f => typeof f.rating === 'number' && f.rating > 0);
  const ratedCount = ratedList.length;
  const sumRating = ratedList.reduce((acc, f) => acc + (f.rating || 0), 0);

  const completionRate =
    saved.length > 0
      ? Math.max(0, Math.min(1, ratedCount / saved.length))
      : (ratedCount > 0 ? 0.1 : 0);

  const likeRatio = reactionTotal ? likes / reactionTotal : 0;

  const estimatedAvgFromReactions =
    reactionTotal ? ((likes * 4.5 + dislikes * 2.0) / reactionTotal) : 0;
  const avgRating = ratedCount ? (sumRating / ratedCount) : estimatedAvgFromReactions;

  return {
    completionRate,
    likeRatio,
    avgRating,
    totals: {
      feedback: totalFeedback,
      likes,
      dislikes,
      saved: saved.length,
      rated: ratedCount
    }
  };
}

// PUBLIC_INTERFACE
export function deriveSentimentSummary({ feedback = [] }) {
  /**
   * Improved heuristic sentiment:
   * - Keyword scoring with small TF-like weights.
   * - Reaction and rating carry calibrated weights.
   * - Bucket into positive | mixed | negative with slightly widened neutral band to reduce flip-flop.
   */
  const posWords = ['love', 'great', 'good', 'fun', 'amazing', 'awesome', 'engaging', 'useful', 'enjoy', 'nice'];
  const negWords = ['bad', 'boring', 'slow', 'confusing', 'hate', 'meh', 'bug', 'issue', 'hard', 'annoy'];

  let score = 0;
  const mentions = { positive: 0, negative: 0, neutral: 0 };

  feedback.forEach(f => {
    let local = 0;
    const c = (f.comment || '').toLowerCase();

    if (c) {
      posWords.forEach(w => { if (c.includes(w)) local += 0.8; });
      negWords.forEach(w => { if (c.includes(w)) local -= 0.9; });
    }
    // reaction/rating signals always considered
    if (f.value === 'like') local += 0.6;
    if (f.value === 'dislike') local -= 0.6;
    if (typeof f.rating === 'number') local += (f.rating - 3) * 0.25; // center at 3

    score += local;
    if (local > 0.35) mentions.positive += 1;
    else if (local < -0.35) mentions.negative += 1;
    else mentions.neutral += 1;
  });

  const sentimentScore = feedback.length ? Math.max(-1, Math.min(1, score / feedback.length)) : 0;
  const label = sentimentScore > 0.3 ? 'positive' : sentimentScore < -0.3 ? 'negative' : 'mixed';

  return { sentimentScore, label, mentions };
}

// PUBLIC_INTERFACE
export function deriveTrendBuckets({ feedback = [], range = '4w' }) {
  /**
   * Bucket feedback by week index (simple local time bucketing).
   * range: '4w' | '12w' | 'all'
   * Adds graceful empty-state by returning at least 4 buckets with zeros.
   */
  const baseWeeks = range === '12w' ? 12 : range === '4w' ? 4 : 12;
  const weeks = Math.max(4, baseWeeks);
  const now = Date.now();
  const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;

  const buckets = Array.from({ length: weeks }).map((_, i) => ({
    name: `W${weeks - i}`,
    likes: 0,
    dislikes: 0,
    total: 0,
    tags: {}
  }));

  if (!feedback.length) {
    // return zeros but still provide axis labels
    return {
      buckets,
      topTagsTrend: buckets.map(b => ({ name: b.name, tag: '', count: 0 }))
    };
  }

  feedback.forEach((f, idx) => {
    // Use createdAt if present; otherwise distribute pseudo-randomly but deterministically across recent weeks
    let t = f.createdAt ? new Date(f.createdAt).getTime() : (now - ((idx % weeks) * MS_PER_WEEK * 0.7));
    const diffW = Math.floor((now - t) / MS_PER_WEEK);
    const bucketIndex = Math.max(0, Math.min(weeks - 1, weeks - 1 - diffW));
    const b = buckets[bucketIndex];
    if (!b) return;
    if (f.value === 'like') b.likes += 1;
    else if (f.value === 'dislike') b.dislikes += 1;
    b.total += 1;

    const comment = (f.comment || '').toLowerCase();
    const tagMatches = (comment.match(/#([a-z0-9_]+)/g) || []).map(s => s.substring(1));
    tagMatches.forEach(tag => {
      b.tags[tag] = (b.tags[tag] || 0) + 1;
    });
  });

  const topTagsTrend = buckets.map(b => {
    const entries = Object.entries(b.tags);
    const top = entries.sort((a, x) => x[1] - a[1])[0];
    return { name: b.name, tag: top ? top[0] : '', count: top ? top[1] : 0 };
  });

  return { buckets, topTagsTrend };
}

// PUBLIC_INTERFACE
export function deriveHeroAlignmentBreakdown({ saved = [], feedback = [] }) {
  /**
   * Compute hero alignment split using saved items' _heroAlignment or heroAlignment,
   * and nudge with likes distribution for better reflection.
   */
  const counts = {};
  const inc = (k, n = 1) => { counts[k] = (counts[k] || 0) + n; };

  saved.forEach(s => {
    const k = s._heroAlignment || s.heroAlignment || 'Ally';
    inc(k, 2); // heavier weight to saved
  });

  feedback.forEach(f => {
    const title = (f.activityTitle || '').toLowerCase();
    // tiny heuristic mapping from title keywords
    const map = [
      { key: 'strategy', hero: 'Strategist' },
      { key: 'architecture', hero: 'Strategist' },
      { key: 'games', hero: 'Vanguard' },
      { key: 'quality', hero: 'Guardian' },
      { key: 'wellness', hero: 'Guardian' },
      { key: 'creative', hero: 'Innovator' },
      { key: 'product', hero: 'Innovator' },
    ];
    const found = map.find(m => title.includes(m.key));
    const hero = found?.hero || 'Ally';
    const weight = f.value === 'like' ? 1 : -0.5;
    inc(hero, weight);
  });

  const total = Object.values(counts).reduce((a, b) => a + (b > 0 ? b : 0), 0) || 1;
  const breakdown = Object.entries(counts).map(([k, v]) => ({
    hero: k,
    pct: Math.max(0, (v / total))
  })).sort((a, b) => b.pct - a.pct);

  return breakdown;
}

// PUBLIC_INTERFACE
export function derivePersona({ team = {}, quiz = {}, saved = [], feedback = [] }) {
  /**
   * Lightweight persona composition: name and witty summary from engagement.
   * Adds small copy refinements and alignment breakdown ready for chip display.
   */
  const breakdown = deriveHeroAlignmentBreakdown({ saved, feedback });
  const top = breakdown[0]?.hero || 'Ally';
  const size = Number(team.size || 0);
  const mode = team.mode || 'hybrid';
  const dept = team.department || 'Team';
  const energy = quiz.energy || 'balanced';

  const name = `${dept} — ${top} Collective`;
  const witty = [
    'The Office Meets Avengers Squad',
    'Figma Files & Friday Fun',
    'Coffee-fueled Collaborators',
    'The Agile Assemble',
  ];
  const label = witty[(dept.length + size) % witty.length];

  const modeLabel = mode === 'remote' ? 'remote' : mode === 'in_person' ? 'in‑person' : 'hybrid';
  const summary = `${label}: a ${modeLabel} crew with ${energy} energy, rallying behind ${top.toLowerCase()} vibes.`;

  return {
    persona: {
      name,
      summary,
      tone: ['playful', 'supportive'],
      motivators: ['connection', 'recognition'],
      constraints: ['low friction', 'time-bound'],
    },
    breakdown
  };
}
