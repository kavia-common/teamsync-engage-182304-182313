import React from 'react';
import Container from '../components/common/Container';
import Card from '../components/common/Card';
import Button from '../components/common/Button';

/**
 * PUBLIC_INTERFACE
 * Minimal Landing page showing only TeamSync brand and a single "Start Now" CTA.
 * Ocean Professional theme applied via existing CSS variables and components.
 */
export default function Landing() {
  // PUBLIC_INTERFACE
  function handleStartNow() {
    /** Navigate to auth step first (signin). Users can switch to signup there. */
    window.location.hash = '#/signin';
  }

  return (
    <div className="hero" role="region" aria-label="TeamSync landing">
      <Container>
        <Card className="landing-hero enter-hero" aria-label="Intro">
          {/* Brand mark placeholder logo */}
          <div
            className="landing-hero__media"
            aria-hidden="true"
            style={{ display: 'grid', placeItems: 'center' }}
          >
            <div
              title="TeamSync"
              style={{
                width: 96,
                height: 96,
                borderRadius: 24,
                display: 'grid',
                placeItems: 'center',
                background:
                  'radial-gradient(circle at 30% 30%, var(--ts-secondary), var(--ts-primary))',
                color: '#041318',
                boxShadow: '0 14px 34px rgba(2,8,23,0.12)',
                border: '1px solid rgba(255,255,255,0.6)',
                fontFamily: '"Outfit","Satoshi",system-ui',
                fontSize: 28,
                fontWeight: 800,
                letterSpacing: 0.5,
              }}
              aria-label="TeamSync logo"
            >
              TS
            </div>
          </div>

          {/* App name and subcopy */}
          <div className="landing-hero__content" aria-labelledby="hero-heading">
            <h1 id="hero-heading" className="h1">TeamSync</h1>
            <p className="muted" aria-describedby="hero-heading">
              Plan engaging team activities with a modern, ocean-inspired experience.
            </p>
          </div>

          {/* CTA row */}
          <div className="hero-ctas" role="group" aria-label="Primary actions">
            <Button onClick={handleStartNow} aria-label="Start now and sign in" title="Start now">
              Start Now
            </Button>
          </div>
        </Card>
      </Container>
    </div>
  );
}
