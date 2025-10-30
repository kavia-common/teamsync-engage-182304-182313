import React, { useEffect } from 'react';
import Container from '../components/common/Container';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { useStore } from '../state/hooks';

/**
 * PUBLIC_INTERFACE
 * Landing page with top CTA group (Sign in, Demo, Get Started), pricing plans (Free and Pro),
 * premium feature badges, referral note, and plan selection reflected in global state.
 * Maintains theme and existing animations.
 */
export default function Landing() {
  const { state, actions } = useStore();

  // Auto-detect demo query param and set demo mode + route to onboarding
  useEffect(() => {
    const hash = window.location.hash || '';
    const isDemo = /[?&]demo=1\b/.test(hash);
    if (isDemo && !state.plan?.demo) {
      actions.setPlan({ demo: true, tier: 'pro' });
      // normalize route to onboarding with demo flag to begin guided flow
      if (!hash.startsWith('#/onboarding')) {
        window.location.hash = '#/onboarding?demo=1';
      }
    }
  }, [state.plan?.demo, actions]);

  // CTA handlers
  const goOnboarding = () => (window.location.hash = '#/onboarding');
  const startDemo = () => {
    actions.setPlan({ demo: true, tier: 'pro' });
    window.location.hash = '#/onboarding?demo=1';
  };
  const getStartedFree = () => {
    actions.setPlan({ tier: 'free', demo: false });
    window.location.hash = '#/onboarding';
  };

  const selectFree = () => actions.setPlan({ tier: 'free', demo: false });
  const selectPro = () => actions.setPlan({ tier: 'pro', demo: false });

  const isPro = state.plan?.tier === 'pro';
  const isFree = state.plan?.tier === 'free';

  return (
    <div className="hero">
      <div className="hero-inner">
        <div>
          {/* Headline and tagline */}
          <h1 className="h1" title="Team time, simplified">
            Plan engaging team activities in just a few clicks.
          </h1>
          <p className="muted mb-4">
            TeamSync learns your team’s size, department, and work mode to suggest curated activities that spark connection.
          </p>

          {/* Top CTA group: Sign in (placeholder), Demo, Get Started for Free */}
          <div className="grid-gap-12" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <a
              href="#/sign-in" // placeholder route; not implemented
              className="btn secondary"
              aria-label="Sign in"
              title="Sign in (placeholder)"
              onClick={(e) => { e.preventDefault(); alert('Sign-in not enabled in this demo.'); }}
            >
              Sign in
            </a>
            <Button className="warning" onClick={startDemo} aria-label="Start demo" title="See it in action (demo mode)">
              🚀 Demo
            </Button>
            <Button onClick={getStartedFree} aria-label="Get started for free" title="Create your first plan free">
              Get Started for Free
            </Button>
          </div>

          {/* Selected plan badge */}
          <div className="mt-3" aria-live="polite">
            <span className={`btn ${isPro ? 'warning' : 'secondary'}`} title="Current plan">
              {isPro ? 'Pro/Business Plan Selected' : 'Free Plan Selected'}
              {state.plan?.demo ? ' • Demo' : ''}
            </span>
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
              onClick={goOnboarding}
              aria-label="Start onboarding now"
              title="Ready when you are 🚀"
            >
              Start Now
            </Button>
          </div>
        </Card>
      </div>

      {/* Pricing section */}
      <Container>
        <div className="mt-6">
          <h2 className="h2 center">Simple pricing</h2>
          <p className="muted center">Start free. Upgrade anytime for advanced features.</p>
        </div>

        <div className="ts-row cols-2 mt-4">
          {/* Free plan */}
          <Card aria-label="Free plan">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <h3 className="h2">Free</h3>
              <span className={`btn ${isFree ? '' : 'secondary'}`} aria-label="Selected plan badge">
                {isFree ? 'Selected' : 'Select'}
              </span>
            </div>
            <p className="muted">Everything you need to get started.</p>
            <ul className="mt-3" style={{ paddingLeft: 18 }}>
              <li>Onboarding & team profiling</li>
              <li>Personality quiz</li>
              <li>3–5 activity recommendations</li>
              <li>Basic feedback</li>
              <li>
                <span className="btn secondary" title="Premium feature">
                  AI Analytics (Premium)
                </span>
              </li>
              <li>
                <span className="btn secondary" title="Premium feature">
                  Custom Activity Builder (Premium)
                </span>
              </li>
            </ul>
            <div className="mt-4" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Button variant={isFree ? 'primary' : 'secondary'} onClick={() => { selectFree(); getStartedFree(); }}>
                {isFree ? 'Continue Free' : 'Choose Free'}
              </Button>
            </div>
          </Card>

          {/* Pro/Business plan */}
          <Card aria-label="Pro plan">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <h3 className="h2">Pro / Business</h3>
              <span className={`btn ${isPro ? '' : 'secondary'}`} aria-label="Selected plan badge">
                {isPro ? 'Selected' : 'Select'}
              </span>
            </div>
            <p className="muted">$15–25 per user / month</p>
            <ul className="mt-3" style={{ paddingLeft: 18 }}>
              <li>Everything in Free</li>
              <li>
                <span className="btn warning" title="Premium feature enabled">
                  AI Analytics
                </span>
              </li>
              <li>
                <span className="btn warning" title="Premium feature enabled">
                  Custom Activity Builder
                </span>
              </li>
              <li>Advanced feedback insights</li>
              <li>Priority support</li>
            </ul>
            <div className="mt-4" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Button onClick={() => { selectPro(); goOnboarding(); }} title="Upgrade and continue">
                Upgrade & Continue
              </Button>
              <Button variant="secondary" onClick={startDemo} title="Try a guided demo">
                Try Demo
              </Button>
            </div>
          </Card>
        </div>

        <div className="mt-3">
          <p className="muted center" title="Referral note">
            Note: Some activities may include referral fees when purchased through partners. This never affects your price.
          </p>
        </div>

        {/* Feature highlights for consistency with theme */}
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
