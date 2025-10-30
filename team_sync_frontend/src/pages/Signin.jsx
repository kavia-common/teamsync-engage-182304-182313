import React from 'react';
import Container from '../components/common/Container';
import Card from '../components/common/Card';
import Button from '../components/common/Button';

/**
 * PUBLIC_INTERFACE
 * Lightweight Sign in placeholder. In a full app this would include auth form.
 * After a mock "sign-in", users proceed to plan selection step (pricing) or dashboard.
 */
export default function Signin() {
  const handleContinue = () => {
    // In a real flow, after successful auth, redirect to plan selection
    window.location.hash = '#/pricing';
    // Pricing is an anchor section on landing; send user to top and scroll to pricing
    setTimeout(() => {
      window.location.hash = '#/';
      setTimeout(() => {
        const el = document.getElementById('pricing');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 0);
    }, 0);
  };

  return (
    <Container>
      <div className="mb-4">
        <h1 className="h1">Sign in</h1>
        <p className="muted">This is a placeholder. Integrate your auth provider here.</p>
      </div>
      <Card>
        <p className="muted">After signing in, you will choose a plan.</p>
        <div className="mt-4" style={{ display: 'flex', gap: 12 }}>
          <Button onClick={handleContinue} aria-label="Continue to plan selection">Continue</Button>
          <Button variant="secondary" onClick={() => (window.location.hash = '#/')}>Back</Button>
        </div>
      </Card>
    </Container>
  );
}
