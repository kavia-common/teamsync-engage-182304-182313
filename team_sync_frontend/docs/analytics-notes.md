# Dashboard Analytics & Persona (MVP)

- Success metrics: completionRate, likeRatio, avgRating derived locally from Zustand state (saved, feedback).
- Sentiment: simple keyword heuristic; will be replaced by AI endpoint later.
- Trends: weekly buckets over configurable range (4w/12w/All). Uses Recharts if available; otherwise a CSS fallback.
- Persona: lightweight, derived from hero-alignment breakdown and team/quiz context; placeholder for /api/persona/generate.

Premium:
- If plan.tier === 'pro', Advanced Analytics badge shows "Included" / "AI‑Powered".
- On Free plan, analytics are still visible as "Preview" using local derivation.

State:
- New store fields: analytics, persona, timeRange.
- Actions: setTimeRange, setAnalytics, setPersona.

API:
- getAnalytics(range) -> { success, sentiment, trend, heroes, source }
- generatePersona(team, quiz, context) -> { persona, breakdown, source, model }
- Both call backend if available; fallback to mockApi which computes locally.
