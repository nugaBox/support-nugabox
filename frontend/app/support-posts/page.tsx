'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { apiJson } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { RequireAuth } from '@/components/RequireAuth';
import { CATEGORY_LABEL, STATUS_LABEL } from '@/lib/labels';

type Row = {
  id: string;
  title: string;
  category: string;
  status: string;
  site: { id: string; name: string };
  author: { id: string; name: string; email: string; role: string };
  createdAt: string;
  updatedAt: string;
};

type ListRes = { items: Row[]; total: number; page: number; pageSize: number };

export default function SupportPostsPage() {
  return (
    <RequireAuth>
      <SupportPostsInner />
    </RequireAuth>
  );
}

function SupportPostsInner() {
  const { user } = useAuth();
  const [data, setData] = useState<ListRes | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [siteId, setSiteId] = useState('');
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');
  const [authorId, setAuthorId] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [users, setUsers] = useState<{ id: string; name: string; email: string }[]>([]);

  const load = useCallback(
    async (overridePage?: number) => {
      setError(null);
      const p = overridePage ?? page;
      try {
        const params = new URLSearchParams();
        if (search.trim()) params.set('search', search.trim());
        if (siteId) params.set('siteId', siteId);
        if (status) params.set('status', status);
        if (category) params.set('category', category);
        if (dateFrom) params.set('dateFrom', dateFrom);
        if (dateTo) params.set('dateTo', dateTo);
        if (user?.role === 'ADMIN' && authorId) params.set('authorId', authorId);
        params.set('page', String(p));
        params.set('pageSize', '20');
        const qs = params.toString();
        const res = await apiJson<ListRes>(`/support-posts?${qs}`);
        setData(res);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : '목록 조회 실패');
      }
    },
    [search, siteId, status, category, authorId, dateFrom, dateTo, page, user?.role],
  );

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (user?.role !== 'ADMIN') return;
    void apiJson<{ id: string; name: string; email: string }[]>('/users')
      .then(setUsers)
      .catch(() => undefined);
  }, [user?.role]);

  const heading = user?.role === 'ADMIN' ? '전체 문의' : '내 문의';

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-neutral-500">{heading}</p>
          <h1 className="text-2xl font-semibold">문의 목록</h1>
        </div>
        <Link
          href="/support-posts/new"
          className="inline-flex justify-center rounded-md border border-neutral-900 px-4 py-2 text-sm dark:border-white"
        >
          문의 등록
        </Link>
      </div>

      <div className="grid gap-3 rounded-lg border border-neutral-200 p-4 dark:border-neutral-800 md:grid-cols-2 lg:grid-cols-3">
        <label className="text-xs">
          검색
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="제목·본문"
            className="mt-1 w-full rounded border border-neutral-300 bg-transparent px-2 py-1.5 dark:border-neutral-600"
          />
        </label>
        <label className="text-xs">
          사이트
          <SiteFilter value={siteId} onChange={setSiteId} />
        </label>
        <label className="text-xs">
          상태
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="mt-1 w-full rounded border border-neutral-300 bg-transparent px-2 py-1.5 dark:border-neutral-600"
          >
            <option value="">전체</option>
            {Object.entries(STATUS_LABEL).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs">
          분류
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-1 w-full rounded border border-neutral-300 bg-transparent px-2 py-1.5 dark:border-neutral-600"
          >
            <option value="">전체</option>
            {Object.entries(CATEGORY_LABEL).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs">
          작성일(from)
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="mt-1 w-full rounded border border-neutral-300 bg-transparent px-2 py-1.5 dark:border-neutral-600"
          />
        </label>
        <label className="text-xs">
          작성일(to)
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="mt-1 w-full rounded border border-neutral-300 bg-transparent px-2 py-1.5 dark:border-neutral-600"
          />
        </label>
        {user?.role === 'ADMIN' && (
          <label className="text-xs md:col-span-2">
            작성자
            <select
              value={authorId}
              onChange={(e) => setAuthorId(e.target.value)}
              className="mt-1 w-full rounded border border-neutral-300 bg-transparent px-2 py-1.5 dark:border-neutral-600"
            >
              <option value="">전체</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.email})
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => {
            setPage(1);
            void load(1);
          }}
          className="rounded border border-neutral-400 px-3 py-1 text-xs dark:border-neutral-600"
        >
          필터 적용
        </button>
        <button
          type="button"
          onClick={() => {
            setSearch('');
            setSiteId('');
            setStatus('');
            setCategory('');
            setAuthorId('');
            setDateFrom('');
            setDateTo('');
            setPage(1);
            setTimeout(() => void load(1), 0);
          }}
          className="rounded border border-neutral-300 px-3 py-1 text-xs dark:border-neutral-700"
        >
          초기화
        </button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* 모바일 카드 */}
      <div className="space-y-3 md:hidden">
        {data?.items.map((row) => (
          <Link
            key={row.id}
            href={`/support-posts/${row.id}`}
            className="block rounded-lg border border-neutral-200 p-4 dark:border-neutral-800"
          >
            <p className="font-medium">{row.title}</p>
            <p className="mt-1 text-xs text-neutral-500">{row.site.name}</p>
            <div className="mt-2 flex flex-wrap gap-2 text-xs">
              <Badge>{CATEGORY_LABEL[row.category] ?? row.category}</Badge>
              <Badge>{STATUS_LABEL[row.status] ?? row.status}</Badge>
            </div>
            <p className="mt-2 text-xs text-neutral-500">
              {row.author.name} · {new Date(row.updatedAt).toLocaleString('ko-KR')}
            </p>
          </Link>
        ))}
      </div>

      {/* 데스크탑 테이블 */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-neutral-200 dark:border-neutral-800">
              <th className="py-2 pr-4 font-medium">사이트</th>
              <th className="py-2 pr-4 font-medium">제목</th>
              <th className="py-2 pr-4 font-medium">분류</th>
              <th className="py-2 pr-4 font-medium">상태</th>
              <th className="py-2 pr-4 font-medium">작성자</th>
              <th className="py-2 pr-4 font-medium">작성일</th>
              <th className="py-2 font-medium">수정일</th>
            </tr>
          </thead>
          <tbody>
            {data?.items.map((row) => (
              <tr key={row.id} className="border-b border-neutral-100 dark:border-neutral-900">
                <td className="py-3 pr-4 align-top text-neutral-600 dark:text-neutral-400">
                  {row.site.name}
                </td>
                <td className="py-3 pr-4 align-top">
                  <Link href={`/support-posts/${row.id}`} className="hover:underline">
                    {row.title}
                  </Link>
                </td>
                <td className="py-3 pr-4 align-top">
                  <Badge>{CATEGORY_LABEL[row.category] ?? row.category}</Badge>
                </td>
                <td className="py-3 pr-4 align-top">
                  <Badge>{STATUS_LABEL[row.status] ?? row.status}</Badge>
                </td>
                <td className="py-3 pr-4 align-top text-neutral-600 dark:text-neutral-400">
                  {row.author.name}
                </td>
                <td className="py-3 pr-4 align-top text-xs text-neutral-500">
                  {new Date(row.createdAt).toLocaleDateString('ko-KR')}
                </td>
                <td className="py-3 align-top text-xs text-neutral-500">
                  {new Date(row.updatedAt).toLocaleString('ko-KR')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data && (
        <p className="text-xs text-neutral-500">
          총 {data.total}건 · {data.page}/{Math.max(1, Math.ceil(data.total / data.pageSize))} 페이지
        </p>
      )}

      {data && data.total > data.pageSize && (
        <div className="flex gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded border px-2 py-1 text-xs disabled:opacity-40"
          >
            이전
          </button>
          <button
            type="button"
            disabled={page * data.pageSize >= data.total}
            onClick={() => setPage((p) => p + 1)}
            className="rounded border px-2 py-1 text-xs disabled:opacity-40"
          >
            다음
          </button>
        </div>
      )}
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block rounded border border-neutral-300 px-2 py-0.5 text-[11px] dark:border-neutral-600">
      {children}
    </span>
  );
}

function SiteFilter({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [sites, setSites] = useState<{ id: string; name: string }[]>([]);
  useEffect(() => {
    void apiJson<{ id: string; name: string }[]>('/sites')
      .then(setSites)
      .catch(() => undefined);
  }, []);
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="mt-1 w-full rounded border border-neutral-300 bg-transparent px-2 py-1.5 dark:border-neutral-600"
    >
      <option value="">전체</option>
      {sites.map((s) => (
        <option key={s.id} value={s.id}>
          {s.name}
        </option>
      ))}
    </select>
  );
}
