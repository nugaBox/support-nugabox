/** OG·metadataBase용 공개 프론트 URL (슬래시 제거). NEXT_PUBLIC_SITE_URL 권장. */
export function getPublicSiteUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.NEXT_PUBLIC_APP_BASE_URL?.trim() ||
    'http://localhost:6040';
  return raw.replace(/\/$/, '');
}

export function getMetadataBaseUrl(): URL {
  return new URL(getPublicSiteUrl());
}
