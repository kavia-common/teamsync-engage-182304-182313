import React, { useMemo, useState } from 'react';
import Container from '../components/common/Container';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Progress from '../components/common/Progress';
import { useStore } from '../state/hooks';

/**
 * PUBLIC_INTERFACE
 * Onboarding form to capture team basics: name, size, department, work mode.
 * Features:
 * - Controlled inputs bound to Zustand store via useStore actions.
 * - Basic validation (required fields) with aria-invalid and inline errors.
 * - Keyboard accessible, labeled controls.
 * - "Next → Take Quiz" navigates to #/quiz.
 */
export default function Onboarding() {
  const { state, actions } = useStore();
  const [name, setName] = useState(state.team.name || '');
  const [size, setSize] = useState(state.team.size || 5);
  const [department, setDepartment] = useState(state.team.department || '');
  const [mode, setMode] = useState(state.team.mode || 'hybrid');
  const [saving, setSaving] = useState(false);
  const [touched, setTouched] = useState({ name: false, size: false });

  const errors = useMemo(() => {
    const e = {};
    if (!name.trim()) e.name = 'Team name is required.';
    if (!size || Number(size) < 1) e.size = 'Team size must be at least 1.';
    if (!mode) e.mode = 'Please select a work mode.';
    return e;
  }, [name, size, mode]);

  const canContinue = Object.keys(errors).length === 0;

  const handleNext = async (e) => {
    e?.preventDefault?.();
    // Mark all as touched to reveal errors if invalid
    if (!canContinue) {
      setTouched({ name: true, size: true });
      return;
    }
    setSaving(true);
    try {
      await actions.setTeam({ name: name.trim(), size: Number(size), department: department.trim(), mode });
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
      <Card as="form" onSubmit={handleNext} noValidate>
        <Progress value={25} label="Onboarding progress" />
        <div className="ts-row cols-2 mt-4">
          <div>
            <label className="label" htmlFor="team-name">Team name</label>
            <input
              id="team-name"
              className="input"
              placeholder="e.g., Growth Guild"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, name: true }))}
              aria-invalid={touched.name && !!errors.name}
              aria-describedby={touched.name && errors.name ? 'team-name-error' : undefined}
              required
            />
            {touched.name && errors.name && (
              <div id="team-name-error" role="alert" className="muted" style={{ color: 'var(--ts-error)' }}>
                {errors.name}
              </div>
            )}
          </div>
          <div>
            <label className="label" htmlFor="team-size">Team size</label>
            <input
              id="team-size"
              className="input"
              type="number"
              min={1}
              inputMode="numeric"
              value={size}
              onChange={(e) => setSize(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, size: true }))}
              aria-invalid={touched.size && !!errors.size}
              aria-describedby={touched.size && errors.size ? 'team-size-error' : undefined}
              required
            />
            {touched.size && errors.size && (
              <div id="team-size-error" role="alert" className="muted" style={{ color: 'var(--ts-error)' }}>
                {errors.size}
              </div>
            )}
          </div>
          <div>
            <label className="label" htmlFor="team-dept">Department</label>
            <input
              id="team-dept"
              className="input"
              placeholder="e.g., Engineering, Sales"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            />
          </div>
          <div>
            <label className="label" htmlFor="team-mode">Work mode</label>
            <select
              id="team-mode"
              className="select"
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              aria-invalid={!!errors.mode}
              required
            >
              <option value="in_person">In-person</option>
              <option value="remote">Remote</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>
        </div>
        <div className="mt-4" style={{ display: 'flex', gap: 12 }}>
          <Button type="button" variant="secondary" onClick={() => (window.location.hash = '#/')}>Back</Button>
          <Button type="submit" onClick={handleNext} aria-label="Next, take quiz" disabled={!canContinue || saving}>
            {saving ? 'Saving…' : 'Next → Take Quiz'}
          </Button>
        </div>
      </Card>
    </Container>
  );
}
