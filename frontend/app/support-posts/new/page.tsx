'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { apiJson, apiUpload } from '@/lib/api';
import { RequireAuth } from '@/components/RequireAuth';
import { CATEGORY_LABEL } from '@/lib/labels';

type Site = { id: string; name: string; code: string };

function plainTextToSafeHtml(plain: string): string {
  const esc = plain
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
  if (!esc.trim()) return '<p></p>';
  return esc.split('\n').join('<br>');
}

export default function NewSupportPostPage() {
  return (
    <RequireAuth>
      <Inner />
    </RequireAuth>
  );
}

function Inner() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [sites, setSites] = useState<Site[]>([]);
  const [siteId, setSiteId] = useState('');
  const [category, setCategory] = useState('FEATURE_INQUIRY');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    void apiJson<Site[]>('/me/sites')
      .then((s) => {
        setSites(s);
        if (s[0]) setSiteId(s[0].id);
      })
      .catch(() => setError('사이트 목록을 불러오지 못했습니다.'));
  }, []);

  function mergeFiles(list: FileList | null) {
    if (!list?.length) return;
    const next = [...files, ...Array.from(list)].slice(0, 5);
    setFiles(next);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!siteId) {
      setError('사이트를 선택하세요.');
      return;
    }
    if (!title.trim()) {
      setError('제목을 입력하세요.');
      return;
    }
    setError(null);
    setPending(true);
    try {
      const html = plainTextToSafeHtml(content);
      const created = await apiJson<{ id: string }>('/support-posts', {
        method: 'POST',
        body: JSON.stringify({
          siteId,
          title: title.trim(),
          content: html,
          category,
        }),
      });
      if (files.length) {
        await apiUpload(created.id, files.slice(0, 5));
      }
      router.push(`/support-posts/${created.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '등록 실패');
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">문의 등록</h1>
        <Link href="/support-posts" className="text-xs font-medium text-ink-tertiary hover:text-ink">
          ← 목록
        </Link>
      </div>

      <form onSubmit={onSubmit} className="ui-card space-y-8 p-6 md:p-8">
        <fieldset className="space-y-3">
          <legend className="text-sm font-medium text-ink">사이트</legend>
          <div className="flex flex-col gap-2">
            {sites.map((s) => (
              <label
                key={s.id}
                className="flex cursor-pointer items-center gap-3 rounded-xl border border-line bg-canvas-subtle px-3 py-2.5 text-sm transition-colors hover:border-line-strong"
              >
                <input
                  type="radio"
                  name="site"
                  value={s.id}
                  checked={siteId === s.id}
                  onChange={() => setSiteId(s.id)}
                />
                <span className="text-ink">
                  {s.name}{' '}
                  <span className="text-ink-tertiary">({s.code})</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-ink-secondary">분류</span>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="ui-input">
            {Object.entries(CATEGORY_LABEL).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-ink-secondary">제목</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="ui-input"
            maxLength={300}
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-ink-secondary">본문</span>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={12}
            className="ui-input min-h-[12rem] resize-y font-mono text-sm leading-relaxed"
            placeholder="내용을 입력하세요."
          />
        </label>

        <div className="space-y-2">
          <span className="text-sm font-medium text-ink-secondary">첨부파일 (최대 5개)</span>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="block w-full max-w-lg text-sm text-ink-secondary file:mr-3 file:rounded-lg file:border-0 file:bg-accent-soft file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-ink"
            onChange={(e) => {
              mergeFiles(e.target.files);
              e.target.value = '';
            }}
          />
          <button
            type="button"
            className="ui-btn-secondary text-xs"
            onClick={() => fileInputRef.current?.click()}
          >
            파일 추가
          </button>
          {files.length > 0 && (
            <ul className="mt-2 space-y-1 text-xs text-ink-secondary">
              {files.map((f, i) => (
                <li key={`${f.name}-${i}`}>{f.name}</li>
              ))}
            </ul>
          )}
        </div>

        {error && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/25 dark:text-red-300">
            {error}
          </p>
        )}

        <p className="text-xs text-ink-tertiary">문의 등록 시 개발자에게 자동으로 알림이 전달됩니다.</p>

        <button type="submit" disabled={pending} className="ui-btn-primary">
          {pending ? '등록 중…' : '등록'}
        </button>
      </form>
    </div>
  );
}
