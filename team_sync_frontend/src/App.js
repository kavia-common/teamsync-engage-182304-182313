import React, { useEffect, useMemo, useState } from 'react';
import './App.css';
import './index.css';
import RoutesView from './router/Routes';

/**
 * App entry applies the Ocean Professional theme using CSS variables
 * and renders the current route view.
 * Note: Navbar intentionally removed so the landing page contains only
 * the single TeamSync logo button, per requirements.
 */
function App() {
  const [theme, setTheme] = useState('light');

  // Preserve theme var behavior but it can be simplified if needed.
  const oceanVars = useMemo(
    () => ({
      '--ts-bg': '#F8FAFC',
      '--ts-surface': '#ffffff',
      '--ts-text': '#1E293B',
      '--ts-text-muted': 'rgba(30,41,59,0.72)',
      '--ts-primary': '#2563EB', // updated to match Ocean Professional primary
      '--ts-primary-600': '#1E4FCB',
      '--ts-primary-700': '#173FA3',
      '--ts-secondary': '#F59E0B',
      '--ts-secondary-600': '#D97706',
      '--ts-error': '#EF4444',
      '--ts-border': '#e6e8ec',
      '--ts-shadow-sm': '0 4px 12px rgba(2, 8, 23, 0.06)',
      '--ts-shadow': '0 12px 30px rgba(2, 8, 23, 0.08)',
      '--ts-radius': '16px',
      '--ts-radius-2xl': '20px',
      '--ts-focus': '0 0 0 3px rgba(37, 99, 235, 0.35)',
    }),
    []
  );

  useEffect(() => {
    const root = document.documentElement;
    Object.entries(oceanVars).forEach(([k, v]) => root.style.setProperty(k, v));
    root.setAttribute('data-theme', theme);
  }, [theme, oceanVars]);

  return (
    <div className="App" style={{ background: 'var(--ts-bg)', minHeight: '100vh' }}>
      <a href="#main" className="skip-link">Skip to main content</a>
      <main id="main" role="main" aria-live="polite">
        <RoutesView />
      </main>
    </div>
  );
}

export default App;
