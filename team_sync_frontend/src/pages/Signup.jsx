import React from 'react';
import Container from '../components/common/Container';
import Card from '../components/common/Card';
import Button from '../components/common/Button';

/**
 * PUBLIC_INTERFACE
 * Lightweight Sign up placeholder. In production, implement real registration.
 * After a mock "sign-up", users proceed to plan selection step (pricing).
 */
export default function Signup() {
  const handleContinue = () => {
    // After sign-up, send to pricing to choose plan
    window.location.hash = '#/pricing';
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
        <h1 className="h1">Sign up</h1>
        <p className="muted">This is a placeholder. Add your registration form here.</p>
      </div>
      <Card>
        <p className="muted">Plan selection happens right after you sign up.</p>
        <div className="mt-4" style={{ display: 'flex', gap: 12 }}>
          <Button onClick={handleContinue} aria-label="Continue to plan selection">Create account</Button>
          <Button variant="secondary" onClick={() => (window.location.hash = '#/')}>Back</Button>
        </div>
      </Card>
    </Container>
  );
}
