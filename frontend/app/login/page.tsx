'use client';

import { Suspense } from 'react';
import { HomeLoginForm } from '@/components/HomeLoginForm';

function LoginInner() {
  return (
    <div className="mx-auto max-w-md">
      <div className="ui-card space-y-6 p-8 md:p-10">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">로그인</h1>
        <HomeLoginForm />
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
