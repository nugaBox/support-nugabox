'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  apiJson,
  clearStoredTokens,
  getApiBase,
  getStoredAccessToken,
  getStoredRefreshToken,
  setStoredTokens,
} from '@/lib/api';

export type AuthUser = {
  id: string;
  username: string;
  name: string;
  role: 'ADMIN' | 'MEMBER';
  isActive: boolean;
};

type AuthState = {
  user: AuthUser | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  loginWithToken: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const token = getStoredAccessToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const me = await apiJson<AuthUser>('/auth/me');
      setUser(me);
    } catch {
      clearStoredTokens();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshUser();
  }, [refreshUser]);

  const applySession = useCallback((data: { accessToken: string; refreshToken: string; user: AuthUser }) => {
    setStoredTokens(data.accessToken, data.refreshToken);
    setUser(data.user);
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const res = await fetch(`${getApiBase()}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const raw = (err as { message?: string | string[] }).message;
      const msg = Array.isArray(raw) ? raw.join(', ') : raw;
      throw new Error(typeof msg === 'string' && msg.length > 0 ? msg : '로그인 실패');
    }
    const data = (await res.json()) as {
      accessToken: string;
      refreshToken: string;
      user: AuthUser;
    };
    applySession(data);
  }, [applySession]);

  const loginWithToken = useCallback(async (token: string) => {
    const res = await fetch(`${getApiBase()}/auth/login-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const raw = (err as { message?: string | string[] }).message;
      const msg = Array.isArray(raw) ? raw.join(', ') : raw;
      throw new Error(typeof msg === 'string' && msg.length > 0 ? msg : '로그인 토큰이 유효하지 않습니다.');
    }
    const data = (await res.json()) as {
      accessToken: string;
      refreshToken: string;
      user: AuthUser;
    };
    applySession(data);
  }, [applySession]);

  const logout = useCallback(async () => {
    try {
      await apiJson('/auth/logout', {
        method: 'POST',
        body: JSON.stringify({
          refreshToken: getStoredRefreshToken(),
        }),
      });
    } catch {
      /* 무시 */
    }
    clearStoredTokens();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      loginWithToken,
      logout,
      refreshUser,
    }),
    [user, loading, login, loginWithToken, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth는 AuthProvider 내부에서만 사용하세요.');
  return ctx;
}
