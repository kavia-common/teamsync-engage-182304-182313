export const ACTIVITIES = [
  // Cross-department fun items
  {
    id: 'x1',
    title: 'Team Spotify Playlist',
    description: 'Everyone adds 1–2 songs. Hit play to kick off your sync with shared vibes.',
    duration: 15,
    budget: 'low',
    suggestedSize: '3-50',
    tags: ['fun', 'music', 'remote', 'in_person', 'chill', 'cross_department'],
    departments: [], // available to all
    exclusiveDepartments: [],
    mode: ['remote', 'in_person', 'hybrid'],
    heroHint: 'Innovator', // playful label
    microcopy: 'Assemble your sonic squad — cue the theme tune!'
  },
  {
    id: 'x2',
    title: 'Digital Show & Tell',
    description: 'Each teammate shares a meaningful item or link in 60 seconds.',
    duration: 20,
    budget: 'low',
    suggestedSize: '3-20',
    tags: ['sharing', 'remote', 'in_person', 'balanced', 'cross_department'],
    departments: [],
    exclusiveDepartments: [],
    mode: ['remote', 'in_person', 'hybrid'],
    heroHint: 'Guardian',
    microcopy: 'Every hero has an origin story — what’s yours?'
  },

  // Leadership exclusive (x2)
  {
    id: 'lead1',
    title: 'Vision Mapping Workshop',
    description: 'Co-create a North Star and 3 horizon goals with interactive prompts.',
    duration: 60,
    budget: 'medium',
    suggestedSize: '3-12',
    tags: ['strategy', 'facilitated', 'remote', 'in_person', 'balanced'],
    departments: ['Leadership'],
    exclusiveDepartments: ['Leadership'],
    mode: ['remote', 'in_person', 'hybrid'],
    heroHint: 'Strategist',
    microcopy: 'Lead the league — chart a course worthy of legends.'
  },
  {
    id: 'lead2',
    title: 'Executive Alignment Roundtable',
    description: 'Facilitated roundtable to align priorities and unblock cross-team initiatives.',
    duration: 45,
    budget: 'low',
    suggestedSize: '3-10',
    tags: ['strategy', 'communication', 'remote', 'in_person', 'chill'],
    departments: ['Leadership'],
    exclusiveDepartments: ['Leadership'],
    mode: ['remote', 'in_person', 'hybrid'],
    heroHint: 'Guardian',
    microcopy: 'Unite the guild — align, decide, and advance.'
  },

  // Sales exclusive (x2)
  {
    id: 'sales1',
    title: 'Pitch Battle Royale',
    description: 'Friendly competition: rapid-fire pitches on fun prompts, with peer votes.',
    duration: 30,
    budget: 'low',
    suggestedSize: '4-20',
    tags: ['games', 'competitive', 'remote', 'in_person', 'high'],
    departments: ['Sales'],
    exclusiveDepartments: ['Sales'],
    mode: ['remote', 'in_person', 'hybrid'],
    heroHint: 'Vanguard',
    microcopy: 'Dial up the charisma — it’s showtime!'
  },
  {
    id: 'sales2',
    title: 'Objection Handling Jam',
    description: 'Pair up to roleplay tough objections and craft winning responses.',
    duration: 35,
    budget: 'low',
    suggestedSize: '4-16',
    tags: ['communication', 'training', 'remote', 'in_person', 'balanced'],
    departments: ['Sales'],
    exclusiveDepartments: ['Sales'],
    mode: ['remote', 'in_person', 'hybrid'],
    heroHint: 'Strategist',
    microcopy: 'Turn challenges into champions.'
  },

  // Marketing exclusive (x2)
  {
    id: 'mkt1',
    title: 'Brand Story Sprint',
    description: 'Rapid exercise to refine your elevator pitch and narrative arc.',
    duration: 40,
    budget: 'low',
    suggestedSize: '3-12',
    tags: ['creative', 'brand', 'remote', 'in_person', 'balanced'],
    departments: ['Marketing'],
    exclusiveDepartments: ['Marketing'],
    mode: ['remote', 'in_person', 'hybrid'],
    heroHint: 'Innovator',
    microcopy: 'Craft the saga — your audience awaits.'
  },
  {
    id: 'mkt2',
    title: 'Content Idea Roulette',
    description: 'Spin themed prompts to generate a month of fresh content ideas.',
    duration: 30,
    budget: 'low',
    suggestedSize: '3-12',
    tags: ['creative', 'content', 'remote', 'in_person', 'high'],
    departments: ['Marketing'],
    exclusiveDepartments: ['Marketing'],
    mode: ['remote', 'in_person', 'hybrid'],
    heroHint: 'Vanguard',
    microcopy: 'Roll the wheel — ideas on demand.'
  },

  // Operations exclusive (x2)
  {
    id: 'ops1',
    title: 'Process Kaizen Sprint',
    description: 'Pick one workflow and shave off 10% friction with quick wins.',
    duration: 40,
    budget: 'low',
    suggestedSize: '3-10',
    tags: ['process', 'efficiency', 'remote', 'in_person', 'chill'],
    departments: ['Operations'],
    exclusiveDepartments: ['Operations'],
    mode: ['remote', 'in_person', 'hybrid'],
    heroHint: 'Architect',
    microcopy: 'Order from chaos — optimize like a mastermind.'
  },

  // QA exclusive (x2)
  {
    id: 'qa1',
    title: 'Bug Hunt Bingo',
    description: 'Turn exploratory testing into a game — first to bingo wins.',
    duration: 50,
    budget: 'low',
    suggestedSize: '3-15',
    tags: ['quality', 'games', 'remote', 'in_person', 'balanced'],
    departments: ['QA'],
    exclusiveDepartments: ['QA'],
    mode: ['remote', 'in_person', 'hybrid'],
    heroHint: 'Guardian',
    microcopy: 'Defend the realm — banish bugs with righteous clicks.'
  },
  {
    id: 'qa2',
    title: 'Test Case Showdown',
    description: 'Teams compete to design edge-case scenarios for a sample feature.',
    duration: 40,
    budget: 'low',
    suggestedSize: '3-12',
    tags: ['quality', 'training', 'remote', 'in_person', 'creative'],
    departments: ['QA'],
    exclusiveDepartments: ['QA'],
    mode: ['remote', 'in_person', 'hybrid'],
    heroHint: 'Strategist',
    microcopy: 'Edge cases assemble — outsmart the bugs.'
  },

  // Development exclusive (x2)
  {
    id: 'dev1',
    title: 'Architecture Kata',
    description: 'Small groups sketch and debate designs for a fun, fictional system.',
    duration: 60,
    budget: 'low',
    suggestedSize: '4-12',
    tags: ['engineering', 'architecture', 'remote', 'in_person', 'creative', 'balanced'],
    departments: ['Development'],
    exclusiveDepartments: ['Development'],
    mode: ['remote', 'in_person', 'hybrid'],
    heroHint: 'Strategist',
    microcopy: 'Refactor reality — design like a hero engineer.'
  },
  {
    id: 'dev2',
    title: 'Code Golf Relay',
    description: 'Pass the baton to write the shortest readable solution to a fun problem.',
    duration: 35,
    budget: 'low',
    suggestedSize: '3-10',
    tags: ['engineering', 'games', 'remote', 'in_person', 'high'],
    departments: ['Development'],
    exclusiveDepartments: ['Development'],
    mode: ['remote', 'in_person', 'hybrid'],
    heroHint: 'Vanguard',
    microcopy: 'Fewer chars, more cheers — fore!'
  },

  // Existing general activities (augmented with metadata)
  {
    id: 'a1',
    title: 'Two Truths & a Lie',
    description: 'A quick icebreaker where each person shares two truths and one lie.',
    duration: 20,
    budget: 'low',
    suggestedSize: '3-12',
    tags: ['games', 'remote', 'in_person', 'chill'],
    departments: [],
    exclusiveDepartments: [],
    mode: ['remote', 'in_person', 'hybrid'],
    heroHint: 'Vanguard',
    microcopy: 'Unmask the legend — spot the decoy.'
  },
  {
    id: 'a2',
    title: 'Virtual Escape Room',
    description: 'Collaborate to solve puzzles in a themed virtual escape experience.',
    duration: 60,
    budget: 'medium',
    suggestedSize: '4-8',
    tags: ['games', 'remote', 'balanced'],
    departments: [],
    exclusiveDepartments: [],
    mode: ['remote', 'hybrid'],
    heroHint: 'Guardian',
    microcopy: 'Decode the enigma — teamwork saves the day.'
  },
  {
    id: 'a3',
    title: 'Cooking Class',
    description: 'Team up to learn a new dish and share a meal together.',
    duration: 90,
    budget: 'high',
    suggestedSize: '4-10',
    tags: ['food', 'in_person', 'creative', 'balanced'],
    departments: [],
    exclusiveDepartments: [],
    mode: ['in_person', 'hybrid'],
    heroHint: 'Innovator',
    microcopy: 'Stir up synergy — flavor meets teamwork.'
  },
  {
    id: 'a4',
    title: 'Outdoor Scavenger Hunt',
    description: 'Explore your area and complete fun challenges along the way.',
    duration: 90,
    budget: 'low',
    suggestedSize: '6-20',
    tags: ['outdoors', 'high', 'in_person'],
    departments: [],
    exclusiveDepartments: [],
    mode: ['in_person'],
    heroHint: 'Vanguard',
    microcopy: 'Adventure assembled — ready, set, quest!'
  },
  {
    id: 'a5',
    title: 'Mindfulness Session',
    description: 'A guided session to reduce stress and improve focus.',
    duration: 30,
    budget: 'low',
    suggestedSize: '3-50',
    tags: ['wellness', 'remote', 'chill', 'in_person'],
    departments: [],
    exclusiveDepartments: [],
    mode: ['remote', 'in_person', 'hybrid'],
    heroHint: 'Guardian',
    microcopy: 'Quiet the noise — center your inner hero.'
  },
  {
    id: 'a6',
    title: 'Team Mural',
    description: 'Create a collaborative digital mural to express team identity.',
    duration: 45,
    budget: 'low',
    suggestedSize: '4-20',
    tags: ['creative', 'remote', 'balanced'],
    departments: [],
    exclusiveDepartments: [],
    mode: ['remote', 'hybrid'],
    heroHint: 'Innovator',
    microcopy: 'Sketch the saga — your team, your legend.'
  }
];
