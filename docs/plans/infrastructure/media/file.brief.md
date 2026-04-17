# 파일 업로드 기능 기획안

## 1. 목표

- 유저 프로필 이미지 / 클럽 로고 이미지 업로드 지원
- 업로드 즉시 리사이징하여 저장 (서버 내 로컬 디스크)
- 이미지가 없는 경우 기본 이미지 제공 (`uploads/defaults/` 폴더)
- 향후 S3 전환이 용이하도록 서비스 레이어를 교체 가능하게 설계

---

## 2. 저장 구조

```
server/
└── uploads/
    ├── defaults/
    │   ├── profile.jpg   ← 프로필 기본 이미지 (직접 배치)
    │   └── club.jpg      ← 클럽 로고 기본 이미지 (직접 배치)
    ├── avatars/
    │   └── {uuid}.jpg    ← 업로드된 프로필 이미지
    └── clubs/
        └── {uuid}.jpg    ← 업로드된 클럽 로고 이미지
```

- 파일명: `uuidv4() + '.jpg'` (항상 JPEG로 변환·저장)
- 이전 파일: 새 업로드 시 기존 파일 디스크에서 삭제
- 정적 파일 서빙: `ServeStaticModule` → `GET /uploads/**`

---

## 3. API 설계

| Method | Endpoint | 설명 | Auth |
|--------|----------|------|------|
| POST | `/upload/avatar` | 내 프로필 이미지 업로드 | 로그인 |
| DELETE | `/upload/avatar` | 내 프로필 이미지 삭제 (기본 이미지로) | 로그인 |
| POST | `/upload/club-logo/:clubId` | 클럽 로고 업로드 | CAPTAIN / VICE_CAPTAIN |
| DELETE | `/upload/club-logo/:clubId` | 클럽 로고 삭제 (기본 이미지로) | CAPTAIN / VICE_CAPTAIN |

### 공통 요청

```
Content-Type: multipart/form-data
필드명: image (File)
```

### 공통 응답

```json
{ "url": "/uploads/avatars/abc123.jpg" }
```

### 업로드 제약

| 항목 | 값 |
|------|----|
| 최대 파일 크기 | 5 MB |
| 허용 MIME 타입 | `image/jpeg`, `image/png`, `image/webp` |
| 저장 형식 | JPEG (모든 포맷 변환) |
| 프로필 리사이즈 | 256 × 256 px (center crop) |
| 클럽 로고 리사이즈 | 256 × 256 px (center crop) |

---

## 4. 기본 이미지 fallback 전략

DB의 `avatarUrl`, `logoUrl` 컬럼은 **null 허용** 유지.
기본 이미지 URL은 **클라이언트에서 처리**한다.

```ts
// 클라이언트 공통 헬퍼
const DEFAULT_AVATAR = '/uploads/defaults/profile.jpg';
const DEFAULT_CLUB_LOGO = '/uploads/defaults/club.jpg';

function getAvatarUrl(url: string | null) {
  return url ?? DEFAULT_AVATAR;
}
```

> 서버에서 null을 기본 URL로 채워 응답하지 않는다.
> `AvatarImage` / 클럽 로고 컴포넌트에서 null 처리를 통일한다.

---

## 5. 서버 구현 범위

### 모듈 구조

```
server/src/features/upload/
├── upload.module.ts
├── upload.controller.ts   ← 엔드포인트
├── upload.service.ts      ← 파일 저장 / 삭제 / DB 업데이트
└── upload.interceptor.ts  ← multer FileInterceptor 설정 (파일 크기·타입 제한)
```

### 주요 로직

1. **`multer` memoryStorage** — 파일을 메모리에 받아 `sharp`에 넘김
2. **`sharp`** — JPEG 변환 + 256×256 center crop + 품질 80
3. **`fs.writeFile`** — `uploads/avatars/` or `uploads/clubs/` 에 저장
4. **Prisma** — `user.avatarUrl` 또는 `club.logoUrl` 업데이트
5. **이전 파일 삭제** — 기존 URL이 defaults 경로가 아닌 경우 `fs.unlink`
6. **DELETE** — DB null로 업데이트 + 파일 삭제

### `app.module.ts` 추가

```ts
ServeStaticModule.forRoot({
  rootPath: join(__dirname, '..', 'uploads'),
  serveRoot: '/uploads',
  exclude: ['/api*'],
}),
```

### `main.ts` — 업로드 폴더 자동 생성

```ts
import { mkdirSync } from 'fs';
['uploads/avatars', 'uploads/clubs', 'uploads/defaults'].forEach((dir) =>
  mkdirSync(join(process.cwd(), dir), { recursive: true }),
);
```

---

## 6. 클라이언트 구현 범위

### 프로필 이미지 편집

- 진입: `app/(app)/profile/edit.tsx` → 프로필 이미지 터치
- `expo-image-picker`로 갤러리에서 선택
- `FormData`에 담아 `POST /upload/avatar` 호출
- 성공 시 `useMyProfile` 캐시 invalidate

### 클럽 로고 편집

- 진입: 클럽 설정 화면 → 로고 이미지 터치 (CAPTAIN/VICE_CAPTAIN만 노출)
- 동일하게 `expo-image-picker` + `POST /upload/club-logo/:clubId`
- 성공 시 클럽 쿼리 invalidate

### 기본 이미지 표시

- `AvatarImage` 컴포넌트: `source` prop이 null이면 `defaults/profile.jpg` 사용
- 클럽 로고: null이면 `defaults/club.jpg` 사용

---

## 7. 의존성 추가

```bash
# 서버
npm install --save @nestjs/serve-static sharp multer @types/multer uuid @types/uuid
npm install --save-dev @types/sharp

# 클라이언트
npx expo install expo-image-picker
```

---

## 8. 보안 고려사항

- MIME 타입 체크: `multer` `fileFilter`에서 화이트리스트 검증 (Content-Type 위조 방어)
- 파일 확장자 검증: `.jpg`, `.jpeg`, `.png`, `.webp`만 허용
- 파일 크기 제한: `multer limits.fileSize = 5 * 1024 * 1024`
- 파일명 노출 금지: 원본 파일명 사용 안함, uuid로만 저장
- `uploads/` 폴더 경로 traversal 방지: `path.basename()` 사용

---

## 9. 미래 S3 전환 시

`upload.service.ts`의 `saveFile()` 메서드만 교체.
Controller, 클라이언트 API 호출 변경 없음.

```ts
// 현재: 로컬 디스크
async saveFile(buffer: Buffer, folder: string): Promise<string> { ... }

// S3 전환 시
async saveFile(buffer: Buffer, folder: string): Promise<string> {
  // S3 PutObject 호출
}
```

---

## 10. 구현 체크리스트

### 서버
- [ ] `sharp`, `multer`, `@nestjs/serve-static` 패키지 설치
- [ ] `uploads/defaults/profile.jpg`, `uploads/defaults/club.jpg` 기본 이미지 배치
- [ ] `upload.module.ts` / `upload.service.ts` / `upload.controller.ts` 구현
- [ ] `ServeStaticModule` 등록 (`app.module.ts`)
- [ ] `main.ts`에 업로드 폴더 자동 생성 코드 추가
- [ ] `POST /upload/avatar` — 업로드 + DB 업데이트 + 이전 파일 삭제
- [ ] `DELETE /upload/avatar` — DB null + 파일 삭제
- [ ] `POST /upload/club-logo/:clubId` — CAPTAIN/VICE_CAPTAIN 권한 체크 포함
- [ ] `DELETE /upload/club-logo/:clubId`
- [ ] 파일 크기/타입 제한 미들웨어

### 클라이언트
- [ ] `expo-image-picker` 설치 및 권한 설정 (`app.json`)
- [ ] 프로필 편집 화면 이미지 터치 → picker → upload API 호출
- [ ] 클럽 설정 화면 로고 터치 → picker → upload API 호출 (권한 분기)
- [ ] `AvatarImage` null 시 기본 이미지 fallback
- [ ] 클럽 로고 null 시 기본 이미지 fallback
- [ ] upload hook (`useUploadAvatar`, `useUploadClubLogo`)
