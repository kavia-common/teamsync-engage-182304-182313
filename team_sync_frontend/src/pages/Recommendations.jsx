import React, { useEffect, useMemo, useState } from 'react';
import Container from '../components/common/Container';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { useStore } from '../state/hooks';
import api from '../services/api';

/**
 * PUBLIC_INTERFACE
 * Displays 3–5 recommended activities with actions to save and give feedback.
 * Ensures tags are visible, Save calls both API and store, and "Try Another Set" refreshes items.
 * Also guarantees a consistent 3–5 layout by filling placeholders if fewer than 3 results.
 */
export default function Recommendations() {
  const { state, actions } = useStore();
  const [loading, setLoading] = useState(true);
  const [recs, setRecs] = useState([]);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0); // bump to force refetch

  // derive payload; keep stable reference with useMemo
  const payload = useMemo(() => ({ team: state.team, quiz: state.quiz }), [state.team, state.quiz]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError('');
    api
      .getRecommendations(payload)
      .then((r) => {
        if (!mounted) return;
        // Constrain to 3–5 cards (mock returns up to 5 already); ensure at least 3 with placeholders
        const list = Array.isArray(r) ? r : [];
        const limited = list.slice(0, Math.max(3, Math.min(5, list.length)));
        // If fewer than 3, synthesize tasteful placeholders to maintain layout consistency
        const minCount = 3;
        if (limited.length < minCount) {
          const placeholders = Array.from({ length: minCount - limited.length }).map((_, i) => ({
            id: `placeholder-${i}`,
            title: 'More ideas loading…',
            description: 'Adjust your quiz or try another set to see fresh picks tailored to your team.',
            duration: 30,
            budget: 'medium',
            suggestedSize: '—',
            tags: ['ideas', 'personalized'],
            placeholder: true
          }));
          setRecs([...limited, ...placeholders]);
        } else {
          setRecs(limited);
        }
      })
      .catch(() => mounted && setError('Failed to load recommendations.'))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [payload, refreshKey]);

  const handleSave = async (item) => {
    if (item.placeholder) return; // do not save placeholders
    try {
      await api.saveRecommendation(item);
    } catch {
      // service already falls back to mock
    } finally {
      actions.saveRecommendation(item);
      // announce to SR users
      if (typeof window !== 'undefined') {
        const live = document.getElementById('sr-live');
        if (live) {
          live.textContent = `${item.title} saved`;
          // clear message after a tick to ensure SR reads subsequent updates
          setTimeout(() => { if (live) live.textContent = ''; }, 800);
        }
      }
    }
  };

  // Lightweight confetti helper (respects reduced motion)
  function sparkConfettiLight() {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced || typeof document === 'undefined') return;

    const canvas = document.createElement('canvas');
    canvas.setAttribute('aria-hidden', 'true');
    Object.assign(canvas.style, {
      position: 'fixed',
      left: '0',
      top: '0',
      pointerEvents: 'none',
      width: '100vw',
      height: '100vh',
      zIndex: 9999
    });
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    const colors = ['#2BD9C9', '#7D83FF', '#f59e0b'];
    const count = Math.min(40, Math.floor((window.innerWidth + window.innerHeight) / 40));
    const particles = Array.from({ length: count }).map(() => ({
      x: canvas.width / 2 + (Math.random() - 0.5) * 120,
      y: canvas.height / 3,
      r: 2 + Math.random() * 2.2,
      c: colors[Math.floor(Math.random() * colors.length)],
      vx: -2 + Math.random() * 4,
      vy: -1 + Math.random() * 1.5,
    }));
    let frames = 0;
    let raf;
    function step() {
      frames += 1;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy + 0.6;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.c;
        ctx.fill();
      });
      if (frames < 45) {
        raf = requestAnimationFrame(step);
      } else {
        cancelAnimationFrame(raf);
        if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
      }
    }
    raf = requestAnimationFrame(step);
  }

  const handleFeedback = async (item, value) => {
    if (item.placeholder) return; // do not feedback placeholders
    await actions.giveFeedback(item.id, value, item.title);
    if (value === 'like') {
      sparkConfettiLight();
    }
    // Accessible announcement without blocking alerts (reduce noise)
    if (typeof window !== 'undefined') {
      const live = document.getElementById('sr-live');
      if (live) {
        live.textContent = value === 'like'
          ? `Noted. We’ll show more like ${item.title}.`
          : `Got it. We’ll show fewer like ${item.title}.`;
        setTimeout(() => { if (live) live.textContent = ''; }, 1200);
      }
    }
  };

  const tryAnother = () => {
    // Trigger a different set by bumping refreshKey to refetch.
    setRefreshKey((k) => k + 1);
  };

  return (
    <Container>
      <div className="mb-4">
        <h1 className="h1">Recommendations</h1>
        <p className="muted">
          Based on your team profile and quiz results — handpicked just for you.
        </p>
        <div id="sr-live" aria-live="polite" className="sr-only" style={{ position: 'absolute', left: -9999 }} />
      </div>

      {loading && <Card aria-busy="true">Loading recommendations…</Card>}
      {error && <Card style={{ borderColor: 'var(--ts-error)' }}>{error}</Card>}

      {!loading && !error && recs.length === 0 && (
        <Card className="confetti" aria-live="polite">
          <h2 className="h2">We’re warming up the idea engine 🔧</h2>
          <p className="muted">
            No picks yet. Try tweaking your quiz choices or generate another set.
          </p>
          <div className="mt-4" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Button onClick={() => (window.location.hash = '#/quiz')} title="Retake the quiz for fresh ideas">
              Adjust Quiz
            </Button>
            <Button variant="secondary" onClick={() => (window.location.hash = '#/onboarding')} title="Update team basics">
              Edit Team
            </Button>
          </div>
        </Card>
      )}

      {!loading && !error && recs.length > 0 && (
        <div className="card-grid">
          {recs.map((rec) => (
            <Card key={rec.id} aria-busy={!!rec.placeholder}>
              <h3 className="h2">{rec.title}</h3>
              <p className="muted">{rec.description}</p>

              {/* Meta row */}
              <div className="mt-3" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <span className="btn secondary" aria-hidden title="Duration">⏱ {rec.duration}m</span>
                <span className="btn secondary" aria-hidden title="Suggested team size">👥 {rec.suggestedSize}</span>
                <span className="btn secondary" aria-hidden title="Budget level">💸 {rec.budget}</span>
              </div>

              {/* Tags visible as chips for scannability */}
              {Array.isArray(rec.tags) && rec.tags.length > 0 && (
                <div className="mt-3" aria-label="Tags" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {rec.tags.slice(0, 6).map((t) => (
                    <span key={t} className="btn ghost" aria-hidden>
                      #{t}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-4" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <Button onClick={() => handleSave(rec)} aria-label={`Save ${rec.title}`} title="Save for later" disabled={!!rec.placeholder}>
                  Save
                </Button>
                <Button variant="ghost" onClick={() => handleFeedback(rec, 'like')} aria-label={`Like ${rec.title}`} title="We’ll show more like this" disabled={!!rec.placeholder}>
                  👍 Like
                </Button>
                <Button variant="ghost" onClick={() => handleFeedback(rec, 'dislike')} aria-label={`Dislike ${rec.title}`} title="We’ll show fewer like this" disabled={!!rec.placeholder}>
                  👎 Dislike
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <div className="mt-6" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <Button variant="secondary" onClick={() => (window.location.hash = '#/quiz')} title="Adjust your quiz answers">
          Back
        </Button>
        <Button onClick={tryAnother} title="See another set based on your profile">
          Try Another Set
        </Button>
        <Button onClick={() => (window.location.hash = '#/dashboard')} title="Review saved picks and feedback">
          Go to Dashboard
        </Button>
      </div>
    </Container>
  );
}
