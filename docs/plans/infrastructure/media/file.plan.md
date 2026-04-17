# 파일 업로드 (File Upload) Plan

## 1. 기능 개요

- **목적**: 유저 프로필 이미지 / 클럽 로고 이미지를 서버에 업로드하고, sharp로 리사이징하여 로컬 디스크에 저장한다. 향후 S3 전환이 가능한 구조로 설계한다.

- **핵심 사용자 시나리오**:

  **GIVEN** 로그인한 유저가 프로필 편집 화면에 진입했을 때  
  **WHEN** 프로필 이미지를 터치하여 갤러리에서 이미지를 선택하면  
  **THEN** 이미지가 서버에 업로드되어 256×256으로 리사이징 저장되고, 프로필 화면에 즉시 반영된다.

  **GIVEN** CAPTAIN 또는 VICE_CAPTAIN이 클럽 설정 화면에 진입했을 때  
  **WHEN** 클럽 로고를 터치하여 이미지를 선택하면  
  **THEN** 로고가 서버에 업로드되어 저장되고, 클럽 화면 전체에 즉시 반영된다.

  **GIVEN** 유저/클럽에 이미지가 없을 때  
  **WHEN** 앱 어디서든 프로필 or 클럽 로고를 조회하면  
  **THEN** `avatarUrl` / `logoUrl` 이 null이면 클라이언트가 기본 이미지를 표시한다.

---

## 2. 클라이언트 라우트

| 경로 | 설명 | 내비게이션 타입 |
|---|---|---|
| `(app)/profile/edit` | 프로필 편집 (기존) — 이미지 터치 시 picker 진입 | stack |
| `(app)/club/settings` | 클럽 설정 (기존) — 로고 터치 시 picker 진입 | stack |

> 별도 라우트 추가 없음. 기존 편집 화면에 이미지 picker + upload 로직 주입.

---

## 3. API 설계

| Method | Endpoint | 설명 | Auth |
|---|---|---|---|
| POST | `/upload/avatar` | 내 프로필 이미지 업로드 | 로그인 |
| DELETE | `/upload/avatar` | 내 프로필 이미지 삭제 (기본 이미지로) | 로그인 |
| POST | `/upload/club-logo/:clubId` | 클럽 로고 업로드 | CAPTAIN / VICE_CAPTAIN |
| DELETE | `/upload/club-logo/:clubId` | 클럽 로고 삭제 (기본 이미지로) | CAPTAIN / VICE_CAPTAIN |

### 요청 형식

```
Content-Type: multipart/form-data
필드명: image (File)
```

### 응답

```json
{ "url": "/uploads/avatars/abc123.jpg" }
```

### 업로드 제약

| 항목 | 값 |
|---|---|
| 최대 파일 크기 | 5 MB |
| 허용 MIME | `image/jpeg`, `image/png`, `image/webp` |
| 저장 형식 | JPEG (항상 변환) |
| 리사이즈 | 256 × 256 px (center crop) |

---

## 4. 데이터 레이어 설계 (`client/src/features/upload/data/`)

### Schemas (Zod)

```ts
// upload.schema.ts
export const uploadResponseSchema = z.object({
  url: z.string(),
});
export type UploadResponse = z.infer<typeof uploadResponseSchema>;
```

### Services (`data/services/upload.service.ts`)

| 함수 | 설명 |
|---|---|
| `uploadAvatar(formData: FormData)` | `POST /upload/avatar` — multipart 전송, 응답 Zod 파싱 |
| `deleteAvatar()` | `DELETE /upload/avatar` |
| `uploadClubLogo(clubId: string, formData: FormData)` | `POST /upload/club-logo/:clubId` |
| `deleteClubLogo(clubId: string)` | `DELETE /upload/club-logo/:clubId` |

> `Content-Type: multipart/form-data` 헤더를 명시적으로 설정하지 않아도 FormData 전달 시 Axios가 자동 처리함.

### Hooks (`data/hooks/useUpload.ts`)

| Hook | 종류 | 설명 |
|---|---|---|
| `useUploadAvatar()` | `useMutation` | 성공 시 `['my-profile']` invalidate |
| `useDeleteAvatar()` | `useMutation` | 성공 시 `['my-profile']` invalidate |
| `useUploadClubLogo(clubId)` | `useMutation` | 성공 시 `['my-club']`, `['club', clubId]` invalidate |
| `useDeleteClubLogo(clubId)` | `useMutation` | 성공 시 `['my-club']`, `['club', clubId]` invalidate |

---

## 5. UI 레이어 설계

### 진입점 — 기존 화면에 통합

**프로필 편집 (`profile/edit.tsx` Container)**
- `AvatarImage` 위에 `TouchableOpacity` 래핑 → 터치 시 `expo-image-picker` 호출
- 이미지 선택 후 `FormData` 생성 → `useUploadAvatar().mutate(formData)`
- 업로드 중 Avatar 위에 `<ActivityIndicator>` 오버레이

**클럽 설정 (club settings Container)**
- 로고 이미지 터치 → `expo-image-picker` → `useUploadClubLogo(clubId).mutate(formData)`
- CAPTAIN / VICE_CAPTAIN만 터치 가능 (`canEditLogo` boolean prop 전달)

### 공통 헬퍼 (`src/shared/utils/imageUrl.ts`)

```ts
const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';
const DEFAULT_AVATAR  = `${BASE_URL}/uploads/defaults/profile.jpg`;
const DEFAULT_CLUB_LOGO = `${BASE_URL}/uploads/defaults/club.jpg`;

export function getAvatarUrl(url: string | null | undefined): string {
  return url ? `${BASE_URL}${url}` : DEFAULT_AVATAR;
}
export function getClubLogoUrl(url: string | null | undefined): string {
  return url ? `${BASE_URL}${url}` : DEFAULT_CLUB_LOGO;
}
```

> `AvatarImage`, 클럽 로고 렌더링 시 이 헬퍼를 통해 `source={{ uri }}` 주입.  
> DB의 `avatarUrl` / `logoUrl` null 여부에 따라 기본 이미지 자동 fallback.

---

## 6. 서버 레이어 설계 (`server/src/features/upload/`)

### 디렉토리 구조

```
server/src/features/upload/
├── upload.module.ts
├── upload.controller.ts
└── upload.service.ts
```

### DTO

별도 DTO 없음. `@UploadedFile()` 데코레이터로 `Express.Multer.File` 직접 수신.

### Service 메서드

| 메서드 | 설명 |
|---|---|
| `uploadAvatar(userId, file)` | sharp 변환 → `uploads/avatars/{uuid}.jpg` 저장 → `user.avatarUrl` 업데이트 → 이전 파일 삭제 → url 반환 |
| `deleteAvatar(userId)` | `user.avatarUrl = null` → 기존 파일 삭제 |
| `uploadClubLogo(clubId, userId, file)` | 권한 확인 → sharp 변환 → `uploads/clubs/{uuid}.jpg` → `club.logoUrl` 업데이트 → 이전 파일 삭제 → url 반환 |
| `deleteClubLogo(clubId, userId)` | 권한 확인 → `club.logoUrl = null` → 기존 파일 삭제 |
| `private processImage(buffer)` | sharp().resize(256,256,'cover').jpeg({quality:80}).toBuffer() |
| `private saveFile(buffer, folder)` | uuid 파일명 생성 → fs.writeFile → `/uploads/{folder}/{uuid}.jpg` 반환 |
| `private deleteOldFile(url)` | url이 `/uploads/defaults/` 경로가 아닌 경우에만 fs.unlink |

### Controller 엔드포인트

```ts
@Post('avatar')
@UseGuards(AuthGuard)
@UseInterceptors(FileInterceptor('image'))
uploadAvatar(@CurrentUser() user, @UploadedFile() file)

@Delete('avatar')
@UseGuards(AuthGuard)
deleteAvatar(@CurrentUser() user)

@Post('club-logo/:clubId')
@UseGuards(AuthGuard)
@UseInterceptors(FileInterceptor('image'))
uploadClubLogo(@Param('clubId') clubId, @CurrentUser() user, @UploadedFile() file)

@Delete('club-logo/:clubId')
@UseGuards(AuthGuard)
deleteClubLogo(@Param('clubId') clubId, @CurrentUser() user)
```

### `app.module.ts` 추가

```ts
ServeStaticModule.forRoot({
  rootPath: join(__dirname, '..', 'uploads'),
  serveRoot: '/uploads',
  exclude: ['/api*'],
})
```

### `main.ts` 업로드 폴더 자동 생성

```ts
['uploads/avatars', 'uploads/clubs', 'uploads/defaults'].forEach((dir) =>
  mkdirSync(join(process.cwd(), dir), { recursive: true }),
);
```

---

## 7. 예외 처리

### 서버 에러 코드

| 코드 | 설명 | HTTP |
|---|---|---|
| `UPLOAD_001` | 파일이 첨부되지 않음 | 400 |
| `UPLOAD_002` | 허용되지 않는 파일 형식 (MIME 불일치) | 415 |
| `UPLOAD_003` | 파일 크기 초과 (5MB) | 413 |
| `UPLOAD_004` | 클럽 로고 수정 권한 없음 (CAPTAIN/VICE_CAPTAIN 아님) | 403 |
| `UPLOAD_005` | 존재하지 않는 클럽 | 404 |

### 클라이언트 에러 처리

| 상황 | 처리 |
|---|---|
| `UPLOAD_002` / `UPLOAD_003` | `toast.error('이미지 파일만 업로드 가능합니다.')` / `toast.error('파일 크기는 5MB 이하여야 합니다.')` |
| `UPLOAD_004` | `toast.error('권한이 없습니다.')` |
| 네트워크 오류 | `toast.error('업로드에 실패했습니다.')` |
| picker 권한 거부 | `Alert.alert('갤러리 접근 권한이 필요합니다.')` |

---

## 8. 구현 체크리스트

### 서버
- [ ] 의존성 설치: `sharp`, `multer`, `@types/multer`, `@nestjs/serve-static`, `uuid`, `@types/uuid`
- [ ] `uploads/defaults/profile.jpg`, `uploads/defaults/club.jpg` 기본 이미지 파일 배치
- [ ] `upload.module.ts` — FileInterceptor multer 설정 (메모리 스토리지, 5MB, MIME 필터)
- [ ] `upload.service.ts` — processImage / saveFile / deleteOldFile private 메서드
- [ ] `upload.service.ts` — uploadAvatar / deleteAvatar
- [ ] `upload.service.ts` — uploadClubLogo / deleteClubLogo (권한 확인 포함)
- [ ] `upload.controller.ts` — 4개 엔드포인트 + Swagger 데코레이터
- [ ] `common/constants/error-codes.ts` — UPLOAD_001~005 추가
- [ ] `app.module.ts` — ServeStaticModule 등록
- [ ] `main.ts` — 업로드 폴더 자동 생성
- [ ] `.gitignore` — `uploads/avatars/`, `uploads/clubs/` 추가 (defaults는 추적)

### 클라이언트
- [ ] `expo-image-picker` 설치 + `app.json` 권한 설정 (`NSPhotoLibraryUsageDescription`)
- [ ] `src/features/upload/data/schemas/upload.schema.ts` 작성
- [ ] `src/features/upload/data/services/upload.service.ts` 작성
- [ ] `src/features/upload/data/hooks/useUpload.ts` 작성
- [ ] `src/shared/utils/imageUrl.ts` 헬퍼 작성 (`getAvatarUrl`, `getClubLogoUrl`)
- [ ] 프로필 편집 Container — 이미지 터치 → picker → upload 연결
- [ ] 클럽 설정 Container — 로고 터치 → picker → upload 연결 (권한 분기)
- [ ] 앱 전역 `AvatarImage` 사용처에 `getAvatarUrl()` 적용
- [ ] 앱 전역 클럽 로고 사용처에 `getClubLogoUrl()` 적용
