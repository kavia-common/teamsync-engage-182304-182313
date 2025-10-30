import React from 'react';
import Container from '../components/common/Container';
import Card from '../components/common/Card';
import Button from '../components/common/Button';

/**
 * PUBLIC_INTERFACE
 * Playful landing page with call to action.
 */
export default function Landing() {
  return (
    <div className="hero">
      <div className="hero-inner">
        <div>
          <h1 className="h1" title="Team time, simplified">
            Plan engaging team activities in just a few clicks.
          </h1>
          <p className="muted mb-4">
            TeamSync learns your team’s size, department, and work mode to suggest curated activities that spark connection.
          </p>
          <p
            className="muted"
            style={{ fontStyle: 'italic', marginTop: -6 }}
            aria-live="polite"
            title="Your squad’s got The Office energy 🎬 (and we’re here for it)"
          >
            Psst — it only takes 2 minutes ✨ We’ll bring the fun.
          </p>
          <div className="grid-gap-12" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <a
              href="#/onboarding"
              className="btn"
              aria-label="Start onboarding"
              title="Set team basics — it only takes a minute"
            >
              Start Onboarding
            </a>
            <a
              href="#/onboarding"
              className="btn secondary"
              aria-label="Begin"
              title="Begin the guided flow"
            >
              Begin
            </a>
          </div>
          <p className="muted mt-3" aria-label="Theme note">
            Ocean Professional theme • Modern • Fast • A sprinkle of fun ✨
          </p>
        </div>
        <Card aria-label="How it works">
          <h2 className="h2">How it works</h2>
          <ol className="muted">
            <li className="mt-2">1. Quick onboarding: tell us about your team</li>
            <li className="mt-2">2. Personality quiz: playful and insightful</li>
            <li className="mt-2">3. Recommendations: 3–5 tailored picks</li>
            <li className="mt-2">4. Feedback: we learn and improve over time</li>
          </ol>
          <div className="mt-4">
            <Button
              onClick={() => (window.location.hash = '#/onboarding')}
              aria-label="Start onboarding now"
              title="Ready when you are 🚀"
            >
              Start Now
            </Button>
          </div>
        </Card>
      </div>
      <Container>
        <div className="ts-row cols-3 mt-6">
          <Card>
            <h3 className="h2">Smart</h3>
            <p className="muted" title="We learn from your likes and dislikes">
              Lightweight recommendation logic with continuous learning.
            </p>
          </Card>
          <Card>
            <h3 className="h2">Flexible</h3>
            <p className="muted" title="Remote, hybrid, in-person — your call">
              Works for remote, hybrid, and in-person teams of any size.
            </p>
          </Card>
          <Card>
            <h3 className="h2">Fun</h3>
            <p className="muted" title="Tasteful confetti included 🎉">
              Modern UI that’s friendly and accessible for everyone.
            </p>
          </Card>
        </div>
      </Container>
    </div>
  );
}
