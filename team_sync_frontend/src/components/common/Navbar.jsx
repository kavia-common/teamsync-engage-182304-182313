import React, { useEffect, useRef, useState } from 'react';
import Button from './Button';
import { useAuthStore } from '../../state/authStore';

/**
 * PUBLIC_INTERFACE
 * Navbar with brand, theme toggle, and a user profile dropdown.
 * The dropdown is accessible (keyboard navigable, Escape to close, outside click to dismiss).
 */
export default function Navbar({ theme, onToggleTheme }) {
  const user = useAuthStore((s) => s.user);
  const clearUser = useAuthStore((s) => s.clearUser);

  const [open, setOpen] = useState(false);
  const btnRef = useRef(null);
  const menuRef = useRef(null);

  const name = (user && typeof user === 'object' && typeof user.name === 'string') ? user.name.trim() : '';

  // Close on outside click
  useEffect(() => {
    function onDocClick(e) {
      if (!open) return;
      const t = e.target;
      if (menuRef.current?.contains(t) || btnRef.current?.contains(t)) return;
      setOpen(false);
    }
    function onKey(e) {
      if (!open) return;
      if (e.key === 'Escape') {
        e.stopPropagation();
        setOpen(false);
        btnRef.current?.focus();
      }
    }
    document.addEventListener('mousedown', onDocClick, true);
    document.addEventListener('keydown', onKey, true);
    return () => {
      document.removeEventListener('mousedown', onDocClick, true);
      document.removeEventListener('keydown', onKey, true);
    };
  }, [open]);

  // Focus first item when menu opens
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => {
      const first = menuRef.current?.querySelector('[role="menuitem"]');
      first?.focus();
    }, 0);
    return () => clearTimeout(t);
  }, [open]);

  const onToggleMenu = () => setOpen((v) => !v);

  // PUBLIC_INTERFACE
  function handleGoProfile() {
    setOpen(false);
    window.location.hash = '#/profile';
  }

  // PUBLIC_INTERFACE
  function handleSignOut() {
    // Clear local store and persisted localStorage-backed authStore
    try {
      clearUser();
    } catch {
      // ignore
    }
    setOpen(false);
    // Redirect to landing; signin also acceptable
    window.location.hash = '#/';
  }

  const userInitials = (() => {
    const n = String(name || '').trim();
    if (!n) return 'U';
    const parts = n.split(/\s+/);
    const a = (parts[0] || '').charAt(0);
    const b = (parts[1] || '').charAt(0);
    return (a + b).toUpperCase() || a.toUpperCase() || 'U';
  })();

  return (
    <header className="navbar" role="banner">
      <div className="navbar-inner">
        <a href="#/" className="brand" aria-label="TeamSync Home">
          <span className="brand-badge" aria-hidden>TS</span>
          <span>TeamSync</span>
        </a>
        <nav aria-label="Primary">
          <div className="nav-actions" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Profile menu (only when signed in) */}
            {name ? (
              <div style={{ position: 'relative' }}>
                <button
                  ref={btnRef}
                  type="button"
                  className="btn secondary"
                  aria-haspopup="menu"
                  aria-expanded={open}
                  aria-controls="profile-menu"
                  title={`Account menu for ${name}`}
                  onClick={onToggleMenu}
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowDown' && !open) {
                      e.preventDefault();
                      setOpen(true);
                    }
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    background: 'color-mix(in srgb, var(--ts-primary), transparent 88%)',
                    borderColor: 'color-mix(in srgb, var(--ts-primary), transparent 72%)',
                    color: 'var(--ts-text)',
                  }}
                >
                  <span
                    aria-hidden
                    style={{
                      width: 26,
                      height: 26,
                      display: 'inline-grid',
                      placeItems: 'center',
                      borderRadius: 10,
                      background: 'linear-gradient(135deg, var(--ts-secondary), var(--ts-primary))',
                      color: '#041318',
                      fontWeight: 800,
                      fontSize: 'var(--font-small)',
                      lineHeight: 'var(--lh-tight)',
                    }}
                  >
                    {userInitials}
                  </span>
                  <span className="sr-only">Open profile menu</span>
                  <span aria-hidden>Hi, {name}</span>
                </button>

                {open && (
                  <div
                    ref={menuRef}
                    id="profile-menu"
                    role="menu"
                    aria-label="Profile options"
                    style={{
                      position: 'absolute',
                      right: 0,
                      marginTop: 8,
                      minWidth: 180,
                      background: 'var(--ts-surface)',
                      color: 'var(--ts-text)',
                      border: '1px solid var(--ts-border)',
                      borderRadius: 12,
                      boxShadow: 'var(--ts-shadow)',
                      padding: 6,
                      zIndex: 20,
                    }}
                    onKeyDown={(e) => {
                      // simple focus loop within menu
                      if (e.key === 'Tab') {
                        const focusables = menuRef.current?.querySelectorAll('[role="menuitem"]');
                        const f = Array.from(focusables || []);
                        if (!f.length) return;
                        const first = f[0];
                        const last = f[f.length - 1];
                        if (e.shiftKey && document.activeElement === first) {
                          e.preventDefault();
                          last.focus();
                        } else if (!e.shiftKey && document.activeElement === last) {
                          e.preventDefault();
                          first.focus();
                        }
                      } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                        e.preventDefault();
                        const items = Array.from(menuRef.current?.querySelectorAll('[role="menuitem"]') || []);
                        const idx = items.indexOf(document.activeElement);
                        if (idx >= 0) {
                          const nextIdx =
                            e.key === 'ArrowDown'
                              ? (idx + 1) % items.length
                              : (idx - 1 + items.length) % items.length;
                          items[nextIdx]?.focus();
                        } else {
                          items[0]?.focus();
                        }
                      } else if (e.key === 'Home') {
                        e.preventDefault();
                        menuRef.current?.querySelector('[role="menuitem"]')?.focus();
                      } else if (e.key === 'End') {
                        e.preventDefault();
                        const items = menuRef.current?.querySelectorAll('[role="menuitem"]');
                        const last = items?.[items.length - 1];
                        last?.focus();
                      }
                    }}
                  >
                    <button
                      role="menuitem"
                      className="btn secondary"
                      style={{ width: '100%', textAlign: 'left' }}
                      onClick={handleGoProfile}
                    >
                      Profile
                    </button>
                    <button
                      role="menuitem"
                      className="btn secondary"
                      style={{ width: '100%', textAlign: 'left', marginTop: 6 }}
                      onClick={handleSignOut}
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : null}

            <Button
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
              onClick={onToggleTheme}
              className="secondary"
              title={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
            >
              {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
}
