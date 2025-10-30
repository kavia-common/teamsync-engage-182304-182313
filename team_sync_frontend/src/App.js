import React, { useEffect, useMemo, useState } from 'react';
import './App.css';
import './index.css';
import RoutesView from './router/Routes';
import Navbar from './components/common/Navbar';
import BackButton from './components/BackButton';

/**
 * App entry applies the Ocean Professional theme using CSS variables,
 * renders the Navbar, BackButton, and current route view.
 */
function App() {
  const [theme, setTheme] = useState('light');

  // Ocean Professional palette
  const oceanVars = useMemo(
    () => ({
      '--ts-bg': '#F8FAFC',
      '--ts-surface': '#ffffff',
      '--ts-text': '#111827',
      '--ts-text-muted': 'rgba(17,24,39,0.72)',
      '--ts-primary': '#2563EB',
      '--ts-primary-600': '#1d4ed8',
      '--ts-primary-700': '#1e40af',
      '--ts-secondary': '#F59E0B',
      '--ts-error': '#EF4444',
      '--ts-border': '#e6e8ec',
      '--ts-shadow-sm': '0 4px 12px rgba(2, 8, 23, 0.06)',
      '--ts-shadow': '0 12px 30px rgba(2, 8, 23, 0.08)',
      '--ts-radius': '16px',
      '--ts-radius-2xl': '20px',
      '--ts-focus': '0 0 0 3px rgba(37,99,235,0.35)'
    }),
    []
  );

  useEffect(() => {
    const root = document.documentElement;
    Object.entries(oceanVars).forEach(([k, v]) => root.style.setProperty(k, v));
    root.setAttribute('data-theme', theme);
  }, [theme, oceanVars]);

  const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'));

  return (
    <div className="App ts-app-bg" style={{ minHeight: '100vh' }}>
      <a href="#main" className="skip-link">Skip to main content</a>
      {/* Global Back button (self-hides on "#/") */}
      <BackButton />
      <Navbar theme={theme} onToggleTheme={toggleTheme} />
      <main id="main" role="main" aria-live="polite">
        <RoutesView />
      </main>
    </div>
  );
}

export default App;
