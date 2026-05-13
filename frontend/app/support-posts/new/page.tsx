'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { apiJson, apiUpload } from '@/lib/api';
import { RequireAuth } from '@/components/RequireAuth';
import { RichTextEditor } from '@/components/RichTextEditor';
import { CATEGORY_LABEL } from '@/lib/labels';

type Site = { id: string; name: string; code: string };

export default function NewSupportPostPage() {
  return (
    <RequireAuth>
      <Inner />
    </RequireAuth>
  );
}

function Inner() {
  const router = useRouter();
  const [sites, setSites] = useState<Site[]>([]);
  const [siteId, setSiteId] = useState('');
  const [category, setCategory] = useState('FEATURE_INQUIRY');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('<p></p>');
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
      const created = await apiJson<{ id: string }>('/support-posts', {
        method: 'POST',
        body: JSON.stringify({
          siteId,
          title: title.trim(),
          content,
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
    <div className="mx-auto max-w-3xl space-y-8 py-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">문의 등록</h1>
        <Link href="/support-posts" className="text-xs text-neutral-500 hover:underline">
          목록
        </Link>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <fieldset className="space-y-3">
          <legend className="text-sm font-medium">사이트</legend>
          <div className="flex flex-col gap-2">
            {sites.map((s) => (
              <label key={s.id} className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="site"
                  value={s.id}
                  checked={siteId === s.id}
                  onChange={() => setSiteId(s.id)}
                />
                <span>
                  {s.name}{' '}
                  <span className="text-neutral-500">({s.code})</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <label className="block space-y-1">
          <span className="text-sm">분류</span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-md border border-neutral-300 bg-transparent px-3 py-2 text-sm dark:border-neutral-600"
          >
            {Object.entries(CATEGORY_LABEL).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </label>

        <label className="block space-y-1">
          <span className="text-sm">제목</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-md border border-neutral-300 bg-transparent px-3 py-2 text-sm dark:border-neutral-600"
            maxLength={300}
          />
        </label>

        <div className="space-y-1">
          <span className="text-sm">본문</span>
          <RichTextEditor value={content} onChange={setContent} />
        </div>

        <label className="block space-y-1">
          <span className="text-sm">첨부파일 (최대 5개)</span>
          <input
            type="file"
            multiple
            onChange={(e) => setFiles(Array.from(e.target.files ?? []).slice(0, 5))}
            className="text-sm"
          />
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="rounded-md border border-neutral-900 px-6 py-2 text-sm dark:border-white disabled:opacity-50"
        >
          {pending ? '등록 중…' : '등록'}
        </button>
      </form>
    </div>
  );
}
