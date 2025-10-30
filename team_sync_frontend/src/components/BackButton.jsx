import React, { useEffect, useState } from 'react';

/**
 * PUBLIC_INTERFACE
 * BackButton renders a small ghost-styled button positioned at top-left that navigates back in history,
 * falling back to the home route ("#/") if no history is available.
 * This component auto-hides on the root route.
 */
const BackButton = () => {
  const [isRoot, setIsRoot] = useState(false);

  useEffect(() => {
    const check = () => {
      const hash = window.location.hash || '#/';
      const path = hash.replace(/^#/, '');
      const normalized = path.startsWith('/') ? path : `/${path}`;
      setIsRoot(normalized === '/');
    };
    check();
    window.addEventListener('hashchange', check);
    return () => window.removeEventListener('hashchange', check);
  }, []);

  const handleBack = () => {
    try {
      if (typeof window !== 'undefined' && window.history && window.history.length > 1) {
        window.history.back();
      } else {
        window.location.hash = '#/';
      }
    } catch {
      window.location.hash = '#/';
    }
  };

  if (isRoot) return null;

  return (
    <button
      type="button"
      onClick={handleBack}
      aria-label="Back"
      className="ts-back-btn"
      data-testid="back-button"
    >
      <svg
        className="ts-back-btn__icon"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span>Back</span>
    </button>
  );
};

export default BackButton;
