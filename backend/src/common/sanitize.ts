import * as sanitizeHtmlModule from 'sanitize-html';

// CommonJS/ESM 혼용 시 default export 형태가 달라질 수 있음
const sanitizeHtml =
  (sanitizeHtmlModule as unknown as { default?: typeof import('sanitize-html') }).default ??
  (sanitizeHtmlModule as unknown as typeof import('sanitize-html'));

const defaultAllowedTags =
  (sanitizeHtml as unknown as { defaults?: { allowedTags?: string[] } }).defaults
    ?.allowedTags ?? [
    'p',
    'br',
    'strong',
    'em',
    'u',
    's',
    'blockquote',
    'ul',
    'ol',
    'li',
    'a',
    'h1',
    'h2',
    'h3',
    'pre',
    'code',
    'span',
    'div',
  ];

const SANITIZE_OPTIONS: import('sanitize-html').IOptions = {
  allowedTags: defaultAllowedTags.concat(['img']),
  allowedAttributes: {
    a: ['href', 'name', 'target', 'rel'],
    img: ['src', 'alt'],
    code: ['class'],
    span: ['class'],
    p: ['class'],
    div: ['class'],
  },
  allowedSchemes: ['http', 'https', 'mailto'],
};

export function sanitizeRichText(html: string): string {
  return sanitizeHtml(html ?? '', SANITIZE_OPTIONS);
}

export function sanitizePlain(text: string): string {
  return sanitizeHtml(text ?? '', { allowedTags: [], allowedAttributes: {} });
}
