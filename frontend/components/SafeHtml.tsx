'use client';

import DOMPurify from 'isomorphic-dompurify';

export function SafeHtml({ html }: { html: string }) {
  const clean = DOMPurify.sanitize(html ?? '', {
    ADD_ATTR: ['target', 'rel'],
  });
  return (
    <div
      className="prose-support prose-support border-t border-neutral-200 pt-4 dark:border-neutral-800"
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}
