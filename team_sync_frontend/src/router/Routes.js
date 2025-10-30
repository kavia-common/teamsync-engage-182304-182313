import React, { useEffect, useMemo, useState } from 'react';
import Landing from '../pages/Landing';
import Onboarding from '../pages/Onboarding';
import Quiz from '../pages/Quiz';
import Recommendations from '../pages/Recommendations';
import Dashboard from '../pages/Dashboard';

/**
 * A super-light hash router to avoid adding react-router-dom dependency.
 * Supports: #/, #/onboarding, #/quiz, #/recommendations, #/dashboard
 */
function useHashLocation() {
  const [hash, setHash] = useState(window.location.hash || '#/');

  useEffect(() => {
    const onHashChange = () => setHash(window.location.hash || '#/');
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  return [hash, (h) => { window.location.hash = h; }];
}

/**
 * PUBLIC_INTERFACE
 * Renders the view based on current hash path.
 */
export default function RoutesView() {
  const [hash] = useHashLocation();

  const route = useMemo(() => {
    const clean = (hash || '#/').replace(/^#/, '');
    return clean.startsWith('/') ? clean : `/${clean}`;
  }, [hash]);

  switch (route) {
    case '/':
      return <Landing />;
    case '/onboarding':
      return <Onboarding />;
    case '/quiz':
      return <Quiz />;
    case '/recommendations':
      return <Recommendations />;
    case '/dashboard':
      return <Dashboard />;
    default:
      return <Landing />;
  }
}
