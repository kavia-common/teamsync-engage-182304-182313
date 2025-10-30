import React, { useMemo, useState } from 'react';
import Container from '../components/common/Container';
import Card from '../components/common/Card';
import Button from '../components/common/Button';

/**
 * PUBLIC_INTERFACE
 * Accessible Sign in form with client-side validation (email, password).
 * On success, routes to #/plan for plan selection.
 */
export default function Signin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState({ email: false, password: false });
  const [submitting, setSubmitting] = useState(false);

  const errors = useMemo(() => {
    const e = {};
    const emailOk = /^\S+@\S+\.\S+$/.test(email);
    if (!emailOk) e.email = 'Enter a valid email address.';
    if (!password || password.length < 6) e.password = 'Password must be at least 6 characters.';
    return e;
  }, [email, password]);

  const canSubmit = Object.keys(errors).length === 0;

  const onSubmit = async (e) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      // Simulate auth success
      await new Promise((res) => setTimeout(res, 350));
      window.location.hash = '#/plan';
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container>
      <div className="mb-4">
        <h1 className="h1">Sign in</h1>
        <p className="muted">Welcome back. After sign-in, you’ll choose a plan.</p>
      </div>
      <Card as="form" onSubmit={onSubmit} noValidate>
        <div className="ts-row cols-2">
          <div>
            <label className="label" htmlFor="email">Email</label>
            <input
              id="email"
              className="input"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, email: true }))}
              aria-invalid={touched.email && !!errors.email}
              aria-describedby={touched.email && errors.email ? 'email-error' : undefined}
              required
            />
            {touched.email && errors.email && (
              <div id="email-error" role="alert" className="muted" style={{ color: 'var(--ts-error)' }}>
                {errors.email}
              </div>
            )}
          </div>
          <div>
            <label className="label" htmlFor="password">Password</label>
            <input
              id="password"
              className="input"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, password: true }))}
              aria-invalid={touched.password && !!errors.password}
              aria-describedby={touched.password && errors.password ? 'password-error' : undefined}
              required
            />
            {touched.password && errors.password && (
              <div id="password-error" role="alert" className="muted" style={{ color: 'var(--ts-error)' }}>
                {errors.password}
              </div>
            )}
          </div>
        </div>

        <div className="mt-4" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Button type="submit" disabled={!canSubmit || submitting} aria-label="Sign in and choose plan">
            {submitting ? 'Signing in…' : 'Sign in'}
          </Button>
          <a href="#/signup" className="btn secondary" aria-label="Go to sign up">Create account</a>
          <Button type="button" variant="ghost" onClick={() => (window.location.hash = '#/')} aria-label="Back to landing">Back</Button>
        </div>
      </Card>
    </Container>
  );
}
