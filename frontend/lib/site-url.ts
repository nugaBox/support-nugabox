/** 공개 OG·canonical용 (슬래시 제거). .env 의 APP_BASE_URL 을 최우선. */
export function getPublicSiteUrl(): string {
  const raw =
    process.env.APP_BASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.NEXT_PUBLIC_APP_BASE_URL?.trim() ||
    'http://localhost:6040';
  return raw.replace(/\/$/, '');
}

export function getMetadataBaseUrl(): URL {
  return new URL(getPublicSiteUrl());
}

export const OG_IMAGE_PATH = '/meta_thumbnail.jpg';

/** og:image 등 — APP_BASE_URL + 이미지 경로 */
export function getOgImageAbsoluteUrl(): string {
  return `${getPublicSiteUrl()}${OG_IMAGE_PATH}`;
}
