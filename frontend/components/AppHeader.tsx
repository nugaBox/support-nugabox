'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { useState } from 'react';

const navLink =
  'text-sm text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors';

export function AppHeader() {
  const { user, logout, loading } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="border-b border-neutral-200 dark:border-neutral-800 bg-[rgb(var(--surface))]/90 backdrop-blur-sm sticky top-0 z-40">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 md:px-8">
        <Link href="/" className="text-sm font-semibold tracking-tight">
          NUGABOX Support
        </Link>

        {/* 데스크탑 네비 */}
        <nav className="hidden items-center gap-6 md:flex">
          {user && (
            <>
              <Link
                href="/support-posts"
                className={`${navLink} ${pathname.startsWith('/support-posts') ? 'font-medium text-neutral-900 dark:text-white' : ''}`}
              >
                문의 목록
              </Link>
              <Link href="/support-posts/new" className={navLink}>
                문의 등록
              </Link>
              {user.role === 'ADMIN' && (
                <Link
                  href="/settings/sites"
                  className={`${navLink} ${pathname.startsWith('/settings') ? 'font-medium text-neutral-900 dark:text-white' : ''}`}
                >
                  설정
                </Link>
              )}
            </>
          )}
          {!loading && (
            <span className="text-xs text-neutral-500">
              {user ? `${user.name} · ${user.role === 'ADMIN' ? '관리자' : '회원'}` : '비로그인'}
            </span>
          )}
          {user ? (
            <button
              type="button"
              onClick={() => void logout()}
              className="rounded border border-neutral-300 px-3 py-1 text-xs dark:border-neutral-700"
            >
              로그아웃
            </button>
          ) : (
            <Link
              href="/login"
              className="rounded border border-neutral-900 px-3 py-1 text-xs dark:border-white"
            >
              로그인
            </Link>
          )}
        </nav>

        {/* 모바일 햄버거 */}
        <button
          type="button"
          className="md:hidden rounded border border-neutral-300 px-2 py-1 text-xs dark:border-neutral-700"
          aria-label="메뉴"
          onClick={() => setOpen((v) => !v)}
        >
          메뉴
        </button>
      </div>

      {open && (
        <div className="border-t border-neutral-200 bg-[rgb(var(--surface-muted))] px-4 py-4 md:hidden dark:border-neutral-800">
          <div className="flex flex-col gap-3">
            {user && (
              <>
                <Link href="/support-posts" className={navLink} onClick={() => setOpen(false)}>
                  문의 목록
                </Link>
                <Link href="/support-posts/new" className={navLink} onClick={() => setOpen(false)}>
                  문의 등록
                </Link>
                {user.role === 'ADMIN' && (
                  <Link href="/settings/sites" className={navLink} onClick={() => setOpen(false)}>
                    설정
                  </Link>
                )}
              </>
            )}
            {user ? (
              <button type="button" onClick={() => void logout()} className="text-left text-sm">
                로그아웃
              </button>
            ) : (
              <Link href="/login" className="text-sm" onClick={() => setOpen(false)}>
                로그인
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
