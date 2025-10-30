import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import Button from './Button';

/**
 * PUBLIC_INTERFACE
 * RecommendationDetailsModal renders an accessible modal with focus trap and keyboard handling.
 * Props:
 * - open: boolean to control visibility
 * - onClose: function to close the modal
 * - item: recommendation object with fields like title, description, duration, suggestedSize, budget, tags, heroAlignment, departmentExclusive, departmentScope, _ai
 * - onSave?: optional handler for saving from within modal
 * - onFeedback?: optional handler for like/dislike from within modal
 */
export default function RecommendationDetailsModal({ open, onClose, item, onSave, onFeedback }) {
  const overlayRef = useRef(null);
  const panelRef = useRef(null);
  const lastFocusedRef = useRef(null);

  // Mount portal target
  const portalTarget = typeof document !== 'undefined' ? document.body : null;

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
          <span className="btn warning" title="Exclusive for your department">Dept‒Exclusive</span>
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
              background: item._ai.source === 'mock-ai' ? 'rgba(245,158,11,0.15)' : undefined,
              color: item._ai.source === 'mock-ai' ? '#92400e' : undefined
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
          <div className="mt-2" style={{ background: 'rgba(37,99,235,0.06)', padding: 12, borderRadius: 12 }}>
            <p className="muted" style={{ margin: 0 }}>{item._ai.reasoning}</p>
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
    </div>
  );

  const Footer = (
    <div className="modal-footer">
      {onSave ? (
        <Button onClick={() => onSave(item)} aria-label={`Save ${item?.title || 'activity'}`}>Save</Button>
      ) : null}
      {onFeedback ? (
        <>
          <Button variant="ghost" onClick={() => onFeedback(item, 'like')} aria-label={`Like ${item?.title || 'activity'}`}>👍 Like</Button>
          <Button variant="ghost" onClick={() => onFeedback(item, 'dislike')} aria-label={`Dislike ${item?.title || 'activity'}`}>👎 Dislike</Button>
        </>
      ) : null}
      <Button variant="secondary" onClick={onClose} aria-label="Close">Close</Button>
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
