import sanitizeHtml from 'sanitize-html';

const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat([
    'img',
    'h1',
    'h2',
    'h3',
    'pre',
    'code',
    'span',
  ]),
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
