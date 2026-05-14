'use client';

import { Suspense } from 'react';
import { useAuth } from '@/lib/auth';
import { SupportPostsBoard } from '@/components/SupportPostsBoard';
import { HomeLoginForm } from '@/components/HomeLoginForm';

export function HomePageClient() {
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
        <h1 className="text-[1.75rem] font-semibold leading-snug tracking-tight text-ink md:text-4xl">고객지원</h1>
        <p className="text-[15px] leading-relaxed text-ink-secondary">
          <span className="font-semibold text-ink">NUGABOX에서 제공하는 서비스의 고객지원 게시판입니다.</span>{' '}
          로그인 후 문의를 등록하고 진행 상태를 확인할 수 있습니다. 모든 문의는 비밀글이며, 일반 회원은 본인이
          작성한 글만 볼 수 있습니다.
        </p>
        <ul className="list-disc space-y-1 pl-5 text-[15px] text-ink-secondary">
          <li>
            계정 관련 문의{' '}
            <a
              href="mailto:root@nugabox.com"
              className="font-medium text-ink underline-offset-2 hover:underline"
            >
              root@nugabox.com
            </a>
          </li>
        </ul>
      </div>

      <Suspense
        fallback={
          <div className="ui-card p-8 text-center text-sm text-ink-tertiary">로딩 중…</div>
        }
      >
        <div className="ui-card space-y-4 p-6 md:p-8">
          <h2 className="text-lg font-semibold tracking-tight text-ink">로그인</h2>
          <HomeLoginForm />
        </div>
      </Suspense>
    </div>
  );
}
