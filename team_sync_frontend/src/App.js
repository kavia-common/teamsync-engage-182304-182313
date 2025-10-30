import React, { useEffect, useMemo, useState } from 'react';
import './App.css';
import './index.css';
import RoutesView from './router/Routes';
import Navbar from './components/common/Navbar';

/**
 * App entry applies the Ocean Professional theme using CSS variables,
 * renders the Navbar and current route view.
 */
function App() {
  const [theme, setTheme] = useState('light');

  // initialize from localStorage or prefers-color-scheme once
  useEffect(() => {
    try {
      const saved = localStorage.getItem('ts-theme');
      if (saved === 'light' || saved === 'dark') {
        setTheme(saved);
      } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setTheme('dark');
      }
    } catch {
      // ignore storage errors
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
