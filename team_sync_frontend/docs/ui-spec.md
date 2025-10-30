# TeamSync Frontend AI/UI Integration Specification

## Overview
This document describes how the React frontend integrates AI recommendations, persona generation, analytics, and gamification with the backend contracts. It focuses on request/response shapes, UI binding, fallback states, and observability. The app uses a dependency-light stack with a custom hash router and Zustand state.

## 1. AI Recommendations (POST /api/ai/recommendations)

### Request
```
{
  "team": { "teamId": "string", "name": "string", "size": 0, "workMode": "remote|in_person|hybrid", "traits": { "...": "..." } },
  "quiz": { "answers": { "...": "..." }, "traits": { "...": 0.0 } },
  "feedbackHistory": [
    { "activityId": "string", "rating": 1, "comment": "string", "createdAt": "ISO8601" }
  ],
  "department": "string",
  "constraints": { "limit": 5, "durationMin": 15, "durationMax": 120, "budget": "low|medium|high", "mode": "remote|in_person|hybrid" }
}
```

### Response
```
{
  "ideas": [
    {
      "title": "string",
      "description": "string",
      "duration": 30,
      "tags": ["fun", "collaboration"],
      "departmentScope": ["Engineering"],
      "heroAlignment": "Strategist",
      "fit_score": 0.0,
      "reasoning": "string"
    }
  ],
  "source": "openai" | "fallback",
  "model": "gpt-4o-mini" | "rules-v1",
  "usage": { "prompt_tokens": 0, "completion_tokens": 0, "total_tokens": 0, "latency_ms": 0 },
  "error": { "code": "string", "message": "string", "retryable": true }
}
```

### UI Binding
- Recommendations.jsx should render “ideas” as cards similarly to existing recommendations with:
  - Department-exclusive or departmentScope labels
  - Hero alignment chip
  - Tags and meta chips (duration)
- Fallback handling:
  - Show “placeholder cards” when fewer than 3 ideas are returned.
  - If source is "fallback", show a subtle badge or tooltip indicating a backup generation was used.

### API Layer
- src/services/api.js should add a method postAIRecommendations(payload) -> response. Use REACT_APP_API_BASE; fallback to mock when backend is unavailable, aligning with current patterns.

## 2. Persona Generation (POST /api/persona/generate)

### Request
```
{
  "team": { "teamId": "string", "name": "string", "size": 0, "workMode": "remote|in_person|hybrid", "department": "string" },
  "quiz": { "answers": { "...": "..." }, "traits": { "...": 0.0 } },
  "context": { "useCase": "onboarding|recommendations|dashboard", "locale": "en-US" }
}
```

### Response
```
{
  "persona": {
    "name": "string",
    "summary": "string",
    "tone": ["playful", "supportive"],
    "motivators": ["connection"],
    "constraints": ["low budget"]
  },
  "source": "openai" | "fallback",
  "model": "gpt-4o-mini" | "rules-v1",
  "usage": { "prompt_tokens": 0, "completion_tokens": 0, "total_tokens": 0, "latency_ms": 0 },
  "error": { "code": "string", "message": "string", "retryable": true }
}
```

### UI Binding
- Dashboard.jsx:
  - Optionally show persona.name and summary as a small info panel above charts.
  - Use persona.tone as a stylistic hint for microcopy (non-blocking).
- Resilience:
  - If source is “fallback” or error present, present a neutral default persona block.

## 3. Analytics Data Extensions

The UI will emit or display the following analytics-aligned events/metrics:

- Success metrics (implicit in UI actions):
  - save -> increment saves and optionally show confetti/microcopy
  - like/dislike -> sentiment signal
  - feedback submit with rating -> contributes to avgRating and sentiment
- Trends:
  - Dashboard shows weekly buckets. For production, use TrendAggregate supplied by backend; for MVP, keep local bucketing (already implemented with fallback).

Data shapes reflected from backend spec:
- EngagementSuccess, SentimentSignal, TrendAggregate.

The frontend should remain tolerant to missing analytics endpoints by using local derivation.

## 4. Gamification: Data and Rules

### Rendering
- Badges:
  - Show small earned badge chips in Dashboard. Use a consistent icon set (emoji or inline icons).
- Events:
  - On save/like/feedback submit, trigger GamificationEvent emission via API (future). For MVP, update local store to simulate progress and award local badges via simple rules.

### Example Badge Hints
- “First Save” after the first successful save.
- “Feedback Apprentice” at 5 feedback entries.
- “Weekly Streak ×3” when feedback happens in three different weekly buckets.

Badges are idempotent and only appear once when earned.

## 5. Logging/Observability

- Network layer:
  - Measure timing per call and add a simple console.debug with { route, latency_ms, source } for developer insight.
- UI counters:
  - Render a small, accessible live region for feedback actions (already present).
- Error surfaces:
  - Recommendations page should show a red-tinted Card when errors occur; retry CTA should refetch.

## 6. Security and PII Minimization

- Do not send user-entered free-form comments to the AI APIs; only send aggregate sentiment or rating.
- Ensure REACT_APP_API_BASE is used from the environment (already implemented).
- Avoid logging raw comments or PII in console. Prefer neutral metrics.

## 7. Component Integration Summary

- Pages/Components impacted:
  - Recommendations.jsx: render AI ideas shape; handle source badges; maintain existing save/like flows.
  - Dashboard.jsx: add optional Persona panel (name + summary), trend chart kept as-is with graceful fallback.
- State:
  - Zustand store remains the single source of truth for team, quiz, saved, feedback. Optional persona slice can be added as { persona, personaSource } when integrated.

## 8. Example Usage (Pseudocode)

### API Client
```javascript
// src/services/api.js
export async function postAIRecommendations(payload) {
  try {
    const res = await postJson('/api/ai/recommendations', payload);
    if (!res || !Array.isArray(res.ideas)) throw new Error('Invalid AI response');
    return res;
  } catch {
    // Fallback: map mockApi.getRecommendations() to AI shape
    const list = await mockApi.getRecommendations(payload);
    return {
      ideas: list.map(a => ({
        title: a.title,
        description: a.description,
        duration: a.duration,
        tags: a.tags || [],
        departmentScope: a.departmentScope || [],
        heroAlignment: a.heroAlignment || 'Ally',
        fit_score: 0.7, // heuristic default
        reasoning: 'fallback heuristic'
      })),
      source: 'fallback',
      model: 'rules-v1',
      usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0, latency_ms: 0 }
    };
  }
}
```

### Recommendations Page Integration
```javascript
// Inside Recommendations.jsx effect:
const aiPayload = {
  team: state.team,
  quiz: { answers: state.quiz, traits: {} },
  feedbackHistory: state.feedback.map(f => ({ activityId: f.activityId, rating: f.rating || (f.value === 'like' ? 5 : 2), comment: '', createdAt: new Date().toISOString() })),
  department: state.team?.department || '',
  constraints: { limit: 5 }
};
const ai = await api.postAIRecommendations(aiPayload);
const ideas = ai.ideas || [];
// Render like current recs with departmentScope and heroAlignment chips
```

## References
- Frontend services and pages:
  - src/services/api.js
  - src/pages/Recommendations.jsx
  - src/pages/Dashboard.jsx
  - src/state/store.zustand.js
