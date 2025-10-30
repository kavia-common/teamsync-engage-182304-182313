/**
 * Example usage:
 * import { TeamBondingIllustration } from "@/components/Illustrations";
 * ...
 * <TeamBondingIllustration maxWidth={680} className="my-8" alt="Team bonding illustration" />
 */
import React, { useEffect, useState } from 'react';
import Container from '../components/common/Container';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { useStore } from '../state/hooks';
// Import the illustration via the barrel export to ensure TS/JS interop
import { TeamBondingIllustration } from "../components/Illustrations";

/**
 * PUBLIC_INTERFACE
 * Landing page hero with a single primary "Start Now" CTA.
 * Horizontal layout: illustration (CSS art) alongside text/CTA.
 * How It Works (2 steps) moved directly below the hero card.
 * Start Now gates flow: auth (signin) -> plan -> onboarding.
 *
 * Enhancements:
 * - Responsive media pane with aspect-ratio placeholder or optional image hook.
 * - Improved spacing and vertical alignment across breakpoints.
 * - Subtle entrance animation with prefers-reduced-motion respected.
 * - Glassy gradient surface, rounded-2xl, and soft shadow preserved via Card.
 * - Accessible headings and ARIA labels preserved.
 */
export default function Landing() {
  const { state, actions } = useStore();

  // Optional hero image hook: now using a stable external illustration (team collaboration with colorful puzzle pieces).
  // Source: Vecteezy CDN free asset (requires attribution retained below).
  // Note: Keep alt descriptive and ensure responsive rendering with CSS classes.
  const HERO_IMAGE =
    'https://static.vecteezy.com/system/resources/previews/006/435/657/non_2x/business-teamwork-people-connecting-puzzle-elements-collaboration-teamwork-partnership-illustration-vector.jpg';
  const HERO_ALT =
    'Illustration of a diverse team collaborating to connect colorful puzzle pieces, symbolizing teamwork and alignment.';

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

  const scrollToPricing = () => {
    const el = document.getElementById('pricing');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // PUBLIC_INTERFACE
  function handleStartNow() {
    /** Navigate to auth step first (signup). Users can switch to sign in there. */
    window.location.hash = '#/signup';
  }

  return (
    <div className="hero" role="region" aria-label="TeamSync landing">
      <Container>
        <Card className="landing-hero landing-hero--compact enter-hero" aria-label="Intro">
          {/* Header/title and supporting copy */}
          <div className="landing-hero__content" aria-labelledby="hero-heading">
            <h1 id="hero-heading" className="h1">Plan engaging team activities in just a few clicks.</h1>
            <p className="muted" aria-describedby="hero-heading">
              TeamSync learns your team’s size, department, and work mode to suggest curated activities that spark connection.
            </p>
          </div>

          {/* Illustration: sits directly below the hero text and above the CTAs */}
          <div className="landing-hero__media" aria-label="Hero illustration container">
            <TeamBondingIllustration
              alt="Colleagues collaborating in a team bonding scene"
              className="landing-hero__img"
              maxWidth={880}
              style={{
                width: '100%',
                height: 'auto',
                borderRadius: 20,
                boxShadow: '0 12px 30px rgba(2, 8, 23, 0.08)',
              }}
            />
            <noscript>
              <p className="muted">Team bonding illustration (enable JavaScript to view).</p>
            </noscript>
          </div>

          {/* CTA row */}
          <div className="hero-ctas" role="group" aria-label="Primary actions">
            <Button onClick={handleStartNow} aria-label="Try TeamSync and sign in" title="Try TeamSync">
              Try TeamSync
            </Button>
            <Button variant="ghost" onClick={scrollToPricing} aria-label="View pricing plans">View Pricing</Button>
          </div>

          <p className="muted mt-3" aria-label="Theme note">
            Ocean Professional theme • Modern • Fast • A sprinkle of fun ✨
          </p>
        </Card>
      </Container>

      {/* Asset attribution (required by Vecteezy for free assets) */}
      <Container>
        <p className="muted center attribution-note">
          Illustration via{' '}
          <a
            href="https://www.vecteezy.com/vector-art/6435657-business-teamwork-people-connecting-puzzle-elements-collaboration-teamwork-partnership-illustration"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Vecteezy teamwork puzzle illustration attribution link"
            title="Vecteezy teamwork puzzle illustration"
          >
            Vecteezy
          </a>{' '}
          (served from external CDN)
        </p>
      </Container>

      {/* How it works: two steps directly below hero */}
      <Container>
        <section aria-labelledby="how-heading" className="mt-6">
          <h2 id="how-heading" className="h2">How it works</h2>
          <div className="ts-row cols-2 mt-3" role="list" aria-label="Two step flow">
            <Card role="listitem" className="how-card">
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <span aria-hidden className="how-icon" title="Onboarding">🧭</span>
                <div>
                  <strong>Onboarding</strong>
                  <div className="muted">Tell us about your team — size, department, and work mode.</div>
                </div>
              </div>
            </Card>
            <Card role="listitem" className="how-card">
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <span aria-hidden className="how-icon" title="Recommendations">🤖</span>
                <div>
                  <strong>Recommendations</strong>
                  <div className="muted">Get 3–5 curated activities matched to your team’s vibe.</div>
                </div>
              </div>
            </Card>
          </div>
        </section>
      </Container>

      {/* Pricing section (read-only preview; selection occurs after auth on /plan) */}
      <Container>
        <section id="pricing" aria-labelledby="pricing-heading" role="region" style={{ scrollMarginTop: 80 }}>
          <div className="mt-6 center">
            <h2 className="h2" id="pricing-heading">Simple pricing</h2>
            <p className="muted">Sign in to choose a plan. You can start free and upgrade anytime.</p>
          </div>

          <div className="ts-row cols-2 mt-4" role="list" aria-label="Plan options (preview)" style={{ alignItems: 'stretch' }}>
            <Card aria-label="Free plan" role="listitem" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
                <div>
                  <h3 className="h2" style={{ marginBottom: 4 }}>Free</h3>
                  <div className="muted" aria-label="Price">$0 <span className="muted">/ user / month</span></div>
                </div>
                <span className="btn secondary" aria-label="Selection after sign-in" title="Choose after sign-in">
                  Select after sign-in
                </span>
              </div>
              <p className="muted" style={{ marginTop: 8 }}>Everything you need to get started.</p>
              <ul className="mt-3 list-reset" aria-label="Free plan features">
                <li className="mt-2"><span aria-hidden>✅</span> Onboarding & team profiling</li>
                <li className="mt-2"><span aria-hidden>✅</span> Personality quiz</li>
                <li className="mt-2"><span aria-hidden>✅</span> 3–5 activity recommendations</li>
                <li className="mt-2"><span aria-hidden>✅</span> Basic feedback</li>
                <li className="mt-2"><span aria-hidden>🔒</span> <span className="muted">AI Analytics (Premium)</span></li>
              </ul>
              <div className="mt-4" style={{ marginTop: 'auto' }}>
                <Button variant="secondary" onClick={handleStartNow} aria-label="Sign in to choose plan">Sign in to choose</Button>
              </div>
            </Card>

            <Card aria-label="Pro plan" role="listitem" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
                <div>
                  <h3 className="h2" style={{ marginBottom: 4 }}>Pro / Business</h3>
                  <div className="muted" aria-label="Price">$20 <span className="muted">/ user / month</span></div>
                </div>
                <span className="btn secondary" aria-label="Selection after sign-in" title="Choose after sign-in">
                  Select after sign-in
                </span>
              </div>
              <p className="muted" style={{ marginTop: 8 }}>Best for growing teams that want advanced insights.</p>
              <ul className="mt-3 list-reset" aria-label="Pro plan features">
                <li className="mt-2"><span aria-hidden>✅</span> Everything in Free</li>
                <li className="mt-2"><span aria-hidden>✅</span> <span className="ai-badge">AI Analytics</span></li>
                <li className="mt-2"><span aria-hidden>✅</span> <span className="ai-badge ai-badge--ghost">Custom Activity Builder</span></li>
                <li className="mt-2"><span aria-hidden>✅</span> Advanced feedback insights</li>
                <li className="mt-2"><span aria-hidden>✅</span> Priority support</li>
              </ul>
              <div className="mt-4" style={{ marginTop: 'auto', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <Button onClick={handleStartNow} aria-label="Sign in to upgrade">Sign in to upgrade</Button>
              </div>
            </Card>
          </div>

          <div className="mt-3">
            <p className="muted center" title="Selection note">
              Plan selection happens after you sign in. You can switch anytime.
            </p>
          </div>
        </section>
      </Container>

      {/* Extra highlights */}
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
