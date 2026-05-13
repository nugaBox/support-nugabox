'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { FormEvent, useCallback, useEffect, useState } from 'react';
import { apiJson, downloadBinary } from '@/lib/api';
import { RequireAuth } from '@/components/RequireAuth';
import { SafeHtml } from '@/components/SafeHtml';
import { useAuth } from '@/lib/auth';
import { CATEGORY_LABEL, STATUS_LABEL } from '@/lib/labels';

type Detail = {
  id: string;
  title: string;
  content: string;
  category: string;
  status: string;
  progressNote: string | null;
  site: { id: string; name: string; code: string };
  author: { id: string; name: string; role: string };
  attachments: Array<{
    id: string;
    originalName: string;
    mimeType: string;
    size: number;
    createdAt: string;
  }>;
  comments: Array<{
    id: string;
    content: string;
    createdAt: string;
    updatedAt: string;
    user: { id: string; name: string; role: string };
  }>;
  statusHistory: Array<{
    id: string;
    beforeStatus: string;
    afterStatus: string;
    changedAt: string;
    changedBy: { id: string; name: string };
  }>;
  createdAt: string;
  updatedAt: string;
};

export default function SupportPostDetailPage() {
  return (
    <RequireAuth>
      <Inner />
    </RequireAuth>
  );
}

function Inner() {
  const params = useParams();
  const id = String(params.id);
  const { user } = useAuth();
  const router = useRouter();

  const [post, setPost] = useState<Detail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [comment, setComment] = useState('');
  const [progressDraft, setProgressDraft] = useState('');
  const [pending, setPending] = useState(false);

  const load = useCallback(async () => {
    try {
      setError(null);
      const d = await apiJson<Detail>(`/support-posts/${id}`);
      setPost(d);
      setProgressDraft(d.progressNote ?? '');
    } catch {
      setError('글을 불러오지 못했거나 접근 권한이 없습니다.');
      setPost(null);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const canManage =
    user?.role === 'ADMIN' || (post && user?.id === post.author.id);

  async function onCommentSubmit(e: FormEvent) {
    e.preventDefault();
    if (!comment.trim()) return;
    setPending(true);
    try {
      await apiJson(`/support-posts/${id}/comments`, {
        method: 'POST',
        body: JSON.stringify({ content: comment }),
      });
      setComment('');
      await load();
    } finally {
      setPending(false);
    }
  }

  async function changeStatus(next: string) {
    setPending(true);
    try {
      await apiJson(`/support-posts/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: next }),
      });
      await load();
    } finally {
      setPending(false);
    }
  }

  async function saveProgress() {
    setPending(true);
    try {
      await apiJson(`/support-posts/${id}/progress-note`, {
        method: 'PATCH',
        body: JSON.stringify({ progressNote: progressDraft }),
      });
      await load();
    } finally {
      setPending(false);
    }
  }

  async function removePost() {
    if (!window.confirm('삭제할까요?')) return;
    await apiJson(`/support-posts/${id}`, { method: 'DELETE' });
    router.push('/support-posts');
  }

  async function handleDownload(attId: string, name: string) {
    const blob = await downloadBinary(`/attachments/${attId}/download`);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (error || !post) {
    return <p className="py-12 text-center text-sm text-red-600">{error ?? '로딩 중…'}</p>;
  }

  return (
    <article className="mx-auto max-w-3xl space-y-10 py-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-neutral-500">
            {post.site.name}
          </p>
          <h1 className="mt-2 text-2xl font-semibold">{post.title}</h1>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <Badge>{CATEGORY_LABEL[post.category] ?? post.category}</Badge>
            <Badge>{STATUS_LABEL[post.status] ?? post.status}</Badge>
          </div>
        </div>
        {canManage && (
          <div className="flex gap-2">
            <Link
              href={`/support-posts/${id}/edit`}
              className="rounded border border-neutral-400 px-3 py-1 text-xs dark:border-neutral-600"
            >
              수정
            </Link>
            <button
              type="button"
              onClick={() => void removePost()}
              className="rounded border border-red-600 px-3 py-1 text-xs text-red-700 dark:text-red-400"
            >
              삭제
            </button>
          </div>
        )}
      </div>

      <dl className="grid gap-2 border-y border-neutral-200 py-4 text-sm dark:border-neutral-800 md:grid-cols-2">
        <div>
          <dt className="text-neutral-500">작성자</dt>
          <dd>{post.author.name}</dd>
        </div>
        <div>
          <dt className="text-neutral-500">작성일</dt>
          <dd>{new Date(post.createdAt).toLocaleString('ko-KR')}</dd>
        </div>
        <div>
          <dt className="text-neutral-500">수정일</dt>
          <dd>{new Date(post.updatedAt).toLocaleString('ko-KR')}</dd>
        </div>
      </dl>

      {user?.role === 'ADMIN' && (
        <section className="space-y-3 rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
          <h2 className="text-sm font-medium">상태 (관리자)</h2>
          <select
            value={post.status}
            disabled={pending}
            onChange={(e) => void changeStatus(e.target.value)}
            className="w-full max-w-xs rounded border border-neutral-300 bg-transparent px-2 py-1 text-sm dark:border-neutral-600"
          >
            {Object.entries(STATUS_LABEL).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>

          <h2 className="pt-4 text-sm font-medium">진행내용 (관리자)</h2>
          <textarea
            value={progressDraft}
            onChange={(e) => setProgressDraft(e.target.value)}
            rows={5}
            className="w-full rounded border border-neutral-300 bg-transparent px-3 py-2 text-sm dark:border-neutral-600"
          />
          <button
            type="button"
            disabled={pending}
            onClick={() => void saveProgress()}
            className="rounded border px-3 py-1 text-xs"
          >
            진행내용 저장
          </button>
        </section>
      )}

      <section>
        <h2 className="mb-2 text-sm font-medium text-neutral-600 dark:text-neutral-400">본문</h2>
        <SafeHtml html={post.content} />
      </section>

      <section>
        <h2 className="mb-2 text-sm font-medium text-neutral-600 dark:text-neutral-400">
          진행내용
        </h2>
        {post.progressNote ? (
          <SafeHtml html={post.progressNote} />
        ) : (
          <p className="text-sm text-neutral-500">등록된 진행내용이 없습니다.</p>
        )}
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-medium">첨부파일</h2>
        <ul className="space-y-2 text-sm">
          {post.attachments.map((a) => (
            <li key={a.id}>
              <button
                type="button"
                className="underline underline-offset-2"
                onClick={() => void handleDownload(a.id, a.originalName)}
              >
                {a.originalName}
              </button>
              <span className="ml-2 text-xs text-neutral-500">
                {(a.size / 1024).toFixed(1)} KB
              </span>
            </li>
          ))}
          {post.attachments.length === 0 && (
            <li className="text-neutral-500">첨부파일이 없습니다.</li>
          )}
        </ul>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-medium">상태 변경 이력</h2>
        <ul className="space-y-2 text-xs text-neutral-600 dark:text-neutral-400">
          {post.statusHistory.map((h) => (
            <li key={h.id}>
              {STATUS_LABEL[h.beforeStatus]} → {STATUS_LABEL[h.afterStatus]} ·{' '}
              {h.changedBy.name} · {new Date(h.changedAt).toLocaleString('ko-KR')}
            </li>
          ))}
          {post.statusHistory.length === 0 && <li>이력 없음</li>}
        </ul>
      </section>

      <section className="space-y-4 border-t border-neutral-200 pt-6 dark:border-neutral-800">
        <h2 className="text-sm font-medium">댓글</h2>
        <ul className="space-y-4">
          {post.comments.map((c) => (
            <li key={c.id} className="rounded border border-neutral-200 p-3 text-sm dark:border-neutral-800">
              <div className="flex justify-between text-xs text-neutral-500">
                <span>
                  {c.user.name} · {c.user.role === 'ADMIN' ? '관리자' : '회원'}
                </span>
                <span>{new Date(c.createdAt).toLocaleString('ko-KR')}</span>
              </div>
              <p className="mt-2 whitespace-pre-wrap">{c.content}</p>
              {(user?.role === 'ADMIN' || user?.id === c.user.id) && (
                <div className="mt-2 flex gap-2 text-xs">
                  <button
                    type="button"
                    className="underline"
                    onClick={() => {
                      const next = window.prompt('댓글 수정', c.content);
                      if (next === null) return;
                      void apiJson(`/comments/${c.id}`, {
                        method: 'PATCH',
                        body: JSON.stringify({ content: next }),
                      }).then(() => load());
                    }}
                  >
                    수정
                  </button>
                  <button
                    type="button"
                    className="underline text-red-600"
                    onClick={() => {
                      if (!window.confirm('댓글을 삭제할까요?')) return;
                      void apiJson(`/comments/${c.id}`, { method: 'DELETE' }).then(() =>
                        load(),
                      );
                    }}
                  >
                    삭제
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>

        <form onSubmit={onCommentSubmit} className="space-y-2">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            placeholder="댓글 작성"
            className="w-full rounded border border-neutral-300 bg-transparent px-3 py-2 text-sm dark:border-neutral-600"
          />
          <button
            type="submit"
            disabled={pending}
            className="rounded border px-3 py-1 text-xs disabled:opacity-50"
          >
            댓글 등록
          </button>
        </form>
      </section>
    </article>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block rounded border border-neutral-300 px-2 py-0.5 dark:border-neutral-600">
      {children}
    </span>
  );
}
