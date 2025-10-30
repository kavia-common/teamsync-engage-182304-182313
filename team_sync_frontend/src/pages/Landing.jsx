import React from 'react';

/**
 * PUBLIC_INTERFACE
 * Minimal landing page rendering only a centered TeamSync logo button.
 * - Primary color: #2563EB
 * - Hover/active accent: #F59E0B
 * - Accessible with aria-label and keyboard focusable
 * - Responsive centering via flex and viewport units
 */
export default function Landing() {
  // If a logo asset becomes available at /assets/teamsync-logo.svg|png
  // replace the inner text span with an <img> tag and keep aria-labels.
  return (
    <div
      role="region"
      aria-label="TeamSync landing"
      style={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f9fafb', // theme background
      }}
    >
      <a href="#/onboarding" aria-label="Enter TeamSync" style={{ textDecoration: 'none' }}>
        <button
          type="button"
          aria-label="TeamSync"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.1rem 2rem',
            borderRadius: '9999px',
            border: 'none',
            cursor: 'pointer',
            backgroundColor: '#2563EB', // primary
            color: '#ffffff',
            boxShadow:
              '0 10px 15px -3px rgba(37, 99, 235, 0.25), 0 4px 6px -4px rgba(37, 99, 235, 0.25)',
            transition: 'transform 150ms ease, background-color 150ms ease, box-shadow 150ms ease',
            fontSize: 'clamp(1.125rem, 2.2vw, 1.5rem)',
            lineHeight: 1.1,
            fontWeight: 800,
            letterSpacing: '0.3px',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#F59E0B'; // secondary hover
            e.currentTarget.style.boxShadow =
              '0 10px 15px -3px rgba(245, 158, 11, 0.25), 0 4px 6px -4px rgba(245, 158, 11, 0.25)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#2563EB';
            e.currentTarget.style.boxShadow =
              '0 10px 15px -3px rgba(37, 99, 235, 0.25), 0 4px 6px -4px rgba(37, 99, 235, 0.25)';
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.transform = 'translateY(1px) scale(0.99)';
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
          }}
        >
          {/* Text-based logo badge fallback */}
          <span
            style={{
              display: 'inline-block',
              padding: '0.3rem 0.75rem',
              borderRadius: '9999px',
              background: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.25)',
              backdropFilter: 'blur(2px)',
              color: '#ffffff',
              fontWeight: 900,
              letterSpacing: '0.4px',
            }}
          >
            TeamSync
          </span>
        </button>
      </a>
    </div>
  );
}
