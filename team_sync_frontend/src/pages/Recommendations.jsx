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

  const handleFeedback = async (item, value) => {
    await actions.giveFeedback(item.id, value, item.title);
    alert('Thanks for the feedback!');
  };

  return (
    <Container>
      <div className="mb-4">
        <h1 className="h1">Recommendations</h1>
        <p className="muted">Based on your team profile and quiz results — handpicked just for you.</p>
      </div>

      {loading && <Card>Loading recommendations…</Card>}
      {error && <Card style={{ borderColor: 'var(--ts-error)' }}>{error}</Card>}
      {!loading && !error && (
        <div className="card-grid">
          {recs.map((rec) => (
            <Card key={rec.id}>
              <h3 className="h2">{rec.title}</h3>
              <p className="muted">{rec.description}</p>
              <div className="mt-3" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <span className="btn secondary" aria-hidden>⏱ {rec.duration}m</span>
                <span className="btn secondary" aria-hidden>👥 {rec.suggestedSize}</span>
                <span className="btn secondary" aria-hidden>💸 {rec.budget}</span>
              </div>
              <div className="mt-4" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <Button onClick={() => handleSave(rec)}>Save</Button>
                <Button variant="ghost" onClick={() => handleFeedback(rec, 'like')}>👍 Like</Button>
                <Button variant="ghost" onClick={() => handleFeedback(rec, 'dislike')}>👎 Dislike</Button>
              </div>
            </Card>
          ))}
        </div>
      )}
      <div className="mt-6" style={{ display: 'flex', gap: 12 }}>
        <Button variant="secondary" onClick={() => (window.location.hash = '#/quiz')}>Back</Button>
        <Button onClick={() => (window.location.hash = '#/dashboard')}>Go to Dashboard</Button>
      </div>
    </Container>
  );
}
