'use client';

import { RequireAuth } from '@/components/RequireAuth';
import { SupportPostsBoard } from '@/components/SupportPostsBoard';

export default function SupportPostsPage() {
  return (
    <RequireAuth>
      <SupportPostsBoard />
    </RequireAuth>
  );
}
