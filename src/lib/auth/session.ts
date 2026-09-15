import type { SessionUser } from '@/types/auth';

/**
 * Phiên giữ TRONG BỘ NHỚ, không localStorage: một lỗi XSS không lấy được token.
 * F5 là mất access token — không sao, cookie refresh còn, `restoreSession()`
 * (trong SessionProvider) lấy lại được mà không cần gõ mật khẩu.
 */
let accessToken: string | null = null;
let currentUser: SessionUser | null = null;

type Listener = (user: SessionUser | null) => void;
const listeners = new Set<Listener>();

export function getAccessToken(): string | null {
  return accessToken;
}

export function getCurrentUser(): SessionUser | null {
  return currentUser;
}

export function setSession(token: string, user: SessionUser): void {
  accessToken = token;
  currentUser = user;
  listeners.forEach((listener) => listener(user));
}

/** Vá vài trường của người dùng mà KHÔNG đụng token — sau khi sửa hồ sơ. */
export function patchCurrentUser(patch: Partial<SessionUser>): void {
  if (!currentUser) return;
  currentUser = { ...currentUser, ...patch };
  listeners.forEach((listener) => listener(currentUser));
}

export function clearSession(): void {
  accessToken = null;
  currentUser = null;
  listeners.forEach((listener) => listener(null));
}

export function subscribeSession(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
