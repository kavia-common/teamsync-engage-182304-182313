import React from 'react';
import Button from './Button';
import { useAuthStore } from '../../state/authStore';

/**
 * PUBLIC_INTERFACE
 * Navbar shows brand, Theme toggle, and a small signed-in chip "Hi, {name}".
 */
export default function Navbar({ theme, onToggleTheme }) {
  const user = useAuthStore((s) => s.user);

  const name = user?.name?.trim();
  return (
    <header className="navbar" role="banner">
      <div className="navbar-inner">
        <a href="#/" className="brand" aria-label="TeamSync Home">
          <span className="brand-badge" aria-hidden>TS</span>
          <span>TeamSync</span>
        </a>
        <nav aria-label="Primary">
          <div className="nav-actions" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {name ? (
              <span
                className="btn secondary"
                title={`Signed in as ${name}`}
                style={{
                  background: 'color-mix(in srgb, var(--ts-primary), transparent 88%)',
                  borderColor: 'color-mix(in srgb, var(--ts-primary), transparent 72%)',
                  color: 'var(--ts-text)',
                }}
              >
                👋 Hi, {name}
              </span>
            ) : null}
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
