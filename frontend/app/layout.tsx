import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth';
import { AppHeader } from '@/components/AppHeader';

export const metadata: Metadata = {
  title: 'NUGABOX 고객지원',
  description: 'NUGABOX 고객지원 게시판',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
        />
      </head>
      <body style={{ fontFamily: '"Pretendard", system-ui, sans-serif' }}>
        <AuthProvider>
          <div className="min-h-screen flex flex-col">
            <AppHeader />
            <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 md:px-8">{children}</main>
            <footer className="border-t border-neutral-200 py-8 text-center text-xs text-neutral-500 dark:border-neutral-800">
              <p>NUGABOX 고객지원 · 모노톤 UI</p>
            </footer>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
