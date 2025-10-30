import React, { useMemo, useState } from 'react';
import Container from '../components/common/Container';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import SocialSignInButton from '../components/common/SocialSignInButton';
import { useAuthStore } from '../state/authStore';

/**
 * PUBLIC_INTERFACE
 * Accessible Sign up form with client-side validation (name, email, password).
 * Enhanced with live password rules, tooltip help, show/hide toggle, and
 * theme-consistent inputs. On success, routes to #/plan.
 */
export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState({ name: false, email: false, password: false });
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showTip, setShowTip] = useState(false);

  // Validation: sign-up requires stronger password hints
  const pwHasMin = password.length >= 8; // stricter for signup guidance
  const pwHasLetter = /[A-Za-z]/.test(password);
  const pwHasNumber = /\d/.test(password);

  const errors = useMemo(() => {
    const e = {};
    if (!name.trim()) e.name = 'Name is required.';
    const emailOk = /^\S+@\S+\.\S+$/.test(email);
    if (!emailOk) e.email = 'Enter a valid email address.';
    // Keep minimum blocking at 6 for parity with sign-in, but show tips below for 8+
    if (!password || password.length < 6) e.password = 'Password must be at least 6 characters.';
    return e;
  }, [name, email, password]);

  const canSubmit = Object.keys(errors).length === 0;

  const onSubmit = async (e) => {
    e.preventDefault();
    setTouched({ name: true, email: true, password: true });
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      // Simulate registration success
      await new Promise((res) => setTimeout(res, 350));
      // Persist minimal user to client store
      const setUser = useAuthStore.getState().setUser;
      setUser({
        name: name.trim(),
        email: email.trim(),
        // Default teamName mirrors Onboarding "Team name" once provided; set a provisional value for greeting
        teamName: 'Your team',
      });
      // Proceed to dashboard for a simpler post-auth path and prevent back nav to auth
      try {
        window.history.replaceState(null, '', '#/dashboard');
      } catch {
        window.location.hash = '#/dashboard';
      }
    } finally {
      setSubmitting(false);
    }
  };

  const helpId = 'signup-password-help';
  const errorId = 'password-error';
  const describedBy = [
    (touched.password && errors.password) ? errorId : null,
    helpId
  ].filter(Boolean).join(' ') || undefined;

  // Social sign-in placeholder handler with inline toast/notice
  // PUBLIC_INTERFACE
  const onSocialSignIn = async (provider) => {
    if (provider !== 'google') return;
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
        <h1 className="h1">Sign up</h1>
        <p className="muted">Create your account. You’ll choose a plan next.</p>
      </div>
      <Card as="form" onSubmit={onSubmit} noValidate>
        {/* Prominent social sign-up above form */}
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
                background: 'var(--ts-surface)',
                color: 'var(--ts-text)',
                border: '1px solid var(--ts-border)',
                borderRadius: 12,
                padding: '8px 10px',
                boxShadow: 'var(--ts-shadow-sm)',
                fontSize: 'var(--font-p)',
                lineHeight: 'var(--lh-normal)'
              }}
            >
              {toast.message}
            </div>
          )}
        </div>
        <div className="ts-row cols-2">
          <div>
            <label className="label" htmlFor="name">Name</label>
            <input
              id="name"
              className="input"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, name: true }))}
              aria-invalid={touched.name && !!errors.name}
              aria-describedby={touched.name && errors.name ? 'name-error' : undefined}
              required
            />
            {touched.name && errors.name && (
              <div id="name-error" role="alert" className="muted" style={{ color: 'var(--ts-error)' }}>
                {errors.name}
              </div>
            )}
          </div>

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
                autoComplete="new-password"
                placeholder="Create a strong password"
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
            <ul id={helpId} className="muted mt-2 list-reset" aria-live="polite" style={{ fontSize: 'var(--font-small)', lineHeight: 'var(--lh-normal)' }}>
              <li aria-checked={pwHasMin} role="checkbox">
                <span aria-hidden style={{ marginRight: 6 }}>{pwHasMin ? '✔️' : '◻️'}</span>
                At least 8 characters
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
                  background: 'var(--ts-surface)',
                  color: 'var(--ts-text)',
                  border: '1px solid var(--ts-border)',
                  borderRadius: 12,
                  boxShadow: 'var(--ts-shadow-sm)',
                  padding: '8px 10px',
                  fontSize: 'var(--font-small)',
                  lineHeight: 'var(--lh-normal)'
                }}
              >
                Tip: Use a unique passphrase with numbers (e.g., three random words + a memorable number).
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
          <Button type="submit" disabled={!canSubmit || submitting} aria-label="Create account and choose plan">
            {submitting ? 'Creating…' : 'Create account'}
          </Button>
          <SocialSignInButton
            provider="google"
            size="sm"
            onClick={() => onSocialSignIn('google')}
            aria-label="Sign up with Google"
          />
          <a href="#/signin" className="btn secondary" aria-label="Already have an account? Sign in">Already have an account? Sign in</a>
          <Button type="button" variant="ghost" onClick={() => (window.location.hash = '#/')} aria-label="Back to landing">Back</Button>
        </div>
      </Card>
    </Container>
  );
}
