/** 백엔드 REST 호출 + JWT 갱신 */
const ACCESS_KEY = 'nugabox_access_token';
const REFRESH_KEY = 'nugabox_refresh_token';

/** 브라우저/SSR이 호출하는 API 베이스. 환경값이 /api 없이 끝나면 자동으로 붙여 Nest 프록시와 맞춘다. */
export function getApiBase(): string {
  const env = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (env) {
    let b = env.replace(/\/$/, '');
    if (!b.endsWith('/api')) b = `${b}/api`;
    return b;
  }
  if (typeof window !== 'undefined') return '/api';
  const port = process.env.PORT || '3000';
  return `http://127.0.0.1:${port}/api`;
}

export function getStoredAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(ACCESS_KEY);
}

export function getStoredRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(REFRESH_KEY);
}

export function setStoredTokens(access: string, refresh: string) {
  sessionStorage.setItem(ACCESS_KEY, access);
  sessionStorage.setItem(REFRESH_KEY, refresh);
}

export function clearStoredTokens() {
  sessionStorage.removeItem(ACCESS_KEY);
  sessionStorage.removeItem(REFRESH_KEY);
}

async function refreshAccessToken(): Promise<string | null> {
  const refresh = getStoredRefreshToken();
  if (!refresh) return null;
  const res = await fetch(`${getApiBase()}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: refresh }),
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { accessToken: string };
  sessionStorage.setItem(ACCESS_KEY, data.accessToken);
  return data.accessToken;
}

export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const url = `${getApiBase()}${path.startsWith('/') ? path : `/${path}`}`;
  const headers = new Headers(init.headers);
  const token = getStoredAccessToken();
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  /** JSON 본문인데 Content-Type이 없으면 Nest/Express가 body를 파싱하지 못함 */
  if (
    init.body !== undefined &&
    typeof init.body === 'string' &&
    init.body.length > 0 &&
    !headers.has('Content-Type')
  ) {
    headers.set('Content-Type', 'application/json');
  }

  let res = await fetch(url, { ...init, headers });

  if (res.status === 401 && !path.includes('/auth/refresh')) {
    const newAccess = await refreshAccessToken();
    if (newAccess) {
      const h2 = new Headers(init.headers);
      h2.set('Authorization', `Bearer ${newAccess}`);
      if (
        init.body !== undefined &&
        typeof init.body === 'string' &&
        init.body.length > 0 &&
        !h2.has('Content-Type')
      ) {
        h2.set('Content-Type', 'application/json');
      }
      res = await fetch(url, { ...init, headers: h2 });
    }
  }

  return res;
}

export async function apiJson<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await apiFetch(path, init);
  if (!res.ok) {
    let msg = res.statusText;
    try {
      const body = await res.json();
      const m = (body as { message?: string | string[] }).message;
      if (Array.isArray(m)) msg = m.join(', ');
      else if (typeof m === 'string') msg = m;
    } catch {
      /* ignore */
    }
    throw new Error(typeof msg === 'string' ? msg : JSON.stringify(msg));
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export async function apiUpload(postId: string, files: File[]) {
  const fd = new FormData();
  files.forEach((f) => fd.append('files', f));
  const res = await apiFetch(`/support-posts/${postId}/attachments`, {
    method: 'POST',
    body: fd,
  });
  if (!res.ok) {
    let msg = '파일 업로드 실패';
    try {
      const body = await res.json();
      msg = (body as { message?: string }).message ?? msg;
    } catch {
      /* ignore */
    }
    throw new Error(msg);
  }
  return res.json() as Promise<unknown>;
}

export async function downloadBinary(path: string): Promise<Blob> {
  const res = await apiFetch(path);
  if (!res.ok) throw new Error('다운로드에 실패했습니다.');
  return res.blob();
}
