import type { Metadata } from 'next';
import { getPublicSiteUrl } from '@/lib/site-url';
import { HomePageClient } from './home-page-client';

const ogImagePath = '/meta_thumbnail.jpg';

export const metadata: Metadata = {
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  alternates: { canonical: getPublicSiteUrl() },
  openGraph: {
    type: 'website',
    url: getPublicSiteUrl(),
    images: [{ url: ogImagePath, alt: 'NUGABOX 고객지원' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: [ogImagePath],
  },
};

export default function HomePage() {
  return <HomePageClient />;
}
