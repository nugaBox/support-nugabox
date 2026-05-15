'use client';

import { FormEvent, useEffect, useState } from 'react';
import { apiJson } from '@/lib/api';
import { useAuth } from '@/lib/auth';

type Me = {
  id: string;
  username: string;
  name: string;
  role: string;
  isActive: boolean;
};

export default function AccountSettingsPage() {
  const { user, refreshUser } = useAuth();
  const [me, setMe] = useState<Me | null>(null);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    void apiJson<Me>('/auth/me')
      .then((m) => {
        setMe(m);
        setName(m.name);
      })
      .catch(() => setMe(null));
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!me) return;
    setError(null);
    setOk(null);
    setPending(true);
    try {
      const body: { name?: string; password?: string } = {};
      if (name.trim() !== me.name.trim()) body.name = name.trim();
      if (password.trim()) body.password = password.trim();
      if (Object.keys(body).length === 0) {
        setError('변경된 내용이 없습니다.');
        setPending(false);
        return;
      }
      await apiJson<Me>('/auth/me', { method: 'PATCH', body: JSON.stringify(body) });
      setPassword('');
      setOk('저장되었습니다. 비밀번호를 바꾼 경우 다른 기기·탭의 로그인은 종료될 수 있습니다.');
      const m = await apiJson<Me>('/auth/me');
      setMe(m);
      setName(m.name);
      await refreshUser();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '저장에 실패했습니다.');
    } finally {
      setPending(false);
    }
  }

  if (!user) return null;

  if (!me) {
    return (
      <p className="rounded-xl border border-line bg-canvas-subtle px-4 py-12 text-center text-sm text-ink-tertiary">
        불러오는 중…
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-ink-tertiary">내 계정</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink">설정</h1>
        <p className="mt-2 text-sm text-ink-secondary">회원명과 비밀번호를 변경할 수 있습니다. 아이디는 변경할 수 없습니다.</p>
      </div>

      <form onSubmit={onSubmit} className="ui-card space-y-4 p-6">
        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/25 dark:text-red-300">
            {error}
          </p>
        )}
        {ok && (
          <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900 dark:border-emerald-800/40 dark:bg-emerald-950/30 dark:text-emerald-100">
            {ok}
          </p>
        )}

        <label className="block space-y-2">
          <span className="text-xs font-medium text-ink-secondary">아이디</span>
          <input
            type="text"
            readOnly
            value={me.username}
            className="ui-input cursor-not-allowed bg-canvas-subtle opacity-90"
            autoComplete="username"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-xs font-medium text-ink-secondary">회원명</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="ui-input"
            autoComplete="name"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-xs font-medium text-ink-secondary">새 비밀번호</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="ui-input"
            autoComplete="new-password"
            placeholder="변경할 때만 입력"
          />
        </label>

        <button type="submit" disabled={pending} className="ui-btn-primary py-2 text-sm disabled:opacity-50">
          {pending ? '저장 중…' : '저장'}
        </button>
      </form>
    </div>
  );
}
