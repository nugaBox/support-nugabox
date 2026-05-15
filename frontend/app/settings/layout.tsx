'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { RequireAuth } from '@/components/RequireAuth';

const navPill =
  'rounded-xl px-4 py-2 text-sm font-medium text-ink-secondary transition-colors hover:bg-elevated hover:text-ink';
const navPillActive = 'bg-elevated text-ink shadow-sm';

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <RequireAuth adminOnly>
      <div className="mx-auto max-w-5xl space-y-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-ink-tertiary">
              관리자
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink">관리자 설정</h1>
          </div>
          <nav className="flex flex-wrap gap-1 rounded-2xl border border-line bg-canvas-subtle p-1.5">
            <Link
              href="/settings/sites"
              className={`${navPill} ${pathname.startsWith('/settings/sites') ? navPillActive : ''}`}
            >
              사이트
            </Link>
            <Link
              href="/settings/users"
              className={`${navPill} ${
                pathname.startsWith('/settings/users') || pathname.startsWith('/settings/user-sites')
                  ? navPillActive
                  : ''
              }`}
            >
              회원
            </Link>
          </nav>
        </div>
        {children}
      </div>
    </RequireAuth>
  );
}
