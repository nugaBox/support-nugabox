# NUGABOX 고객지원 게시판

Next.js(Nuxt 아님) + NestJS + PostgreSQL + Prisma + Docker Compose 기반 고객지원(비밀글) 시스템입니다.

## 시드 계정 (로컬 개발)

| 역할 | 이메일 | 비밀번호 |
|------|--------|----------|
| 관리자 | `admin@nugabox.local` | `Admin12345!` |
| 회원1 | `member1@nugabox.local` | `Member12345!` |
| 회원2 | `member2@nugabox.local` | `Member12345!` |

## 빠른 시작

1. 루트에 `.env` 생성: `.env.example`을 복사한 뒤 `JWT_SECRET`, `REFRESH_TOKEN_SECRET` 등을 채웁니다.
2. 개발 기동:
   ```bash
   ./compose.sh dev up
   ./compose.sh dev migrate
   ./compose.sh dev seed
   ```
3. 브라우저: `http://localhost:3000` (프론트), API: `http://localhost:4000`

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
