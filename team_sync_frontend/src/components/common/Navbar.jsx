import React from 'react';
import Button from './Button';
import { useStore } from '../../state/hooks';

/**
 * PUBLIC_INTERFACE
 * Navbar simplified to show only the TeamSync primary CTA and Theme toggle.
 * Preserves theme toggle behavior and Ocean Professional styling.
 */
export default function Navbar({ theme, onToggleTheme }) {
  const { state } = useStore();

  // PUBLIC_INTERFACE
  // Primary CTA click: start TeamSync by navigating to sign-in (keeps existing flow).
  const handleStart = () => {
    window.location.hash = '#/signin';
  };

  return (
    <header className="navbar" role="banner">
      <div className="navbar-inner">
        <a href="#/" className="brand" aria-label="TeamSync Home">
          <span className="brand-badge" aria-hidden>TS</span>
          <span>TeamSync</span>
        </a>
        <nav aria-label="Primary">
          <div className="nav-actions">
            <Button onClick={handleStart} aria-label="Start TeamSync" title="Start TeamSync">
              TeamSync
            </Button>
            <Button
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
              onClick={onToggleTheme}
              className="secondary"
              title={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
            >
              {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
}
