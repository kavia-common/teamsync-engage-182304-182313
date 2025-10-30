import React from 'react';
import Button from './Button';
import { useStore } from '../../state/hooks';

/**
 * PUBLIC_INTERFACE
 * Navbar with brand, key links, and theme toggle.
 */
export default function Navbar({ theme, onToggleTheme }) {
  const { state } = useStore();
  const planBadge = state.plan?.tier === 'pro' ? 'Pro' : 'Free';
  const demoSuffix = state.plan?.demo ? ' • Demo' : '';

  return (
    <header className="navbar" role="banner">
      <div className="navbar-inner">
        <a href="#/" className="brand" aria-label="TeamSync Home">
          <span className="brand-badge" aria-hidden>TS</span>
          <span>TeamSync</span>
        </a>
        <nav aria-label="Primary">
          <div className="nav-actions">
            <a className="btn ghost" href="#/onboarding">Onboard</a>
            <a className="btn ghost" href="#/quiz">Quiz</a>
            <a className="btn ghost" href="#/recommendations">Recommendations</a>
            <a className="btn ghost" href="#/dashboard">Dashboard</a>
            <a className="btn ghost" href="#/pricing" onClick={(e) => { e.preventDefault(); window.location.hash = '#/'; setTimeout(() => { const el = document.querySelector('[aria-label="Pro plan"]'); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 0); }}>
              Pricing
            </a>
            <span className="btn secondary" aria-label="Current plan badge">{planBadge}{demoSuffix}</span>
            <Button aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`} onClick={onToggleTheme} className="secondary">
              {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
}
