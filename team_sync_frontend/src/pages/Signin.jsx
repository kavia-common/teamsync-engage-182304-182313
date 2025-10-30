import React, { useMemo, useState } from 'react';
import Container from '../components/common/Container';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import SocialSignInButton from '../components/common/SocialSignInButton';

/**
 * PUBLIC_INTERFACE
 * Accessible Sign in form with client-side validation (email, password).
 * Enhanced with theme-consistent inputs, tooltip help, password visibility toggle,
 * and ARIA attributes for error and help text. On success, routes to #/plan.
 */
export default function Signin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState({ email: false, password: false });
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showTip, setShowTip] = useState(false);

  // Basic sign-in checks
  const errors = useMemo(() => {
    const e = {};
    const emailOk = /^\S+@\S+\.\S+$/.test(email);
    if (!emailOk) e.email = 'Enter a valid email address.';
    if (!password || password.length < 6) e.password = 'Password must be at least 6 characters.';
    return e;
  }, [email, password]);

  // Inline password guidance checks (non-blocking for sign-in, informative)
  const pwHasMin = password.length >= 6;
  const pwHasLetter = /[A-Za-z]/.test(password);
  const pwHasNumber = /\d/.test(password);

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

  const helpId = 'signin-password-help';
  const errorId = 'password-error';
  const describedBy = [
    (touched.password && errors.password) ? errorId : null,
    helpId
  ].filter(Boolean).join(' ') || undefined;

  // Social sign-in placeholder handler with inline toast/notice
  // PUBLIC_INTERFACE
  const onSocialSignIn = async (provider) => {
    if (provider !== 'google') return;
    // show inline toast/notice for 2.5s
    setToast({ type: 'info', message: 'Redirecting to Google… (placeholder auth)' });
    // eslint-disable-next-line no-console
    console.log('[Auth] Social sign-in requested:', provider);
    await new Promise((res) => setTimeout(res, 2500));
    setToast(null);
  };

  const [toast, setToast] = useState(null);

  return (
    <Container>
      <div className="mb-4">
        <h1 className="h1">Sign in</h1>
        <p className="muted">Welcome back. After sign-in, you’ll choose a plan.</p>
      </div>
      <Card as="form" onSubmit={onSubmit} noValidate>
        {/* Prominent social sign-in above form */}
        <div className="mt-2" style={{ display: 'grid', gap: 10 }}>
          <SocialSignInButton
            provider="google"
            size="lg"
            onClick={() => onSocialSignIn('google')}
          />
          <div className="social-divider" role="separator" aria-label="or continue with email">
            <span>or</span>
          </div>
          {toast && (
            <div
              role="status"
              aria-live="polite"
              className="muted"
              style={{
                background: '#fff',
                border: '1px solid var(--ts-border)',
                borderRadius: 12,
                padding: '8px 10px',
                boxShadow: 'var(--ts-shadow-sm)'
              }}
            >
              {toast.message}
            </div>
          )}
        </div>
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              <label className="label" htmlFor="password">Password</label>
              {/* Info button for tooltip */}
              <button
                type="button"
                className="btn ghost"
                aria-label="Password tips"
                aria-pressed={showTip}
                onClick={() => setShowTip((s) => !s)}
                onMouseEnter={() => setShowTip(true)}
                onMouseLeave={() => setShowTip(false)}
                style={{ padding: '4px 10px', borderRadius: 12 }}
              >
                i
              </button>
            </div>

            <div style={{ position: 'relative' }}>
              <input
                id="password"
                className="input"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                aria-invalid={touched.password && !!errors.password}
                aria-describedby={describedBy}
                required
              />
              {/* Show/Hide toggle */}
              <button
                type="button"
                className="btn secondary"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
                style={{
                  position: 'absolute',
                  right: 6,
                  top: 6,
                  padding: '6px 10px',
                  borderRadius: 12
                }}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>

            {/* Live inline rules (help text) */}
            <ul id={helpId} className="muted mt-2 list-reset" aria-live="polite">
              <li aria-checked={pwHasMin} role="checkbox">
                <span aria-hidden style={{ marginRight: 6 }}>{pwHasMin ? '✔️' : '◻️'}</span>
                At least 6 characters
              </li>
              <li aria-checked={pwHasLetter} role="checkbox">
                <span aria-hidden style={{ marginRight: 6 }}>{pwHasLetter ? '✔️' : '◻️'}</span>
                Includes a letter
              </li>
              <li aria-checked={pwHasNumber} role="checkbox">
                <span aria-hidden style={{ marginRight: 6 }}>{pwHasNumber ? '✔️' : '◻️'}</span>
                Includes a number
              </li>
            </ul>

            {showTip && (
              <div
                role="note"
                className="muted mt-2"
                style={{
                  background: '#fff',
                  border: '1px solid var(--ts-border)',
                  borderRadius: 12,
                  boxShadow: 'var(--ts-shadow-sm)',
                  padding: '8px 10px'
                }}
              >
                Tip: Use a mix of words and numbers you’ll remember, and avoid reusing passwords.
              </div>
            )}

            {touched.password && errors.password && (
              <div id={errorId} role="alert" className="muted" style={{ color: 'var(--ts-error)' }}>
                {errors.password}
              </div>
            )}
          </div>
        </div>

        <div className="mt-4" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <Button type="submit" disabled={!canSubmit || submitting} aria-label="Sign in and choose plan">
            {submitting ? 'Signing in…' : 'Sign in'}
          </Button>
          <SocialSignInButton
            provider="google"
            size="sm"
            onClick={() => onSocialSignIn('google')}
            aria-label="Sign in with Google"
          />
          <a href="#/signup" className="btn secondary" aria-label="New to TeamSync? Create an account">New to TeamSync? Create an account</a>
          <Button type="button" variant="ghost" onClick={() => (window.location.hash = '#/')} aria-label="Back to landing">Back</Button>
        </div>
      </Card>
    </Container>
  );
}
