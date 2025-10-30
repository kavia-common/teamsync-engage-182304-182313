# TeamSync Frontend (React 18, Lightweight)

This is the TeamSync MVP frontend implemented with a dependency-light approach:
- No router dependency (uses a tiny hash router)
- Ocean Professional theme with blue/amber accents
- Pages: Landing, Onboarding, Quiz, Recommendations, Dashboard
- Shared components: Navbar, Container, Card, Button, Progress
- Global state via simple Context + Reducer
- Mock API and data with in-memory save/feedback

Getting started:
- npm start

Navigation:
- Uses hash routes: #/, #/onboarding, #/quiz, #/recommendations, #/dashboard

Notes:
- The API layer currently falls back to mockApi. To integrate a real backend, implement the respective fetch calls in src/services/api.js.
- Accessibility: includes a skip link, labeled controls, and focus outlines.
