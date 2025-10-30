import React, { useEffect, useRef, useState, useMemo } from 'react';
import ReactDOM from 'react-dom';
import Button from './Button';

/**
 * PUBLIC_INTERFACE
 * RecommendationDetailsModal renders an accessible modal with focus trap and keyboard handling.
 * Props:
 * - open: boolean to control visibility
 * - onClose: function to close the modal
 * - item: recommendation object
 * - onSave?: optional handler for saving from within modal
 * - onFeedback?: optional handler for like/dislike from within modal (legacy quick reaction)
 * - onFeedbackSubmit?: optional handler for structured feedback submit
 *
 * PUBLIC_INTERFACE
 * onFeedbackSubmit signature:
 *   onFeedbackSubmit(gameId, { sentiment: 'up'|'down'|null, rating: 0|1|2|3|4|5 })
 * The component provides accessible controls and local state for sentiment and star rating.
 */
export default function RecommendationDetailsModal({
  open,
  onClose,
  item,
  onSave,
  onFeedback,
  onFeedbackSubmit
}) {
  const overlayRef = useRef(null);
  const panelRef = useRef(null);
  const lastFocusedRef = useRef(null);

  // Local UI state for feedback controls
  const [sentiment, setSentiment] = useState(null); // 'up' | 'down' | null
  const [rating, setRating] = useState(0); // 0..5
  const [submitted, setSubmitted] = useState(false);

  // Reset feedback state whenever modal opens for a new item
  useEffect(() => {
    if (open) {
      setSentiment(null);
      setRating(0);
      setSubmitted(false);
    }
  }, [open, item?.id]);

  // Mount portal target
  const portalTarget = typeof document !== 'undefined' ? document.body : null;

  // Accessible star list (role=radiogroup). Keep hooks before any early returns.
  const stars = useMemo(() => [1, 2, 3, 4, 5], []);

  useEffect(() => {
    if (!open) return undefined;

    // Save last focused element
    lastFocusedRef.current = document.activeElement;

    // Prevent background scroll
    const prevOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';

    // Focus the panel on open
    const t = setTimeout(() => {
      if (panelRef.current) {
        const focusable = panelRef.current.querySelector(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        (focusable || panelRef.current).focus();
      }
    }, 0);

    // Keydown listener for Esc and focus trap
    const onKey = (e) => {
      if (!open) return;
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose?.();
        return;
      }
      if (e.key === 'Tab' && panelRef.current) {
        const focusables = panelRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const f = Array.from(focusables).filter((el) => !el.hasAttribute('disabled'));
        if (f.length === 0) {
          e.preventDefault();
          return;
        }
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey, true);

    return () => {
      clearTimeout(t);
      document.removeEventListener('keydown', onKey, true);
      document.documentElement.style.overflow = prevOverflow;
      // Restore focus
      if (lastFocusedRef.current && typeof lastFocusedRef.current.focus === 'function') {
        lastFocusedRef.current.focus();
      }
    };
  }, [open, onClose]);

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) {
      onClose?.();
    }
  };

  if (!portalTarget || !open) return null;

  // Derived display helpers
  const tags = Array.isArray(item?.tags) ? item.tags : [];
  const deptScope = Array.isArray(item?.departmentScope) ? item.departmentScope : [];

  const Header = (
    <div className="modal-header">
      <div className="modal-title-wrap">
        <h2 className="h2" id="rec-modal-title">{item?.title || 'Activity details'}</h2>
        {item?.departmentExclusive && (
          <span className="btn warning" title="Exclusive for your department">Dept\u2012Exclusive</span>
        )}
        {item?._ai?.fit_score ? (
          <span className="btn ghost" title="AI Fit score">🎯 {Number(item._ai.fit_score).toFixed(2)}</span>
        ) : null}
        {item?.heroAlignment ? (
          <span className="btn ghost" title="Hero alignment">🛡 {item.heroAlignment}</span>
        ) : null}
      </div>
      <button
        type="button"
        className="btn secondary"
        aria-label="Close details"
        onClick={onClose}
      >
        ✕
      </button>
    </div>
  );

  const Body = (
    <div className="modal-body" id="rec-modal-desc">
      <p className="muted" style={{ fontSize: 16 }}>
        {item?.description || 'No description provided.'}
      </p>

      <div className="mt-3" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {item?.duration ? <span className="btn secondary" title="Duration">⏱ {item.duration}m</span> : null}
        {item?.suggestedSize ? <span className="btn secondary" title="Suggested size">👥 {item.suggestedSize}</span> : null}
        {item?.budget ? <span className="btn secondary" title="Budget level">💸 {item.budget}</span> : null}
        {deptScope.length > 0 && !item?.departmentExclusive ? (
          <span className="btn secondary" title="Relevant departments">🏷 {deptScope.join(', ')}</span>
        ) : null}
        {item?._ai?.source ? (
          <span
            className="btn ghost"
            title={`AI Source: ${item._ai.source}`}
            style={{
              background: item._ai.source === 'mock-ai' ? 'color-mix(in srgb, var(--ts-secondary), transparent 80%)' : undefined,
              color: 'var(--ts-text)'
            }}
          >
            🤖 {item._ai.source}
          </span>
        ) : null}
      </div>

      {tags.length > 0 && (
        <>
          <div className="mt-3 muted" style={{ fontWeight: 600 }}>Tags</div>
          <div className="mt-2" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {tags.map((t) => (
              <span key={t} className="btn ghost" aria-hidden>#{t}</span>
            ))}
          </div>
        </>
      )}

      {item?._ai?.reasoning ? (
        <>
          <div className="mt-3 muted" style={{ fontWeight: 600 }}>Why this pick</div>
          <div className="mt-2" style={{ background: 'var(--ts-surface)', border: '1px solid var(--ts-border)', padding: 12, borderRadius: 12, boxShadow: 'var(--ts-shadow-sm)' }}>
            <p className="muted" style={{ margin: 0, color: 'var(--ts-text-muted)' }}>{item._ai.reasoning}</p>
          </div>
        </>
      ) : null}

      {/* Placeholder for future: rules/requirements if available */}
      {item?.requirements || item?.rules ? (
        <>
          <div className="mt-3 muted" style={{ fontWeight: 600 }}>Requirements & Rules</div>
          <ul className="list-reset mt-2">
            {Array.isArray(item.requirements) && item.requirements.map((r, idx) => (
              <li key={`req-${idx}`}>• {r}</li>
            ))}
            {Array.isArray(item.rules) && item.rules.map((r, idx) => (
              <li key={`rule-${idx}`}>• {r}</li>
            ))}
          </ul>
        </>
      ) : null}

      {/* Feedback section */}
      <div className="mt-4" aria-label="Feedback section">
        <div className="muted" style={{ fontWeight: 700, marginBottom: 8 }}>Quick Feedback</div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Sentiment toggle */}
          <div role="group" aria-label="Sentiment" style={{ display: 'inline-flex', gap: 8 }}>
            <button
              type="button"
              className={`btn ${sentiment === 'up' ? '' : 'secondary'}`}
              aria-pressed={sentiment === 'up'}
              onClick={() => setSentiment((s) => (s === 'up' ? null : 'up'))}
              title="Thumbs up"
            >
              👍
            </button>
            <button
              type="button"
              className={`btn ${sentiment === 'down' ? '' : 'secondary'}`}
              aria-pressed={sentiment === 'down'}
              onClick={() => setSentiment((s) => (s === 'down' ? null : 'down'))}
              title="Thumbs down"
            >
              👎
            </button>
          </div>

          {/* Star rating */}
          <div
            role="radiogroup"
            aria-label="Star rating"
            style={{ display: 'inline-flex', gap: 4, marginLeft: 8 }}
          >
            {stars.map((n) => {
              const active = rating >= n;
              return (
                <button
                  key={n}
                  type="button"
                  role="radio"
                  aria-checked={rating === n}
                  className={`btn ${active ? '' : 'secondary'} feedback-star`}
                  onClick={() => setRating(n)}
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
                      e.preventDefault();
                      setRating((r) => Math.min(5, r + 1 || 1));
                    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
                      e.preventDefault();
                      setRating((r) => Math.max(0, r - 1));
                    } else if (e.key === 'Home') {
                      e.preventDefault();
                      setRating(0);
                    } else if (e.key === 'End') {
                      e.preventDefault();
                      setRating(5);
                    } else if (e.key === ' ' || e.key === 'Enter') {
                      e.preventDefault();
                      setRating(n);
                    }
                  }}
                  title={`${n} star${n > 1 ? 's' : ''}`}
                >
                  {active ? '★' : '☆'}
                </button>
              );
            })}
            {/* Clear rating button for keyboard/mouse */}
            <button
              type="button"
              className="btn secondary"
              onClick={() => setRating(0)}
              aria-label="Clear rating"
              title="Clear rating"
            >
              ⟲
            </button>
          </div>
        </div>
        {/* Submission confirmation text */}
        {submitted && (
          <div
            className="mt-2"
            aria-live="polite"
            style={{
              fontSize: 13,
              color: 'var(--ts-text-muted)'
            }}
          >
            Thanks! Your feedback helps improve future picks.
          </div>
        )}
      </div>
    </div>
  );

  const handleSubmitFeedback = () => {
    const payload = { sentiment, rating: Number(rating || 0) };
    // Prefer new structured callback; fallback to legacy quick reaction if sentiment only
    if (typeof onFeedbackSubmit === 'function') {
      const gid = item?.id || item?.title || '';
      onFeedbackSubmit(gid, payload);
      setSubmitted(true);
      // small acknowledgement also via aria-live (within modal)
      if (typeof document !== 'undefined') {
        const live = panelRef.current?.querySelector('#rec-modal-live');
        if (live) {
          live.textContent = 'Feedback submitted';
          setTimeout(() => { if (live) live.textContent = ''; }, 1000);
        }
      }
    } else if (typeof onFeedback === 'function' && payload.sentiment) {
      // Map to existing like/dislike for backward compat
      onFeedback(item, payload.sentiment === 'up' ? 'like' : 'dislike');
      setSubmitted(true);
    } else {
      setSubmitted(true);
    }
  };

  const Footer = (
    <div className="modal-footer">
      <div id="rec-modal-live" className="sr-only" aria-live="polite" />
      {/* Left: primary actions */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginRight: 'auto' }}>
        {onSave ? (
          <Button onClick={() => onSave(item)} aria-label={`Save ${item?.title || 'activity'}`}>Save</Button>
        ) : null}
      </div>
      {/* Right: feedback submit + close */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Button
          variant="ghost"
          onClick={handleSubmitFeedback}
          aria-label="Submit feedback"
          disabled={submitted || (sentiment === null && rating === 0)}
          title="Submit your feedback"
        >
          Submit Feedback
        </Button>
        <Button variant="secondary" onClick={onClose} aria-label="Close">Close</Button>
      </div>
    </div>
  );

  const modal = (
    <div
      className="modal-overlay"
      ref={overlayRef}
      onMouseDown={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="rec-modal-title"
      aria-describedby="rec-modal-desc"
    >
      <div className="modal-panel" ref={panelRef} tabIndex={-1}>
        {Header}
        {Body}
        {Footer}
      </div>
    </div>
  );

  return ReactDOM.createPortal(modal, portalTarget);
}
