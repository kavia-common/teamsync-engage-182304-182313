# E2E Gamification Checklist (Aligned)

What to verify:
- Save action awards +5 pts (backend) and adds a history entry; Dashboard Gamification shows updated points after refresh.
- Feedback quick reactions (Like/Dislike) award +3 pts; Like mapped to rating 4, Dislike mapped to rating 2. A long comment (>=120 chars) adds +1 bonus.
- Badges (backend-driven) appear on Dashboard and trigger subtle confetti:
  - First Save (after first save)
  - Feedback Apprentice (>=5 feedback total)
  - Creative Champ (>=5 likes on creative-tag activities: tags include "creativity" or "creative")
  - Most Collaborative (quiz.collaboration high and like ratio >=0.6 with >=5 feedback)
  - Consistent Contributor (>=5 feedback within the last 14 days)
- Confetti respects prefers-reduced-motion.
- aria-live regions update users:
  - Recommendations: #sr-live
  - Dashboard: #sr-live-dashboard
  - Gamification panel: #sr-live-gamification
- Timeline ordering in Gamification panel: most recent first.
- Theme consistency: Ocean Professional variables applied across pages.

Steps:
1) From Recommendations:
   - Save one activity. Expect points +5 and a new history entry (type: save) after Dashboard refresh. Screen reader: “<Title> saved.”
2) Submit feedback:
   - Like 3 different activities (quick reactions). Each should add +3. 
   - Submit one long feedback from Dashboard comments (>=120 chars) with rating 4 or 5. Expect +3 base +1 bonus.
   - Optionally mix in a Dislike (rating 2) to validate mapping and like ratio effects.
3) Badges:
   - After first save, expect “First Save”.
   - After total 5 feedback (quick + long), expect “Feedback Apprentice”.
   - If 5 Likes on creative-tag activities, expect “Creative Champ”.
   - If collaboration trait high and like ratio >=0.6 with >=5 feedback, expect “Most Collaborative”.
   - If 5 feedback within ~14 days (test quickly within session), expect “Consistent Contributor”.
4) Dashboard Gamification:
   - Verify updated points, badges grid with titles/icons, tooltip shows description, and recent awards timeline (most recent first).
   - aria-live announces points and new badge events.
5) Motion/accessibility:
   - Confirm confetti appears subtly and does not show when prefers-reduced-motion is enabled.

Notes:
- Frontend now aligns optimistic increments with backend (save +5; feedback +3 base; longComment bonus passed via meta when applicable).
- Recommendations quick reactions send rating=4 for Like and rating=2 for Dislike with longComment=false meta.
- Badges are sourced from backend; icon mapping includes backend IDs for consistent visuals.
