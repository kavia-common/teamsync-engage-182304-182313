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
          <h1 className="h1">Find the perfect team activity in minutes.</h1>
          <p className="muted mb-4">
            TeamSync learns your team’s style, size, and vibe to suggest curated activities that spark connection.
          </p>
          <p className="muted" style={{ fontStyle: 'italic', marginTop: -6 }}>Psst — it only takes 2 minutes ✨ We’ll bring the fun.</p>
          <div className="grid-gap-12" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <a href="#/onboarding" className="btn" aria-label="Start onboarding">Get Started</a>
            <a href="#/quiz" className="btn secondary" aria-label="Take the quiz">Take the Quiz</a>
          </div>
          <p className="muted mt-3">Ocean Professional theme • Modern • Fast</p>
        </div>
        <Card>
          <h2 className="h2">How it works</h2>
          <ol className="muted">
            <li className="mt-2">1. Quick onboarding: tell us about your team</li>
            <li className="mt-2">2. Personality quiz: playful and insightful</li>
            <li className="mt-2">3. Recommendations: 3–5 tailored picks</li>
            <li className="mt-2">4. Feedback: we learn and improve over time</li>
          </ol>
          <div className="mt-4">
            <Button onClick={() => (window.location.hash = '#/onboarding')}>Start Now</Button>
          </div>
        </Card>
      </div>
      <Container>
        <div className="ts-row cols-3 mt-6">
          <Card>
            <h3 className="h2">Smart</h3>
            <p className="muted">Lightweight recommendation logic with continuous learning.</p>
          </Card>
          <Card>
            <h3 className="h2">Flexible</h3>
            <p className="muted">Works for remote, hybrid, and in-person teams of any size.</p>
          </Card>
          <Card>
            <h3 className="h2">Fun</h3>
            <p className="muted">Modern UI that’s friendly and accessible for everyone.</p>
          </Card>
        </div>
      </Container>
    </div>
  );
}
