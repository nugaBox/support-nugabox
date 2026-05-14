'use client';

import { FormEvent, useEffect, useState } from 'react';
import { apiJson } from '@/lib/api';

type Site = {
  id: string;
  name: string;
  code: string;
  description: string | null;
  isActive: boolean;
};

export default function SettingsSitesPage() {
  const [sites, setSites] = useState<Site[]>([]);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [desc, setDesc] = useState('');

  const load = () =>
    void apiJson<Site[]>('/sites').then(setSites).catch(() => undefined);

  useEffect(() => {
    load();
  }, []);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    await apiJson('/sites', {
      method: 'POST',
      body: JSON.stringify({
        name,
        code,
        description: desc || undefined,
        isActive: true,
      }),
    });
    setName('');
    setCode('');
    setDesc('');
    load();
  }

  return (
    <div className="space-y-8">
      <section className="ui-card p-6">
        <h2 className="text-lg font-semibold tracking-tight text-ink">사이트 목록</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm text-ink">
            <thead>
              <tr className="border-b border-line text-ink-secondary">
                <th className="py-2.5 font-medium">이름</th>
                <th className="py-2.5 font-medium">코드</th>
                <th className="py-2.5 font-medium">활성</th>
                <th className="py-2.5 font-medium">작업</th>
              </tr>
            </thead>
            <tbody>
              {sites.map((s) => (
                <tr key={s.id} className="border-b border-line/70 last:border-0">
                  <td className="py-2.5">{s.name}</td>
                  <td className="py-2.5 font-mono text-xs text-ink-secondary">{s.code}</td>
                  <td className="py-2.5">{s.isActive ? '예' : '아니오'}</td>
                  <td className="py-2.5">
                    <button
                      type="button"
                      className="ui-btn-ghost px-0 text-xs"
                      onClick={() =>
                        void apiJson(`/sites/${s.id}`, {
                          method: 'PATCH',
                          body: JSON.stringify({ isActive: !s.isActive }),
                        }).then(load)
                      }
                    >
                      토글
                    </button>{' '}
                    <button
                      type="button"
                      className="text-xs font-medium text-red-600 hover:text-red-700 dark:text-red-400"
                      onClick={() =>
                        window.confirm('삭제(비활성·소프트삭제)할까요?') &&
                        void apiJson(`/sites/${s.id}`, { method: 'DELETE' }).then(load)
                      }
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="ui-card p-6">
        <h2 className="text-lg font-semibold tracking-tight text-ink">사이트 추가</h2>
        <form onSubmit={onCreate} className="mt-4 grid gap-3 md:max-w-lg">
          <input
            placeholder="사이트명"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="ui-input"
          />
          <input
            placeholder="코드 (예: SITE-C)"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
            className="ui-input"
          />
          <input
            placeholder="설명 (선택)"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            className="ui-input"
          />
          <button type="submit" className="ui-btn-primary w-fit">
            추가
          </button>
        </form>
      </section>
    </div>
  );
}
