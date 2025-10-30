import React from 'react';

/**
 * PUBLIC_INTERFACE
 * Simple card with surface, border, radius and shadow.
 * Hover lift uses CSS transform; users with reduced motion preference will see no lift.
 */
export default function Card({ className = '', style, children, as: Tag = 'div', ...rest }) {
  return (
    <Tag className={`ts-card ${className}`} style={style} {...rest}>
      {children}
    </Tag>
  );
}
