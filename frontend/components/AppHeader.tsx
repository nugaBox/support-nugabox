'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { useState } from 'react';

const navBase =
  'rounded-xl px-2.5 py-1.5 text-sm text-ink-secondary transition-colors hover:bg-accent-soft hover:text-ink';
const navActive = 'bg-accent-soft font-medium text-ink';

const devLinkClass = 'ui-btn-primary ml-2 py-2 text-xs';

export function AppHeader() {
  const { user, logout, loading } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isLogin = pathname === '/login';

  if (isLogin) {
    return (
      <header className="sticky top-0 z-40 border-b border-line bg-elevated/80 backdrop-blur-xl dark:bg-elevated/70">
        <div className="mx-auto flex max-w-5xl justify-center px-4 py-3.5 md:px-8">
          <div className="flex items-center justify-center gap-3">
            <Image
              src="/banner.png"
              alt="NUGABOX"
              width={874}
              height={200}
              className="h-8 w-auto max-w-[min(100%,220px)] object-contain md:h-9 md:max-w-[260px]"
              priority
            />
            <span className="text-lg font-bold tracking-tight text-ink md:text-xl">고객지원</span>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-elevated/80 backdrop-blur-xl dark:bg-elevated/70">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3.5 md:px-8">
        <Link href="/" className="flex min-w-0 shrink items-center gap-3">
          <Image
            src="/banner.png"
            alt="NUGABOX"
            width={874}
            height={200}
            className="h-8 w-auto max-w-[min(100%,220px)] object-contain object-left md:h-9 md:max-w-[260px]"
            priority
          />
          <span className="text-lg font-bold tracking-tight text-ink md:text-xl">고객지원</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {user && (
            <>
              <Link
                href="/support-posts"
                className={`${navBase} ${
                  pathname === '/' ||
                  (pathname.startsWith('/support-posts') && !pathname.startsWith('/support-posts/new'))
                    ? navActive
                    : ''
                }`}
              >
                문의
              </Link>
              {user.role === 'ADMIN' && (
                <Link
                  href="/settings/sites"
                  className={`${navBase} ${pathname.startsWith('/settings') ? navActive : ''}`}
                >
                  설정
                </Link>
              )}
            </>
          )}
          {!loading && (
            <span className="ml-4 max-w-[160px] truncate text-sm font-medium text-ink-secondary">
              {user ? `${user.name}님` : ''}
            </span>
          )}
          {user ? (
            <button
              type="button"
              onClick={() => void logout()}
              className="ui-btn-ghost ml-1"
            >
              로그아웃
            </button>
          ) : (
            <a
              href="https://nugabox.io"
              target="_blank"
              rel="noopener noreferrer"
              className={devLinkClass}
            >
              개발자
            </a>
          )}
        </nav>

        <button
          type="button"
          className="ui-btn-ghost md:hidden"
          aria-label="메뉴"
          onClick={() => setOpen((v) => !v)}
        >
          메뉴
        </button>
      </div>

      {open && (
        <div className="border-t border-line bg-canvas-subtle px-4 py-4 md:hidden">
          <div className="flex flex-col gap-1">
            {user && (
              <>
                <p className="px-2.5 py-1 text-sm font-medium text-ink-secondary">{user.name}님</p>
                <Link href="/support-posts" className={navBase} onClick={() => setOpen(false)}>
                  문의 목록
                </Link>
                {user.role === 'ADMIN' && (
                  <Link href="/settings/sites" className={navBase} onClick={() => setOpen(false)}>
                    설정
                  </Link>
                )}
              </>
            )}
            {user ? (
              <button type="button" className={`${navBase} text-left`} onClick={() => void logout()}>
                로그아웃
              </button>
            ) : (
              <a
                href="https://nugabox.io"
                target="_blank"
                rel="noopener noreferrer"
                className={navBase}
                onClick={() => setOpen(false)}
              >
                개발자
              </a>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
