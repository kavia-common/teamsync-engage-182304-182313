import React, { useEffect, useMemo, useState } from 'react';
import Container from '../components/common/Container';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { useStore } from '../state/hooks';
import api from '../services/api';

/**
 * PUBLIC_INTERFACE
 * Displays 3–5 recommended activities with actions to save and give feedback.
 * Adds department segmented filter (All vs Department), department-exclusive badge,
 * hero alignment label, and playful microcopy. Maintains accessibility.
 * Integrates gamification: awards on save/feedback and refreshes global gamification state.
 */
export default function Recommendations() {
  const { state, actions } = useStore();
  const [loading, setLoading] = useState(true);
  const [recs, setRecs] = useState([]);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0); // bump to force refetch
  const [segment, setSegment] = useState((state.team?.department || '').trim() ? 'department' : 'all'); // 'all' | 'department'

  const dept = (state.team?.department || '').trim();
  const teamId = state.team?.teamId || state.team?.id || state.team?.name || '';

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
        const list = Array.isArray(r) ? r : [];

        // Constrain to 3–5 cards; ensure at least 3 with placeholders
        const limited = list.slice(0, Math.max(3, Math.min(5, list.length)));
        const minCount = 3;
        let base = limited;
        if (limited.length < minCount) {
          const placeholders = Array.from({ length: minCount - limited.length }).map((_, i) => ({
            id: `placeholder-${i}`,
            title: 'More ideas loading…',
            description: 'Adjust your quiz or try another set to see fresh picks tailored to your team.',
            duration: 30,
            budget: 'medium',
            suggestedSize: '—',
            tags: ['ideas', 'personalized'],
            placeholder: true,
            heroAlignment: 'Ally',
            departmentExclusive: false,
            departmentScope: []
          }));
          base = [...limited, ...placeholders];
        }
        setRecs(base);
      })
      .catch(() => mounted && setError('Failed to load recommendations.'))
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, [payload, refreshKey]);

  // AI state
  const [ai, setAi] = useState({ ideas: [], source: '', model: '', usage: null, error: null });
  const [aiLoading, setAiLoading] = useState(false);
  const [showReasoning, setShowReasoning] = useState({}); // id -> bool

  async function generateAI() {
    setAiLoading(true);
    try {
      const payloadAI = {
        team: state.team || {},
        quiz: state.quiz || {},
        department: state.team?.department || '',
        constraints: { limit: 5, mode: state.team?.workMode || 'hybrid' }
      };
      const res = await api.postAIRecommendations(payloadAI);
      setAi(res);
      // Merge AI ideas into current list with de-dup by title
      const existing = Array.isArray(recs) ? recs : [];
      const aiIdeas = (res.ideas || []).map((x) => {
        const scope = Array.isArray(x.departmentScope) ? x.departmentScope : [];
        const exclusive = scope.length === 1 && (!!(state.team?.department) && scope[0] === state.team.department);
        return ({
          id: x.id || `ai-${Math.random().toString(36).slice(2, 8)}`,
          title: x.title,
          description: x.description,
          duration: x.duration || 30,
          tags: x.tags || [],
          heroAlignment: x.heroAlignment || 'Ally',
          departmentScope: scope,
          departmentExclusive: exclusive,
          suggestedSize: `${Math.max(2, (state.team?.size || 2) - 1)}-${(state.team?.size || 6) + 2}`,
          budget: 'medium',
          _ai: { source: res.source, fit_score: typeof x.fit_score === 'number' ? x.fit_score : 0.5, reasoning: x.reasoning || '' }
        });
      });
      const titles = new Set(existing.map((e) => (e.title || '').toLowerCase()));
      const merged = [...existing, ...aiIdeas.filter((i) => !titles.has((i.title || '').toLowerCase()))];
      setRecs(merged);
      if (res.error) {
        // Non-blocking toast substitute
        // eslint-disable-next-line no-console
        console.warn('AI provider error (fallback used):', res.error);
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('AI generation failed:', e?.message || e);
      setAi({ ideas: [], source: 'fallback', model: 'rules-v1', error: { message: String(e) } });
    } finally {
      setAiLoading(false);
    }
  }

  const filtered = useMemo(() => {
    if (segment !== 'department') return recs;
    return recs.filter(r => r.placeholder || r.departmentExclusive || (r.departmentScope || []).includes(dept));
  }, [recs, segment, dept]);

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

  async function afterAwardRefreshAndCelebrate() {
    // Refresh gamification state
    try { await actions.refreshGamification(teamId); } catch { /* ignore */ }
    // To avoid hook rule violations and extra coupling, we conservatively trigger a light confetti
    // after a potential award; the UI remains subtle and respects reduced motion.
    sparkConfettiLight();
  }

  const handleSave = async (item) => {
    if (item.placeholder) return; // do not save placeholders
    try {
      await api.saveRecommendation(item);
    } catch {
      // service already falls back to mock
    } finally {
      // Ensure we persist department info and hero label on save
      const enriched = {
        ...item,
        _savedDept: dept,
        _heroAlignment: item.heroAlignment || 'Ally',
      };
      actions.saveRecommendation(enriched);
      // Gamification: record local award and POST to backend
      try {
        await actions.recordAward('save', { activityId: item.id, title: item.title });
        await api.awardGamification({ teamId, event: 'save', meta: { activityId: item.id } });
        await afterAwardRefreshAndCelebrate();
      } catch { /* ignore */ }

      if (typeof window !== 'undefined') {
        const live = document.getElementById('sr-live');
        if (live) {
          live.textContent = `${item.title} saved`;
          setTimeout(() => { if (live) live.textContent = ''; }, 800);
        }
      }
    }
  };

  const handleFeedback = async (item, value) => {
    if (item.placeholder) return; // do not feedback placeholders
    // Map like/dislike to numeric rating for backend thresholds (>=4 like, <=2 dislike)
    const rating = value === 'like' ? 4 : 2;
    const comment = ''; // quick reactions carry no long comment
    await actions.giveFeedback(item.id, value, item.title, comment, rating);
    if (value === 'like') sparkConfettiLight();

    // Gamification: local + server award, include longComment meta=false to align with backend bonus logic
    try {
      await actions.recordAward('feedback', { activityId: item.id, value, rating, longComment: false });
      await api.awardGamification({
        teamId,
        event: 'feedback',
        meta: { activityId: item.id, value, rating, longComment: false }
      });
      await afterAwardRefreshAndCelebrate();
    } catch { /* ignore */ }

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

  const tryAnother = () => setRefreshKey((k) => k + 1);

  const SegmentControl = () => (
    <div role="tablist" aria-label="Recommendation filter" className="mt-3" style={{ display: 'inline-flex', gap: 8 }}>
      <button
        role="tab"
        aria-selected={segment === 'all'}
        className={`btn ${segment === 'all' ? '' : 'secondary'}`}
        onClick={() => setSegment('all')}
      >
        All
      </button>
      <button
        role="tab"
        aria-selected={segment === 'department'}
        className={`btn ${segment === 'department' ? '' : 'secondary'}`}
        onClick={() => setSegment('department')}
        disabled={!dept}
        title={dept ? `Show ${dept} picks` : 'Set department in Onboarding'}
      >
        {dept ? `${dept}` : 'Department'}
      </button>
    </div>
  );

  return (
    <Container>
      <div className="mb-4">
        <h1 className="h1">Recommendations</h1>
        <p className="muted">
          Based on your team profile and quiz results — handpicked just for you.
        </p>
        <SegmentControl />
        <div id="sr-live" aria-live="polite" className="sr-only" />
        <div className="mt-3" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Button onClick={generateAI} disabled={aiLoading} title="Use AI to generate tailored ideas">
            {aiLoading ? 'Generating…' : 'AI Generate'}
          </Button>
          {ai?.source && (
            <span className="muted">
              Source: {ai.source} {ai.model ? `(${ai.model})` : ''}{' '}
              {ai.usage?.latency_ms ? `· ${ai.usage.latency_ms}ms` : ''}
            </span>
          )}
        </div>
      </div>

      {loading && <Card aria-busy="true">Loading recommendations…</Card>}
      {error && <Card style={{ borderColor: 'var(--ts-error)' }}>{error}</Card>}

      {!loading && !error && filtered.length === 0 && (
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

      {!loading && !error && filtered.length > 0 && (
        <div className="card-grid">
          {filtered.map((rec) => (
            <Card key={rec.id} aria-busy={!!rec.placeholder}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
                <h3 className="h2" style={{ marginRight: 8 }}>{rec.title}</h3>
                {/* Department-exclusive badge */}
                {rec.departmentExclusive && (
                  <span className="btn warning" aria-label="Department exclusive" title="Exclusive for your department">
                    Dept‑Exclusive
                  </span>
                )}
              </div>

              {/* Hero alignment label and microcopy */}
              <div className="mt-2" style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <span className="btn ghost" title="Hero alignment" aria-label={`Hero alignment ${rec.heroAlignment || 'Ally'}`}>
                  🛡 {rec.heroAlignment || 'Ally'}
                </span>
                {rec.microcopy && (
                  <span className="muted" style={{ fontStyle: 'italic' }}>
                    {rec.microcopy}
                  </span>
                )}
              </div>

              <p className="muted mt-2">{rec.description}</p>

              {/* AI badges and fit score */}
              {rec._ai && (
                <div className="mt-2" style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <span className="btn ghost" title={`Source: ${rec._ai.source}`}>🤖 {rec._ai.source}</span>
                  <span className="btn ghost" title="Fit score from 0 to 1">🎯 {Number(rec._ai.fit_score).toFixed(2)}</span>
                  {rec._ai.reasoning && (
                    <button
                      className="btn secondary"
                      onClick={() => setShowReasoning((m) => ({ ...m, [rec.id]: !m[rec.id] }))}
                      aria-expanded={!!showReasoning[rec.id]}
                      aria-controls={`rsn-${rec.id}`}
                    >
                      {showReasoning[rec.id] ? 'Hide Why' : 'Why this?'}
                    </button>
                  )}
                </div>
              )}
              {rec._ai?.reasoning && showReasoning[rec.id] && (
                <div id={`rsn-${rec.id}`} className="mt-2" style={{ background: 'rgba(37,99,235,0.06)', padding: 12, borderRadius: 12 }}>
                  <p className="muted" style={{ margin: 0 }}>{rec._ai.reasoning}</p>
                </div>
              )}

              {/* Meta row */}
              <div className="mt-3" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <span className="btn secondary" aria-hidden title="Duration">⏱ {rec.duration}m</span>
                <span className="btn secondary" aria-hidden title="Suggested team size">👥 {rec.suggestedSize}</span>
                <span className="btn secondary" aria-hidden title="Budget level">💸 {rec.budget}</span>
                {/* Show department scope when present and not exclusive */}
                {(rec.departmentScope && rec.departmentScope.length > 0 && !rec.departmentExclusive) && (
                  <span className="btn secondary" aria-hidden title="Relevant departments">🏷 {rec.departmentScope.join(', ')}</span>
                )}
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
