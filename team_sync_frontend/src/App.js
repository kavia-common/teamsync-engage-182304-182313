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

  // Brand Refresh palette
  const oceanVars = useMemo(
    () => ({
      '--ts-bg': '#F8FAFC',
      '--ts-surface': '#ffffff',
      '--ts-text': '#1E293B',
      '--ts-text-muted': 'rgba(30,41,59,0.72)',
      '--ts-primary': '#2BD9C9',
      '--ts-primary-600': '#22c9ba',
      '--ts-primary-700': '#19b5a7',
      '--ts-secondary': '#7D83FF',
      '--ts-secondary-600': '#6b72ff',
      '--ts-error': '#EF4444',
      '--ts-border': '#e6e8ec',
      '--ts-shadow-sm': '0 4px 12px rgba(2, 8, 23, 0.06)',
      '--ts-shadow': '0 12px 30px rgba(2, 8, 23, 0.08)',
      '--ts-radius': '16px',
      '--ts-radius-2xl': '20px',
      '--ts-focus': '0 0 0 3px rgba(43,217,201,0.35)'
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
        <main id="main" role="main" aria-live="polite">
          <RoutesView />
        </main>
      </div>
    </StoreProvider>
  );
}

export default App;
