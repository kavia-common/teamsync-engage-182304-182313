import React, { useMemo, useState, useCallback } from 'react';
import Container from '../components/common/Container';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { useStore } from '../state/hooks';
import api from '../services/api';

// Try importing Recharts; if not available, we'll gracefully fallback with a simple bar
let Recharts = {};
try {
  // Dynamically require to avoid hard failure if package missing in some envs
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
} = Recharts || {};

/**
 * PUBLIC_INTERFACE
 * Dashboard summarizing saved items, team summary, engagement chart, feedback form,
 * and a "Generate New Activity" button that fetches a fresh set and navigates to Recommendations.
 */
export default function Dashboard() {
  const { state, actions } = useStore();
  const saved = state.saved || [];
  const feedback = state.feedback || [];

  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(4);
  const [submitting, setSubmitting] = useState(false);
  const [generating, setGenerating] = useState(false);

  // concise team summary (team name, size, department, work mode)
  const teamSummary = useMemo(() => {
    const t = state.team || {};
    const modeLabel =
      t.mode === 'remote' ? 'Remote' : t.mode === 'in_person' ? 'In‑person' : 'Hybrid';
    return `${t.name || 'Your team'} • ${t.size || 0} people • ${t.department || '—'} • ${modeLabel}`;
  }, [state.team]);

  // engagement chart data: likes grouped into simple buckets
  const chartData = useMemo(() => {
    const buckets = Array.from({ length: 6 }).map((_, i) => ({ name: `W${i + 1}`, likes: 0 }));
    feedback.forEach((f, idx) => {
      const bucket = idx % buckets.length;
      if (f.value === 'like') buckets[bucket].likes += 1;
    });
    return buckets;
  }, [feedback]);

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    // accept empty comment but ensure rating present
    if (!rating) return;
    setSubmitting(true);
    try {
      // attach feedback to last saved item if any
      const target = saved[saved.length - 1];
      const activityId = target?.id || 'general';
      const sentiment = rating >= 4 ? 'like' : 'dislike';
      // update local state
      await actions.giveFeedback(activityId, sentiment, target?.title || 'General feedback', comment, rating);
      // try to notify backend/mock (non-blocking perception since store already updated)
      try {
        await api.giveFeedback(activityId, sentiment);
      } catch {
        // fallback handled in api layer already
      }
      setComment('');
      setRating(4);
      // Accessible live region update
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
      // Trigger a fetch to warm recommendations; the Recommendations page fetches again,
      // but this ensures we "generate" now per requirement.
      await api.getRecommendations({ team: state.team, quiz: state.quiz });
      window.location.hash = '#/recommendations';
    } finally {
      setGenerating(false);
    }
  }, [state.team, state.quiz]);

  // Small helper for a graceful chart fallback if Recharts is missing
  function ChartArea() {
    if (Recharts && ResponsiveContainer && (LineChart || BarChart)) {
      const ChartImpl = LineChart || BarChart;
      const Series = Line ? (
        <Line type="monotone" dataKey="likes" stroke="#7D83FF" strokeWidth={2} dot={{ r: 3 }} />
      ) : (
        <Bar dataKey="likes" fill="#7D83FF" radius={[6, 6, 0, 0]} />
      );
      return (
        <div className="mt-3" style={{ height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <ChartImpl data={chartData}>
              {CartesianGrid ? <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" /> : null}
              {XAxis ? <XAxis dataKey="name" /> : null}
              {YAxis ? <YAxis allowDecimals={false} /> : null}
              {Tooltip ? <Tooltip /> : null}
              {Series}
            </ChartImpl>
          </ResponsiveContainer>
        </div>
      );
    }
    // Fallback: simple inline bars using divs
    return (
      <div className="mt-3" style={{ height: 220 }}>
        <div className="muted mb-2">Engagement (fallback)</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8, alignItems: 'end', height: 180 }}>
          {chartData.map((b) => (
            <div key={b.name} aria-label={`${b.name} likes ${b.likes}`} title={`${b.name}: ${b.likes}`}>
              <div
                style={{
                  height: `${Math.min(100, b.likes * 20)}%`,
                  background: 'linear-gradient(180deg, var(--ts-secondary), var(--ts-primary))',
                  borderRadius: 10,
                  boxShadow: 'var(--ts-shadow-sm)',
                }}
              />
              <div className="muted" style={{ fontSize: 12, marginTop: 6, textAlign: 'center' }}>{b.name}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <Container>
      <div className="mb-4">
        <h1 className="h1">Dashboard</h1>
        <p className="muted">Welcome back. Here’s your team summary and recent engagement.</p>
        <div id="sr-live-dashboard" aria-live="polite" className="sr-only" />
      </div>

      <div className="ts-row cols-2">
        <Card>
          <h2 className="h2">Team summary</h2>
          <p className="muted">{teamSummary}</p>
          <ChartArea />
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
