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
import { useAuthStore } from '../state/authStore';

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
 * Small helper to hydrate auth state synchronously from localStorage.
 * Returns { ready, isAuthed } to avoid initial flicker on first render.
 */
function useAuthReady() {
  const getUser = useAuthStore((s) => s.getUser);
  const isSignedInFn = useAuthStore((s) => s.isSignedIn);
  const [ready, setReady] = useState(false);
  const [isAuthed, setAuthed] = useState(false);

  useEffect(() => {
    try {
      const u = getUser?.();
      setAuthed(!!(u && (u.email || u.name)));
      // expose team id for downstream services
      if (typeof window !== 'undefined') {
        window.__TS_TEAM_ID__ = u?.teamName || '';
      }
    } catch {
      /* ignore */
    } finally {
      // allow a tiny tick so Navbar can read store before first route paint
      const t = setTimeout(() => setReady(true), 10);
      return () => clearTimeout(t);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // also react to later auth store changes
  useEffect(() => {
    const check = () => {
      try { setAuthed(!!isSignedInFn()); } catch { /* noop */ }
    };
    const i = setInterval(check, 250);
    return () => clearInterval(i);
  }, [isSignedInFn]);

  return { ready, isAuthed };
}

/**
 * PUBLIC_INTERFACE
 * Renders the view based on current hash path with subtle fade transitions.
 * Adds simple auth route-guards and a micro-skeleton while hydrating.
 */
export default function RoutesView() {
  const [hash] = useHashLocation();
  const { path, params } = useMemo(() => parseRoute(hash), [hash]);

  const { ready, isAuthed } = useAuthReady();

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

  // Simple guards: block until auth is hydrated to avoid flicker
  const guardedPath = useMemo(() => {
    if (!ready) return 'loading';
    // If user is authenticated, redirect /signin and /signup to /dashboard
    if (isAuthed && (path === '/signin' || path === '/signup')) {
      // replace history (hash) to prevent back navigation to auth
      try { window.history.replaceState(null, '', '#/dashboard'); } catch { window.location.hash = '#/dashboard'; }
      return '/dashboard';
    }
    // If not authenticated, redirect protected pages to /signin
    const protectedPaths = ['/profile', '/dashboard', '/onboarding', '/quiz', '/recommendations', '/plan'];
    if (!isAuthed && protectedPaths.includes(path)) {
      try { window.history.replaceState(null, '', '#/signin'); } catch { window.location.hash = '#/signin'; }
      return '/signin';
    }
    return path;
  }, [ready, isAuthed, path]);

  function getView(p) {
    switch (p) {
      case 'loading':
        return (
          <div className="ts-container" aria-busy="true" aria-live="polite">
            <div className="ts-card" style={{ padding: 18 }}>
              <div className="muted">Loading…</div>
            </div>
          </div>
        );
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

  const view = getView(guardedPath);
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
