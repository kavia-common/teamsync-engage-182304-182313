import React from 'react';

/**
 * PUBLIC_INTERFACE
 * Linear progress bar
 */
export default function Progress({ value = 0, max = 100, label }) {
  const pct = Math.max(0, Math.min(100, Math.round((value / max) * 100)));
  return (
    <div className="ts-progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label={label}>
      <div className="bar" style={{ width: `${pct}%` }} />
    </div>
  );
}
