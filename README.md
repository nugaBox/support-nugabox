# NUGABOX 고객지원 게시판

Next.js + NestJS + PostgreSQL + Prisma + Docker Compose 기반 고객지원(비밀글) 시스템입니다.

## 빠른 시작

1. 루트에 `.env` 생성: `.env.example`을 복사한 뒤 `JWT_SECRET`, `REFRESH_TOKEN_SECRET` 등을 채웁니다.
2. 개발 기동:
   ```bash
   ./compose.sh dev up
   ./compose.sh dev migrate
   ./compose.sh dev seed
   ```
3. 브라우저: `http://localhost:6040` (프론트), API: `http://localhost:6041`, PostgreSQL(호스트): `localhost:6042`

> `dev seed` / `dev migrate` 실행 시 컨테이너 안에서 `prisma generate`가 함께 돌아가도록 되어 있습니다. 소스만 바꾼 뒤 이미지를 다시 빌드하지 않은 경우에도 시드가 Prisma 스키마와 맞습니다.

## 운영(역방향 프록시)

공개 도메인이 `https://support.nugabox.com`이고 애플리케이션은 호스트의 `localhost:6040`(프론트) 등으로 받는 경우, **브라우저·CORS·텔레그램 링크**에 쓰는 값은 `.env.example`의 `APP_BASE_URL`, `FRONTEND_ORIGIN` 설명을 따릅니다. API 베이스 URL(`NEXT_PUBLIC_API_URL`)은 브라우저에서 실제로 호출 가능한 주소로 두어야 하며, 프론트만 동일 도메인으로 묶을지 API를 별도 포트·서브도메인으로 열지에 따라 설정이 달라집니다.

## Docker 명령 (`compose.sh`)

- `./compose.sh dev up` — 프론트/백 hot reload, DB·업로드 볼륨 마운트
- `./compose.sh dev migrate` — `prisma migrate deploy`
- `./compose.sh dev seed` — 시드
- `./compose.sh prod up` — 빌드 후 `next start` / `node dist/main.js`

## 테스트

```bash
cd backend && npm test
```

## 디렉터리 구조 (요약)

```
support-nugabox/
  backend/          # NestJS + Prisma
  frontend/         # Next.js App Router
  docker-compose.yml
  docker-compose.dev.yml
  docker-compose.prod.yml
  compose.sh
  .env.example
```

## WYSIWYG

**TipTap**을 사용합니다. React 친화적이며 확장(링크·코드블록 등)이 쉽고, 서버 `sanitize-html` + 클라이언트 `isomorphic-dompurify`로 이중 XSS 방어를 적용했습니다.

## 인증

**액세스 JWT + 리프레시 토큰(DB 해시 저장)**. SPA에서 구현 단순성을 위해 `sessionStorage`에 보관합니다. 운영에서는 BFF + HttpOnly 쿠키 전환을 권장합니다.

## 상태 변경 정책

관리자는 **모든 상태 → 모든 상태** 전환을 허용하고, `StatusHistory`로 이력을 남깁니다. UI에서는 일반적인 흐름을 안내할 수 있습니다.

## 스토리지

업로드는 `UPLOAD_DIR` 볼륨에 저장합니다. S3 호환 스토리지로 확장 시 `AttachmentsService`에 스토리지 추상화 레이어를 두고 `path`에 객체 키를 저장하는 방식을 권장합니다.
