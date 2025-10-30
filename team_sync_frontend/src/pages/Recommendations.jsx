import React, { useEffect, useState } from 'react';
import Container from '../components/common/Container';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { useStore } from '../state/hooks';
import api from '../services/api';

/**
 * PUBLIC_INTERFACE
 * Displays 3–5 recommended activities with actions to save and give feedback.
 */
export default function Recommendations() {
  const { state, actions } = useStore();
  const [loading, setLoading] = useState(true);
  const [recs, setRecs] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError('');
    api
      .getRecommendations({ team: state.team, quiz: state.quiz })
      .then((r) => mounted && setRecs(r))
      .catch(() => mounted && setError('Failed to load recommendations.'))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [state.team, state.quiz]);

  const handleSave = async (item) => {
    await actions.saveRecommendation(item);
  };

  // Lightweight confetti helper
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
    await actions.giveFeedback(item.id, value, item.title);
    // playful microcopy
    if (value === 'like') {
      sparkConfettiLight();
    }
    alert(
      value === 'like'
        ? 'Nice! We’ll sprinkle more like that 🎉'
        : 'Got it — we’ll show fewer like this 💡'
    );
  };

  const tryAnother = () => {
    // Simple reshuffle: trigger a refetch by tweaking quiz interests ordering
    const reordered = [...(state.quiz.interests || [])].sort(() => Math.random() - 0.5);
    actions.setQuiz({ interests: reordered });
  };

  return (
    <Container>
      <div className="mb-4">
        <h1 className="h1" title="Your squad’s got The Office energy 🎬">Recommendations</h1>
        <p className="muted">
          Based on your team profile and quiz results — handpicked just for you.
        </p>
      </div>

      {loading && <Card aria-busy="true">Loading recommendations…</Card>}
      {error && <Card style={{ borderColor: 'var(--ts-error)' }}>{error}</Card>}
      {!loading && !error && recs.length === 0 && (
        <Card className="confetti" aria-live="polite">
          <h2 className="h2">We’re warming up the idea engine 🔧</h2>
          <p className="muted">
            No picks yet. Try tweaking your quiz choices — or unleash your inner Avengers 🦸‍♀️ and retake it with bold vibes.
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
            <Card key={rec.id}>
              <h3 className="h2" title="Team-boosting activity">{rec.title}</h3>
              <p className="muted">{rec.description}</p>
              <div className="mt-3" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <span className="btn secondary" aria-hidden title="Duration">⏱ {rec.duration}m</span>
                <span className="btn secondary" aria-hidden title="Suggested team size">👥 {rec.suggestedSize}</span>
                <span className="btn secondary" aria-hidden title="Budget level">💸 {rec.budget}</span>
              </div>
              <div className="mt-4" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <Button onClick={() => handleSave(rec)} aria-label={`Save ${rec.title}`} title="Save for later">
                  Save
                </Button>
                <Button variant="ghost" onClick={() => handleFeedback(rec, 'like')} aria-label={`Like ${rec.title}`} title="We’ll show more like this">
                  👍 Like
                </Button>
                <Button variant="ghost" onClick={() => handleFeedback(rec, 'dislike')} aria-label={`Dislike ${rec.title}`} title="We’ll show fewer like this">
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
