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
      <body className="min-h-screen bg-canvas font-sans text-ink antialiased">
        <AuthProvider>
          <div className="flex min-h-screen flex-col">
            <AppHeader />
            <main className="relative mx-auto w-full max-w-5xl flex-1 px-4 py-12 md:px-8 md:py-14">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-elevated/40 to-transparent dark:from-elevated/20" />
              <div className="relative">{children}</div>
            </main>
            <footer className="border-t border-line bg-canvas-subtle py-8 text-center">
              <p className="text-sm text-ink-secondary">
                © 2026 NUGABOX. All rights reserved.
              </p>
            </footer>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
