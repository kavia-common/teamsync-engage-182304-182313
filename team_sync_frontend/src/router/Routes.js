import React, { useEffect, useMemo, useRef, useState } from 'react';
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
 * Renders the view based on current hash path with subtle fade transitions.
 */
export default function RoutesView() {
  const [hash] = useHashLocation();

  const route = useMemo(() => {
    const clean = (hash || '#/').replace(/^#/, '');
    return clean.startsWith('/') ? clean : `/${clean}`;
  }, [hash]);

  // Reduced motion detection
  const prefersReduced = useMemo(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  // Manage enter/exit classes around route changes
  const [phase, setPhase] = useState('enter'); // 'enter' | 'enter-active' | 'exit' | 'exit-active'
  const prevRouteRef = useRef(route);
  const timeoutRef = useRef(null);

  useEffect(() => {
    // when route changes, run exit then enter sequence
    if (prevRouteRef.current !== route) {
      if (prefersReduced) {
        // Skip animation, just update immediately
        setPhase('enter-active');
        prevRouteRef.current = route;
        return;
      }
      // Start exit phase
      setPhase('exit');
      // allow paint, then activate exit
      requestAnimationFrame(() => setPhase('exit-active'));
      // After exit completes, switch to enter
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        prevRouteRef.current = route;
        setPhase('enter'); // reset to enter
        requestAnimationFrame(() => setPhase('enter-active'));
      }, 200); // match CSS .page-exit-active duration
    } else {
      // initial mount
      if (prefersReduced) setPhase('enter-active');
      else {
        setPhase('enter');
        requestAnimationFrame(() => setPhase('enter-active'));
      }
    }
    return () => clearTimeout(timeoutRef.current);
  }, [route, prefersReduced]);

  function getView(r) {
    switch (r) {
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

  const view = getView(route);
  const className =
    prefersReduced
      ? ''
      : [
          'page-transition',
          phase === 'enter' && 'page-enter',
          phase === 'enter-active' && 'page-enter-active',
          phase === 'exit' && 'page-exit',
          phase === 'exit-active' && 'page-exit-active',
        ]
          .filter(Boolean)
          .join(' ');

  return (
    <div className={className} aria-live="polite">
      {view}
    </div>
  );
}
