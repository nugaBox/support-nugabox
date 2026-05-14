import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

function shouldSendNoRobots(pathname: string): boolean {
  if (pathname === '/') return false;
  if (pathname.startsWith('/_next')) return false;
  if (pathname === '/favicon.ico') return false;
  if (pathname.startsWith('/favicon/')) return false;
  if (pathname === '/banner.png' || pathname === '/meta_thumbnail.jpg') return false;
  if (pathname.endsWith('.webmanifest')) return false;
  if (pathname.includes('browserconfig.xml')) return false;
  return true;
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (pathname === '/login') {
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

  const res = NextResponse.next();
  if (shouldSendNoRobots(pathname)) {
    res.headers.set('X-Robots-Tag', 'noindex, nofollow');
  }
  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image).*)'],
};
