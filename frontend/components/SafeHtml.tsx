'use client';

import DOMPurify from 'isomorphic-dompurify';

export function SafeHtml({ html }: { html: string }) {
  const clean = DOMPurify.sanitize(html ?? '', {
    ADD_ATTR: ['target', 'rel'],
  });
  return (
    <div
      className="prose-support border-t border-line pt-4 text-ink"
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}
