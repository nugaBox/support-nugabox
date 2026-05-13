'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/lib/auth';

/** 로그인 필요 페이지 래퍼 */
export function RequireAuth({
  children,
  adminOnly,
}: {
  children: React.ReactNode;
  adminOnly?: boolean;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace(`/login?next=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    if (adminOnly && user.role !== 'ADMIN') {
      router.replace('/support-posts');
    }
  }, [user, loading, router, adminOnly]);

  if (loading || !user) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-neutral-500">
        불러오는 중…
      </div>
    );
  }
  if (adminOnly && user.role !== 'ADMIN') return null;
  return <>{children}</>;
}
