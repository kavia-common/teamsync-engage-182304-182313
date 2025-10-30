//
// Mock AI idea generator used as a temporary fallback when the backend AI service is unavailable.
// Returns 3–5 ideas with playful tone and department-aware content.
//
// PUBLIC_INTERFACE
export async function generateIdeas(team = {}, quiz = {}, department = "General") {
  /** 
   * Generates mock AI ideas for team-building activities.
   * Params:
   *  - team: object containing team info (e.g., size, remote/hybrid, preferences)
   *  - quiz: object containing quiz responses/results
   *  - department: string of the selected department
   * Returns:
   *  - Promise<Array<Idea>> where Idea = {
   *      id, title, description, duration, tags, departmentScope, 
   *      heroAlignment, fit_score, reasoning, source, model
   *    }
   */
  const rng = seededRandom(JSON.stringify({ team, quiz, department, t: Date.now() }));
  const size = Math.max(3, Math.min(5, Math.floor(rng() * 5) + 3)); // 3–7 then clamp to 3–5
  const baseIdeas = getBaseIdeaPool(department);
  // Pick unique ideas
  const picks = pickUnique(baseIdeas, size, rng);

  // Ensure at least one idea is exclusive to selected department (departmentScope === department)
  if (!picks.some(i => i.departmentScope === department)) {
    const deptExclusive = baseIdeas.find(i => i.departmentScope === department);
    if (deptExclusive) {
      // Replace the lowest fit idea with the department exclusive one
      let minIdx = 0;
      for (let i = 1; i < picks.length; i++) {
        if (picks[i].fit_score < picks[minIdx].fit_score) minIdx = i;
      }
      picks[minIdx] = deptExclusive;
    }
  }

  // Apply playful tone adjustments and minor randomization to fit_score
  const adjusted = picks.map((idea, idx) => {
    const jitter = Math.floor(rng() * 10) - 5; // -5..+4
    const fit = clamp(idea.fit_score + jitter, 55, 98);
    const hero = idea.heroAlignment || pickOne(["Culture Hero", "People Hero", "Ops Hero", "Product Hero"], rng);
    const duration = idea.duration || pickOne(["30–45 min", "45–60 min", "60–90 min"], rng);

    // Add playful tone to description
    const desc = withPlayfulTone(idea.description);

    return {
      ...idea,
      id: idea.id || `mock-${department.toLowerCase()}-${idx}-${Math.floor(rng() * 100000)}`,
      duration,
      heroAlignment: hero,
      fit_score: fit,
      description: desc,
      source: "mock-ai",
      model: "mock-v1",
      reasoning: idea.reasoning || playfulReasoning(department, rng),
      tags: Array.isArray(idea.tags) && idea.tags.length ? idea.tags : generateTags(idea, rng)
    };
  });

  // Sort desc by fit_score to feel smarter out of the box
  adjusted.sort((a, b) => b.fit_score - a.fit_score);
  return adjusted;
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

function playfulReasoning(department, rng) {
  const lines = [
    `Optimized for ${department} workflows with a dash of fun.`,
    `Balances focus and play—right in the ${department} sweet spot.`,
    `Targets collaboration friction points common in ${department}.`,
    `Amplifies strengths while quietly fixing ${department} bottlenecks.`,
    `Low setup, high impact—perfect for a busy ${department} crew.`
  ];
  return pickOne(lines, rng);
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
  // Add a couple of fun generics with department label in reasoning to ensure exclusivity when needed
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
