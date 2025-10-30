# TeamSync Engage Workspace

This workspace contains the TeamSync frontend application.

Folders:
- team_sync_frontend: React 18 app implementing the TeamSync MVP with a dependency-light approach.

Run locally:
1) cd team_sync_frontend
2) npm install
3) npm start
Open http://localhost:3000

App overview:
- Hash-based routing (no router dependency): #/, #/onboarding, #/quiz, #/recommendations, #/dashboard
- Pages: Landing, Onboarding, Quiz, Recommendations, Dashboard
- Shared components: Navbar, Container, Card, Button, Progress
- Global state: Zustand store (src/state/store.zustand.js) exposed via useStore()
- Services: src/services/api.js with mockApi fallback
- Mock data: src/mock
- Theme: Ocean Professional (blue & amber accents), responsive and accessible

Notes:
- To integrate a real backend, update src/services/api.js to call your endpoints using fetch and environment variables via .env (do not hardcode URLs).
- Accessibility: includes a skip link, aria labels, and visible focus states.
