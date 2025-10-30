import React, { useEffect, useMemo, useState } from 'react';
import './App.css';
import './index.css';
import RoutesView from './router/Routes';
import Navbar from './components/common/Navbar';
import { useAuthStore } from './state/authStore';

/**
 * App entry applies the Ocean Professional theme using CSS variables,
 * renders the Navbar and current route view.
 */
function App() {
  const [theme, setTheme] = useState('light');
  const [hydrated, setHydrated] = useState(false);

  // initialize from localStorage or prefers-color-scheme once and hydrate auth quickly
  useEffect(() => {
    // Hydrate auth on app mount
    try {
      const u = useAuthStore.getState().getUser();
      if (typeof window !== 'undefined') {
        window.__TS_TEAM_ID__ = u?.teamName || '';
      }
    } catch {
      // ignore
    }
    try {
      const saved = localStorage.getItem('ts-theme');
      if (saved === 'light' || saved === 'dark') {
        setTheme(saved);
      } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setTheme('dark');
      }
    } catch {
      // ignore storage errors
    } finally {
      // brief tick to ensure Navbar can read auth state before first paint
      const t = setTimeout(() => setHydrated(true), 10);
      return () => clearTimeout(t);
    }
  }, []);

  // Apply theme data attribute for CSS variables to take effect
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('ts-theme', theme);
    } catch {
      // ignore storage errors
    }
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'));

  if (!hydrated) {
    return (
      <div className="App" style={{ background: 'var(--ts-bg)', minHeight: '100vh', color: 'var(--ts-text)' }}>
        <a href="#main" className="skip-link">Skip to main content</a>
        <header className="navbar" role="banner">
          <div className="navbar-inner">
            <span className="brand"><span className="brand-badge" aria-hidden>TS</span><span>TeamSync</span></span>
            <div className="nav-actions">
              <button type="button" className="btn secondary" disabled aria-busy="true">Loading…</button>
            </div>
          </div>
        </header>
        <main id="main" role="main" aria-live="polite">
          <div className="ts-container">
            <div className="ts-card" aria-busy="true">
              <div className="muted">Loading…</div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="App" style={{ background: 'var(--ts-bg)', minHeight: '100vh', color: 'var(--ts-text)' }}>
      <a href="#main" className="skip-link">Skip to main content</a>
      <Navbar theme={theme} onToggleTheme={toggleTheme} />
      <main id="main" role="main" aria-live="polite">
        <RoutesView />
      </main>
    </div>
  );
}

export default App;
