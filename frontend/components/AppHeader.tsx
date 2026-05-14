'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { useState } from 'react';

const navBase =
  'rounded-lg px-2.5 py-1.5 text-sm text-ink-secondary transition-colors hover:bg-accent-soft hover:text-ink';
const navActive = 'bg-accent-soft font-medium text-ink';

export function AppHeader() {
  const { user, logout, loading } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-elevated/80 backdrop-blur-xl dark:bg-elevated/70">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3.5 md:px-8">
        <Link
          href="/"
          className="text-[15px] font-semibold tracking-tight text-ink"
        >
          NUGABOX
          <span className="ml-1.5 font-normal text-ink-tertiary">Support</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {user && (
            <>
              <Link
                href="/support-posts"
                className={`${navBase} ${pathname.startsWith('/support-posts') && pathname !== '/support-posts/new' ? navActive : ''}`}
              >
                문의
              </Link>
              <Link
                href="/support-posts/new"
                className={`${navBase} ${pathname === '/support-posts/new' ? navActive : ''}`}
              >
                등록
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
            <span className="ml-4 max-w-[140px] truncate text-xs text-ink-tertiary">
              {user ? `${user.name} · ${user.role === 'ADMIN' ? '관리자' : '회원'}` : ''}
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
            <Link href="/login" className="ui-btn-primary ml-2 py-2 text-xs">
              로그인
            </Link>
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
                <Link href="/support-posts" className={navBase} onClick={() => setOpen(false)}>
                  문의 목록
                </Link>
                <Link href="/support-posts/new" className={navBase} onClick={() => setOpen(false)}>
                  문의 등록
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
              <Link href="/login" className={navBase} onClick={() => setOpen(false)}>
                로그인
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
