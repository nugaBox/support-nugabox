'use client';

import { FormEvent, useEffect, useState } from 'react';
import { apiJson } from '@/lib/api';

type UserRow = {
  id: string;
  username: string;
  name: string;
  role: string;
  isActive: boolean;
};

export default function SettingsUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'ADMIN' | 'MEMBER'>('MEMBER');

  const load = () =>
    void apiJson<UserRow[]>('/users').then(setUsers).catch(() => undefined);

  useEffect(() => {
    load();
  }, []);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    await apiJson('/users', {
      method: 'POST',
        body: JSON.stringify({
          username,
          password,
          name,
          role,
        }),
    });
    setUsername('');
    setName('');
    setPassword('');
    load();
  }

  return (
    <div className="space-y-8">
      <section className="ui-card p-6">
        <h2 className="text-lg font-semibold tracking-tight text-ink">회원 목록</h2>
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
                <tr key={u.id} className="border-b border-line/70 last:border-0">
                  <td className="py-2.5 font-mono text-xs">{u.username}</td>
                  <td className="py-2.5">{u.name}</td>
                  <td className="py-2.5 font-mono text-xs text-ink-secondary">{u.role}</td>
                  <td className="py-2.5">{u.isActive ? '활성' : '비활성'}</td>
                  <td className="py-2.5">
                    <button
                      type="button"
                      className="ui-btn-ghost px-0 text-xs"
                      onClick={() =>
                        void apiJson(`/users/${u.id}/${u.isActive ? 'deactivate' : 'activate'}`, {
                          method: 'PATCH',
                        }).then(load)
                      }
                    >
                      {u.isActive ? '비활성화' : '활성화'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="ui-card p-6">
        <h2 className="text-lg font-semibold tracking-tight text-ink">회원 추가</h2>
        <form onSubmit={onCreate} className="mt-4 grid gap-3 md:max-w-lg">
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
          <button type="submit" className="ui-btn-primary w-fit">
            추가
          </button>
        </form>
      </section>
    </div>
  );
}
