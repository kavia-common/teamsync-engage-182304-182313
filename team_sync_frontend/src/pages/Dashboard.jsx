import React, { useMemo, useState } from 'react';
import Container from '../components/common/Container';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { useStore } from '../state/hooks';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

/**
 * PUBLIC_INTERFACE
 * Dashboard summarizing saved items, team summary, engagement chart, and feedback form.
 */
export default function Dashboard() {
  const { state, actions } = useStore();
  const saved = state.saved || [];
  const feedback = state.feedback || [];

  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(4);
  const [submitting, setSubmitting] = useState(false);

  const teamSummary = useMemo(() => {
    const t = state.team || {};
    return `${t.name || 'Your team'} • ${t.size || 0} people • ${t.department || '—'} • ${t.mode || 'hybrid'}`;
  }, [state.team]);

  const chartData = useMemo(() => {
    // Build simple engagement trend: count of likes in last N (mock)
    const buckets = Array.from({ length: 6 }).map((_, i) => ({ name: `W${i + 1}`, likes: 0 }));
    feedback.forEach((f, idx) => {
      const bucket = idx % buckets.length;
      if (f.value === 'like') buckets[bucket].likes += 1;
    });
    return buckets;
  }, [feedback]);

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!comment && !rating) return;
    setSubmitting(true);
    try {
      // attach feedback to last saved item if any, otherwise generic
      const target = saved[saved.length - 1];
      await actions.giveFeedback(target?.id || 'general', rating >= 4 ? 'like' : 'dislike', target?.title || 'General feedback', comment, rating);
      setComment('');
      setRating(4);
      alert('Thanks for the feedback! 🙌');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container>
      <div className="mb-4">
        <h1 className="h1">Dashboard</h1>
        <p className="muted">Welcome back. Here’s your team summary and recent engagement.</p>
      </div>

      <div className="ts-row cols-2">
        <Card>
          <h2 className="h2">Team summary</h2>
          <p className="muted">{teamSummary}</p>
          <div className="mt-3" style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="likes" stroke="#7D83FF" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4">
            <Button onClick={() => (window.location.hash = '#/recommendations')}>Generate New Activity</Button>
          </div>
        </Card>

        <Card>
          <h2 className="h2">Saved activities</h2>
          {saved.length === 0 && (
            <p className="muted" title="Save picks from the recommendations">
              Nothing saved yet — future you will thank present you 😉
            </p>
          )}
          <ul>
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
          <ul>
            {feedback.slice(-6).reverse().map((f, idx) => (
              <li key={idx} className="mt-2">
                <span aria-hidden>{f.value === 'like' ? '👍' : '👎'}</span> {f.activityTitle} {f.rating ? `• ${f.rating}/5` : ''} {f.comment ? `— “${f.comment}”` : ''}
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <h2 className="h2">Share feedback</h2>
          <form onSubmit={handleFeedbackSubmit}>
            <div>
              <label htmlFor="rating" className="label">Rating (1–5)</label>
              <input id="rating" type="range" min={1} max={5} step={1} value={rating} onChange={(e) => setRating(Number(e.target.value))} className="input" />
              <div className="muted">Current: {rating}</div>
            </div>
            <div className="mt-3">
              <label htmlFor="comment" className="label">Comments</label>
              <textarea id="comment" className="textarea" rows={4} placeholder="What worked well? What could be better?" value={comment} onChange={(e) => setComment(e.target.value)} />
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
