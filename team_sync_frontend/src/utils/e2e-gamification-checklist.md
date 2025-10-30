# E2E Gamification Verification Checklist (MVP)

Use this checklist to verify end-to-end gamification behavior.

Preconditions:
- Frontend running at http://localhost:3000
- Backend running at http://localhost:4000 (optional; frontend will fallback to mock where applicable)
- Team created via Onboarding; take Quiz; have at least 1-2 activities recommended

Steps:
1) Save an activity from Recommendations
   - Action: Click “Save” on one card
   - Expect:
     - Dashboard Gamification points increase by +5 (backend) or +10 optimistic local then sync
     - Awards timeline includes an entry “Saved an activity”
     - If first save, “First Save” badge appears; subtle confetti plays unless prefers-reduced-motion
     - Aria live region announces updated points and new badge

2) Submit several feedback events
   - Actions:
     - From Dashboard “Share feedback” form:
       - Submit 4 ratings (mix: 5, 4, 2, 3) with short comments
       - Submit 1 more rating with a longer comment >= 120 chars
     - From Recommendations: click Like on a “creative/creativity” tagged activity at least 5 times total across items if available
   - Expect:
     - Points increase: +3 each feedback, +1 extra for the long comment; streak +2 bonus when hitting 3 likes in a row
     - Awards timeline shows “Gave feedback” entries with +points
     - Potential badges:
       - Feedback Apprentice (after 5 total feedback)
       - Creative Champ (after 5 likes on activities tagged creative/creativity)
       - Consistent Contributor (if 5 feedbacks fall within 14 days)
     - Subtle confetti on new badge; respects reduced motion
     - Aria live region announces points and badge

3) Open Dashboard and verify Gamification panel
   - Shows updated points, badges grid (most recent badges listed), awards timeline (most recent first)
   - Theme matches Ocean Professional palette; buttons and cards consistent

4) Accessibility
   - Points and badge events announced via aria-live (sr-live-gamification)
   - Dashboard global live region announces status updates
   - Confetti suppressed by prefers-reduced-motion

5) Threshold sanity
   - Creative Champ after 5+ creative likes
   - Consistent Contributor after 5 feedbacks in 14 days
   - Feedback Apprentice at 5 feedbacks total
   - If tuning needed, adjust thresholds in backend gamificationService.js

Record findings and any adjustments performed (date, commit, summary).

