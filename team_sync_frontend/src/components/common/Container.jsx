import React from 'react';

/**
 * PUBLIC_INTERFACE
 * A max-width content wrapper with standard padding.
 */
export default function Container({ className = '', style, children }) {
  return (
    <div className={`ts-container ${className}`} style={style}>
      {children}
    </div>
  );
}
