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

  // Leadership exclusive
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

  // Sales exclusive
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

  // Product exclusive
  {
    id: 'prod1',
    title: 'Lightning Discovery Jam',
    description: '5×5 ideation: five minutes per prompt to uncover real user pains.',
    duration: 45,
    budget: 'low',
    suggestedSize: '3-12',
    tags: ['product', 'discovery', 'remote', 'in_person', 'creative', 'balanced'],
    departments: ['Product'],
    exclusiveDepartments: ['Product'],
    mode: ['remote', 'in_person', 'hybrid'],
    heroHint: 'Innovator',
    microcopy: 'Prototype your destiny — one idea at a time.'
  },

  // Operations exclusive
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

  // QA exclusive
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

  // Dev exclusive
  {
    id: 'dev1',
    title: 'Architecture Kata',
    description: 'Small groups sketch and debate designs for a fun, fictional system.',
    duration: 60,
    budget: 'low',
    suggestedSize: '4-12',
    tags: ['engineering', 'architecture', 'remote', 'in_person', 'creative', 'balanced'],
    departments: ['Dev'],
    exclusiveDepartments: ['Dev'],
    mode: ['remote', 'in_person', 'hybrid'],
    heroHint: 'Strategist',
    microcopy: 'Refactor reality — design like a hero engineer.'
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
