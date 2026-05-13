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
    <div className="mx-auto max-w-md space-y-8 py-8">
      <div>
        <h1 className="text-2xl font-semibold">로그인</h1>
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
          관리자와 회원 동일한 로그인 화면을 사용합니다.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <label className="block space-y-1">
          <span className="text-xs text-neutral-500">이메일</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-neutral-300 bg-transparent px-3 py-2 text-sm dark:border-neutral-600"
            autoComplete="email"
          />
        </label>
        <label className="block space-y-1">
          <span className="text-xs text-neutral-500">비밀번호</span>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border border-neutral-300 bg-transparent px-3 py-2 text-sm dark:border-neutral-600"
            autoComplete="current-password"
          />
        </label>
        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-md border border-neutral-900 py-2.5 text-sm dark:border-white disabled:opacity-50"
        >
          {pending ? '처리 중…' : '로그인'}
        </button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<p className="py-12 text-center text-sm text-neutral-500">로딩 중…</p>}>
      <LoginInner />
    </Suspense>
  );
}
