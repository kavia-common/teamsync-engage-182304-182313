import React, { useState } from 'react';
import Container from '../components/common/Container';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Progress from '../components/common/Progress';
import { useStore } from '../state/hooks';

/**
 * PUBLIC_INTERFACE
 * Onboarding form to capture team basics: name, size, department, work mode.
 */
export default function Onboarding() {
  const { state, actions } = useStore();
  const [name, setName] = useState(state.team.name || '');
  const [size, setSize] = useState(state.team.size || 5);
  const [department, setDepartment] = useState(state.team.department || '');
  const [mode, setMode] = useState(state.team.mode || 'hybrid');
  const [saving, setSaving] = useState(false);

  const canContinue = name && size > 0 && mode;

  const handleNext = async () => {
    if (!canContinue) return;
    setSaving(true);
    try {
      await actions.setTeam({ name, size: Number(size), department, mode });
      window.location.hash = '#/quiz';
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container>
      <div className="mb-4">
        <h1 className="h1">Onboarding</h1>
        <p className="muted">Tell us about your team so we can tailor the experience.</p>
      </div>
      <Card>
        <Progress value={25} label="Onboarding progress" />
        <div className="ts-row cols-2 mt-4">
          <div>
            <label className="label" htmlFor="team-name">Team name</label>
            <input id="team-name" className="input" placeholder="e.g., Growth Guild" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="team-size">Team size</label>
            <input id="team-size" className="input" type="number" min={1} value={size} onChange={(e) => setSize(e.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="team-dept">Department</label>
            <input id="team-dept" className="input" placeholder="e.g., Engineering, Sales" value={department} onChange={(e) => setDepartment(e.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="team-mode">Work mode</label>
            <select id="team-mode" className="select" value={mode} onChange={(e) => setMode(e.target.value)}>
              <option value="in_person">In-person</option>
              <option value="remote">Remote</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>
        </div>
        <div className="mt-4" style={{ display: 'flex', gap: 12 }}>
          <Button variant="secondary" onClick={() => (window.location.hash = '#/')}>Back</Button>
          <Button onClick={handleNext} disabled={!canContinue || saving}>{saving ? 'Saving…' : 'Next → Take Quiz'}</Button>
        </div>
      </Card>
    </Container>
  );
}
