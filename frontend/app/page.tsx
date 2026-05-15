import type { Metadata } from 'next';
import { getOgImageAbsoluteUrl, getPublicSiteUrl } from '@/lib/site-url';
import { HomePageClient } from './home-page-client';

export async function generateMetadata(): Promise<Metadata> {
  const base = getPublicSiteUrl();
  const ogImage = getOgImageAbsoluteUrl();

  return {
    robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
    alternates: { canonical: base },
    openGraph: {
      type: 'website',
      url: base,
      images: [{ url: ogImage, alt: 'NUGABOX 고객지원' }],
    },
    twitter: {
      card: 'summary_large_image',
      images: [ogImage],
    },
  };
}

export default function HomePage() {
  return <HomePageClient />;
}
