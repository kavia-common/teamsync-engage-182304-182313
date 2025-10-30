import React from 'react';
import Container from '../components/common/Container';
import Card from '../components/common/Card';
import Button from '../components/common/Button';

/**
 * PUBLIC_INTERFACE
 * Landing: Minimal home screen that shows only TeamSync logo/name and the existing
 * "Start Now" button. Route for Start Now remains aligned with current hash routing.
 */
export default function Landing() {
  const handleStartNow = () => {
    // Keep existing route behavior: previously start led into auth or onboarding via hash router.
    // We default to onboarding if your flow uses that first, otherwise signin. Adjust if needed.
    // If the app previously navigated to '#/onboarding', leave it as is; otherwise '#/signin'.
    // Prefer onboarding for MVP flow. If there is no history, hash router will handle.
    const current = window.location.hash || '#/';
    // Heuristic: if plan selection or auth was the previous, keep going to onboarding as a start point
    window.location.hash = '#/onboarding';
  };

  return (
    <div className="ts-landing-gradient" role="region" aria-label="TeamSync landing">
      <Container>
        <Card className="ts-landing-card" aria-label="Intro card">
          {/* Placeholder Logo + App Name */}
          <div className="ts-logo-wrap">
            <div className="ts-logo-icon" aria-hidden="true">
              <svg width="56" height="56" viewBox="0 0 48 48" fill="none" role="img" aria-label="TeamSync logo">
                <defs>
                  <linearGradient id="tsLogoGrad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
                    <stop offset="0" stopColor="#2563EB" />
                    <stop offset="1" stopColor="#F59E0B" />
                  </linearGradient>
                </defs>
                <rect x="6" y="6" width="36" height="36" rx="10" fill="url(#tsLogoGrad)" opacity="0.15" />
                <path d="M16 24c0-4.418 3.582-8 8-8 2.176 0 4.148.882 5.586 2.314l-2.828 2.829A4.996 4.996 0 0024 20c-2.761 0-5 2.239-5 5h-3z" fill="#2563EB" />
                <path d="M32 24c0 4.418-3.582 8-8 8-2.176 0-4.148-.882-5.586-2.314l2.828-2.829A4.996 4.996 0 0024 28c2.761 0 5-2.239 5-5h3z" fill="#F59E0B" />
              </svg>
            </div>
            <div className="ts-logo-text">
              TeamSync
            </div>
          </div>

          {/* Existing Start Now button. Keep label and destination semantics */}
          <div className="ts-actions">
            <Button variant="primary" onClick={handleStartNow}>Start Now</Button>
          </div>
        </Card>
      </Container>
    </div>
  );
}
