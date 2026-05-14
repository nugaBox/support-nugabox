import type { NextConfig } from 'next';

/** Next 서버(리라이트) → Nest 로 넘길 내부 베이스. Docker에서는 backend:4000 */
const internalApiOrigin =
  process.env.INTERNAL_API_ORIGIN?.replace(/\/$/, '') ?? 'http://127.0.0.1:6041';

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${internalApiOrigin}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
