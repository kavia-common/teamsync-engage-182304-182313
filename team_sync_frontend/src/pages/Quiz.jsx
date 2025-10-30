import React, { useEffect, useMemo, useState } from 'react';
import Container from '../components/common/Container';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Progress from '../components/common/Progress';
import { useStore } from '../state/hooks';

/**
 * PUBLIC_INTERFACE
 * 5-question quiz with concise radio/slider inputs.
 * On submit: triggers confetti and navigates to /recommendations.
 * Demo mode: if ?demo=1, prefill default quiz answers and auto-submit.
 */
export default function Quiz({ params = {} }) {
  const { state, actions } = useStore();

  const isDemo = String(params.demo || '').toLowerCase() === '1' || !!state.plan?.demo;

  // Initialize from store with safe defaults
  const initial = useMemo(
    () => ({
      energy: state.quiz.energy ?? 'balanced',          // Q1
      budget: state.quiz.budget ?? 'medium',            // Q2
      duration: Number(state.quiz.duration ?? 60),      // Q3
      interests: state.quiz.interests ?? ['games'],     // Q4
      collaboration: Number(state.quiz.collaboration ?? 3) // Q5
    }),
    [state.quiz]
  );

  // Local form state
  const [energy, setEnergy] = useState(initial.energy);
  const [budget, setBudget] = useState(initial.budget);
  const [duration, setDuration] = useState(initial.duration);
  const [interests, setInterests] = useState(initial.interests);
  const [collaboration, setCollaboration] = useState(initial.collaboration);
  const [saving, setSaving] = useState(false);

  // Auto-prefill + auto-submit in demo
  useEffect(() => {
    if (!isDemo) return;
    // ensure plan reflects demo/pro for premium awareness
    actions.setPlan({ demo: true, tier: state.plan?.tier || 'pro' });

    // prefill quick values for a good spread
    setEnergy('balanced');
    setBudget('medium');
    setDuration(45);
    setInterests(['games', 'creative', 'wellness']);
    setCollaboration(4);

    const t = setTimeout(async () => {
      setSaving(true);
      try {
        await actions.setQuiz({
          energy: 'balanced',
          budget: 'medium',
          duration: String(45),
          interests: ['games', 'creative', 'wellness'],
          collaboration: 4,
        });
        // subtle: skip confetti on auto to avoid confusion; recommendations can still celebrate on likes
        window.location.hash = '#/recommendations';
      } finally {
        setSaving(false);
      }
    }, 250);

    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDemo]);

  // Accessible multi-select chips (kept but presented as a controlled set of toggles)
  const chips = [
    { key: 'games', label: 'Games' },
    { key: 'outdoors', label: 'Outdoors' },
    { key: 'food', label: 'Food' },
    { key: 'creative', label: 'Creative' },
    { key: 'wellness', label: 'Wellness' },
  ];

  const toggleInterest = (key) => {
    setInterests((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  };

  // Confetti respects reduced motion and draws a quick overlay
  function sparkConfetti() {
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
    const colors = ['#2BD9C9', '#7D83FF', '#34d399', '#f59e0b'];
    const count = Math.min(90, Math.floor((window.innerWidth + window.innerHeight) / 24));
    const particles = Array.from({ length: count }).map(() => ({
      x: Math.random() * canvas.width,
      y: -10 - Math.random() * 40,
      r: 2 + Math.random() * 3,
      c: colors[Math.floor(Math.random() * colors.length)],
      vx: -1 + Math.random() * 2,
      vy: 2 + Math.random() * 2.5
    }));
    let frames = 0;
    let raf;
    function step() {
      frames += 1;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.02;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.c;
        ctx.fill();
      });
      if (frames < 55) {
        raf = requestAnimationFrame(step);
      } else {
        cancelAnimationFrame(raf);
        if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
      }
    }
    raf = requestAnimationFrame(step);
  }

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    setSaving(true);
    try {
      await actions.setQuiz({
        energy,
        budget,
        duration: String(duration), // persist as string to match store shape
        interests,
        collaboration
      });
      sparkConfetti();
      window.location.hash = '#/recommendations';
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="teal-page-bg">
      <Container>
        <section className="glass-section">
          <div className="mb-4">
            <h1 className="h1">Team Quiz</h1>
            <p className="muted">Five quick picks to tailor your activities.</p>
            {isDemo && <div className="mt-2"><span className="btn warning">Demo mode</span></div>}
          </div>

          <Card as="form" onSubmit={handleSubmit} noValidate>
            <Progress value={100} label="Quiz progress" />

            <div className="ts-row cols-2 mt-4">
              {/* Q1: Energy (radios) */}
              <fieldset>
                <legend className="label">1) Energy</legend>
                <div role="radiogroup" aria-label="Energy level" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <label className={`btn ${energy === 'chill' ? '' : 'secondary'}`}>
                    <input
                      type="radio"
                      name="energy"
                      value="chill"
                      checked={energy === 'chill'}
                      onChange={() => setEnergy('chill')}
                      aria-label="Chill"
                      style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
                    />
                    Chill
                  </label>
                  <label className={`btn ${energy === 'balanced' ? '' : 'secondary'}`}>
                    <input
                      type="radio"
                      name="energy"
                      value="balanced"
                      checked={energy === 'balanced'}
                      onChange={() => setEnergy('balanced')}
                      aria-label="Balanced"
                      style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
                    />
                    Balanced
                  </label>
                  <label className={`btn ${energy === 'high' ? '' : 'secondary'}`}>
                    <input
                      type="radio"
                      name="energy"
                      value="high"
                      checked={energy === 'high'}
                      onChange={() => setEnergy('high')}
                      aria-label="High"
                      style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
                    />
                    High
                  </label>
                </div>
              </fieldset>

              {/* Q2: Budget (radios) */}
              <fieldset>
                <legend className="label">2) Budget</legend>
                <div role="radiogroup" aria-label="Budget" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <label className={`btn ${budget === 'low' ? '' : 'secondary'}`}>
                    <input
                      type="radio"
                      name="budget"
                      value="low"
                      checked={budget === 'low'}
                      onChange={() => setBudget('low')}
                      aria-label="Low"
                      style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
                    />
                    Low
                  </label>
                  <label className={`btn ${budget === 'medium' ? '' : 'secondary'}`}>
                    <input
                      type="radio"
                      name="budget"
                      value="medium"
                      checked={budget === 'medium'}
                      onChange={() => setBudget('medium')}
                      aria-label="Medium"
                      style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
                    />
                    Medium
                  </label>
                  <label className={`btn ${budget === 'high' ? '' : 'secondary'}`}>
                    <input
                      type="radio"
                      name="budget"
                      value="high"
                      checked={budget === 'high'}
                      onChange={() => setBudget('high')}
                      aria-label="High"
                      style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
                    />
                    High
                  </label>
                </div>
              </fieldset>

              {/* Q3: Duration (slider) */}
              <div>
                <label className="label" htmlFor="duration">3) Duration (minutes)</label>
                <input
                  id="duration"
                  className="input"
                  type="range"
                  min={15}
                  max={180}
                  step={15}
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  aria-valuemin={15}
                  aria-valuemax={180}
                  aria-valuenow={duration}
                />
                <div className="muted" style={{ fontSize: 'var(--font-small)', lineHeight: 'var(--lh-normal)' }}>Current: {duration} min</div>
              </div>

              {/* Q4: Interests (compact chip toggles) */}
              <div>
                <span className="label" id="interests-label">4) Interests</span>
                <div aria-labelledby="interests-label" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {chips.map((c) => (
                    <button
                      key={c.key}
                      type="button"
                      onClick={() => toggleInterest(c.key)}
                      className={`btn ${interests.includes(c.key) ? '' : 'secondary'}`}
                      aria-pressed={interests.includes(c.key)}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Q5: Collaboration (slider) */}
              <div>
                <label className="label" htmlFor="collab">5) Collaboration (1–5)</label>
                <input
                  id="collab"
                  className="input"
                  type="range"
                  min={1}
                  max={5}
                  step={1}
                  value={collaboration}
                  onChange={(e) => setCollaboration(Number(e.target.value))}
                  aria-valuemin={1}
                  aria-valuemax={5}
                  aria-valuenow={collaboration}
                />
                <div className="muted" style={{ fontSize: 'var(--font-small)', lineHeight: 'var(--lh-normal)' }}>Current: {collaboration}</div>
              </div>
            </div>

            <div className="mt-4" style={{ display: 'flex', gap: 12 }}>
              <Button variant="secondary" type="button" onClick={() => (window.location.hash = '#/onboarding')}>Back</Button>
              <Button type="submit" disabled={saving}>{saving ? 'Saving…' : (isDemo ? 'Continuing Demo…' : 'Submit & See Recommendations')}</Button>
            </div>
          </Card>
        </section>
      </Container>
    </div>
  );
}
