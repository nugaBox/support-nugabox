import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

/** 구 /login 경로는 홈으로 옮김. ?next= 는 유지 */
export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname !== '/login') return NextResponse.next();
  const url = request.nextUrl.clone();
  url.pathname = '/';
  const next = request.nextUrl.searchParams.get('next');
  if (next) {
    url.searchParams.set('next', next);
  } else {
    url.search = '';
  }
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/login'],
};
