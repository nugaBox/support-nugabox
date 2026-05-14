'use client';

import { FormEvent, Fragment, useEffect, useState } from 'react';
import { apiJson } from '@/lib/api';
import { Modal } from '@/components/Modal';

type UserRow = {
  id: string;
  username: string;
  name: string;
  role: string;
  isActive: boolean;
};

type SiteShort = { id: string; name: string; code: string };

export default function SettingsUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [sites, setSites] = useState<SiteShort[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selection, setSelection] = useState<Record<string, boolean>>({});
  const [modalOpen, setModalOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'ADMIN' | 'MEMBER'>('MEMBER');
  const [savingMap, setSavingMap] = useState(false);

  const loadUsers = () =>
    void apiJson<UserRow[]>('/users').then(setUsers).catch(() => undefined);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    void apiJson<SiteShort[]>('/sites').then(setSites).catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!expandedId || sites.length === 0) return;
    void apiJson<SiteShort[]>(`/users/${expandedId}/sites`)
      .then((mapped) => {
        const next: Record<string, boolean> = {};
        sites.forEach((s) => {
          next[s.id] = mapped.some((m) => m.id === s.id);
        });
        setSelection(next);
      })
      .catch(() => undefined);
  }, [expandedId, sites]);

  function closeUserModal() {
    setModalOpen(false);
    setFormError(null);
    setUsername('');
    setName('');
    setPassword('');
    setRole('MEMBER');
  }

  async function onCreateUser(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    try {
      await apiJson('/users', {
        method: 'POST',
        body: JSON.stringify({
          username,
          password,
          name,
          role,
        }),
      });
      closeUserModal();
      loadUsers();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : '추가에 실패했습니다.');
    }
  }

  async function saveMapping(userId: string) {
    const siteIds = sites.filter((s) => selection[s.id]).map((s) => s.id);
    setSavingMap(true);
    try {
      await apiJson(`/users/${userId}/sites`, {
        method: 'PUT',
        body: JSON.stringify({ siteIds }),
      });
      alert('저장되었습니다.');
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : '저장에 실패했습니다.');
    } finally {
      setSavingMap(false);
    }
  }

  return (
    <div className="space-y-8">
      <section className="ui-card p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold tracking-tight text-ink">회원 목록</h2>
          <button type="button" onClick={() => setModalOpen(true)} className="settings-btn w-full sm:w-auto">
            회원 추가
          </button>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm text-ink">
            <thead>
              <tr className="border-b border-line text-ink-secondary">
                <th className="py-2.5 font-medium">아이디</th>
                <th className="py-2.5 font-medium">이름</th>
                <th className="py-2.5 font-medium">역할</th>
                <th className="py-2.5 font-medium">상태</th>
                <th className="py-2.5 font-medium">작업</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <Fragment key={u.id}>
                  <tr
                    className={`cursor-pointer border-b border-line/70 transition-colors last:border-0 hover:bg-canvas-subtle/60 ${
                      expandedId === u.id ? 'bg-canvas-subtle/40' : ''
                    }`}
                    onClick={() => setExpandedId(expandedId === u.id ? null : u.id)}
                  >
                    <td className="py-2.5 font-mono text-xs">{u.username}</td>
                    <td className="py-2.5">{u.name}</td>
                    <td className="py-2.5 font-mono text-xs text-ink-secondary">{u.role}</td>
                    <td className="py-2.5">{u.isActive ? '활성' : '비활성'}</td>
                    <td className="py-2.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        className="settings-btn"
                        onClick={() =>
                          void apiJson(`/users/${u.id}/${u.isActive ? 'deactivate' : 'activate'}`, {
                            method: 'PATCH',
                          }).then(loadUsers)
                        }
                      >
                        {u.isActive ? '비활성화' : '활성화'}
                      </button>
                    </td>
                  </tr>
                  {expandedId === u.id && (
                    <tr className="border-b border-line/70 bg-canvas-subtle/50 last:border-0">
                      <td colSpan={5} className="px-4 py-5">
                        <p className="text-xs font-medium text-ink-secondary">사이트 매핑</p>
                        <p className="mt-1 text-xs text-ink-tertiary">
                          접속 가능한 사이트를 선택한 뒤 저장하세요.
                        </p>
                        <div className="mt-4 grid gap-2 sm:max-w-xl">
                          {sites.map((s) => (
                            <label
                              key={s.id}
                              className="flex cursor-pointer items-center gap-3 rounded-xl border border-line bg-elevated px-3 py-2 text-sm text-ink"
                            >
                              <input
                                type="checkbox"
                                className="size-4 rounded border-line accent-zinc-900 dark:accent-zinc-100"
                                checked={!!selection[s.id]}
                                onChange={(e) =>
                                  setSelection((prev) => ({ ...prev, [s.id]: e.target.checked }))
                                }
                              />
                              <span>
                                {s.name}{' '}
                                <span className="font-mono text-xs text-ink-secondary">({s.code})</span>
                              </span>
                            </label>
                          ))}
                        </div>
                        <button
                          type="button"
                          disabled={savingMap}
                          className="settings-btn mt-4"
                          onClick={() => void saveMapping(u.id)}
                        >
                          {savingMap ? '저장 중…' : '매핑 저장'}
                        </button>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <Modal open={modalOpen} title="회원 추가" onClose={closeUserModal}>
        <form onSubmit={onCreateUser} className="grid gap-3">
          {formError && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/25 dark:text-red-300">
              {formError}
            </p>
          )}
          <input
            type="text"
            placeholder="아이디 (영문·숫자·._-)"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="ui-input"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            autoComplete="off"
          />
          <input
            placeholder="이름"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="ui-input"
          />
          <input
            type="password"
            placeholder="비밀번호 (8자 이상)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="ui-input"
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as 'ADMIN' | 'MEMBER')}
            className="ui-input"
          >
            <option value="MEMBER">MEMBER</option>
            <option value="ADMIN">ADMIN</option>
          </select>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={closeUserModal} className="ui-btn-ghost px-4 py-2 text-xs">
              취소
            </button>
            <button type="submit" className="ui-btn-primary px-4 py-2 text-xs">
              추가
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
