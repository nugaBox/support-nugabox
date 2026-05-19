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

type LoginTokenStatus = {
  hasToken: boolean;
  createdAt?: string;
  expiresAt?: string | null;
  lastUsedAt?: string | null;
};

type IssuedLoginToken = {
  token: string;
  loginUrl: string;
  expiresAt: string | null;
};

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
  const [tokenModalUser, setTokenModalUser] = useState<UserRow | null>(null);
  const [issuedToken, setIssuedToken] = useState<IssuedLoginToken | null>(null);
  const [tokenStatusMap, setTokenStatusMap] = useState<Record<string, LoginTokenStatus>>({});
  const [tokenLoadingId, setTokenLoadingId] = useState<string | null>(null);

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

  async function loadTokenStatus(userId: string) {
    try {
      const status = await apiJson<LoginTokenStatus>(`/users/${userId}/login-token`);
      setTokenStatusMap((prev) => ({ ...prev, [userId]: status }));
      return status;
    } catch {
      return null;
    }
  }

  async function issueLoginToken(user: UserRow) {
    if (!user.isActive) {
      alert('비활성화된 회원에게는 로그인 링크를 발급할 수 없습니다.');
      return;
    }
    if (
      !window.confirm(
        `${user.name}(${user.username}) 회원의 로그인 링크를 ${tokenStatusMap[user.id]?.hasToken ? '재발급' : '발급'}할까요? 기존 링크는 더 이상 사용할 수 없습니다.`,
      )
    ) {
      return;
    }
    setTokenLoadingId(user.id);
    try {
      const res = await apiJson<IssuedLoginToken>(`/users/${user.id}/login-token`, { method: 'POST' });
      setIssuedToken(res);
      setTokenModalUser(user);
      await loadTokenStatus(user.id);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : '발급에 실패했습니다.');
    } finally {
      setTokenLoadingId(null);
    }
  }

  async function revokeLoginToken(user: UserRow) {
    if (!window.confirm(`${user.name} 회원의 로그인 링크를 폐기할까요?`)) return;
    setTokenLoadingId(user.id);
    try {
      await apiJson(`/users/${user.id}/login-token`, { method: 'DELETE' });
      setTokenStatusMap((prev) => ({ ...prev, [user.id]: { hasToken: false } }));
      alert('로그인 링크가 폐기되었습니다.');
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : '폐기에 실패했습니다.');
    } finally {
      setTokenLoadingId(null);
    }
  }

  function closeTokenModal() {
    setTokenModalUser(null);
    setIssuedToken(null);
  }

  async function copyLoginUrl(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      alert('로그인 URL이 복사되었습니다.');
    } catch {
      alert('복사에 실패했습니다. URL을 직접 선택해 복사하세요.');
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
                    onClick={() => {
                      const next = expandedId === u.id ? null : u.id;
                      setExpandedId(next);
                      if (next) void loadTokenStatus(next);
                    }}
                  >
                    <td className="py-2.5 font-mono text-xs">{u.username}</td>
                    <td className="py-2.5">{u.name}</td>
                    <td className="py-2.5 font-mono text-xs text-ink-secondary">{u.role}</td>
                    <td className="py-2.5">{u.isActive ? '활성화' : '비활성화'}</td>
                    <td className="py-2.5" onClick={(e) => e.stopPropagation()}>
                      <div className="flex flex-wrap gap-2">
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
                        <button
                          type="button"
                          className="settings-btn"
                          disabled={tokenLoadingId === u.id}
                          onClick={() => void issueLoginToken(u)}
                        >
                          {tokenLoadingId === u.id ? '처리 중…' : '로그인 링크 발급'}
                        </button>
                        {tokenStatusMap[u.id]?.hasToken && (
                          <button
                            type="button"
                            className="settings-btn"
                            disabled={tokenLoadingId === u.id}
                            onClick={() => void revokeLoginToken(u)}
                          >
                            로그인 링크 폐기
                          </button>
                        )}
                        <button
                          type="button"
                          className="settings-btn"
                          onClick={() =>
                            window.confirm(
                              `비밀번호를 아이디(${u.username})와 동일하게 초기화합니다. 기존에 로그인된 세션은 모두 끊깁니다. 계속할까요?`,
                            ) &&
                            void apiJson(`/users/${u.id}/reset-password`, { method: 'PATCH' }).then(
                              () => {
                                alert('비밀번호가 초기화되었습니다.');
                                loadUsers();
                              },
                            )
                          }
                        >
                          비밀번호 초기화
                        </button>
                        <button
                          type="button"
                          className="settings-btn-danger"
                          onClick={() =>
                            window.confirm(
                              '이 회원을 아카이브할까요? 목록에서는 보이지 않으며 DB에는 그대로 보관됩니다. 로그인도 불가능해집니다.',
                            ) &&
                            void apiJson(`/users/${u.id}`, { method: 'DELETE' }).then(() => {
                              setExpandedId((cur) => (cur === u.id ? null : cur));
                              loadUsers();
                            })
                          }
                        >
                          아카이브
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedId === u.id && (
                    <tr className="border-b border-line/70 bg-canvas-subtle/50 last:border-0">
                      <td colSpan={5} className="px-4 py-5">
                        <p className="text-xs font-medium text-ink-secondary">사이트 매핑</p>
                        <p className="mt-1 text-xs text-ink-tertiary">
                          접속 가능한 사이트를 선택한 뒤 저장하세요.
                        </p>
                        {tokenStatusMap[u.id]?.hasToken && (
                          <p className="mt-3 text-xs text-ink-secondary">
                            로그인 링크 발급됨
                            {tokenStatusMap[u.id]?.lastUsedAt
                              ? ` · 마지막 사용 ${new Date(tokenStatusMap[u.id]!.lastUsedAt!).toLocaleString('ko-KR')}`
                              : ' · 아직 미사용'}
                            {tokenStatusMap[u.id]?.expiresAt
                              ? ` · 만료 ${new Date(tokenStatusMap[u.id]!.expiresAt!).toLocaleString('ko-KR')}`
                              : ' · 만료 없음'}
                          </p>
                        )}
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

      <Modal open={!!tokenModalUser && !!issuedToken} title="로그인 링크 발급" onClose={closeTokenModal}>
        {issuedToken && tokenModalUser && (
          <div className="space-y-4">
            <p className="text-sm text-ink-secondary">
              <span className="font-medium text-ink">{tokenModalUser.name}</span> 회원이 아래 URL로 접속하면
              자동 로그인됩니다. 링크는 외부에 노출되지 않도록 주의하세요.
            </p>
            <label className="block space-y-2">
              <span className="text-xs font-medium text-ink-secondary">로그인 URL</span>
              <input
                readOnly
                value={issuedToken.loginUrl}
                className="ui-input font-mono text-xs"
                onFocus={(e) => e.target.select()}
              />
            </label>
            {issuedToken.expiresAt && (
              <p className="text-xs text-ink-tertiary">
                만료: {new Date(issuedToken.expiresAt).toLocaleString('ko-KR')}
              </p>
            )}
            <div className="flex flex-wrap justify-end gap-2 pt-2">
              <button
                type="button"
                className="ui-btn-ghost px-4 py-2 text-xs"
                onClick={closeTokenModal}
              >
                닫기
              </button>
              <button
                type="button"
                className="ui-btn-primary px-4 py-2 text-xs"
                onClick={() => void copyLoginUrl(issuedToken.loginUrl)}
              >
                URL 복사
              </button>
            </div>
          </div>
        )}
      </Modal>

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
            placeholder="비밀번호"
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
