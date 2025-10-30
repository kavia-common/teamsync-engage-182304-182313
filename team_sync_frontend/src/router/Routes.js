import React, { useEffect, useMemo, useRef, useState } from 'react';
import Landing from '../pages/Landing';
import Onboarding from '../pages/Onboarding';
import Quiz from '../pages/Quiz';
import Recommendations from '../pages/Recommendations';
import Dashboard from '../pages/Dashboard';
import Signup from '../pages/Signup';
import Signin from '../pages/Signin';
import PlanSelection from '../pages/PlanSelection';
import Profile from '../pages/Profile';

/**
 * A super-light hash router to avoid adding react-router-dom dependency.
 * Supports: #/, #/signup, #/signin, #/plan, #/onboarding, #/quiz, #/recommendations, #/dashboard, #/pricing (anchor handled)
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

function parseRoute(hash) {
  const clean = (hash || '#/').replace(/^#/, '');
  const normalized = clean.startsWith('/') ? clean : `/${clean}`;
  const [path, query = ''] = normalized.split('?');
  const params = {};
  if (query) {
    query.split('&').forEach(kv => {
      const [k, v] = kv.split('=');
      params[decodeURIComponent(k || '')] = decodeURIComponent(v || '');
    });
  }
  return { path, params };
}

/**
 * PUBLIC_INTERFACE
 * Renders the view based on current hash path with subtle fade transitions.
 */
export default function RoutesView() {
  const [hash] = useHashLocation();

  const { path, params } = useMemo(() => parseRoute(hash), [hash]);

  // scroll to pricing anchor when route is '#/pricing'
  useEffect(() => {
    if (path === '/pricing') {
      // Switch to landing, then scroll pricing
      window.location.hash = '#/';
      setTimeout(() => {
        const el = document.getElementById('pricing');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 0);
    }
  }, [path]);

  // Reduced motion detection
  const prefersReduced = useMemo(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  // Manage enter/exit classes around route changes
  const [phase, setPhase] = useState('enter'); // 'enter' | 'enter-active' | 'exit' | 'exit-active'
  const prevRouteRef = useRef(path);
  const timeoutRef = useRef(null);

  useEffect(() => {
    // when route changes, run exit then enter sequence
    if (prevRouteRef.current !== path) {
      if (prefersReduced) {
        // Skip animation, just update immediately
        setPhase('enter-active');
        prevRouteRef.current = path;
        return;
      }
      // Start exit phase
      setPhase('exit');
      // allow paint, then activate exit
      requestAnimationFrame(() => setPhase('exit-active'));
      // After exit completes, switch to enter
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        prevRouteRef.current = path;
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
  }, [path, prefersReduced]);

  function getView(p) {
    switch (p) {
      case '/':
        return <Landing />;
      case '/signup':
        return <Signup />;
      case '/signin':
        return <Signin />;
      case '/plan':
        return <PlanSelection />;
      case '/onboarding':
        return <Onboarding params={params} />;
      case '/quiz':
        return <Quiz params={params} />;
      case '/recommendations':
        return <Recommendations params={params} />;
      case '/dashboard':
        return <Dashboard params={params} />;
      case '/profile':
        return <Profile />;
      default:
        return <Landing />;
    }
  }

  const view = getView(path);
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
