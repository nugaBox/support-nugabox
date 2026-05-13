'use client';

import Link from 'next/link';
import { RequireAuth } from '@/components/RequireAuth';

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireAuth adminOnly>
      <div className="mx-auto max-w-5xl space-y-8 py-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-semibold">설정</h1>
          <nav className="flex flex-wrap gap-3 text-sm">
            <Link href="/settings/sites" className="underline underline-offset-4">
              사이트
            </Link>
            <Link href="/settings/users" className="underline underline-offset-4">
              회원
            </Link>
            <Link href="/settings/user-sites" className="underline underline-offset-4">
              회원-사이트 매핑
            </Link>
          </nav>
        </div>
        {children}
      </div>
    </RequireAuth>
  );
}
