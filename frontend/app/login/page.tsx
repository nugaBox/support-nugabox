'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { useAuth } from '@/lib/auth';

function LoginInner() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get('next') ?? '/support-posts';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      await login(email, password);
      router.replace(nextPath);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '로그인 실패');
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="ui-card space-y-8 p-8 md:p-10">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">로그인</h1>
          <p className="mt-2 text-sm text-ink-secondary">
            관리자와 회원이 같은 화면으로 로그인합니다.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          <label className="block space-y-2">
            <span className="text-xs font-medium text-ink-secondary">이메일</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="ui-input"
              autoComplete="email"
            />
          </label>
          <label className="block space-y-2">
            <span className="text-xs font-medium text-ink-secondary">비밀번호</span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="ui-input"
              autoComplete="current-password"
            />
          </label>
          {error && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
              {error}
            </p>
          )}
          <button type="submit" disabled={pending} className="ui-btn-primary w-full">
            {pending ? '처리 중…' : '계속'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <p className="py-16 text-center text-sm text-ink-tertiary">로딩 중…</p>
      }
    >
      <LoginInner />
    </Suspense>
  );
}
