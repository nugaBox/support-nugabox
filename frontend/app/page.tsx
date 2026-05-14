'use client';

import { Suspense } from 'react';
import { useAuth } from '@/lib/auth';
import { SupportPostsBoard } from '@/components/SupportPostsBoard';
import { HomeLoginForm } from '@/components/HomeLoginForm';

export default function HomePage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-sm text-ink-tertiary">불러오는 중…</p>
      </div>
    );
  }

  if (user) {
    return <SupportPostsBoard />;
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="ui-card space-y-5 p-8 md:p-10">
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-ink-tertiary">
          Customer support
        </p>
        <h1 className="text-[1.75rem] font-semibold leading-snug tracking-tight text-ink md:text-4xl">
          고객지원 게시판
        </h1>
        <p className="text-[15px] leading-relaxed text-ink-secondary">
          로그인 후 문의를 등록하고 진행 상태를 확인할 수 있습니다. 모든 문의는 비밀글이며, 일반
          회원은 본인이 작성한 글만 볼 수 있습니다.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="ui-card p-8 text-center text-sm text-ink-tertiary">로딩 중…</div>
        }
      >
        <div className="ui-card p-6 md:p-8">
          <HomeLoginForm />
        </div>
      </Suspense>
    </div>
  );
}
