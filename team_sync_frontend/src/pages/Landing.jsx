import React, { useEffect } from 'react';
import Container from '../components/common/Container';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { useStore } from '../state/hooks';

/**
 * PUBLIC_INTERFACE
 * Landing page with primary CTA group (Sign up, Sign in, Demo, Get Started),
 * simplified "How it works" (Onboarding, Recommendations), pricing, and highlights.
 * Accessibility friendly; uses rounded-2xl cards, shadows, and teal/purple palette.
 */
export default function Landing() {
  const { state, actions } = useStore();

  // Auto-detect demo query param and set demo mode + route to onboarding
  useEffect(() => {
    const hash = window.location.hash || '';
    const isDemo = /[?&]demo=1\b/.test(hash);
    if (isDemo && !state.plan?.demo) {
      actions.setPlan({ demo: true, tier: 'pro' });
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

  // helpers for checkmark lists
  const Check = ({ gated = false, children, label }) => (
    <li role="listitem" aria-label={label || (typeof children === 'string' ? children : undefined)} className="mt-2" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span aria-hidden>{gated ? '🔒' : '✔️'}</span>
      <span className={gated ? 'muted' : ''}>{children}</span>
    </li>
  );

  // pricing CTA anchor scroll helper
  const scrollToPricing = () => {
    const el = document.getElementById('pricing');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="hero">
      <div className="hero-inner">
        <div>
          {/* Headline and tagline */}
          <h1 className="h1" title="Team time, simplified">
            Plan engaging team activities in just a few clicks.
          </h1>
          <p className="muted">
            TeamSync learns your team’s size, department, and work mode to suggest curated activities that spark connection.
          </p>

          {/* Primary CTA group directly beneath hero text */}
          <div className="grid-gap-12 mt-3" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }} aria-label="Primary actions">
            {/* Sign up and Sign in link to placeholder hash routes if unimplemented */}
            <a href="#/signup" className="btn" aria-label="Sign up">Sign up</a>
            <a href="#/signin" className="btn secondary" aria-label="Sign in">Sign in</a>

            {/* Keep Demo and Get Started links intact */}
            <Button className="warning" onClick={startDemo} aria-label="Start demo" title="See it in action (demo mode)">
              🚀 Demo
            </Button>
            <Button onClick={getStartedFree} aria-label="Get started for free" title="Create your first plan free">
              Get Started
            </Button>
            <Button variant="ghost" onClick={scrollToPricing} aria-label="Jump to pricing">
              View Pricing
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

        {/* Simplified How it works: 2 steps with themed icons */}
        <Card aria-label="How it works">
          <h2 className="h2">How it works</h2>
          <ol className="list-reset" aria-label="Two step flow">
            <li className="mt-2" style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <span aria-hidden className="btn secondary" title="Onboarding">🧭</span>
              <div>
                <strong>Onboarding</strong>
                <div className="muted">Tell us about your team — size, department, and work mode.</div>
              </div>
            </li>
            <li className="mt-2" style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <span aria-hidden className="btn secondary" title="Recommendations">🤖</span>
              <div>
                <strong>Recommendations</strong>
                <div className="muted">Get 3–5 curated activities matched to your team’s vibe.</div>
              </div>
            </li>
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
        <section id="pricing" aria-labelledby="pricing-heading" role="region" style={{ scrollMarginTop: 80 }}>
          <div className="mt-6 center">
            <h2 className="h2" id="pricing-heading">Simple pricing</h2>
            <p className="muted">Start free. Upgrade anytime for advanced features.</p>
          </div>

          {/* Responsive two-card grid */}
          <div className="ts-row cols-2 mt-4" role="list" aria-label="Plan options" style={{ alignItems: 'stretch' }}>
            {/* Free plan */}
            <Card aria-label="Free plan" role="listitem" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
                <div>
                  <h3 className="h2" style={{ marginBottom: 4 }}>Free</h3>
                  <div className="muted" aria-label="Price">$0 <span className="muted">/ user / month</span></div>
                </div>
                <span
                  className={`btn ${isFree ? '' : 'secondary'}`}
                  aria-label={isFree ? 'Free plan selected' : 'Select Free plan'}
                  aria-pressed={isFree}
                >
                  {isFree ? 'Selected' : 'Select'}
                </span>
              </div>
              <p className="muted" style={{ marginTop: 8 }}>Everything you need to get started.</p>

              <ul className="mt-3" role="list" aria-label="Free plan features" style={{ paddingLeft: 4, listStyle: 'none', margin: 0 }}>
                <Check label="Onboarding and team profiling">Onboarding & team profiling</Check>
                <Check label="Personality quiz">Personality quiz</Check>
                <Check label="3 to 5 activity recommendations">3–5 activity recommendations</Check>
                <Check label="Basic feedback">Basic feedback</Check>
                <Check gated label="AI Analytics (Premium)">AI Analytics <span className="sr-only">(Premium)</span></Check>
                <Check gated label="Custom Activity Builder (Premium)">Custom Activity Builder <span className="sr-only">(Premium)</span></Check>
              </ul>

              <div className="mt-4" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 'auto' }}>
                <Button
                  variant={isFree ? 'primary' : 'secondary'}
                  onClick={() => { selectFree(); getStartedFree(); }}
                  aria-label={isFree ? 'Continue with Free plan' : 'Choose Free plan'}
                >
                  {isFree ? 'Continue Free' : 'Choose Free'}
                </Button>
              </div>
            </Card>

            {/* Pro/Business plan */}
            <Card aria-label="Pro plan" role="listitem" style={{ display: 'flex', flexDirection: 'column', borderColor: isPro ? 'var(--ts-secondary)' : undefined }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
                <div>
                  <h3 className="h2" style={{ marginBottom: 4 }}>Pro / Business</h3>
                  <div className="muted" aria-label="Price">$15–25 <span className="muted">/ user / month</span></div>
                </div>
                <span
                  className={`btn ${isPro ? '' : 'secondary'}`}
                  aria-label={isPro ? 'Pro plan selected' : 'Select Pro plan'}
                  aria-pressed={isPro}
                >
                  {isPro ? 'Selected' : 'Select'}
                </span>
              </div>
              <p className="muted" style={{ marginTop: 8 }}>Best for growing teams that want advanced insights.</p>

              <ul className="mt-3" role="list" aria-label="Pro plan features" style={{ paddingLeft: 4, listStyle: 'none', margin: 0 }}>
                <Check label="Everything in Free">Everything in Free</Check>
                <Check label="AI Analytics"><span className="ai-badge" title="Premium feature enabled">AI Analytics</span></Check>
                <Check label="Custom Activity Builder"><span className="ai-badge ai-badge--ghost" title="Premium feature enabled">Custom Activity Builder</span></Check>
                <Check label="Advanced feedback insights">Advanced feedback insights</Check>
                <Check label="Priority support">Priority support</Check>
              </ul>

              <div className="mt-4" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 'auto' }}>
                <Button onClick={() => { selectPro(); goOnboarding(); }} title="Upgrade and continue" aria-label="Upgrade to Pro and continue">
                  Upgrade & Continue
                </Button>
                <Button variant="secondary" onClick={startDemo} title="Try a guided demo" aria-label="Try a guided demo">
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
        </section>

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
