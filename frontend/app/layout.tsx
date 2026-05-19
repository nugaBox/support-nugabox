import type { Metadata } from 'next';
import { Suspense } from 'react';
import './globals.css';
import { AuthProvider } from '@/lib/auth';
import { AppHeader } from '@/components/AppHeader';
import { TokenLoginHandler } from '@/components/TokenLoginHandler';
import { getMetadataBaseUrl, getOgImageAbsoluteUrl, getPublicSiteUrl } from '@/lib/site-url';

export async function generateMetadata(): Promise<Metadata> {
  const ogImage = getOgImageAbsoluteUrl();
  const base = getPublicSiteUrl();

  return {
    metadataBase: getMetadataBaseUrl(),
    title: 'NUGABOX 고객지원',
    description: 'NUGABOX 고객지원 게시판',
    openGraph: {
      type: 'website',
      url: base,
      images: [{ url: ogImage, alt: 'NUGABOX 고객지원' }],
    },
    twitter: {
      card: 'summary_large_image',
      images: [ogImage],
    },
    manifest: '/favicon/site.webmanifest',
    icons: {
      icon: [
        { url: '/favicon/favicon.ico', sizes: 'any' },
        { url: '/favicon/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
        { url: '/favicon/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      ],
      apple: '/favicon/apple-touch-icon.png',
      other: [
        {
          rel: 'mask-icon',
          url: '/favicon/safari-pinned-tab.svg',
          color: '#272b35',
        },
      ],
    },
    other: {
      'msapplication-TileColor': '#272b35',
      'msapplication-config': '/favicon/browserconfig.xml',
    },
  };
}

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
              <div className="relative">
                <Suspense fallback={null}>
                  <TokenLoginHandler />
                </Suspense>
                {children}
              </div>
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
