import React, { useMemo, useState, useCallback, useEffect } from 'react';
import Container from '../components/common/Container';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { useStore } from '../state/hooks';
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
  const color =
    label === 'positive' ? 'var(--ts-primary)'
    : label === 'negative' ? 'var(--ts-error)'
    : '#9CA3AF';
  const bg =
    label === 'positive' ? 'rgba(43,217,201,0.14)'
    : label === 'negative' ? 'rgba(239,68,68,0.14)'
    : 'rgba(148,163,184,0.14)';
  const icon = label === 'positive' ? '😊' : label === 'negative' ? '☹️' : '😐';
  return (
    <span className="btn secondary" style={{ background: bg, borderColor: bg, color: '#0b0f2a' }} title={`Sentiment: ${label} (${(score*100).toFixed(0)}%)`}>
      {icon} {label.charAt(0).toUpperCase()+label.slice(1)}
    </span>
  );
}

/**
 * PUBLIC_INTERFACE
 * Dashboard with advanced analytics, trends, persona, feedback, and controls.
 * Adds time range selector (4w/12w/All), premium indicators, and accessible summaries.
 * Integrates gamification refresh on feedback submission.
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
      const sentiment = rating >= 4 ? 'like' : 'dislike';
      await actions.giveFeedback(activityId, sentiment, target?.title || 'General feedback', comment, rating);
      try {
        await api.giveFeedback(activityId, sentiment);
      } catch { /* ignore */ }

      // Gamification: record local award and notify backend, then refresh state
      try {
        await actions.recordAward('feedback', { activityId, rating, sentiment });
        await api.awardGamification({ teamId, event: 'feedback', meta: { activityId, rating, sentiment } });
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
      window.location.hash = '#/recommendations';
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
              {CartesianGrid ? <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" /> : null}
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
                  <div style={{ height: `${lh}%`, background: 'var(--ts-primary)', borderRadius: 8 }} />
                  <div style={{ height: `${dh}%`, background: 'var(--ts-error)', borderRadius: 8 }} />
                </div>
                <div className="muted" style={{ fontSize: 12, marginTop: 6, textAlign: 'center' }}>{b.name}</div>
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

  return (
    <Container>
      <div className="mb-4">
        <h1 className="h1">Dashboard</h1>
        <p className="muted">Welcome back. Here’s your team summary and recent engagement.</p>
        <div id="sr-live-dashboard" aria-live="polite" className="sr-only" />
      </div>

      {/* Persona card */}
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

        {/* Success metrics */}
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

              <div className="mt-2 muted" aria-live="polite">
                {analytics.success?.totals?.likes || 0} likes • {analytics.success?.totals?.dislikes || 0} dislikes • {analytics.success?.totals?.feedback || 0} total feedback
              </div>
              <TrendChart />
              <TopTagTrend />
            </>
          )}
        </Card>
      </div>

      <div className="ts-row cols-2">
        <Card>
          <h2 className="h2">Team summary</h2>
          <p className="muted">{teamSummary}</p>
          <TrendChart />
          <div className="mt-4" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Button onClick={handleGenerateNew} disabled={generating} aria-label="Generate new recommendations">
              {generating ? 'Generating…' : 'Generate New Activity'}
            </Button>
            <Button variant="secondary" onClick={() => (window.location.hash = '#/recommendations')} aria-label="Go to recommendations">
              View Recommendations
            </Button>
          </div>
        </Card>

        <Card>
          <h2 className="h2">Saved activities</h2>
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
                    Dept‑Exclusive
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
        </Card>
      </div>

      <div className="ts-row cols-2 mt-4">
        <Card>
          <h2 className="h2">Recent feedback</h2>
          {feedback.length === 0 && (
            <p className="muted" title="Like or dislike recommendations to improve your feed">
              No feedback yet — your hot takes make our picks smarter 🔥
            </p>
          )}
          <ul aria-label="Recent feedback list">
            {feedback.slice(-6).reverse().map((f, idx) => (
              <li key={idx} className="mt-2">
                <span aria-hidden>{f.value === 'like' ? '👍' : '👎'}</span> {f.activityTitle}{' '}
                {f.rating ? `• ${f.rating}/5` : ''} {f.comment ? `— “${f.comment}”` : ''}
              </li>
            ))}
          </ul>
        </Card>

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
