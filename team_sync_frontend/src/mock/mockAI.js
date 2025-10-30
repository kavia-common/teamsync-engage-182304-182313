//
// Mock AI idea generator used as a temporary fallback when the backend AI service is unavailable.
// Returns 3–5 ideas with playful tone and department-aware content.
// Adds configurable scoring/creativity and richer reasoning bullets.
//

// Lightweight configuration block for easy tuning
const CONFIG = {
  // Weighting
  deptWeight: 2.2,               // emphasis on department alignment
  interestWeight: 1.4,           // quiz interests weight
  workModeWeight: 1.1,           // team work mode weight
  energyWeight: 0.9,             // quiz energy weight
  baseMinFit: 60,                // clamp min
  baseMaxFit: 98,                // clamp max

  // Creativity signals for titling and description flourishes
  creativityPhrases: [
    'spark-powered', 'playfully strategic', 'micro-epic', 'zero-friction',
    'caffeine-free momentum', 'snackable collaboration', 'idea-forward', 'delight-first'
  ],

  // Tag boosts influence fit
  tagBoosts: {
    collaboration: 4,
    communication: 3,
    creativity: 3,
    'problem-solving': 3,
    'remote-friendly': 2,
    hybrid: 2,
    'quick-setup': 2,
    chill: 1,
    balanced: 1,
    high: 1
  },

  // Hero alignments to cycle through
  heroAlignments: ['Strategist', 'Innovator', 'Guardian', 'Vanguard', 'Ally']
};

// PUBLIC_INTERFACE
export async function generateIdeas(team = {}, quiz = {}, department = "General") {
  /** 
   * Generates mock AI ideas for team-building activities.
   * - Ensures at least one department-exclusive idea (scope == department)
   * - Adds creative flourishes in titles/descriptions with playful tone
   * - Computes fit_score with higher weights for department match and selected interests/work mode
   * - Enriches reasoning with short bullet points (why fit, dept alignment, constraints)
   * - Ensures 3–5 total items
   * Returns: Promise<Array<Idea>> where Idea = {
   *   id, title, description, duration, tags, departmentScope,
   *   heroAlignment, fit_score, reasoning, source, model
   * }
   */
  const rng = seededRandom(JSON.stringify({ team, quiz, department, t: Date.now() }));
  const targetCount = clamp(3 + Math.floor(rng() * 3), 3, 5); // 3–5
  const baseIdeas = getBaseIdeaPool(department);

  // Score each idea with weighted logic
  const scored = baseIdeas.map((idea) => {
    const score100 = computeFitScore100({ idea, team, quiz, department, rng });
    return { ...idea, fit_score: score100 };
  });

  // Choose a diverse subset
  const picks = pickUnique(scored.sort((a, b) => b.fit_score - a.fit_score), targetCount, rng);

  // Guarantee department-exclusive presence
  if (!picks.some(i => String(i.departmentScope || '').toLowerCase() === String(department || '').toLowerCase())) {
    const exclusive = scored.find(i => String(i.departmentScope || '').toLowerCase() === String(department || '').toLowerCase());
    if (exclusive) {
      // Replace the lowest fit pick
      let minIdx = 0;
      for (let i = 1; i < picks.length; i++) if (picks[i].fit_score < picks[minIdx].fit_score) minIdx = i;
      picks[minIdx] = exclusive;
    }
  }

  // Final shaping: hero, duration, creative copy, structured reasoning bullets
  const shaped = picks.slice(0, clamp(picks.length, 3, 5)).map((idea, idx) => {
    const hero = idea.heroAlignment || pickOne(CONFIG.heroAlignments, rng);
    const duration = idea.duration || pickOne(["25–35 min", "40–55 min", "60–85 min"], rng);

    const creativeTitle = addCreativeFlourishToTitle(idea.title, rng);
    const desc = withPlayfulTone(addCreativeFlourishToDescription(idea.description, rng));
    const reasoningBullets = buildReasoningBullets({ idea, team, quiz, department, rng });

    return {
      ...idea,
      id: idea.id || `mock-${String(department || 'general').toLowerCase()}-${idx}-${Math.floor(rng() * 1e5)}`,
      title: creativeTitle,
      description: desc,
      duration,
      heroAlignment: hero,
      source: "mock-ai",
      model: "mock-v1",
      reasoning: reasoningBullets.join(' • '),
      tags: Array.isArray(idea.tags) && idea.tags.length ? idea.tags : generateTags(idea, rng),
      fit_score: clamp(idea.fit_score, CONFIG.baseMinFit, CONFIG.baseMaxFit)
    };
  });

  // Sort desc by fit_score to feel smarter out of the box
  shaped.sort((a, b) => b.fit_score - a.fit_score);
  return shaped;
}

// Helpers

function seededRandom(seedStr) {
  // Simple xorshift-based PRNG seeded from a string
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seedStr.length; i++) {
    h ^= seedStr.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  let state = h || 1;
  return function() {
    // xorshift32
    state ^= state << 13; state ^= state >>> 17; state ^= state << 5;
    // Convert to [0,1)
    return ((state >>> 0) / 4294967296);
  };
}

function pickUnique(array, count, rng) {
  const copy = array.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, Math.max(3, Math.min(5, count)));
}

function pickOne(arr, rng) {
  return arr[Math.floor(rng() * arr.length)];
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function pickSome(arr, n, rng) {
  const copy = arr.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, Math.max(0, Math.min(n, copy.length)));
}

function withPlayfulTone(text) {
  const extras = [
    " Bonus points for team spirit!",
    " Expect high-fives and maybe a GIF reaction.",
    " Guaranteed to spark smiles and brainstorms.",
    " Warning: may cause spontaneous collaboration.",
    " Insert celebratory emoji here 🎉"
  ];
  return `${text.trim()} ${pickOne(extras, seededRandom(text))}`.trim();
}

function addCreativeFlourishToTitle(title, rng) {
  const flair = pickOne(CONFIG.creativityPhrases, rng);
  // Insert flair as a subtitle-like suffix
  return `${title} · ${flair}`;
}

function addCreativeFlourishToDescription(desc, rng) {
  const bits = pickSome(CONFIG.creativityPhrases, 2, rng);
  return `${desc} This one is ${bits.join(' and ')}.`;
}



// Build concise reasoning bullets
function buildReasoningBullets({ idea, team, quiz, department, rng }) {
  const bullets = [];
  // Why fit
  bullets.push('why: strong match to team profile');
  // Department alignment
  const scope = String(idea.departmentScope || '');
  const isDept = scope.toLowerCase() === String(department || '').toLowerCase();
  bullets.push(`dept: ${isDept ? 'exclusive to' : 'relevant for'} ${department || 'your team'}`);
  // Constraints
  const duration = idea.duration || 45;
  const mode = team?.mode || team?.workMode || 'hybrid';
  const budget = quiz?.budget || 'medium';
  bullets.push(`constraints: ${duration}m • ${mode} • ${budget}`);
  // A hint of hero
  const hero = idea.heroAlignment || pickOne(CONFIG.heroAlignments, rng);
  bullets.push(`hero: ${hero}`);
  return bullets;
}

function generateTags(idea, rng) {
  const bag = [
    "icebreaker", "remote-friendly", "in-person", "hybrid", "collaboration",
    "creativity", "communication", "problem-solving", "low-cost", "quick-setup",
  ];
  const n = 3 + Math.floor(rng() * 3); // 3–5
  const out = [];
  for (let i = 0; i < n; i++) {
    const t = pickOne(bag, rng);
    if (!out.includes(t)) out.push(t);
  }
  return out;
}

// Weighted fit score out of 100, with stronger department match and interests/work mode
function computeFitScore100({ idea, team, quiz, department, rng }) {
  let s = 50; // base
  const scope = String(idea.departmentScope || '');
  const dept = String(department || '').trim().toLowerCase();
  const tags = Array.isArray(idea.tags) ? idea.tags.map(t => String(t).toLowerCase()) : [];

  // Department weight
  if (scope.toLowerCase() === dept && dept) {
    s += 25 * CONFIG.deptWeight; // exclusive big boost
  }

  // Interests
  const interests = Array.isArray(quiz?.interests) ? quiz.interests.map(t => String(t).toLowerCase()) : [];
  const overlap = interests.filter(t => tags.includes(t)).length;
  s += overlap * (6 * CONFIG.interestWeight);

  // Work mode
  const mode = (team?.mode || team?.workMode || 'hybrid').toLowerCase();
  if (tags.includes(mode)) s += 6 * CONFIG.workModeWeight;
  else if (mode === 'hybrid' && (tags.includes('remote-friendly') || tags.includes('in-person'))) s += 3 * CONFIG.workModeWeight;

  // Energy
  const energy = String(quiz?.energy || 'balanced').toLowerCase();
  if (tags.includes(energy)) s += 4 * CONFIG.energyWeight;

  // Tag boosts
  Object.keys(CONFIG.tagBoosts).forEach((t) => {
    if (tags.includes(t)) s += CONFIG.tagBoosts[t];
  });

  // Small creative jitter
  s += Math.floor(rng() * 7) - 3; // -3..+3

  return clamp(Math.round(s), CONFIG.baseMinFit, CONFIG.baseMaxFit);
}

function getBaseIdeaPool(department) {
  const dept = department || "General";
  const shared = [
    {
      id: "mock-shared-1",
      title: "Hero Huddle: Lightning Wins",
      description: "Each teammate shares one recent win and one blocker—fast, friendly, and focused.",
      tags: ["communication", "quick-setup", "hybrid"],
      departmentScope: "General",
      heroAlignment: "People Hero",
      fit_score: 82
    },
    {
      id: "mock-shared-2",
      title: "Mystery Match: Cross-Team Pair-Up",
      description: "Random pairs solve a mini-challenge together, then present their approach.",
      tags: ["collaboration", "icebreaker", "remote-friendly"],
      departmentScope: "General",
      heroAlignment: "Culture Hero",
      fit_score: 79
    },
    {
      id: "mock-shared-3",
      title: "Retro Roulette",
      description: "Spin a wheel of retro prompts to spark fresh insights without the same-old format.",
      tags: ["creativity", "communication", "remote-friendly"],
      departmentScope: "General",
      heroAlignment: "Ops Hero",
      fit_score: 77
    }
  ];

  const byDept = {
    Engineering: [
      {
        id: "mock-eng-1",
        title: "Bug Bash Arcade",
        description: "Turn pesky issues into points—squash bugs in rounds with playful awards.",
        tags: ["problem-solving", "remote-friendly", "low-cost"],
        departmentScope: "Engineering",
        heroAlignment: "Product Hero",
        fit_score: 88
      },
      {
        id: "mock-eng-2",
        title: "Design Doc Speed Dating",
        description: "5-minute lightning reviews to align on architecture without the calendar drag.",
        tags: ["communication", "collaboration", "hybrid"],
        departmentScope: "Engineering",
        heroAlignment: "Ops Hero",
        fit_score: 86
      }
    ],
    Marketing: [
      {
        id: "mock-mkt-1",
        title: "Campaign Jam Session",
        description: "Rapid-fire brainstorming to remix a live campaign with fresh hooks.",
        tags: ["creativity", "collaboration", "hybrid"],
        departmentScope: "Marketing",
        heroAlignment: "Culture Hero",
        fit_score: 87
      },
      {
        id: "mock-mkt-2",
        title: "Audience Avatar Workshop",
        description: "Craft playful personas to sharpen messaging and spark empathy.",
        tags: ["communication", "creativity", "in-person"],
        departmentScope: "Marketing",
        heroAlignment: "People Hero",
        fit_score: 84
      }
    ],
    Sales: [
      {
        id: "mock-sales-1",
        title: "Objection Olympics",
        description: "Gamify common objections and trade winning comebacks in teams.",
        tags: ["communication", "icebreaker", "remote-friendly"],
        departmentScope: "Sales",
        heroAlignment: "Culture Hero",
        fit_score: 86
      },
      {
        id: "mock-sales-2",
        title: "Pitch Karaoke",
        description: "Spin a wheel, pitch a random product—score style, clarity, and creativity.",
        tags: ["creativity", "collaboration", "in-person"],
        departmentScope: "Sales",
        heroAlignment: "People Hero",
        fit_score: 83
      }
    ],
    HR: [
      {
        id: "mock-hr-1",
        title: "Policy Puzzle Hunt",
        description: "Turn key policy learnings into a playful scavenger quiz.",
        tags: ["communication", "low-cost", "remote-friendly"],
        departmentScope: "HR",
        heroAlignment: "Ops Hero",
        fit_score: 84
      },
      {
        id: "mock-hr-2",
        title: "Recognition Relay",
        description: "Pass the kudos baton—structured peer shoutouts that make culture hum.",
        tags: ["culture", "icebreaker", "hybrid"],
        departmentScope: "HR",
        heroAlignment: "Culture Hero",
        fit_score: 85
      }
    ],
    Product: [
      {
        id: "mock-pm-1",
        title: "Opportunity Framing Sprint",
        description: "Quickly transform raw insights into crisp opportunity statements.",
        tags: ["problem-solving", "communication", "hybrid"],
        departmentScope: "Product",
        heroAlignment: "Product Hero",
        fit_score: 89
      },
      {
        id: "mock-pm-2",
        title: "Roadmap Show & Tell",
        description: "Micro-demos and roadmap highlights to align momentum and focus.",
        tags: ["communication", "collaboration", "remote-friendly"],
        departmentScope: "Product",
        heroAlignment: "Ops Hero",
        fit_score: 83
      }
    ]
  };

  const deptIdeas = byDept[dept] || [];
  // Merge and ensure some variety
  const pool = [...shared, ...deptIdeas];
  // Add department-labeled exclusives
  pool.push({
    id: "mock-generic-1",
    title: `${dept} Hero Quest`,
    description: `A themed challenge aligned to ${dept} workflows with playful badges.`,
    tags: ["collaboration", "creativity", "hybrid"],
    departmentScope: dept,
    heroAlignment: "Culture Hero",
    fit_score: 86,
    reasoning: `Designed to energize ${dept} with low overhead and high smiles.`
  });
  pool.push({
    id: "mock-generic-2",
    title: `${dept} Sync & Sprint`,
    description: `Short burst planning plus a mini-retro tailored for ${dept}.`,
    tags: ["communication", "problem-solving", "quick-setup"],
    departmentScope: dept,
    heroAlignment: "Ops Hero",
    fit_score: 85,
    reasoning: `Balances speed and structure for ${dept} teams.`
  });

  return pool;
}
