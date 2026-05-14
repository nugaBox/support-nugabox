'use client';

import { FormEvent, useEffect, useState } from 'react';
import { apiJson } from '@/lib/api';
import { Modal } from '@/components/Modal';

type Site = {
  id: string;
  name: string;
  code: string;
  description: string | null;
  isActive: boolean;
};

export default function SettingsSitesPage() {
  const [sites, setSites] = useState<Site[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [desc, setDesc] = useState('');

  const load = () =>
    void apiJson<Site[]>('/sites').then(setSites).catch(() => undefined);

  useEffect(() => {
    load();
  }, []);

  function closeModal() {
    setModalOpen(false);
    setFormError(null);
    setName('');
    setCode('');
    setDesc('');
  }

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    try {
      await apiJson('/sites', {
        method: 'POST',
        body: JSON.stringify({
          name,
          code,
          description: desc || undefined,
          isActive: true,
        }),
      });
      closeModal();
      load();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : '추가에 실패했습니다.');
    }
  }

  return (
    <div className="space-y-8">
      <section className="ui-card p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold tracking-tight text-ink">사이트 목록</h2>
          <button type="button" onClick={() => setModalOpen(true)} className="settings-btn w-full sm:w-auto">
            사이트 추가
          </button>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm text-ink">
            <thead>
              <tr className="border-b border-line text-ink-secondary">
                <th className="py-2.5 font-medium">이름</th>
                <th className="py-2.5 font-medium">코드</th>
                <th className="py-2.5 font-medium">상태</th>
                <th className="py-2.5 font-medium">작업</th>
              </tr>
            </thead>
            <tbody>
              {sites.map((s) => (
                <tr key={s.id} className="border-b border-line/70 last:border-0">
                  <td className="py-2.5">{s.name}</td>
                  <td className="py-2.5 font-mono text-xs text-ink-secondary">{s.code}</td>
                  <td className="py-2.5">{s.isActive ? '활성화' : '비활성화'}</td>
                  <td className="py-2.5">
                    <div className="flex flex-wrap gap-2">
                      {s.isActive ? (
                        <button
                          type="button"
                          className="settings-btn"
                          onClick={() =>
                            void apiJson(`/sites/${s.id}`, {
                              method: 'PATCH',
                              body: JSON.stringify({ isActive: false }),
                            }).then(load)
                          }
                        >
                          비활성화
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="settings-btn"
                          onClick={() =>
                            void apiJson(`/sites/${s.id}`, {
                              method: 'PATCH',
                              body: JSON.stringify({ isActive: true }),
                            }).then(load)
                          }
                        >
                          활성화
                        </button>
                      )}
                      <button
                        type="button"
                        className="settings-btn-danger"
                        onClick={() =>
                          window.confirm(
                            '이 사이트를 아카이브할까요? 목록에서는 보이지 않으며 DB에는 그대로 보관됩니다.',
                          ) &&
                          void apiJson(`/sites/${s.id}`, { method: 'DELETE' }).then(load)
                        }
                      >
                        아카이브
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <Modal open={modalOpen} title="사이트 추가" onClose={closeModal}>
        <form onSubmit={onCreate} className="grid gap-3">
          {formError && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/25 dark:text-red-300">
              {formError}
            </p>
          )}
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
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={closeModal} className="ui-btn-ghost px-4 py-2 text-xs">
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
