'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { authApi } from '@/lib/api/auth';
import { refreshAccessToken } from '@/lib/auth/refresh';
import { clearSession, getCurrentUser, subscribeSession } from '@/lib/auth/session';
import type { SessionUser } from '@/types/auth';

interface SessionContextValue {
  user: SessionUser | null;
  /** Đang khôi phục phiên sau khi tải trang — chưa biết đã đăng nhập hay chưa. */
  loading: boolean;
  logout: () => Promise<void>;
  can: (permission: string) => boolean;
}

const SessionContext = createContext<SessionContextValue | null>(null);

/**
 * Khôi phục phiên lúc tải trang: access token nằm trong bộ nhớ nên F5 là mất;
 * gọi refresh MỘT lần bằng cookie httpOnly. Không có cookie → `user = null`,
 * khung dashboard đưa về /login.
 */
export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(getCurrentUser);
  const [loading, setLoading] = useState(true);

  useEffect(() => subscribeSession(setUser), []);

  useEffect(() => {
    let cancelled = false;
    refreshAccessToken().finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const logout = useCallback(async () => {
    // Xoá phiên phía client TRƯỚC: server có lỗi thì người dùng vẫn thoát được.
    clearSession();
    await authApi.logout().catch(() => undefined);
  }, []);

  const can = useCallback((permission: string) => user?.permissions.includes(permission) ?? false, [user]);

  return <SessionContext.Provider value={{ user, loading, logout, can }}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession phải nằm trong <SessionProvider>');
  return ctx;
}
