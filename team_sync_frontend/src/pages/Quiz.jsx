import React, { useMemo, useState } from 'react';
import Container from '../components/common/Container';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Progress from '../components/common/Progress';
import { useStore } from '../state/hooks';

/**
 * PUBLIC_INTERFACE
 * Simple multi-question quiz for preferences and personality.
 */
export default function Quiz() {
  const { state, actions } = useStore();
  const initial = useMemo(
    () => ({
      energy: state.quiz.energy ?? 'balanced',
      budget: state.quiz.budget ?? 'medium',
      duration: state.quiz.duration ?? '60',
      interests: state.quiz.interests ?? ['games'],
    }),
    [state.quiz]
  );

  const [energy, setEnergy] = useState(initial.energy);
  const [budget, setBudget] = useState(initial.budget);
  const [duration, setDuration] = useState(initial.duration);
  const [interests, setInterests] = useState(initial.interests);
  const [saving, setSaving] = useState(false);

  const toggleInterest = (key) => {
    setInterests((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await actions.setQuiz({ energy, budget, duration, interests });
      window.location.hash = '#/recommendations';
    } finally {
      setSaving(false);
    }
  };

  const chips = [
    { key: 'games', label: 'Games' },
    { key: 'outdoors', label: 'Outdoors' },
    { key: 'food', label: 'Food' },
    { key: 'creative', label: 'Creative' },
    { key: 'wellness', label: 'Wellness' },
  ];

  return (
    <Container>
      <div className="mb-4">
        <h1 className="h1">Team Quiz</h1>
        <p className="muted">A quick pulse on vibe and preferences — we’ll keep it snappy.</p>
      </div>
      <Card>
        <Progress value={60} label="Quiz progress" />
        <div className="ts-row cols-2 mt-4">
          <div>
            <label className="label">Energy level</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Button className={energy === 'chill' ? '' : 'secondary'} onClick={() => setEnergy('chill')}>Chill</Button>
              <Button className={energy === 'balanced' ? '' : 'secondary'} onClick={() => setEnergy('balanced')}>Balanced</Button>
              <Button className={energy === 'high' ? '' : 'secondary'} onClick={() => setEnergy('high')}>High</Button>
            </div>
          </div>
          <div>
            <label className="label">Budget</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Button className={budget === 'low' ? '' : 'secondary'} onClick={() => setBudget('low')}>Low</Button>
              <Button className={budget === 'medium' ? '' : 'secondary'} onClick={() => setBudget('medium')}>Medium</Button>
              <Button className={budget === 'high' ? '' : 'secondary'} onClick={() => setBudget('high')}>High</Button>
            </div>
          </div>
          <div>
            <label className="label" htmlFor="duration">Duration (minutes)</label>
            <input id="duration" className="input" type="number" min={15} max={240} value={duration} onChange={(e) => setDuration(e.target.value)} />
          </div>
          <div>
            <label className="label">Interests</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
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
        </div>
        <div className="mt-4" style={{ display: 'flex', gap: 12 }}>
          <Button variant="secondary" onClick={() => (window.location.hash = '#/onboarding')}>Back</Button>
          <Button onClick={handleSubmit} disabled={saving}>{saving ? 'Saving…' : 'See Recommendations'}</Button>
        </div>
      </Card>
    </Container>
  );
}
