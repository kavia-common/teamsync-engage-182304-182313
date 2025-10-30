import React from 'react';
import Container from '../components/common/Container';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { useStore } from '../state/hooks';

/**
 * PUBLIC_INTERFACE
 * Dashboard summarizing saved items and recent feedback.
 */
export default function Dashboard() {
  const { state } = useStore();
  const saved = state.saved || [];
  const feedback = state.feedback || [];

  return (
    <Container>
      <div className="mb-4">
        <h1 className="h1">Dashboard</h1>
        <p className="muted">Welcome, {state.team.name || 'team'}. Here’s what we’ve learned.</p>
      </div>

      <div className="ts-row cols-2">
        <Card>
          <h2 className="h2">Saved activities</h2>
          {saved.length === 0 && <p className="muted">No saved items yet.</p>}
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

        <Card>
          <h2 className="h2">Recent feedback</h2>
          {feedback.length === 0 && <p className="muted">No feedback yet.</p>}
          <ul>
            {feedback.slice(-6).reverse().map((f, idx) => (
              <li key={idx} className="mt-2">
                <span aria-hidden>{f.value === 'like' ? '👍' : '👎'}</span> {f.activityTitle}
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </Container>
  );
}
