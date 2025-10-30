import React, { useEffect, useMemo, useState } from 'react';
import Container from '../components/common/Container';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { useStore } from '../state/hooks';
import api from '../services/api';
import { generateIdeas as mockGenerateIdeas } from '../mock/mockAI';
import RecommendationDetailsModal from '../components/common/RecommendationDetailsModal';

/**
 * PUBLIC_INTERFACE
 * Displays 3–5 recommended activities with actions to save and give feedback.
 * Adds department segmented filter (All vs Department), department-exclusive badge,
 * hero alignment label, and playful microcopy. Maintains accessibility.
 * Integrates gamification: awards on save/feedback and refreshes global gamification state.
 *
 * AI Generate button uses mock AI by default and only tries backend when a hidden flag (?ai=backend) is present.
 * Merges results with the existing list, dedupes by title, sorts by fit_score desc.
 * Shows badges for source (mock-ai) and AI reasoning.
 *
 * TODO: Restore backend-first flow when /api/ai/recommendations is healthy.
 */
export default function Recommendations() {
  const { state, actions } = useStore();
  const [loading, setLoading] = useState(true);
  const [recs, setRecs] = useState([]);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0); // bump to force refetch
  const [segment, setSegment] = useState((state.team?.department || '').trim() ? 'department' : 'all'); // 'all' | 'department'

  // Normalize department to match mock data keys (e.g., 'Dev' -> 'Development')
  let dept = (state.team?.department || '').trim();
  if (/^dev(elopment)?$/i.test(dept)) dept = 'Development';
  const teamId = state.team?.teamId || state.team?.id || state.team?.name || '';

  // derive payload; keep stable reference with useMemo
  const payload = useMemo(() => ({ team: state.team, quiz: state.quiz }), [state.team, state.quiz]);

  // Surface teamId for API.saveRecommendation mapping (non-invasive)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.__TS_TEAM_ID__ = teamId || '';
    }
  }, [teamId]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError('');
    api
      .getRecommendations(payload)
      .then((r) => {
        if (!mounted) return;
        const list = Array.isArray(r) ? r : [];

        // Constrain to 4–5 cards; ensure at least 4 with placeholders (rare fallback)
        const limited = list.slice(0, Math.max(4, Math.min(5, list.length)));
        const minCount = 4;
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
      .catch(() => setError('Failed to load recommendations.'))
      .finally(() => setLoading(false));
    return () => { mounted = false; };
  }, [payload, refreshKey]);

  // AI state
  const [ai, setAi] = useState({ ideas: [], source: '', model: '', usage: null, error: null });
  const [aiLoading, setAiLoading] = useState(false);
  const [showReasoning, setShowReasoning] = useState({}); // id -> bool
  const [debugOverlay, setDebugOverlay] = useState(false); // toggles network/debug view

  // Merge, dedupe by title (case/whitespace-insensitive), sort by fit_score desc (0..1)
  function mergeByTitle(existing, incoming) {
    const map = new Map();
    const norm = (t) => String(t || '').trim().toLowerCase();
    [...existing, ...incoming].forEach(item => {
      const key = norm(item.title);
      if (!key) return;

      // Normalize departmentExclusive by exact match to selected department if not already provided
      const scope = Array.isArray(item.departmentScope) ? item.departmentScope.map(s => String(s).trim()) : [];
      const dpt = String(state.team?.department || '').trim();
      const isExclusive = scope.length === 1 && !!dpt && scope[0].toLowerCase() === dpt.toLowerCase();
      const normalized = {
        ...item,
        departmentExclusive: typeof item.departmentExclusive === 'boolean' ? item.departmentExclusive : isExclusive
      };

      const prior = map.get(key);
      // Prefer items with higher _ai.fit_score if present
      const priorScore = Number(prior?._ai?.fit_score ?? 0);
      const currScore = Number(normalized?._ai?.fit_score ?? 0);
      if (!prior || currScore > priorScore) {
        map.set(key, { ...(prior || {}), ...normalized });
      }
    });
    const merged = Array.from(map.values());
    merged.sort((a, b) => Number(b?._ai?.fit_score ?? 0) - Number(a?._ai?.fit_score ?? 0));
    return merged;
  }

  async function generateAI() {
    setAiLoading(true);
    try {
      const payloadAI = {
        team: state.team || {},
        quiz: state.quiz || {},
        department: state.team?.department || '',
        constraints: { limit: 5, mode: state.team?.workMode || 'hybrid' }
      };
      // Determine mode: default to mock; allow backend via hidden toggle (?ai=backend)
      // TODO: Restore backend-first flow when /api/ai/recommendations is healthy
      const params = new URLSearchParams((typeof window !== 'undefined' && (window.location.search || '')) || '');
      const useBackend = String(params.get('ai') || '').toLowerCase() === 'backend';

      const start = Date.now();
      let ideas = [];
      let source = 'mock-ai';
      let model = 'mock-v1';
      let usage = null;
      let backendError = null;

      if (useBackend) {
        try {
          const res = await api.postAIRecommendations(payloadAI);
          if (Array.isArray(res?.ideas) && res.ideas.length > 0) {
            source = res?.source || 'backend';
            model = res?.model || model;
            usage = res?.usage || null;
            ideas = res.ideas.map((x, idx) => {
              const scope = Array.isArray(x.departmentScope) ? x.departmentScope.map(s => String(s).trim()) : [];
              const dpt = String(state.team?.department || '').trim();
              const exclusive = scope.length === 1 && !!dpt && scope[0].toLowerCase() === dpt.toLowerCase();
              const fit = Number.isFinite(Number(x.fit_score))
                ? Number(x.fit_score)
                : 0.7;
              return {
                id: x.id || `ai-${idx}-${Math.random().toString(36).slice(2, 8)}`,
                title: String(x.title || '').trim(),
                description: String(x.description || '').trim(),
                duration: Number(x.duration || 30),
                tags: Array.isArray(x.tags) ? x.tags.map(t => String(t).toLowerCase()) : [],
                heroAlignment: x.heroAlignment || 'Ally',
                departmentScope: scope,
                departmentExclusive: exclusive,
                suggestedSize: `${Math.max(2, (state.team?.size || 2) - 1)}-${(state.team?.size || 6) + 2}`,
                budget: 'medium',
                _ai: { source: source || 'openai', model: model || '', fit_score: fit, reasoning: x.reasoning || '' }
              };
            });
          } else {
            backendError = res?.error || 'empty';
          }
        } catch (e) {
          backendError = e?.message || 'backend-failed';
        }
      }

      if (!useBackend || ideas.length === 0) {
        // Default path or backend failed: use mock generator
        const mockIdeas = await mockGenerateIdeas(state.team || {}, state.quiz || {}, state.team?.department || 'General');
        source = 'mock-ai';
        model = 'mock-v1';
        ideas = mockIdeas.map((x, idx) => {
          const scope = Array.isArray(x.departmentScope) ? [x.departmentScope] : [];
          const dpt = String(state.team?.department || '').trim();
          const exclusive = scope.length === 1 && !!dpt && scope[0].toLowerCase() === dpt.toLowerCase();
          const fit = Number.isFinite(Number(x.fit_score)) ? Number(x.fit_score) / 100 : 0.8; // convert 0–100 -> 0–1
          return {
            id: x.id || `mock-${idx}-${Math.random().toString(36).slice(2, 8)}`,
            title: String(x.title || '').trim(),
            description: String(x.description || '').trim(),
            duration: Number(x.duration || 45),
            tags: Array.isArray(x.tags) ? x.tags : [],
            heroAlignment: x.heroAlignment || 'Ally',
            departmentScope: scope,
            departmentExclusive: exclusive,
            suggestedSize: `${Math.max(2, (state.team?.size || 2) - 1)}-${(state.team?.size || 6) + 2}`,
            budget: 'medium',
            _ai: { source, model, fit_score: fit, reasoning: x.reasoning || '' }
          };
        });

        if (backendError) {
          // eslint-disable-next-line no-console
          console.warn('Backend AI failed; served mock instead:', backendError);
        }
      }

      const existing = Array.isArray(recs) ? recs : [];
      const merged = mergeByTitle(existing, ideas);
      setRecs(merged);

      const latency_ms = Date.now() - start;
      setAi({ ideas, source, model, usage: { ...(usage || {}), latency_ms }, error: backendError || null });
    } catch (e) {
      // Final safety: ensure mock ideas render if anything above throws
      // eslint-disable-next-line no-console
      console.warn('AI generation error; using mock fallback:', e?.message || e);
      const mockIdeas = await mockGenerateIdeas(state.team || {}, state.quiz || {}, state.team?.department || 'General');
      const ideas = mockIdeas.map((x, idx) => {
        const scope = Array.isArray(x.departmentScope) ? [x.departmentScope] : [];
        const dpt = String(state.team?.department || '').trim();
        const exclusive = scope.length === 1 && !!dpt && scope[0].toLowerCase() === dpt.toLowerCase();
        const fit = Number.isFinite(Number(x.fit_score)) ? Number(x.fit_score) / 100 : 0.8;
        return {
          id: x.id || `mock-${idx}-${Math.random().toString(36).slice(2, 8)}`,
          title: String(x.title || '').trim(),
          description: String(x.description || '').trim(),
          duration: Number(x.duration || 45),
          tags: Array.isArray(x.tags) ? x.tags : [],
          heroAlignment: x.heroAlignment || 'Ally',
          departmentScope: scope,
          departmentExclusive: exclusive,
          suggestedSize: `${Math.max(2, (state.team?.size || 2) - 1)}-${(state.team?.size || 6) + 2}`,
          budget: 'medium',
          _ai: { source: 'mock-ai', model: 'mock-v1', fit_score: fit, reasoning: x.reasoning || '' }
        };
      });
      const existing = Array.isArray(recs) ? recs : [];
      setRecs(mergeByTitle(existing, ideas));
      setAi({ ideas, source: 'mock-ai', model: 'mock-v1', usage: null, error: null });
    } finally {
      setAiLoading(false);
    }
  }

  const filtered = useMemo(() => {
    if (segment !== 'department') return recs;
    const d = String(dept || '').toLowerCase();
    return recs.filter((r) => {
      if (r.placeholder || r.departmentExclusive) return true;
      const scope = Array.isArray(r.departmentScope) ? r.departmentScope : [];
      return scope.map((s) => String(s).toLowerCase()).includes(d);
    });
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

  // Modal state for details view
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const openDetails = (item) => { setSelectedItem(item); setDetailsOpen(true); };
  const closeDetails = () => { setDetailsOpen(false); setSelectedItem(null); };

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
    <div className="teal-page-bg">
      <Container>
        <section className="glass-section">
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
              <Button variant="ghost" onClick={() => setDebugOverlay((v) => !v)} title="Toggle debug overlay">
                {debugOverlay ? 'Hide Debug' : 'Show Debug'}
              </Button>
              {ai?.source && (
                <span className="muted">
                  Source: {ai.source} {ai.model ? `(${ai.model})` : ''}{' '}
                  {ai.usage?.latency_ms ? `· ${ai.usage.latency_ms}ms` : ''}
                </span>
              )}
            </div>
            {debugOverlay && ai?.source && (
              <div className="mt-2" style={{ fontSize: 'var(--font-small)', lineHeight: 'var(--lh-normal)', background: 'var(--ts-surface)', border: '1px solid var(--ts-border)', padding: 12, borderRadius: 12, boxShadow: 'var(--ts-shadow-sm)', color: 'var(--ts-text)' }}>
                <div><strong>AI Debug</strong></div>
                <div>source: {ai.source} | model: {ai.model || '(n/a)'} | ideas: {Array.isArray(ai.ideas) ? ai.ideas.length : 0}</div>
                {Array.isArray(ai.ideas) && ai.ideas.slice(0, 5).map((x, idx) => {
                  const fsNum = Number(x.fit_score ?? x._ai?.fit_score ?? 0);
                  const fitDisp = Number.isFinite(fsNum)
                    ? (fsNum > 1 ? (fsNum / 100).toFixed(2) : fsNum.toFixed(2))
                    : '—';
                  const scope = Array.isArray(x.departmentScope) ? x.departmentScope : [];
                  return (
                    <div key={idx} style={{ marginTop: 4 }}>
                      #{idx + 1} · fit={fitDisp}
                      {' '}title="{String(x.title || '').slice(0, 60)}"
                      {' '}deptScope={[...scope].join(',')}
                    </div>
                  );
                })}
              </div>
            )}
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
                    {/* Source badge for mock-ai */}
                    {rec._ai?.source && (
                      <span
                        className="btn ghost"
                        title={`AI Source: ${rec._ai.source}`}
                        style={{
                          background: rec._ai.source === 'mock-ai' ? 'color-mix(in srgb, var(--ts-secondary), transparent 80%)' : undefined,
                          color: 'var(--ts-text)'
                        }}
                      >
                        🤖 {rec._ai.source}
                      </span>
                    )}
                  </div>

                  <p className="muted mt-2">{rec.description}</p>

                  {/* AI badges and fit score + reasoning */}
                  {rec._ai && (
                    <div className="mt-2" style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                      <span className="btn ghost" title="AI Fit score (0 to 1)">🎯 {Number(rec._ai.fit_score).toFixed(2)}</span>
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
                    <div id={`rsn-${rec.id}`} className="mt-2" style={{ background: 'var(--ts-surface)', border: '1px solid var(--ts-border)', padding: 12, borderRadius: 12, boxShadow: 'var(--ts-shadow-sm)' }}>
                      <p className="muted" style={{ margin: 0, color: 'var(--ts-text-muted)', fontSize: 'var(--font-small)', lineHeight: 'var(--lh-normal)' }}>{rec._ai.reasoning}</p>
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
                    <Button
                      variant="secondary"
                      onClick={() => openDetails(rec)}
                      aria-label={`View details for ${rec.title}`}
                      title="View details"
                      disabled={!!rec.placeholder}
                    >
                      View Details
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Details Modal */}
          <RecommendationDetailsModal
            open={detailsOpen}
            onClose={closeDetails}
            item={selectedItem}
            onSave={handleSave}
            onFeedback={handleFeedback}
            onFeedbackSubmit={(gameId, fb) => {
              // Local in-memory store; could be lifted to Zustand if needed later
              try {
                if (!window.__TS_FEEDBACK__) window.__TS_FEEDBACK__ = {};
                const prev = window.__TS_FEEDBACK__[gameId] || [];
                const next = [...prev, { ...fb, at: Date.now() }];
                window.__TS_FEEDBACK__[gameId] = next;
                // eslint-disable-next-line no-console
                console.log('Feedback submitted:', { gameId, ...fb });
              } catch (e) {
                // eslint-disable-next-line no-console
                console.warn('Feedback store failed', e);
              }
            }}
          />

          <div className="mt-6" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Button variant="secondary" onClick={() => (window.location.hash = '#/quiz')} title="Adjust your quiz answers">
              Back
            </Button>
            <Button onClick={() => setRefreshKey((k) => k + 1)} title="See another set based on your profile">
              Try Another Set
            </Button>
            <Button onClick={() => (window.location.hash = '#/dashboard')} title="Review saved picks and feedback">
              Go to Dashboard
            </Button>
          </div>
        </section>
      </Container>
    </div>
  );
}
