'use client';

import { RequireAuth } from '@/components/RequireAuth';

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <div className="mx-auto max-w-lg space-y-8">{children}</div>
    </RequireAuth>
  );
}
