import { CATEGORY_LABEL, STATUS_LABEL } from '@/lib/labels';

const badgeBase =
  'inline-flex items-center rounded-xl border px-2 py-0.5 text-[11px] font-medium leading-tight';

/** 상태 뱃지 — 모노톤에 맞춘 차분한 색 */
export function StatusBadge({ status }: { status: string }) {
  const label = STATUS_LABEL[status] ?? status;
  const cls =
    {
      WAITING:
        'border-zinc-200 bg-zinc-100 text-zinc-800 dark:border-zinc-700 dark:bg-zinc-800/80 dark:text-zinc-200',
      IN_PROGRESS:
        'border-sky-200/90 bg-sky-100/90 text-sky-950 dark:border-sky-800/60 dark:bg-sky-950/45 dark:text-sky-100',
      DONE:
        'border-emerald-200/90 bg-emerald-100/85 text-emerald-950 dark:border-emerald-800/50 dark:bg-emerald-950/40 dark:text-emerald-100',
      REJECTED:
        'border-amber-200/90 bg-amber-100/80 text-amber-950 dark:border-amber-800/50 dark:bg-amber-950/35 dark:text-amber-100',
      STOPPED:
        'border-amber-200/90 bg-amber-100/80 text-amber-950 dark:border-amber-800/50 dark:bg-amber-950/35 dark:text-amber-100',
    }[status] ??
    'border-line bg-canvas-subtle text-ink-secondary';
  return <span className={`${badgeBase} ${cls}`}>{label}</span>;
}

/** 분류 뱃지 — 긴급만 붉은 톤 */
export function CategoryBadge({ category }: { category: string }) {
  const label = CATEGORY_LABEL[category] ?? category;
  const isUrgent = category === 'URGENT';
  const cls = isUrgent
    ? 'border-rose-200/90 bg-rose-100/85 text-rose-950 dark:border-rose-800/55 dark:bg-rose-950/40 dark:text-rose-100'
    : 'border-line bg-canvas-subtle text-ink-secondary';
  return <span className={`${badgeBase} ${cls}`}>{label}</span>;
}
