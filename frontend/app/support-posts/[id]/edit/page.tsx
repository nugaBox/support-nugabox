'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { apiJson, apiUpload } from '@/lib/api';
import { RequireAuth } from '@/components/RequireAuth';
import { RichTextEditor } from '@/components/RichTextEditor';
import { CATEGORY_LABEL } from '@/lib/labels';

type Detail = {
  id: string;
  title: string;
  content: string;
  category: string;
  attachments: Array<{ id: string; originalName: string }>;
};

export default function EditSupportPostPage() {
  return (
    <RequireAuth>
      <Inner />
    </RequireAuth>
  );
}

function Inner() {
  const params = useParams();
  const id = String(params.id);
  const router = useRouter();

  const [post, setPost] = useState<Detail | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('FEATURE_INQUIRY');
  const [content, setContent] = useState('<p></p>');
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    void apiJson<Detail>(`/support-posts/${id}`)
      .then((p) => {
        setPost(p);
        setTitle(p.title);
        setCategory(p.category);
        setContent(p.content);
      })
      .catch(() => setError('불러오기 실패 또는 권한 없음'));
  }, [id]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setPending(true);
    try {
      await apiJson(`/support-posts/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          title: title.trim(),
          category,
          content,
        }),
      });
      const remain = post?.attachments.length ?? 0;
      const maxNew = Math.max(0, 5 - remain);
      const uploadSlice = files.slice(0, maxNew);
      if (uploadSlice.length) {
        await apiUpload(id, uploadSlice);
      }
      router.push(`/support-posts/${id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '저장 실패');
    } finally {
      setPending(false);
    }
  }

  async function removeAttachment(attId: string) {
    if (!window.confirm('첨부파일을 삭제할까요?')) return;
    await apiJson(`/attachments/${attId}`, { method: 'DELETE' });
    const p = await apiJson<Detail>(`/support-posts/${id}`);
    setPost(p);
  }

  if (error && !post) {
    return (
      <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-8 text-center text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300">
        {error}
      </p>
    );
  }
  if (!post) {
    return (
      <p className="rounded-xl border border-line bg-canvas-subtle px-4 py-12 text-center text-sm text-ink-tertiary">
        로딩 중…
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="flex justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">문의 수정</h1>
        <Link href={`/support-posts/${id}`} className="text-xs font-medium text-ink-tertiary hover:text-ink">
          ← 상세
        </Link>
      </div>

      <form onSubmit={onSubmit} className="ui-card space-y-8 p-6 md:p-8">
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
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="ui-input" />
        </label>

        <div className="space-y-2">
          <span className="text-sm font-medium text-ink-secondary">본문</span>
          <RichTextEditor key={post.id} value={content} onChange={setContent} />
        </div>

        <section className="space-y-3 rounded-xl border border-line bg-canvas-subtle p-4">
          <h2 className="text-sm font-medium text-ink">기존 첨부 ({post.attachments.length}/5)</h2>
          <ul className="space-y-2 text-sm text-ink">
            {post.attachments.map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-2">
                <span>{a.originalName}</span>
                <button
                  type="button"
                  className="text-xs font-medium text-ink-tertiary underline hover:text-red-600"
                  onClick={() => void removeAttachment(a.id)}
                >
                  삭제
                </button>
              </li>
            ))}
          </ul>
        </section>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-ink-secondary">
            새 첨부 추가 (합계 최대 5개 — 현재 {post.attachments.length}개)
          </span>
          <input
            type="file"
            multiple
            onChange={(e) =>
              setFiles(Array.from(e.target.files ?? []).slice(0, 5 - post.attachments.length))
            }
            className="text-sm text-ink-secondary file:mr-3 file:rounded-lg file:border-0 file:bg-accent-soft file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-ink"
          />
        </label>

        {error && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/25 dark:text-red-300">
            {error}
          </p>
        )}

        <button type="submit" disabled={pending} className="ui-btn-primary">
          {pending ? '저장 중…' : '저장'}
        </button>
      </form>
    </div>
  );
}
