import React from 'react';
import Button from './Button';

/**
 * PUBLIC_INTERFACE
 * Accessible SocialSignInButton supporting provider-specific styling.
 * Currently supports 'google' with proper aria-labels and keyboard-friendly tap target.
 */
export default function SocialSignInButton({
  provider = 'google',
  size = 'lg', // 'lg' | 'sm'
  onClick,
  className = '',
  ...rest
}) {
  const isGoogle = provider === 'google';
  const ariaLabel =
    isGoogle ? (size === 'lg' ? 'Continue with Google' : 'Sign in with Google') : 'Continue with provider';

  // Google brand icon (inline SVG for no external deps)
  const GoogleIcon = (
    <svg aria-hidden viewBox="0 0 24 24" width={18} height={18}>
      <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.2-1.7 3.6-5.5 3.6-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.2.8 3.9 1.5l2.7-2.6C16.4 2.8 14.4 2 12 2 6.9 2 2.7 6.2 2.7 11.3S6.9 20.7 12 20.7c6 0 8.3-4.1 8.3-6.2 0-.4 0-.7-.1-1H12z"/>
      <path fill="#34A853" d="M3.9 7.4l3.2 2.4c.8-1.9 2.6-3.2 4.9-3.2 1.9 0 3.2.8 3.9 1.5l2.7-2.6C16.4 2.8 14.4 2 12 2 8 2 4.7 4.4 3.9 7.4z" opacity=".9"/>
      <path fill="#FBBC05" d="M12 22c3.1 0 5.8-1 7.7-2.8l-3.3-2.7c-1.1.7-2.5 1.2-4.4 1.2-3.8 0-7-2.6-7.9-6.2l-3.2 2.5C2.6 18.9 6.9 22 12 22z" opacity=".9"/>
      <path fill="#4285F4" d="M20.3 14.5c.1-.4.1-.7.1-1 0-.4 0-.7-.1-1H12v3.9h5.5c-.1.6-.5 1.4-1.2 2.1l3.2 2.6c1.5-1.4 2.8-3.6 2.8-6.6z" opacity=".95"/>
    </svg>
  );

  const googleClasses =
    size === 'lg'
      ? 'social-btn social-btn--google'
      : 'social-btn social-btn--google social-btn--sm';

  return (
    <Button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      // Using 'secondary' for base then override via class to match Ocean Professional
      className={`${googleClasses} ${className}`}
      variant="secondary"
      {...rest}
    >
      <span className="social-btn__icon" aria-hidden>
        {GoogleIcon}
      </span>
      <span className="social-btn__text">
        {size === 'lg' ? (isGoogle ? 'Continue with Google' : 'Continue') : (isGoogle ? 'Google' : 'Provider')}
      </span>
    </Button>
  );
}
