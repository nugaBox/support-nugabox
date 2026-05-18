# NUGABOX 고객지원 REST API 연동 가이드

다른 서비스·앱에서 NUGABOX 고객지원 게시판 기능을 사용할 때 참고하는 문서입니다.

## 기본 정보

| 항목 | 값 |
|------|-----|
| 운영 사이트 | `https://support.nugabox.com` |
| API 베이스 URL | **`https://support.nugabox.com/api`** |
| 프로토콜 | HTTPS, JSON (`Content-Type: application/json`) |
| 인증 | JWT Bearer (`Authorization: Bearer <accessToken>`) |

배포 환경에서는 Next.js가 `/api/*` 요청을 NestJS 백엔드로 프록시합니다. 브라우저·서버 모두 **동일한 공개 URL**(`/api`)로 호출하면 됩니다.

로컬 개발 시 예: `http://localhost:6040/api`

---

## 연동 흐름 요약

1. 관리자에게 **지원 시스템 계정**(username / password)과 **사이트 매핑**(MEMBER인 경우)을 발급받습니다.
2. `POST /api/auth/login`으로 `accessToken`, `refreshToken`을 받습니다.
3. 이후 모든 API 요청 헤더에 `Authorization: Bearer <accessToken>`을 넣습니다.
4. access 토큰 만료 시 `POST /api/auth/refresh`로 갱신합니다.

**서버 간(M2M) 호출**은 CORS 제약이 없습니다. **브라우저에서 다른 도메인**으로 직접 호출하려면 운영 `.env`의 `CORS_ORIGINS`(또는 `FRONTEND_ORIGIN`)에 해당 출처를 추가해야 합니다.

---

## 인증

### 로그인

```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "member1",
  "password": "your-password"
}
```

**응답 (200)**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "a1b2c3...",
  "expiresIn": "15m",
  "user": {
    "id": "uuid",
    "username": "member1",
    "name": "홍길동",
    "role": "MEMBER",
    "isActive": true,
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-01T00:00:00.000Z"
  }
}
```

### 토큰 갱신

```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "<로그인 시 받은 refreshToken>"
}
```

**응답 (200)**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": { "...": "..." }
}
```

### 로그아웃

```http
POST /api/auth/logout
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "refreshToken": "<선택: 해당 기기만 로그아웃>"
}
```

`refreshToken`을 생략하면 해당 사용자의 모든 리프레시 토큰이 무효화됩니다.

### 내 정보

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/api/auth/me` | 현재 로그인 사용자 |
| PATCH | `/api/auth/me` | 이름·비밀번호 변경 (`name`, `password` 중 하나 이상) |

---

## 역할과 권한

| 역할 | 코드 | 문의 목록 | 문의 상세 | 문의 등록 | 문의 수정·삭제 | 상태·진행내용 | 댓글 | 사이트 관리 | 사용자 관리 |
|------|------|-----------|-----------|-----------|----------------|---------------|------|-------------|-------------|
| 관리자 | `ADMIN` | 전체 | 전체 | 전체 사이트 | 전체 | 가능 | 전체 글 | CRUD | CRUD |
| 회원 | `MEMBER` | 본인 글만 | 본인 글만 | 매핑된 사이트만 | 본인 글만 | 불가 | 접근 가능한 글 | 조회(매핑) | 불가 |

- MEMBER가 다른 사용자 글 ID로 요청하면 **404**로 응답합니다(존재 여부 비노출).
- 상태 변경·진행내용 수정은 **ADMIN 전용**입니다.

---

## 열거형(Enum)

### 문의 분류 `PostCategory`

| 값 | 설명 |
|----|------|
| `URGENT` | 긴급 |
| `FEATURE_ADD` | 기능추가 |
| `FEATURE_INQUIRY` | 기능문의 |
| `FEATURE_UPDATE` | 기능수정 |

### 진행 상태 `PostStatus`

| 값 | 설명 |
|----|------|
| `WAITING` | 대기 |
| `IN_PROGRESS` | 진행중 |
| `REJECTED` | 반려 |
| `DONE` | 완료 |
| `STOPPED` | 중단 |

관리자는 **모든 상태 → 모든 상태** 전환이 가능하며, 변경 시 `statusHistory`에 이력이 기록됩니다.

---

## 헬스 체크

인증 없이 API 가용 여부를 확인합니다.

```http
GET /api/health
```

```json
{
  "ok": true,
  "service": "nugabox-support-api",
  "timestamp": "2026-05-18T12:00:00.000Z"
}
```

---

## 지원 문의 (Support Posts)

### 목록 조회 (페이징)

```http
GET /api/support-posts?page=1&pageSize=20
Authorization: Bearer <accessToken>
```

**쿼리 파라미터**

| 이름 | 타입 | 설명 |
|------|------|------|
| `page` | number | 페이지 (기본 1) |
| `pageSize` | number | 페이지 크기 (기본 20, 최대 100) |
| `search` | string | 제목·본문 검색 |
| `siteId` | uuid | 사이트 필터 |
| `status` | PostStatus | 상태 필터 |
| `category` | PostCategory | 분류 필터 |
| `authorId` | uuid | 작성자 필터 (**ADMIN만**) |
| `dateFrom` | ISO 날짜 문자열 | 생성일 시작 |
| `dateTo` | ISO 날짜 문자열 | 생성일 끝 |

**응답 (200)**

```json
{
  "items": [
    {
      "id": "uuid",
      "title": "문의 제목",
      "category": "FEATURE_INQUIRY",
      "status": "WAITING",
      "site": { "id": "uuid", "name": "사이트 A" },
      "author": {
        "id": "uuid",
        "name": "홍길동",
        "username": "member1",
        "role": "MEMBER"
      },
      "createdAt": "2026-05-18T00:00:00.000Z",
      "updatedAt": "2026-05-18T00:00:00.000Z"
    }
  ],
  "total": 42,
  "page": 1,
  "pageSize": 20,
  "statusCounts": {
    "WAITING": 10,
    "IN_PROGRESS": 5,
    "REJECTED": 2,
    "DONE": 20,
    "STOPPED": 5
  }
}
```

### 상세 조회

```http
GET /api/support-posts/{id}
Authorization: Bearer <accessToken>
```

**응답 (200)** — 댓글·첨부·상태 이력 포함

```json
{
  "id": "uuid",
  "title": "문의 제목",
  "content": "<p>HTML 본문</p>",
  "category": "FEATURE_INQUIRY",
  "status": "IN_PROGRESS",
  "progressNote": "<p>관리자 진행 메모</p>",
  "site": { "id": "uuid", "name": "사이트 A", "code": "SITE-A" },
  "author": {
    "id": "uuid",
    "name": "홍길동",
    "username": "member1",
    "role": "MEMBER"
  },
  "attachments": [
    {
      "id": "uuid",
      "originalName": "screenshot.png",
      "mimeType": "image/png",
      "size": 12345,
      "createdAt": "2026-05-18T00:00:00.000Z"
    }
  ],
  "comments": [
    {
      "id": "uuid",
      "content": "댓글 내용",
      "createdAt": "2026-05-18T01:00:00.000Z",
      "updatedAt": "2026-05-18T01:00:00.000Z",
      "user": { "id": "uuid", "username": "admin" }
    }
  ],
  "statusHistory": [
    {
      "id": "uuid",
      "beforeStatus": "WAITING",
      "afterStatus": "IN_PROGRESS",
      "changedAt": "2026-05-18T02:00:00.000Z",
      "changedBy": { "id": "uuid", "name": "관리자" }
    }
  ],
  "createdAt": "2026-05-18T00:00:00.000Z",
  "updatedAt": "2026-05-18T02:00:00.000Z"
}
```

### 등록

```http
POST /api/support-posts
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "siteId": "uuid",
  "title": "문의 제목",
  "content": "<p>본문 HTML</p>",
  "category": "FEATURE_INQUIRY"
}
```

- 등록 시 기본 상태는 `WAITING`입니다.
- MEMBER는 `GET /api/me/sites`로 받은 사이트 ID만 사용할 수 있습니다.
- 등록 성공 시 서버가 **Telegram 알림**(환경 변수 `TELEGRAM_ENABLED=true`일 때)을 보낼 수 있습니다.

**응답**: 상세 조회와 동일한 객체.

### 수정

```http
PATCH /api/support-posts/{id}
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "title": "수정된 제목",
  "content": "<p>수정 본문</p>",
  "category": "URGENT"
}
```

모든 필드는 선택(optional)입니다.

### 삭제

```http
DELETE /api/support-posts/{id}
Authorization: Bearer <accessToken>
```

**응답**

```json
{ "ok": true }
```

소프트 삭제이며, 삭제된 글은 목록·상세에서 조회되지 않습니다.

### 진행 상태 변경 (ADMIN)

```http
PATCH /api/support-posts/{id}/status
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "status": "IN_PROGRESS"
}
```

- `statusHistory`에 변경 이력이 추가됩니다.
- Telegram이 활성화된 경우 **상태 변경 알림**이 전송됩니다.
- 외부 시스템에서 상태 변경을 감지하려면:
  - 주기적으로 `GET /api/support-posts/{id}`의 `status` / `statusHistory`를 폴링하거나
  - 상세 응답의 `updatedAt`·마지막 `statusHistory.changedAt`을 비교합니다.

### 진행내용 수정 (ADMIN)

```http
PATCH /api/support-posts/{id}/progress-note
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "progressNote": "<p>진행 상황 HTML</p>"
}
```

---

## 댓글 (Comments)

댓글은 **평면 구조**입니다(대댓글 `parent_id` 없음). 상세 조회 응답에도 `comments` 배열이 포함됩니다.

### 목록

```http
GET /api/support-posts/{postId}/comments
Authorization: Bearer <accessToken>
```

### 등록

```http
POST /api/support-posts/{postId}/comments
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "content": "댓글 내용 (최대 10000자)"
}
```

### 수정

```http
PATCH /api/comments/{commentId}
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "content": "수정된 댓글"
}
```

- 작성자 본인 또는 ADMIN만 수정 가능합니다.

### 삭제

```http
DELETE /api/comments/{commentId}
Authorization: Bearer <accessToken>
```

**응답**: `{ "ok": true }` (소프트 삭제)

---

## 첨부파일 (Attachments)

### 업로드

```http
POST /api/support-posts/{postId}/attachments
Authorization: Bearer <accessToken>
Content-Type: multipart/form-data
```

| 필드 | 설명 |
|------|------|
| `files` | 파일 (최대 5개, 필드명 `files`) |

크기 제한: 환경 변수 `MAX_FILE_SIZE_MB`(기본 10MB).

**응답**: 첨부 메타데이터 배열

```json
[
  {
    "id": "uuid",
    "originalName": "file.pdf",
    "mimeType": "application/pdf",
    "size": 1024,
    "createdAt": "2026-05-18T00:00:00.000Z"
  }
]
```

### 다운로드

```http
GET /api/attachments/{attachmentId}/download
Authorization: Bearer <accessToken>
```

바이너리 스트림이 반환됩니다. `Content-Disposition: attachment` 헤더에 파일명이 포함됩니다.

### 삭제

```http
DELETE /api/attachments/{attachmentId}
Authorization: Bearer <accessToken>
```

---

## 사이트 (Sites)

### 목록

```http
GET /api/sites
GET /api/sites?activeOnly=true
Authorization: Bearer <accessToken>
```

- ADMIN: 전체(삭제 제외) 사이트
- MEMBER: 본인에게 매핑된 활성 사이트

**응답 예**

```json
[
  {
    "id": "uuid",
    "name": "사이트 A",
    "code": "SITE-A",
    "description": null,
    "isActive": true,
    "createdAt": "...",
    "updatedAt": "..."
  }
]
```

### 문의 등록용 내 사이트

```http
GET /api/me/sites
Authorization: Bearer <accessToken>
```

활성 사이트만 반환합니다. `POST /api/support-posts`의 `siteId`에 사용합니다.

### 사이트 관리 (ADMIN)

| 메서드 | 경로 | 설명 |
|--------|------|------|
| POST | `/api/sites` | 생성 (`name`, `code`, `description?`, `isActive?`) |
| GET | `/api/sites/{id}` | 상세 |
| PATCH | `/api/sites/{id}` | 수정 |
| DELETE | `/api/sites/{id}` | 삭제(비활성) |

---

## 사용자 관리 (ADMIN)

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/api/users` | 사용자 목록 |
| POST | `/api/users` | 사용자 생성 |
| GET | `/api/users/{id}` | 상세 |
| PATCH | `/api/users/{id}` | 수정 |
| PATCH | `/api/users/{id}/activate` | 활성화 |
| PATCH | `/api/users/{id}/deactivate` | 비활성화 |
| PATCH | `/api/users/{id}/reset-password` | 비밀번호를 username과 동일하게 초기화 |
| DELETE | `/api/users/{id}` | 삭제 |
| GET | `/api/users/{id}/sites` | 사용자-사이트 매핑 조회 |
| PUT | `/api/users/{id}/sites` | 매핑 일괄 설정 `{ "siteIds": ["uuid", ...] }` |

외부 서비스 연동 시 일반적으로 **MEMBER 계정**을 만들고 `PUT /api/users/{id}/sites`로 사이트를 매핑합니다.

---

## 알림 (상태 변경 등)

| 이벤트 | 동작 |
|--------|------|
| 문의 등록 | `TELEGRAM_ENABLED=true` 시 Telegram으로 알림 |
| 상태 변경 (ADMIN) | 동일 |
| 댓글 등록 | **별도 푸시/Webhook 없음** — API 폴링 또는 상세 조회로 확인 |

외부 Webhook 수신 API는 현재 제공하지 않습니다. 필요 시 별도 개발이 필요합니다.

---

## HTTP 상태 코드·에러

NestJS 기본 형식:

```json
{
  "statusCode": 401,
  "message": "아이디 또는 비밀번호가 올바르지 않습니다.",
  "error": "Unauthorized"
}
```

| 코드 | 의미 |
|------|------|
| 400 | 요청 본문·쿼리 검증 실패 |
| 401 | 인증 실패·토큰 만료 |
| 403 | 권한 없음 (예: MEMBER의 상태 변경) |
| 404 | 리소스 없음 또는 접근 불가 |
| 409 | 충돌 (예: 사이트 코드 중복) |

---

## 연동 예제

### cURL — 로그인 후 목록

```bash
BASE="https://support.nugabox.com/api"

TOKEN=$(curl -s -X POST "$BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"member1","password":"your-password"}' \
  | jq -r '.accessToken')

curl -s "$BASE/support-posts?page=1&pageSize=10" \
  -H "Authorization: Bearer $TOKEN"
```

### JavaScript (fetch)

```javascript
const API_BASE = 'https://support.nugabox.com/api';

async function login(username, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function listPosts(accessToken, page = 1) {
  const res = await fetch(
    `${API_BASE}/support-posts?page=${page}&pageSize=20`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function createPost(accessToken, payload) {
  const res = await fetch(`${API_BASE}/support-posts`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// 사용 예
// const { accessToken, refreshToken } = await login('member1', '***');
// const list = await listPosts(accessToken);
// const post = await createPost(accessToken, {
//   siteId: '...',
//   title: '연동 테스트',
//   content: '<p>본문</p>',
//   category: 'FEATURE_INQUIRY',
// });
```

### Python (requests)

```python
import requests

API_BASE = "https://support.nugabox.com/api"

def login(username: str, password: str) -> dict:
    r = requests.post(
        f"{API_BASE}/auth/login",
        json={"username": username, "password": password},
        timeout=30,
    )
    r.raise_for_status()
    return r.json()

def get_post(access_token: str, post_id: str) -> dict:
    r = requests.get(
        f"{API_BASE}/support-posts/{post_id}",
        headers={"Authorization": f"Bearer {access_token}"},
        timeout=30,
    )
    r.raise_for_status()
    return r.json()
```

---

## 기능 체크리스트

| 기능 | API | 비고 |
|------|-----|------|
| 지원 글 목록 (페이징) | `GET /api/support-posts` | `statusCounts` 포함 |
| 지원 글 상세 | `GET /api/support-posts/{id}` | 댓글·첨부·이력 포함 |
| 지원 글 등록 | `POST /api/support-posts` | |
| 지원 글 수정 | `PATCH /api/support-posts/{id}` | |
| 지원 글 삭제 | `DELETE /api/support-posts/{id}` | |
| 댓글 CRUD | `/api/support-posts/{postId}/comments`, `/api/comments/{id}` | 평면 댓글 |
| 진행 상태 변경 | `PATCH /api/support-posts/{id}/status` | ADMIN, Telegram 알림 가능 |
| 진행내용 | `PATCH /api/support-posts/{id}/progress-note` | ADMIN |
| 상태 변경 이력 | 상세의 `statusHistory` | |
| 첨부 업로드·다운로드·삭제 | attachments 엔드포인트 | multipart |
| 사이트·계정 | `/api/sites`, `/api/me/sites`, `/api/users` | ADMIN 관리 |

---

## 운영·보안 권장사항

1. **HTTPS**만 사용하고, 토큰을 URL 쿼리에 넣지 마세요.
2. 연동 전용 **서비스 계정**을 두고, 비밀번호·토큰은 연동 측 시크릿 저장소에 보관하세요.
3. `accessToken` 만료(`JWT_EXPIRES_IN`, 기본 15분) 전에 `refresh`로 갱신하세요.
4. 본문·댓글은 HTML/평문 sanitize가 적용됩니다. 연동 측에서도 XSS에 주의하세요.
5. 브라우저 기반 타 도메인 연동 시 `CORS_ORIGINS=https://your-app.com,https://support.nugabox.com` 형태로 설정합니다.

---

## 문의

API 계정 발급·사이트 매핑·운영 환경 설정은 NUGABOX 관리자에게 요청하세요.
