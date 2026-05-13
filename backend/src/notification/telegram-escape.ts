/** Telegram HTML(parse_mode=HTML)용 이스케이프 — XSS/파싱 오류 방지 */
export function escapeTelegramHtml(input: string): string {
  return String(input ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
