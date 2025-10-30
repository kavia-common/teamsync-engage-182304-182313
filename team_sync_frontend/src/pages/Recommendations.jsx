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
    // playful microcopy
    alert(
      value === 'like'
        ? 'Nice! We’ll sprinkle more like that 🎉'
        : 'Got it — we’ll show fewer like this 💡'
    );
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
      <div className="mt-6" style={{ display: 'flex', gap: 12 }}>
        <Button variant="secondary" onClick={() => (window.location.hash = '#/quiz')} title="Adjust your quiz answers">
          Back
        </Button>
        <Button onClick={() => (window.location.hash = '#/dashboard')} title="Review saved picks and feedback">
          Go to Dashboard
        </Button>
      </div>
    </Container>
  );
}
