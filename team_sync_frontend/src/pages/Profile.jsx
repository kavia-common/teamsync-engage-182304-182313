import React from 'react';
import Container from '../components/common/Container';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { useAuthStore } from '../state/authStore';

/**
 * PUBLIC_INTERFACE
 * Profile page shows basic account info from the local auth store.
 * - Display name (read-only placeholder)
 * - Email (read-only)
 * - Team name (links to dashboard to edit inline)
 * Uses Ocean Professional theme variables and respects dark mode.
 */
export default function Profile() {
  const user = useAuthStore((s) => s.user);
  const isSignedIn = useAuthStore((s) => s.isSignedIn)();

  // Compute derived values up front (no hooks) to keep order stable
  const _nameRaw = (user?.name || '').trim();
  const initials = (() => {
    const parts = _nameRaw ? _nameRaw.split(/\s+/) : [];
    const a = (parts[0] || 'U')[0] || 'U';
    const b = (parts[1] || '')[0] || '';
    return (a + b).toUpperCase();
  })();

  // If not signed in, redirect to /signin gracefully
  if (!isSignedIn) {
    try {
      window.history.replaceState(null, '', '#/signin');
    } catch {
      window.location.hash = '#/signin';
    }
    return null;
  }

  const name = _nameRaw || '—';
  const email = (user?.email || '').trim() || '—';
  const teamName = (user?.teamName || '').trim() || 'Your team';

  return (
    <Container>
      <div className="mb-4">
        <h1 className="h1">Your Profile</h1>
        <p className="muted">
          Manage your basic info. Team name can be edited from the Dashboard.
        </p>
      </div>

      <Card>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div
            aria-hidden
            style={{
              width: 56,
              height: 56,
              display: 'inline-grid',
              placeItems: 'center',
              borderRadius: 16,
              background: 'linear-gradient(135deg, var(--ts-secondary), var(--ts-primary))',
              color: '#041318',
              fontWeight: 800,
              fontSize: 18,
              boxShadow: 'var(--ts-shadow-sm)',
            }}
            title="Avatar"
          >
            {initials}
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 'var(--font-h3)', lineHeight: 'var(--lh-tight)' }}>{name}</div>
            <div className="muted" style={{ fontSize: 'var(--font-small)', lineHeight: 'var(--lh-normal)' }}>
              {isSignedIn ? 'Signed in' : 'Signed out'}
            </div>
          </div>
        </div>

        <div className="mt-4" style={{ display: 'grid', gap: 12 }}>
          <div>
            <label className="label" htmlFor="profile-email">Email</label>
            <input
              id="profile-email"
              className="input"
              type="email"
              value={email}
              readOnly
              aria-readonly="true"
              title="Email"
            />
          </div>
          <div>
            <label className="label" htmlFor="profile-display-name">Display name</label>
            <input
              id="profile-display-name"
              className="input"
              value={name}
              readOnly
              aria-readonly="true"
              title="Display name"
            />
          </div>
          <div>
            <label className="label" htmlFor="profile-team">Team</label>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <input
                id="profile-team"
                className="input"
                value={teamName}
                readOnly
                aria-readonly="true"
                title="Team name (edit from Dashboard)"
              />
              <Button
                variant="secondary"
                onClick={() => (window.location.hash = '#/dashboard')}
                title="Edit on Dashboard"
                aria-label="Edit team name on Dashboard"
              >
                Edit on Dashboard
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-4" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Button variant="secondary" onClick={() => (window.location.hash = '#/')} aria-label="Back to Home">
            Back
          </Button>
          <Button onClick={() => (window.location.hash = '#/dashboard')} aria-label="Go to Dashboard">
            Go to Dashboard
          </Button>
        </div>
      </Card>
    </Container>
  );
}
