import { create } from 'zustand';

/**
 * PUBLIC_INTERFACE
 * Authentication/user state store with simple persistence.
 * Stores basic user info and exposes helpers to get/update it across the app.
 *
 * Persistence:
 * - Uses localStorage key 'ts-auth' to persist { name, teamName, email }.
 * - Exposes hydrate on load and writes on every update.
 */
function loadFromStorage() {
  try {
    const raw = localStorage.getItem('ts-auth');
    if (!raw) return { user: null };
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      return { user: parsed.user || null };
    }
  } catch {
    // ignore
  }
  return { user: null };
}

function saveToStorage(user) {
  try {
    localStorage.setItem('ts-auth', JSON.stringify({ user }));
  } catch {
    // ignore
  }
}

export const useAuthStore = create((set, get) => ({
  user: loadFromStorage().user, // { name, teamName, email } | null

  // PUBLIC_INTERFACE
  setUser: (user) => {
    const safe = user && typeof user === 'object'
      ? {
          name: String(user.name || '').trim(),
          teamName: String(user.teamName || '').trim(),
          email: String(user.email || '').trim(),
        }
      : null;
    set({ user: safe });
    saveToStorage(safe);
    // Expose team id hint for API fallbacks (global shim, non-blocking)
    if (typeof window !== 'undefined') {
      window.__TS_TEAM_ID__ = safe?.teamName || '';
    }
  },

  // PUBLIC_INTERFACE
  clearUser: () => {
    set({ user: null });
    saveToStorage(null);
    if (typeof window !== 'undefined') {
      window.__TS_TEAM_ID__ = '';
    }
  },

  // PUBLIC_INTERFACE
  getUser: () => get().user,

  // PUBLIC_INTERFACE
  isSignedIn: () => !!get().user && !!(get().user.email || get().user.name),
}));

// PUBLIC_INTERFACE
export const selectUser = (s) => s.user;
