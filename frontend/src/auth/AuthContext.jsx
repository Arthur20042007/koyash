import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchMe, getToken, setToken, updateAccount } from '../api/client';
import { AuthContext } from './useAuth';

const USER_KEY = 'koyash_user';
const AVATAR_KEY = 'koyash_avatar_'; // + userId

function readStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeStoredUser(user) {
  try {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(USER_KEY);
  } catch {
    /* ignore */
  }
}

// Avatar carries a client-side fallback: until the backend deploy that adds the
// `avatar` field, the server drops it, so we also remember the choice per user
// in localStorage and merge it back in whenever the account loads.
function mergeStoredAvatar(user) {
  if (!user || user.avatar) return user;
  try {
    const saved = localStorage.getItem(AVATAR_KEY + user.id);
    return saved ? { ...user, avatar: saved } : user;
  } catch {
    return user;
  }
}

// Guest-first: the whole questionnaire works without an account. This provider
// only tracks the *optional* signed-in user, mirroring the backend's ADR-004
// model. Token + user are cached in localStorage so a reload stays signed in.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => mergeStoredAvatar(readStoredUser()));
  // If there's no token we're already "ready" (a guest); otherwise we stay
  // not-ready until the stored token is validated below.
  const [ready, setReady] = useState(() => !getToken());

  // On first mount, if we hold a token, confirm it's still valid and refresh
  // the cached user. An expired/invalid token signs the user back out quietly.
  useEffect(() => {
    if (!getToken()) return;
    let cancelled = false;
    fetchMe()
      .then((me) => {
        if (cancelled) return;
        const merged = mergeStoredAvatar(me);
        setUser(merged);
        writeStoredUser(merged);
      })
      .catch(() => {
        if (cancelled) return;
        setToken(null);
        writeStoredUser(null);
        setUser(null);
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Called by login/register screens with the backend's TokenResponse.
  const signIn = useCallback(({ access_token, user: nextUser }) => {
    setToken(access_token);
    const merged = mergeStoredAvatar(nextUser);
    writeStoredUser(merged);
    setUser(merged);
  }, []);

  const signOut = useCallback(() => {
    setToken(null);
    writeStoredUser(null);
    setUser(null);
  }, []);

  // Patch the cached user after a profile edit without a full re-fetch.
  const updateUser = useCallback((patch) => {
    setUser((prev) => {
      const next = { ...(prev || {}), ...patch };
      writeStoredUser(next);
      return next;
    });
  }, []);

  // Pick a profile avatar: update the cache, remember it locally, and best-effort
  // persist it server-side (ignored until the backend deploy lands).
  const setAvatar = useCallback((key) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, avatar: key };
      writeStoredUser(next);
      try {
        localStorage.setItem(AVATAR_KEY + prev.id, key);
      } catch {
        /* ignore */
      }
      return next;
    });
    updateAccount({ avatar: key }).catch(() => {});
  }, []);

  const value = useMemo(
    () => ({ user, isAuthenticated: !!user, ready, signIn, signOut, updateUser, setAvatar }),
    [user, ready, signIn, signOut, updateUser, setAvatar],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
