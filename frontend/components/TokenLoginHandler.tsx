'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth';

/** URL 쿼리 ?token= 으로 자동 로그인 후 토큰을 주소창에서 제거 */
export function TokenLoginHandler() {
  const { user, loading, loginWithToken } = useAuth();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const attemptedRef = useRef<string | null>(null);

  const urlToken = searchParams.get('token')?.trim() ?? '';

  useEffect(() => {
    if (loading || !urlToken || user) return;
    if (attemptedRef.current === urlToken) return;
    attemptedRef.current = urlToken;

    const next = searchParams.get('next');
    const cleanUrl = next ? `${pathname}?next=${encodeURIComponent(next)}` : pathname;

    void (async () => {
      setPending(true);
      setError(null);
      try {
        await loginWithToken(urlToken);
        router.replace(cleanUrl);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : '로그인에 실패했습니다.');
        router.replace(cleanUrl);
      } finally {
        setPending(false);
      }
    })();
  }, [loading, urlToken, user, loginWithToken, router, pathname, searchParams]);

  if (!urlToken || user || (!pending && !error)) return null;

  return (
    <div className="mb-6 flex min-h-[4rem] items-center justify-center">
      {pending && <p className="text-sm text-ink-tertiary">로그인 링크로 접속 중…</p>}
      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </p>
      )}
    </div>
  );
}
