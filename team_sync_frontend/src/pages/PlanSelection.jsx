import React from 'react';
import Container from '../components/common/Container';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { useStore } from '../state/hooks';

/**
 * PUBLIC_INTERFACE
 * PlanSelection allows a just-signed-in user to choose Free or Pro/Business.
 * - Commits selection to Zustand plan state
 * - Shows key features/pricing
 * - Accessible: labeled buttons, role=list semantics
 * - After selection, routes to #/onboarding
 */
export default function PlanSelection() {
  const { state, actions } = useStore();

  const handleChoose = (tier) => {
    actions.setPlan({ tier, demo: false }); // commit to store; billing left default
    window.location.hash = '#/onboarding';
  };

  const isPro = state.plan?.tier === 'pro';

  const Check = ({ gated = false, children, label }) => (
    <li role="listitem" aria-label={label || (typeof children === 'string' ? children : undefined)} className="mt-2" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span aria-hidden>{gated ? '🔒' : '✔️'}</span>
      <span className={gated ? 'muted' : ''}>{children}</span>
    </li>
  );

  return (
    <Container>
      <div className="mb-4">
        <h1 className="h1">Choose your plan</h1>
        <p className="muted">You can start free and upgrade anytime. Current: <strong>{isPro ? 'Pro' : 'Free'}</strong></p>
      </div>

      <div className="ts-row cols-2 mt-4" role="list" aria-label="Plan options">
        <Card role="listitem">
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
            <div>
              <h2 className="h2" style={{ marginBottom: 4 }}>Free</h2>
              <div className="price" aria-label="Price">$0 <small>/ user / month</small></div>
            </div>
            <span className="btn secondary">Good for trying it out</span>
          </div>
          <ul className="mt-3 list-reset" aria-label="Free features">
            <Check label="Onboarding & team profiling">Onboarding & team profiling</Check>
            <Check label="Personality quiz">Personality quiz</Check>
            <Check label="3–5 recommendations">3–5 recommendations</Check>
            <Check label="Basic feedback">Basic feedback</Check>
            <Check gated label="AI Analytics (Premium)">AI Analytics <span className="sr-only">(Premium)</span></Check>
          </ul>
          <div className="mt-4" style={{ display: 'flex', gap: 8 }}>
            <Button onClick={() => handleChoose('free')} aria-label="Choose Free plan">Choose Free</Button>
          </div>
        </Card>

        <Card role="listitem" aria-label="Pro plan">
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
            <div>
              <h2 className="h2" style={{ marginBottom: 4 }}>Pro / Business</h2>
              <div className="price" aria-label="Price">$15–25 <small>/ user / month</small></div>
            </div>
            <span className="ai-badge" title="Premium feature set">AI‑Powered</span>
          </div>
          <ul className="mt-3 list-reset" aria-label="Pro features">
            <Check label="Everything in Free">Everything in Free</Check>
            <Check label="AI Analytics"><span className="ai-badge">AI Analytics</span></Check>
            <Check label="Custom Activity Builder"><span className="ai-badge ai-badge--ghost">Custom Activity Builder</span></Check>
            <Check label="Advanced feedback insights">Advanced feedback insights</Check>
            <Check label="Priority support">Priority support</Check>
          </ul>
          <div className="mt-4" style={{ display: 'flex', gap: 8 }}>
            <Button className="warning" onClick={() => handleChoose('pro')} aria-label="Choose Pro plan">Choose Pro</Button>
            <Button variant="secondary" onClick={() => handleChoose('free')} aria-label="Skip and use Free">Start Free</Button>
          </div>
        </Card>
      </div>

      <div className="mt-3">
        <p className="muted center">You can switch plans later from settings.</p>
      </div>
    </Container>
  );
}
