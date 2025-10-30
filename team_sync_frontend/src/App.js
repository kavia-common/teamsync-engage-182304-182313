import React, { useEffect, useMemo, useState } from 'react';
import './App.css';
import './index.css';
import RoutesView from './router/Routes';
import Navbar from './components/common/Navbar';
import { StoreProvider } from './state/store';

/**
 * App entry applies the Ocean Professional theme using CSS variables,
 * renders the Navbar and current route view, and provides global store.
 */
function App() {
  const [theme, setTheme] = useState('light');

  // Ocean Professional palette
  const oceanVars = useMemo(
    () => ({
      '--ts-bg': '#f9fafb',
      '--ts-surface': '#ffffff',
      '--ts-text': '#111827',
      '--ts-text-muted': 'rgba(17,24,39,0.7)',
      '--ts-primary': '#2563EB',
      '--ts-secondary': '#F59E0B',
      '--ts-error': '#EF4444',
      '--ts-border': '#e5e7eb',
      '--ts-shadow': '0 10px 20px rgba(0,0,0,0.06)',
      '--ts-radius': '16px',
      '--ts-focus': '0 0 0 3px rgba(37,99,235,0.35)'
    }),
    []
  );

  useEffect(() => {
    // apply theme vars to document root
    const root = document.documentElement;
    Object.entries(oceanVars).forEach(([k, v]) => root.style.setProperty(k, v));
    root.setAttribute('data-theme', theme);
  }, [theme, oceanVars]);

  const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'));

  return (
    <StoreProvider>
      <div className="App" style={{ background: 'var(--ts-bg)', minHeight: '100vh' }}>
        <a href="#main" className="skip-link">Skip to main content</a>
        <Navbar theme={theme} onToggleTheme={toggleTheme} />
        <main id="main" aria-live="polite">
          <RoutesView />
        </main>
      </div>
    </StoreProvider>
  );
}

export default App;
