import React, { useMemo, useState, useCallback, useEffect } from 'react';
import Container from '../components/common/Container';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { useStore } from '../state/hooks';
import { useAuthStore } from '../state/authStore';
import api from '../services/api';
import { deriveSuccessMetrics, deriveSentimentSummary, deriveTrendBuckets, deriveHeroAlignmentBreakdown, derivePersona } from '../services/analytics';

// Try importing Recharts; if not available, we'll gracefully fallback
let Recharts = {};
try {
  // eslint-disable-next-line global-require
  Recharts = require('recharts');
} catch (e) {
  Recharts = null;
}

const {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar,
  AreaChart,
  Area,
  Legend,
} = Recharts || {};

// Accessible hint ids for metric explanations
const HINT_IDS = {
  completion: 'metric-hint-completion',
  likeRatio: 'metric-hint-like-ratio',
  avgRating: 'metric-hint-avg-rating',
};

// Render compact sentiment chip from score/label
function SentimentChip({ score = 0, label = 'mixed' }) {
  const bg =
    label === 'positive' ? 'color-mix(in srgb, var(--ts-primary), transparent 84%)'
    : label === 'negative' ? 'color-mix(in srgb, var(--ts-error), transparent 84%)'
    : 'color-mix(in srgb, var(--ts-text), transparent 86%)';
  const icon = label === 'positive' ? '😊' : label === 'negative' ? '☹️' : '😐';
  return (
    <span className="btn secondary" style={{ background: bg, borderColor: bg, color: 'var(--ts-text)' }} title={`Sentiment: ${label} (${(score*100).toFixed(0)}%)`}>
      {icon} {label.charAt(0).toUpperCase()+label.slice(1)}
    </span>
  );
}

/**
 * PUBLIC_INTERFACE
 * Dashboard with advanced analytics, trends, persona, feedback, and controls.
 * Adds time range selector (4w/12w/All), premium indicators, and accessible summaries.
 * Integrates gamification refresh on feedback submission and includes a Gamification panel.
 */
export default function Dashboard() {
  const { state, actions } = useStore();
  const saved = state.saved || [];
  const feedback = state.feedback || [];
  const timeRange = state.timeRange || '4w';
  const planTier = state.plan?.tier || 'free';
  const isPro = planTier === 'pro';

  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(4);
  const [submitting, setSubmitting] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [loadingPersona, setLoadingPersona] = useState(false);

  const teamId = state.team?.teamId || state.team?.id || state.team?.name || '';

  // concise team summary (team name, size, department, work mode)
  const teamSummary = useMemo(() => {
    const t = state.team || {};
    const modeLabel =
      t.mode === 'remote' ? 'Remote' : t.mode === 'in_person' ? 'In‑person' : 'Hybrid';
    return `${t.name || 'Your team'} • ${t.size || 0} people • ${t.department || '—'} • ${modeLabel}`;
  }, [state.team]);

  // compute local analytics as immediate fallback while async fetch occurs
  const localAnalytics = useMemo(() => {
    const success = deriveSuccessMetrics({ feedback, saved });
    const sentiment = deriveSentimentSummary({ feedback });
    const trend = deriveTrendBuckets({ feedback, range: timeRange });
    const heroes = deriveHeroAlignmentBreakdown({ saved, feedback });
    return { success, sentiment, trend, heroes, source: 'local' };
  }, [feedback, saved, timeRange]);

  // effect: try fetch analytics from API (mock or backend), store in Zustand
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoadingAnalytics(true);
      try {
        const teamIdLocal = state.team?.teamId || state.team?.id || state.team?.name || '';
        const data = await api.getAnalytics(timeRange, teamIdLocal);
        if (mounted && data) actions.setAnalytics(data);
      } catch {
        // handled in api via fallback
      } finally {
        if (mounted) setLoadingAnalytics(false);
      }
    })();
    return () => { mounted = false; };
  }, [timeRange, actions, state.team]);

  // effect: fetch persona (premium shows "AI-powered", free shows preview)
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoadingPersona(true);
      try {
        const res = await api.generatePersona(state.team || {}, state.quiz || {}, { useCase: 'dashboard', locale: 'en-US' });
        if (mounted && res) actions.setPersona(res);
      } catch {
        // fallback inside api
      } finally {
        if (mounted) setLoadingPersona(false);
      }
    })();
    return () => { mounted = false; };
  }, [state.team, state.quiz, actions]);

  const analytics = state.analytics || localAnalytics;
  const personaBlock = state.persona || derivePersona({ team: state.team, quiz: state.quiz, saved, feedback });
  const trendBuckets = analytics?.trend?.buckets || localAnalytics.trend.buckets;
  const topTagTrend = analytics?.trend?.topTagsTrend || localAnalytics.trend.topTagsTrend;

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!rating) return;
    setSubmitting(true);
    try {
      const target = saved[saved.length - 1];
      const activityId = target?.id || 'general';
      const sentiment = rating >= 4 ? 'like' : rating <= 2 ? 'dislike' : 'neutral';
      await actions.giveFeedback(activityId, sentiment, target?.title || 'General feedback', comment, rating);
      try {
        await api.giveFeedback(activityId, sentiment);
      } catch { /* ignore */ }

      // Gamification: record local award and notify backend, then refresh state
      try {
        const longComment = typeof comment === 'string' && comment.trim().length >= 120;
        await actions.recordAward('feedback', { activityId, rating, sentiment, longComment });
        await api.awardGamification({
          teamId,
          event: 'feedback',
          meta: { activityId, rating, sentiment, longComment, comment: comment || '' }
        });
        await actions.refreshGamification(teamId);
      } catch { /* ignore */ }

      setComment('');
      setRating(4);
      const live = document.getElementById('sr-live-dashboard');
      if (live) {
        live.textContent = 'Thanks for the feedback!';
        setTimeout(() => { if (live) live.textContent = ''; }, 1200);
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Fetch a fresh recommendation set then navigate to /recommendations
  const handleGenerateNew = useCallback(async () => {
    setGenerating(true);
    try {
      await api.getRecommendations({ team: state.team, quiz: state.quiz });
      // announce success in live region
      const live = document.getElementById('sr-live-dashboard');
      if (live) {
        live.textContent = 'New recommendations generated.';
        setTimeout(() => { if (live) live.textContent = ''; }, 1200);
      }
      // Navigate with refresh flag so Recommendations page can force refetch if needed
      window.location.hash = '#/recommendations?refresh=1';
    } catch (e) {
      const live = document.getElementById('sr-live-dashboard');
      if (live) {
        live.textContent = 'Failed to generate. Using last best set.';
        setTimeout(() => { if (live) live.textContent = ''; }, 1400);
      }
    } finally {
      setGenerating(false);
    }
  }, [state.team, state.quiz]);

  // Range control
  function TimeRange() {
    const opts = ['4w', '12w', 'all'];
    return (
      <div className="mt-2" role="tablist" aria-label="Time range" style={{ display: 'inline-flex', gap: 8 }}>
        {opts.map(o => (
          <button
            key={o}
            role="tab"
            aria-selected={timeRange === o}
            className={`btn ${timeRange === o ? '' : 'secondary'}`}
            onClick={() => (actions?.setTimeRange ? actions.setTimeRange(o) : null)}
          >
            {o.toUpperCase()}
          </button>
        ))}
      </div>
    );
  }

  // Chart: likes vs dislikes over time
  function TrendChart() {
    const hasData = (trendBuckets || []).some(b => (b.likes || b.dislikes));
    if (Recharts && ResponsiveContainer && (LineChart || AreaChart)) {
      const ChartImpl = AreaChart || LineChart;
      return (
        <div className="mt-3" style={{ height: 260 }}>
          <div className="muted" style={{ fontSize: 12, marginBottom: 4 }}>Weekly engagement trend</div>
          <ResponsiveContainer width="100%" height="100%">
            <ChartImpl data={trendBuckets}>
              {CartesianGrid ? <CartesianGrid strokeDasharray="3 3" stroke="var(--ts-border)" /> : null}
              {XAxis ? <XAxis dataKey="name" label={{ value: 'Week', position: 'insideBottom', offset: -4 }} /> : null}
              {YAxis ? <YAxis allowDecimals={false} label={{ value: 'Count', angle: -90, position: 'insideLeft' }} /> : null}
              {Tooltip ? <Tooltip /> : null}
              {Legend ? <Legend /> : null}
              {Area
                ? (
                  <>
                    <Area type="monotone" dataKey="likes" name="Likes" stroke="#22c9ba" fill="#2BD9C922" strokeWidth={2} />
                    <Area type="monotone" dataKey="dislikes" name="Dislikes" stroke="#EF4444" fill="#EF444422" strokeWidth={2} />
                  </>
                )
                : (
                  <>
                    {Line ? <Line type="monotone" dataKey="likes" name="Likes" stroke="#22c9ba" strokeWidth={2} dot={{ r: 2 }} /> : null}
                    {Line ? <Line type="monotone" dataKey="dislikes" name="Dislikes" stroke="#EF4444" strokeWidth={2} dot={{ r: 2 }} /> : null}
                  </>
                )
              }
            </ChartImpl>
          </ResponsiveContainer>
          {!hasData && <div className="muted mt-2">No engagement yet for this range.</div>}
        </div>
      );
    }
    // Fallback: simple inline bars
    return (
      <div className="mt-3" style={{ height: 220 }}>
        <div className="muted mb-2">Weekly engagement (fallback)</div>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${trendBuckets.length || 6}, 1fr)`, gap: 8, alignItems: 'end', height: 180 }}>
          {trendBuckets.map((b) => {
            const lh = Math.min(100, b.likes * 16);
            const dh = Math.min(100, b.dislikes * 16);
            return (
              <div key={b.name} aria-label={`${b.name} likes ${b.likes} dislikes ${b.dislikes}`} title={`${b.name}: 👍${b.likes} 👎${b.dislikes}`}>
                <div style={{ display: 'grid', gap: 4 }}>
                  <div style={{ height: `${lh}%`, background: 'var(--ts-primary)', borderRadius: 8, boxShadow: '0 1px 0 rgba(0,0,0,0.15)' }} />
                  <div style={{ height: `${dh}%`, background: 'var(--ts-error)', borderRadius: 8, boxShadow: '0 1px 0 rgba(0,0,0,0.15)' }} />
                </div>
                <div className="muted" style={{ fontSize: 12, marginTop: 6, textAlign: 'center', color: 'var(--ts-text-muted)' }}>{b.name}</div>
              </div>
            );
          })}
        </div>
        {!trendBuckets.some(b => (b.likes || b.dislikes)) && <div className="muted mt-2">No engagement yet for this range.</div>}
      </div>
    );
  }

  function TopTagTrend() {
    const data = topTagTrend.filter(t => t.tag);
    if (!data.length) return null;
    if (Recharts && ResponsiveContainer && (BarChart || LineChart)) {
      const BI = BarChart || LineChart;
      return (
        <div className="mt-3" style={{ height: 200 }}>
          <div className="muted" style={{ fontSize: 12, marginBottom: 4 }}>Top tag by week</div>
          <ResponsiveContainer width="100%" height="100%">
            <BI data={data}>
              {CartesianGrid ? <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" /> : null}
              {XAxis ? <XAxis dataKey="name" /> : null}
              {YAxis ? <YAxis allowDecimals={false} /> : null}
              {Tooltip ? <Tooltip /> : null}
              {Bar ? <Bar dataKey="count" name="Tag mentions" fill="#7D83FF" radius={[6,6,0,0]} /> : <Line type="monotone" dataKey="count" stroke="#7D83FF" strokeWidth={2} />}
            </BI>
          </ResponsiveContainer>
        </div>
      );
    }
    return (
      <div className="mt-3">
        <div className="muted">Top tags by week:</div>
        <ul className="list-reset">
          {data.map(d => <li key={d.name}>{d.name}: #{d.tag} ×{d.count}</li>)}
        </ul>
      </div>
    );
  }

  // Premium banner for AI Analytics on Free plan
  const PremiumBanner = !isPro ? (
    <div role="note" aria-label="Premium analytics banner" className="mt-2" style={{ padding: 12, border: '1px dashed var(--ts-border)', borderRadius: 12, background: 'rgba(125,131,255,0.06)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <div>
          <strong>AI Analytics Preview</strong>
          <div className="muted">Upgrade to unlock AI‑powered insights, sentiment models, and deeper trends.</div>
        </div>
        <Button className="warning" onClick={() => { window.location.hash = '#/'; setTimeout(() => { const el = document.querySelector('[aria-label="Pro plan"]'); if (el) el.scrollIntoView({ behavior: 'smooth' }); }, 0); }}>
          Upgrade
        </Button>
      </div>
    </div>
  ) : null;

  // Read live-auth data directly from persisted auth store to avoid stale copies
  const authUser = useAuthStore((s) => s.user);
  const setAuthUser = useAuthStore((s) => s.setUser);
  const userName = (authUser?.name || '').trim();

  // Inline team name editing state: always derive from auth store for the header
  const effectiveTeamName = (authUser?.teamName || state.team?.name || 'Your team').trim() || 'Your team';
  const [editing, setEditing] = useState(false);
  const [teamInput, setTeamInput] = useState(effectiveTeamName);
  const [error, setError] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const inputRef = React.useRef(null);
  const editButtonRef = React.useRef(null);

  // Keep input in sync with auth store changes when not actively editing (prevents stale local state)
  useEffect(() => {
    if (!editing) {
      setTeamInput(effectiveTeamName);
    }
  }, [effectiveTeamName, editing]);

  // Focus management on enter/exit edit mode
  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select?.();
    }
  }, [editing]);

  const validateTeam = (v) => {
    const name = String(v || '').trim();
    if (!name) return 'Team name cannot be empty.';
    if (name.length < 2) return 'Team name must be at least 2 characters.';
    if (name.length > 50) return 'Team name must be 50 characters or fewer.';
    return '';
  };

  const saveTeamName = () => {
    const val = teamInput;
    const validation = validateTeam(val);
    if (validation) {
      setError(validation);
      // announce error
      const live = document.getElementById('sr-live-dashboard');
      if (live) {
        live.textContent = validation;
        setTimeout(() => { if (live) live.textContent = ''; }, 1500);
      }
      return;
    }
    // Persist to authStore (localStorage-backed) while preserving other fields.
    const nextUser = {
      ...(authUser || {}),
      teamName: String(val).trim(),
    };
    try {
      setAuthUser(nextUser);
      // also reflect in in-memory zustand team for parts that read state.team.name
      if (actions?.setTeam) {
        actions.setTeam({ name: String(val).trim() });
      }
      setStatusMsg('Team name saved.');
      setEditing(false);
      setError('');
      const live = document.getElementById('sr-live-dashboard');
      if (live) {
        live.textContent = 'Team name updated.';
        setTimeout(() => { if (live) live.textContent = ''; }, 1200);
      }
      // return focus to Edit button after save for keyboard flow
      setTimeout(() => {
        editButtonRef.current?.focus();
      }, 0);
    } catch (e) {
      setError('Failed to save. Please try again.');
      const live = document.getElementById('sr-live-dashboard');
      if (live) {
        live.textContent = 'Failed to save team name.';
        setTimeout(() => { if (live) live.textContent = ''; }, 1500);
      }
    }
  };

  const cancelEdit = () => {
    setTeamInput(effectiveTeamName);
    setError('');
    setEditing(false);
    // return focus to Edit button to maintain flow
    setTimeout(() => {
      editButtonRef.current?.focus();
    }, 0);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveTeamName();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancelEdit();
    }
  };

  return (
    <Container>
      <div className="mb-4">
        {/* Heading row with editable team name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {!editing ? (
            <>
              <h1 className="h1" style={{ marginBottom: 6, marginRight: 6 }}>
                {`Welcome, ${effectiveTeamName}!`}
              </h1>
              <button
                ref={editButtonRef}
                type="button"
                className="btn secondary"
                aria-label="Edit team name"
                onClick={() => { setEditing(true); setStatusMsg(''); }}
                title="Edit team name"
              >
                ✏️ Edit
              </button>
              <button
                type="button"
                className="btn"
                aria-label="Edit team details"
                title="Edit Team Details"
                onClick={() => {
                  // Navigate to Profile where team details can be edited (reuse existing logic)
                  window.location.hash = '#/profile#/team';
                  const live = document.getElementById('sr-live-dashboard');
                  if (live) {
                    live.textContent = 'Opening team details.';
                    setTimeout(() => { if (live) live.textContent = ''; }, 900);
                  }
                }}
              >
                Edit Team Details
              </button>
            </>
          ) : (
            <div
              role="group"
              aria-label="Edit team name"
              style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}
            >
              <label htmlFor="team-name-input" className="sr-only">Team name</label>
              <input
                id="team-name-input"
                ref={inputRef}
                className="input"
                style={{ maxWidth: 320 }}
                value={teamInput}
                onChange={(e) => setTeamInput(e.target.value)}
                onKeyDown={handleKeyDown}
                aria-invalid={!!error}
                aria-describedby={error ? 'team-name-error' : undefined}
                placeholder="Enter team name"
              />
              <button
                type="button"
                className="btn"
                onClick={saveTeamName}
                aria-label="Save team name"
                title="Save"
              >
                Save
              </button>
              <button
                type="button"
                className="btn secondary"
                onClick={cancelEdit}
                aria-label="Cancel"
                title="Cancel"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
        {error && (
          <div id="team-name-error" role="alert" className="muted" style={{ color: 'var(--ts-error)', marginTop: 6 }}>
            {error}
          </div>
        )}
        {statusMsg && !error && (
          <div className="muted" style={{ color: 'var(--ts-secondary, #F59E0B)', marginTop: 6 }}>
            {statusMsg}
          </div>
        )}
        <p className="muted" style={{ marginTop: 6 }}>
          {userName ? `Signed in as ${userName}.` : 'Signed in.'} Here’s your team summary and recent engagement.
        </p>
        <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>
          Tip: Use “✏️ Edit” to rename your team inline or “Edit Team Details” to manage it from your profile.
        </div>
        <div id="sr-live-dashboard" aria-live="polite" className="sr-only" />
      </div>

      {/* Persona card and Advanced Analytics */}
      <div className="ts-row cols-2">
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <h2 className="h2">Team Culture Persona</h2>
            <span className={`btn ${isPro ? 'warning' : 'secondary'}`} title={isPro ? 'AI‑powered' : 'Preview'}>
              {isPro ? 'AI‑Powered' : 'Preview'}
            </span>
          </div>
          {loadingPersona ? (
            <p className="muted">Generating persona…</p>
          ) : !personaBlock || !personaBlock.persona ? (
            <p className="muted">No persona available yet. Share feedback or complete onboarding to unlock insights.</p>
          ) : (
            <>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <strong>{personaBlock.persona?.name || 'Team Persona'}</strong>
                <span className="btn ghost" aria-hidden>🧭 Tone: {(personaBlock.persona?.tone || []).join(', ') || 'playful'}</span>
              </div>
              <p className="muted mt-2">{personaBlock.persona?.summary || '—'}</p>
              {/* Hero alignment breakdown (badges) */}
              <div className="mt-3" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }} aria-label="Hero alignment breakdown">
                {(personaBlock.breakdown || []).slice(0, 4).map(h => (
                  <span key={h.hero} className="btn secondary" title="Hero alignment share">
                    🛡 {h.hero}: {Math.round((h.pct || 0) * 100)}%
                  </span>
                ))}
              </div>
              {/* Microcopy */}
              <div className="mt-2 muted">
                Witty microcopy: Leaning {personaBlock.breakdown?.[0]?.hero || 'Ally'} — “assemble and thrive.”
              </div>
            </>
          )}
        </Card>

        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <h2 className="h2">Advanced Analytics</h2>
            <div style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
              {!isPro ? <span className="btn secondary" title="Premium feature">Premium</span> : <span className="btn warning">Included</span>}
              <TimeRange />
            </div>
          </div>
          {PremiumBanner}
          {loadingAnalytics ? (
            <p className="muted">Loading analytics…</p>
          ) : !analytics ? (
            <p className="muted">Analytics unavailable. We’ll show local estimates once feedback is added.</p>
          ) : (
            <>
              {/* Metric hints (aria-describedby) */}
              <div className="sr-only" id={HINT_IDS.completion}>
                Completion rate is the share of saved activities that received a rating.
              </div>
              <div className="sr-only" id={HINT_IDS.likeRatio}>
                Like ratio is likes divided by likes plus dislikes.
              </div>
              <div className="sr-only" id={HINT_IDS.avgRating}>
                Average rating is the mean of provided ratings, or an estimate from reactions when ratings are missing.
              </div>

              <div className="mt-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 12 }}>
                <div>
                  <div className="muted">Completion rate</div>
                  <div
                    style={{ fontWeight: 800, fontSize: 20 }}
                    aria-describedby={HINT_IDS.completion}
                    title="Rated feedback vs saved activities"
                  >
                    {Math.round((analytics.success?.completionRate || 0) * 100)}%
                  </div>
                </div>
                <div>
                  <div className="muted">Like ratio</div>
                  <div
                    style={{ fontWeight: 800, fontSize: 20 }}
                    aria-describedby={HINT_IDS.likeRatio}
                    title="Likes ÷ (Likes + Dislikes)"
                  >
                    {Math.round((analytics.success?.likeRatio || 0) * 100)}%
                  </div>
                </div>
                <div>
                  <div className="muted">Avg rating</div>
                  <div
                    style={{ fontWeight: 800, fontSize: 20 }}
                    aria-describedby={HINT_IDS.avgRating}
                    title="Mean rating; estimated if missing"
                  >
                    {(analytics.success?.avgRating || 0).toFixed(1)}/5
                  </div>
                </div>
                <div>
                  <div className="muted">Sentiment</div>
                  <div>
                    <SentimentChip score={analytics.sentiment?.sentimentScore || 0} label={analytics.sentiment?.label || 'mixed'} />
                  </div>
                </div>
              </div>

              <div className="mt-2 muted" aria-live="polite" aria-atomic="true">
                {analytics.success?.totals?.likes || 0} likes • {analytics.success?.totals?.dislikes || 0} dislikes • {analytics.success?.totals?.feedback || 0} total feedback
              </div>
              <TrendChart />
              <TopTagTrend />
            </>
          )}
        </Card>
      </div>

      {/* Team Summary & Saved combined - simplified to avoid parallel small cards */}
      <div className="mt-4">
        <Card>
          <div className="ts-row cols-2">
            <div>
              <h2 className="h2">Team summary</h2>
              <p className="muted">{teamSummary}</p>
              <TrendChart />
              <div className="mt-4" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <Button onClick={handleGenerateNew} disabled={generating} aria-label="Generate new recommendations now">
                  {generating ? 'Generating…' : 'Generate New Recommendations'}
                </Button>
                <Button variant="secondary" onClick={() => (window.location.hash = '#/recommendations')} aria-label="Go to recommendations">
                  View Recommendations
                </Button>
              </div>
            </div>

            <div>
              <h2 className="h2">Saved activities</h2>
              <div className="muted" style={{ fontSize: 12 }}>
                {state.team?.department ? `Department: ${state.team.department}` : 'Department: —'}
              </div>
              {saved.length === 0 && (
                <p className="muted" title="Save picks from the recommendations">
                  Nothing saved yet — future you will thank present you 😉
                </p>
              )}
              <ul aria-label="Saved activities list">
                {saved.map((s) => (
                  <li key={s.id} className="mt-2">
                    <strong>{s.title}</strong> — {s.duration}m • {s.budget} • {s.suggestedSize}
                    {s._heroAlignment ? (
                      <span title="Hero alignment" className="btn ghost" style={{ marginLeft: 8 }}>
                        🛡 {s._heroAlignment}
                      </span>
                    ) : null}
                    {s.departmentExclusive ? (
                      <span title="Department exclusive" className="btn warning" style={{ marginLeft: 8 }}>
                        Dept‒Exclusive
                      </span>
                    ) : null}
                    {Array.isArray(s.departmentScope) && s.departmentScope.length > 0 && !s.departmentExclusive ? (
                      <span title="Relevant departments" className="btn secondary" style={{ marginLeft: 8 }}>
                        🏷 {s.departmentScope.join(', ')}
                      </span>
                    ) : null}
                    {s._savedDept ? (
                      <span title="Saved under department" className="btn secondary" style={{ marginLeft: 8 }}>
                        Dept: {s._savedDept}
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
              <div className="mt-4">
                <Button onClick={() => (window.location.hash = '#/recommendations')}>Find more</Button>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Gamification section only - remove adjacent small card */}
      <div className="mt-4">
        <Card>
          <GamificationPanel teamId={teamId} />
        </Card>
      </div>

      {/* Feedback form - single column to avoid empty gaps */}
      <div className="mt-4">
        <Card>
          <h2 className="h2">Share feedback</h2>
          <form onSubmit={handleFeedbackSubmit}>
            <div>
              <label htmlFor="rating" className="label">Rating (1–5)</label>
              <input
                id="rating"
                type="range"
                min={1}
                max={5}
                step={1}
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="input"
                aria-valuemin={1}
                aria-valuemax={5}
                aria-valuenow={rating}
              />
              <div className="muted">Current: {rating}</div>
            </div>
            <div className="mt-3">
              <label htmlFor="comment" className="label">Comments</label>
              <textarea
                id="comment"
                className="textarea"
                rows={4}
                placeholder="What worked well? What could be better?"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>
            <div className="mt-4" style={{ display: 'flex', gap: 12 }}>
              <Button type="submit" disabled={submitting}>{submitting ? 'Submitting…' : 'Submit feedback'}</Button>
              <Button type="button" variant="secondary" onClick={() => { setComment(''); setRating(4); }}>Clear</Button>
            </div>
          </form>
        </Card>
      </div>
    </Container>
  );
}

// PUBLIC_INTERFACE
function GamificationPanel({ teamId }) {
  /** Accessible, themed Gamification panel.
   * - Fetches latest gamification on mount via refreshGamification(teamId).
   * - Shows points total with aria-live, a timeline of recent awards, and a badges grid.
   * - Subtle confetti animation when a new badge appears, respecting prefers-reduced-motion.
   */
  const { state, actions } = useStore();
  const points = state.gamification?.points ?? 0;
  const badges = state.gamification?.badges ?? [];
  const history = state.gamification?.history ?? [];
  const lastEarned = state.gamification?.lastEarnedBadgeId || null;

  // Refresh on mount
  useEffect(() => {
    actions.refreshGamification(teamId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamId]);

  // Confetti pulse on new badge earned
  useEffect(() => {
    if (!lastEarned) return;
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    // Minimal confetti overlay
    const canvas = document.createElement('canvas');
    canvas.setAttribute('aria-hidden', 'true');
    Object.assign(canvas.style, {
      position: 'fixed',
      left: '0', top: '0',
      width: '100vw', height: '100vh',
      pointerEvents: 'none',
      zIndex: 9999
    });
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    const colors = ['#2BD9C9', '#7D83FF', '#34d399', '#f59e0b'];
    const particles = Array.from({ length: 32 }).map(() => ({
      x: (window.innerWidth / 2) + (Math.random() - 0.5) * 220,
      y: (window.innerHeight / 4) + (Math.random() - 0.5) * 120,
      r: 1.5 + Math.random() * 2,
      c: colors[Math.floor(Math.random() * colors.length)],
      vx: -1.5 + Math.random() * 3,
      vy: -2 + Math.random() * 1.2,
    }));
    let frames = 0;
    let raf;
    function step() {
      frames += 1;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy + 0.5;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.c;
        ctx.fill();
      });
      if (frames < 38) {
        raf = requestAnimationFrame(step);
      } else {
        cancelAnimationFrame(raf);
        if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
      }
    }
    raf = requestAnimationFrame(step);
  }, [lastEarned]);

  // Accessible live region for points updates and badge announcements
  useEffect(() => {
    const live = document.getElementById('sr-live-gamification');
    if (live) {
      live.textContent = `Points: ${points}. ${lastEarned ? 'New badge earned.' : ''}`;
      const t = setTimeout(() => { if (live) live.textContent = ''; }, 1500);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [points, lastEarned]);

  // Compose timeline (most recent first)
  const timeline = [...history].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 7);

  // Locked badges placeholders up to grid size
  const badgeIcons = {
    // legacy local ids
    first_save: '💾',
    feedback_apprentice: '📝',
    points_100: '🏆',
    // backend ids
    'badge-first-save': '💾',
    'badge-feedback-apprentice': '📝',
    'badge-creative-champ': '✨',
    'badge-most-collaborative': '👥',
    'badge-consistent-contributor': '🗓️',
  };
  const gridTarget = 6;
  const lockedCount = Math.max(0, gridTarget - badges.length);
  const locked = Array.from({ length: lockedCount }).map((_, i) => ({ id: `locked_${i}` }));

  return (
    <div>
      <h2 className="h2">Gamification</h2>
      <div id="sr-live-gamification" className="sr-only" aria-live="polite" aria-atomic="true" />
      <div className="mt-2" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <span className="btn warning" aria-label={`Total points ${points}`} title="Total points">
          ✨ {points} pts
        </span>
        <span className="btn secondary" title={`${badges.length} badges`}>
          🎅 {badges.length} badges
        </span>
      </div>

      {/* Badges grid */}
      <div className="mt-3" role="grid" aria-label="Badges">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 10 }}>
          {badges.map((b) => (
            <div key={b.id || b.badgeId} role="gridcell" className="ts-card" style={{ padding: 12 }}>
              <div
                style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                title={b.description || b.title || b.badgeId || b.id}
              >
                <span aria-hidden>{badgeIcons[b.id] || badgeIcons[b.badgeId] || '🎅'}</span>
                <strong>{b.title || b.badgeId || b.id}</strong>
              </div>
              <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>
                Earned {new Date(b.earnedAt || b.awardedAt || Date.now()).toLocaleString()}
              </div>
            </div>
          ))}
          {locked.map((l) => (
            <div key={l.id} role="gridcell" className="ts-card" style={{ padding: 12, opacity: 0.6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span aria-hidden>🔒</span>
                <strong>Locked</strong>
              </div>
              <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>Earn more points to unlock</div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent awards timeline */}
      <div className="mt-4">
        <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>Recent awards</div>
        {timeline.length === 0 ? (
          <p className="muted">Make saves and share feedback to start earning points and badges.</p>
        ) : (
          <ol className="list-reset" aria-label="Awards timeline">
            {timeline.map((h) => (
              <li key={h.id} className="mt-2" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span aria-hidden>•</span>
                <span>
                  <strong style={{ marginRight: 6 }}>{labelForEvent(h.type || h.event)}</strong>
                  <span className="muted">{formatWhen(h.createdAt)} • +{h.points || 0} pts</span>
                </span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}

// helpers
function labelForEvent(e) {
  if (e === 'save') return 'Saved an activity';
  if (e === 'feedback') return 'Gave feedback';
  if (e === 'like' || e === 'feedback-like') return 'Liked';
  if (e === 'dislike' || e === 'feedback-dislike') return 'Disliked';
  if (e === 'rating') return 'Rated an activity';
  if (e === 'badge') return 'Badge awarded';
  return 'Engagement';
}
function formatWhen(ts) {
  try {
    const d = new Date(ts);
    return d.toLocaleString();
  } catch {
    return '';
  }
}
