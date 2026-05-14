'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { FormEvent, useCallback, useEffect, useState } from 'react';
import { apiJson, downloadBinary } from '@/lib/api';
import { RequireAuth } from '@/components/RequireAuth';
import { SafeHtml } from '@/components/SafeHtml';
import { useAuth } from '@/lib/auth';
import { CategoryBadge, StatusBadge } from '@/components/SupportPostBadges';
import { STATUS_LABEL } from '@/lib/labels';

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

  if (error) {
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
    <article className="mx-auto max-w-3xl space-y-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-ink-tertiary">
            {post.site.name}
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink">{post.title}</h1>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <CategoryBadge category={post.category} />
            <StatusBadge status={post.status} />
          </div>
        </div>
        {canManage && (
          <div className="flex shrink-0 gap-2">
            <Link
              href={`/support-posts/${id}/edit`}
              className="inline-flex items-center justify-center rounded-xl border border-line bg-elevated px-3 py-2 text-xs font-medium text-ink shadow-sm transition-colors hover:bg-elevated-hover"
            >
              수정
            </Link>
            <button
              type="button"
              onClick={() => void removePost()}
              className="inline-flex items-center justify-center rounded-xl border border-rose-300 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-800 transition-colors hover:bg-rose-100 dark:border-rose-800/60 dark:bg-rose-950/35 dark:text-rose-200 dark:hover:bg-rose-950/55"
            >
              삭제
            </button>
          </div>
        )}
      </div>

      <dl className="ui-card-muted grid gap-3 border-0 p-5 text-sm md:grid-cols-2">
        <div>
          <dt className="text-xs font-medium text-ink-tertiary">작성자</dt>
          <dd className="mt-1 text-ink">{post.author.name}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-ink-tertiary">작성일</dt>
          <dd className="mt-1 text-ink">{new Date(post.createdAt).toLocaleString('ko-KR')}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-ink-tertiary">처리일</dt>
          <dd className="mt-1 text-ink">{new Date(post.updatedAt).toLocaleDateString('ko-KR')}</dd>
        </div>
      </dl>

      {user?.role === 'ADMIN' && (
        <section className="ui-card space-y-4 p-5">
          <h2 className="text-sm font-medium text-ink">상태 (관리자)</h2>
          <select
            value={post.status}
            disabled={pending}
            onChange={(e) => void changeStatus(e.target.value)}
            className="ui-input max-w-xs py-2"
          >
            {Object.entries(STATUS_LABEL).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>

          <h2 className="pt-2 text-sm font-medium text-ink">진행내용 (관리자)</h2>
          <textarea
            value={progressDraft}
            onChange={(e) => setProgressDraft(e.target.value)}
            rows={5}
            className="ui-input"
          />
          <button
            type="button"
            disabled={pending}
            onClick={() => void saveProgress()}
            className="ui-btn-secondary py-2 text-xs"
          >
            진행내용 저장
          </button>
        </section>
      )}

      <section className="ui-card p-6">
        <h2 className="mb-3 text-sm font-medium text-ink-secondary">본문</h2>
        <SafeHtml html={post.content} />
      </section>

      <section className="ui-card p-6">
        <h2 className="mb-3 text-sm font-medium text-ink-secondary">진행내용</h2>
        {post.progressNote ? (
          <SafeHtml html={post.progressNote} />
        ) : (
          <p className="text-sm text-ink-tertiary">등록된 진행내용이 없습니다.</p>
        )}
      </section>

      <section className="ui-card space-y-3 p-6">
        <h2 className="text-sm font-medium text-ink">첨부파일</h2>
        <ul className="space-y-2 text-sm">
          {post.attachments.map((a) => (
            <li key={a.id}>
              <button
                type="button"
                className="text-ink-secondary underline decoration-line underline-offset-2 hover:text-ink"
                onClick={() => void handleDownload(a.id, a.originalName)}
              >
                {a.originalName}
              </button>
              <span className="ml-2 text-xs text-ink-tertiary">
                {(a.size / 1024).toFixed(1)} KB
              </span>
            </li>
          ))}
          {post.attachments.length === 0 && (
            <li className="text-ink-tertiary">첨부파일이 없습니다.</li>
          )}
        </ul>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-medium text-ink">상태 변경 이력</h2>
        <ul className="space-y-2 text-xs text-ink-secondary">
          {post.statusHistory.map((h) => (
            <li key={h.id}>
              {STATUS_LABEL[h.beforeStatus]} → {STATUS_LABEL[h.afterStatus]} ·{' '}
              {h.changedBy.name} · {new Date(h.changedAt).toLocaleString('ko-KR')}
            </li>
          ))}
          {post.statusHistory.length === 0 && <li>이력 없음</li>}
        </ul>
      </section>

      <section className="space-y-4 border-t border-line pt-8">
        <h2 className="text-sm font-medium text-ink">댓글</h2>
        <ul className="space-y-4">
          {post.comments.map((c) => (
            <li key={c.id} className="rounded-xl border border-line bg-canvas-subtle p-4 text-sm">
              <div className="flex justify-between text-xs text-ink-tertiary">
                <span>
                  {c.user.name} · {c.user.role === 'ADMIN' ? '관리자' : '회원'}
                </span>
                <span>{new Date(c.createdAt).toLocaleString('ko-KR')}</span>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-ink">{c.content}</p>
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

        <form onSubmit={onCommentSubmit} className="space-y-3 pt-2">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            placeholder="댓글 작성"
            className="ui-input"
          />
          <button type="submit" disabled={pending} className="ui-btn-primary py-2 text-xs disabled:opacity-50">
            댓글 등록
          </button>
        </form>
      </section>
    </article>
  );
}
