'use client';

import { FormEvent, useEffect, useState } from 'react';
import { apiJson } from '@/lib/api';

type UserRow = { id: string; email: string; name: string };
type Site = { id: string; name: string; code: string };

export default function SettingsUserSitesPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [userId, setUserId] = useState('');
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  useEffect(() => {
    void apiJson<UserRow[]>('/users').then(setUsers);
    void apiJson<Site[]>('/sites').then(setSites);
  }, []);

  useEffect(() => {
    if (!userId) return;
    void apiJson<Site[]>(`/users/${userId}/sites`).then((mapped) => {
      const next: Record<string, boolean> = {};
      mapped.forEach((s) => {
        next[s.id] = true;
      });
      setSelected(next);
    });
  }, [userId]);

  async function onSave(e: FormEvent) {
    e.preventDefault();
    if (!userId) return;
    const siteIds = sites.filter((s) => selected[s.id]).map((s) => s.id);
    await apiJson(`/users/${userId}/sites`, {
      method: 'PUT',
      body: JSON.stringify({ siteIds }),
    });
    alert('저장되었습니다.');
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-medium">회원 선택 후 사이트 매핑</h2>
      <label className="block max-w-md text-sm">
        회원
        <select
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 dark:border-neutral-600"
        >
          <option value="">선택…</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name} ({u.email})
            </option>
          ))}
        </select>
      </label>

      <form onSubmit={onSave} className="space-y-3">
        <div className="grid gap-2">
          {sites.map((s) => (
            <label key={s.id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={!!selected[s.id]}
                onChange={(e) =>
                  setSelected((prev) => ({ ...prev, [s.id]: e.target.checked }))
                }
              />
              {s.name} ({s.code})
            </label>
          ))}
        </div>
        <button type="submit" className="rounded border px-4 py-2 text-sm" disabled={!userId}>
          저장
        </button>
      </form>
    </div>
  );
}
