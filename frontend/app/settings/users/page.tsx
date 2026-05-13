'use client';

import { FormEvent, useEffect, useState } from 'react';
import { apiJson } from '@/lib/api';

type UserRow = {
  id: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
};

export default function SettingsUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [email, setEmail] = useState('');
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
        email,
        password,
        name,
        role,
      }),
    });
    setEmail('');
    setName('');
    setPassword('');
    load();
  }

  return (
    <div className="space-y-10">
      <section>
        <h2 className="text-lg font-medium">회원 목록</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-800">
                <th className="py-2">이메일</th>
                <th className="py-2">이름</th>
                <th className="py-2">역할</th>
                <th className="py-2">상태</th>
                <th className="py-2">작업</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-neutral-100 dark:border-neutral-900">
                  <td className="py-2">{u.email}</td>
                  <td className="py-2">{u.name}</td>
                  <td className="py-2">{u.role}</td>
                  <td className="py-2">{u.isActive ? '활성' : '비활성'}</td>
                  <td className="py-2 space-x-2">
                    <button
                      type="button"
                      className="text-xs underline"
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

      <section>
        <h2 className="text-lg font-medium">회원 추가</h2>
        <form onSubmit={onCreate} className="mt-4 grid gap-3 md:max-w-lg">
          <input
            type="email"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="rounded border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-600"
          />
          <input
            placeholder="이름"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="rounded border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-600"
          />
          <input
            type="password"
            placeholder="비밀번호 (8자 이상)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="rounded border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-600"
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as 'ADMIN' | 'MEMBER')}
            className="rounded border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-600"
          >
            <option value="MEMBER">MEMBER</option>
            <option value="ADMIN">ADMIN</option>
          </select>
          <button type="submit" className="rounded border px-4 py-2 text-sm">
            추가
          </button>
        </form>
      </section>
    </div>
  );
}
