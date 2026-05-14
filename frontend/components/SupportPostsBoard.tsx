'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { apiJson } from '@/lib/api';
import { STATUS_LABEL } from '@/lib/labels';
import { CategoryBadge, StatusBadge } from '@/components/SupportPostBadges';

type Row = {
  id: string;
  title: string;
  category: string;
  status: string;
  site: { id: string; name: string };
  author: { id: string; name: string; username: string; role: string };
  createdAt: string;
  updatedAt: string;
};

type ListRes = {
  items: Row[];
  total: number;
  page: number;
  pageSize: number;
  statusCounts?: Record<string, number>;
};

const PAGE_SIZE = 10;

const STATUS_ORDER = ['WAITING', 'IN_PROGRESS', 'REJECTED', 'DONE', 'STOPPED'] as const;

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ko-KR');
}

export function SupportPostsBoard() {
  const [data, setData] = useState<ListRes | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [siteId, setSiteId] = useState('');
  const [page, setPage] = useState(1);

  const load = useCallback(
    async (overridePage?: number) => {
      setError(null);
      const p = overridePage ?? page;
      try {
        const params = new URLSearchParams();
        if (search.trim()) params.set('search', search.trim());
        if (siteId) params.set('siteId', siteId);
        params.set('page', String(p));
        params.set('pageSize', String(PAGE_SIZE));
        const qs = params.toString();
        const res = await apiJson<ListRes>(`/support-posts?${qs}`);
        setData({
          ...res,
          statusCounts: res.statusCounts ?? {},
        });
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : '목록 조회 실패');
      }
    },
    [search, siteId, page],
  );

  useEffect(() => {
    void load();
  }, [load]);

  function runSearch() {
    setPage(1);
    void load(1);
  }

  function goPage(next: number) {
    setPage(next);
  }

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  const pageButtons = (() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const cur = page;
    const set = new Set<number>();
    set.add(1);
    set.add(totalPages);
    for (let d = -2; d <= 2; d++) {
      const n = cur + d;
      if (n >= 1 && n <= totalPages) set.add(n);
    }
    return [...set].sort((a, b) => a - b);
  })();

  const counts = data?.statusCounts;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">문의 목록</h1>
        <Link href="/support-posts/new" className="ui-btn-primary w-full shrink-0 px-6 sm:w-auto">
          문의 등록
        </Link>
      </div>

      <div className="ui-card flex flex-col gap-3 p-4 sm:flex-row sm:flex-wrap sm:items-end">
        <label className="flex min-w-[140px] flex-1 flex-col gap-1.5 text-xs font-medium text-ink-secondary sm:max-w-[200px]">
          사이트
          <SiteFilter value={siteId} onChange={setSiteId} />
        </label>
        <label className="flex min-w-0 flex-[2] flex-col gap-1.5 text-xs font-medium text-ink-secondary">
          검색
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="제목·본문"
            className="ui-input py-2 text-sm"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                runSearch();
              }
            }}
          />
        </label>
        <div className="flex shrink-0 gap-2">
          <button type="button" onClick={() => runSearch()} className="ui-btn-primary px-4 py-2 text-xs">
            검색
          </button>
          <button
            type="button"
            onClick={() => {
              setSearch('');
              setSiteId('');
              setPage(1);
            }}
            className="ui-btn-ghost px-3 py-2 text-xs"
          >
            초기화
          </button>
        </div>
      </div>

      {counts && data && (
        <p className="text-sm text-ink-secondary">
          전체 <span className="font-semibold text-ink">{data.total}</span>건
          {STATUS_ORDER.map((key) => (
            <span key={key} className="ml-3">
              {STATUS_LABEL[key]} <span className="font-medium text-ink">{counts[key] ?? 0}</span>건
            </span>
          ))}
        </p>
      )}

      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/25 dark:text-red-300">
          {error}
        </p>
      )}

      <div className="space-y-3 md:hidden">
        {data?.items.map((row) => (
          <Link
            key={row.id}
            href={`/support-posts/${row.id}`}
            className="ui-card block p-4 transition-shadow hover:shadow-float"
          >
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <CategoryBadge category={row.category} />
              <StatusBadge status={row.status} />
            </div>
            <p className="mt-2 text-xs text-ink-tertiary">{row.site.name}</p>
            <p className="mt-1 font-semibold text-ink">{row.title}</p>
            <p className="mt-2 text-xs text-ink-secondary">
              {row.author.name} · 처리일 {formatDate(row.updatedAt)}
            </p>
          </Link>
        ))}
      </div>

      <div className="ui-card hidden overflow-hidden md:block">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-line bg-canvas-subtle text-ink-secondary">
              <th className="px-4 py-3 pr-3 font-medium">사이트</th>
              <th className="py-3 pr-3 font-medium">분류</th>
              <th className="min-w-[8rem] py-3 pr-3 font-medium">제목</th>
              <th className="py-3 pr-3 font-medium">작성자</th>
              <th className="py-3 pr-3 font-medium">작성일</th>
              <th className="py-3 pr-3 font-medium">상태</th>
              <th className="px-4 py-3 font-medium">처리일</th>
            </tr>
          </thead>
          <tbody>
            {data?.items.map((row) => (
              <tr
                key={row.id}
                className="border-b border-line last:border-0 transition-colors hover:bg-canvas-subtle/80"
              >
                <td className="px-4 py-3.5 pr-3 align-top text-ink-secondary">{row.site.name}</td>
                <td className="py-3.5 pr-3 align-top">
                  <CategoryBadge category={row.category} />
                </td>
                <td className="py-3.5 pr-3 align-top font-semibold text-ink">
                  <Link
                    href={`/support-posts/${row.id}`}
                    className="hover:text-ink-secondary hover:underline"
                  >
                    {row.title}
                  </Link>
                </td>
                <td className="py-3.5 pr-3 align-top text-ink-secondary">{row.author.name}</td>
                <td className="py-3.5 pr-3 align-top text-xs text-ink-tertiary">
                  {formatDate(row.createdAt)}
                </td>
                <td className="py-3.5 pr-3 align-top">
                  <StatusBadge status={row.status} />
                </td>
                <td className="px-4 py-3.5 align-top text-xs text-ink-tertiary">
                  {formatDate(row.updatedAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data && totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-center gap-1.5">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => goPage(page - 1)}
            className="ui-btn-ghost min-w-[4rem] py-1.5 text-xs disabled:pointer-events-none disabled:opacity-35"
          >
            이전
          </button>
          {pageButtons.flatMap((n, idx) => {
            const prev = pageButtons[idx - 1];
            const nodes = [];
            if (idx > 0 && prev !== undefined && prev < n - 1) {
              nodes.push(
                <span key={`gap-${n}-${idx}`} className="px-1 text-xs text-ink-tertiary">
                  …
                </span>,
              );
            }
            nodes.push(
              <button
                key={`p-${n}`}
                type="button"
                onClick={() => goPage(n)}
                className={
                  n === page
                    ? 'min-w-[2rem] rounded-lg border border-line bg-accent-soft px-2 py-1.5 text-xs font-semibold text-ink'
                    : 'min-w-[2rem] rounded-lg px-2 py-1.5 text-xs text-ink-secondary hover:bg-canvas-subtle'
                }
              >
                {n}
              </button>,
            );
            return nodes;
          })}
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => goPage(page + 1)}
            className="ui-btn-ghost min-w-[4rem] py-1.5 text-xs disabled:pointer-events-none disabled:opacity-35"
          >
            다음
          </button>
        </div>
      )}

      {data && (
        <p className="text-center text-xs text-ink-tertiary">
          {PAGE_SIZE}개/페이지 · {data.page}/{totalPages} 페이지
        </p>
      )}
    </div>
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
    <select value={value} onChange={(e) => onChange(e.target.value)} className="ui-input py-2 text-sm">
      <option value="">전체</option>
      {sites.map((s) => (
        <option key={s.id} value={s.id}>
          {s.name}
        </option>
      ))}
    </select>
  );
}
