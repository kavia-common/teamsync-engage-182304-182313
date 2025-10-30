import React from 'react';

/**
 * PUBLIC_INTERFACE
 * Button with size/variant options and accessible focus styles.
 */
export default function Button({
  children,
  onClick,
  type = 'button',
  variant = 'primary', // primary | secondary | warning | ghost
  disabled = false,
  className = '',
  ...rest
}) {
  return (
    <button
      type={type}
      className={`btn ${variant !== 'primary' ? variant : ''} ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...rest}
    >
      {children}
    </button>
  );
}
