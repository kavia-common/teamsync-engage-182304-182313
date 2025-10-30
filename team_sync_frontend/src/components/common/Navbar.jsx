import React from 'react';
import Button from './Button';

/**
 * PUBLIC_INTERFACE
 * Navbar shows brand and Theme toggle only.
 * Removes TeamSync CTA as requested.
 */
export default function Navbar({ theme, onToggleTheme }) {
  return (
    <header className="navbar" role="banner">
      <div className="navbar-inner">
        <a href="#/" className="brand" aria-label="TeamSync Home">
          <span className="brand-badge" aria-hidden>TS</span>
          <span>TeamSync</span>
        </a>
        <nav aria-label="Primary">
          <div className="nav-actions">
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
