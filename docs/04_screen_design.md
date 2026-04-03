# 04. 화면 설계서 (Screen Design Spec)

> **이 문서의 목적**
> - 모든 화면별 URL 경로, 내비게이션 타입, UI 컴포넌트, 데이터 인터페이스, Redux 슬라이스 매핑, API 엔드포인트를 한 곳에서 확인한다.
> - 코드 작성 시 이 문서를 최우선 기준으로 삼는다.
> - Figma Make 프로토타입(React Web) 기반으로 추출했으며, 실제 구현은 React Native(Expo) 기준으로 재해석한다.

---

## 공통 규칙

### 내비게이션 타입 정의

| 기호 | 내비게이션 타입 | 설명 |
|---|---|---|
| `[TAB]` | Tab Navigator | 하단 탭바에서 전환 |
| `[STACK]` | Stack Navigator | 스택 푸시/팝 이동 |
| `[MODAL]` | Modal (Bottom Sheet / Full Screen) | 위에서 덮어씌워지는 오버레이 |

### 공통 데이터 타입 (전역 참조)

```typescript
// 사용자
interface User {
  id: number;
  name: string;
  email: string;
  nickname: string;
  position: string;
  preferredFoot: 'left' | 'right' | 'both';
  jerseyNumber: number;
  profileImage?: string;
  role: 'captain' | 'member';
  teamId?: number;
  rating?: number;
}

// 팀
interface Team {
  id: number;
  name: string;
  region: string;
  level: number;
  members: number;
  rating?: number;
  description?: string;
  captainId: number;
  monthlyFee?: number;
}

// FCM 토큰
interface FCMToken {
  userId: number;
  token: string;
  platform: 'ios' | 'android';
  updatedAt: string;
}
```

### 공통 컴포넌트 목록

| 컴포넌트명 | 설명 | 사용 화면 |
|---|---|---|
| `PlayerCard` | FIFA 스타일 선수 카드 (rating ≥85: 금, ≥75: 보라, ≥65: 파랑, else: 회색) | Profile, PlayerProfile, TeamMembers |
| `MannerScoreBadge` | 매너 점수 뱃지 (size: sm/md/lg, showDetails 옵션) | Mercenary, Profile, MannerScoreDetail |
| `SoccerFieldMap` | 카카오 지도 기반 축구장 마커 지도 | FieldMap |
| `FieldSearchFilter` | 지역·타입·크기 필터 + 검색창 | FieldMap |
| `MobileLayout` | 공통 헤더 + 스크롤 래퍼 | 대부분 화면 |
| `FormationBoard` | 축구장 배경 위에 포지션 슬롯 렌더링 | PositionSetup, TodayMatch |
| `DraggablePlayer` | react-dnd useDrag 선수 카드 | PositionSetup |
| `PositionSlot` | react-dnd useDrop 포지션 슬롯 | PositionSetup |

---

## 1. 인증 화면

---

### S01. 로그인 화면

| 항목 | 내용 |
|---|---|
| **경로** | `/login` |
| **내비게이션** | `[STACK]` — 루트, 인증 없이 접근 가능 |
| **역할** | 이메일+비밀번호 로그인, 소셜 로그인(Figma: 카카오·구글) |

**UI 컴포넌트:**
- 앱 로고 + 브랜드명 (Hero 영역, 그린 그라디언트 배경)
- 이메일 TextInput
- 비밀번호 TextInput (secureTextEntry)
- '로그인' Primary Button
- 소셜 로그인 버튼 그룹 (카카오: 노랑, 구글: 흰색)
- '회원가입' 텍스트 링크, '비밀번호 찾기' 텍스트 링크

**데이터 인터페이스:**
```typescript
interface LoginRequest {
  email: string;
  password: string;
}
interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}
```

**Redux 슬라이스:** `authSlice` — `{ user, accessToken, isLoggedIn, isLoading, error }`

**API:**
| 메서드 | 엔드포인트 | 설명 |
|---|---|---|
| `POST` | `/api/auth/login` | 이메일 로그인 |
| `POST` | `/api/auth/social/kakao` | 카카오 소셜 로그인 |
| `POST` | `/api/auth/social/google` | 구글 소셜 로그인 |

---

### S02. 회원가입 화면

| 항목 | 내용 |
|---|---|
| **경로** | `/register` |
| **내비게이션** | `[STACK]` — 로그인 화면에서 푸시 |

**UI 컴포넌트:**
- 이메일 TextInput + 중복 확인 버튼
- 비밀번호 TextInput (8자 이상 유효성 표시)
- 비밀번호 확인 TextInput
- 닉네임 TextInput (2~12자)
- '가입하기' Primary Button
- 유효성 오류 인라인 텍스트 (각 필드 하단)

**데이터 인터페이스:**
```typescript
interface RegisterRequest {
  email: string;
  password: string;
  nickname: string;
}
```

**Redux 슬라이스:** `authSlice`

**API:**
| 메서드 | 엔드포인트 | 설명 |
|---|---|---|
| `POST` | `/api/auth/register` | 회원가입 |
| `GET` | `/api/auth/check-email?email=` | 이메일 중복 확인 |

---

### S03. 프로필 초기 설정 (온보딩)

| 항목 | 내용 |
|---|---|
| **경로** | `/onboarding` |
| **내비게이션** | `[STACK]` — 회원가입 직후 진입, 완료 시 `/` (홈) 이동 |

**UI 컴포넌트:**
- 이름(실명) TextInput
- 포지션 선택 SegmentedControl (GK / DF / MF / FW)
- 선호 포지션 MultiSelect
- 주발 선택 (좌발 / 우발 / 양발) RadioButton 그룹
- 등번호 NumericInput (1~99)
- '설정 완료' Primary Button
- '나중에 하기' 텍스트 링크 (일부 항목 건너뛰기)

**데이터 인터페이스:**
```typescript
interface ProfileSetupRequest {
  realName: string;
  position: 'GK' | 'DF' | 'MF' | 'FW';
  preferredPositions: string[];
  preferredFoot: 'left' | 'right' | 'both';
  jerseyNumber: number;
}
```

**Redux 슬라이스:** `userSlice` — `{ profile, isProfileComplete }`

**API:**
| 메서드 | 엔드포인트 | 설명 |
|---|---|---|
| `PUT` | `/api/users/me/profile` | 프로필 초기 설정 저장 |

---

## 2. 홈 화면

---

### S04. 홈 (메인 대시보드)

| 항목 | 내용 |
|---|---|
| **경로** | `/` |
| **내비게이션** | `[TAB]` — 탭바 1번째 |

**UI 컴포넌트:**
- **Hero Section**: 팀명 · Level 배지 · 팀원 수 · 최근 경기 결과 (그린 그라디언트)
- **다음 경기 카드**: D-Day 배지 + 날짜·시간, 블루 그라디언트, `/today-match` 링크
- **빠른 메뉴 그리드 (2×2)**:
  - 축구장 찾기 → `/field-map` (파랑)
  - 포지션 배정 → `/position-setup` (초록)
  - 경기 투표 → `/voting` (보라)
  - 용병 구하기 → `/mercenary` (주황)
- **추천 팀 목록**: 팀명 · 지역 · Level · 팀원 수 · 별점, `/team-search` 연결
- '더 많은 팀 찾아보기' CTA 버튼

**데이터 인터페이스:**
```typescript
interface HomeData {
  myTeam: {
    name: string;
    level: number;
    members: number;
    nextMatch?: string;      // ISO 날짜 문자열
    recentResult?: string;   // '승 3-2'
  };
  recommendedTeams: Array<{
    id: number;
    name: string;
    region: string;
    level: number;
    members: number;
    rating: number;
  }>;
}
```

**Redux 슬라이스:** `teamSlice.myTeam`, `teamSlice.recommendedTeams`

**API:**
| 메서드 | 엔드포인트 | 설명 |
|---|---|---|
| `GET` | `/api/home` | 홈 대시보드 데이터 (myTeam + nextMatch + recommendedTeams) |

---

## 3. 팀 관리 화면

---

### S05. 내 팀 (팀 홈)

| 항목 | 내용 |
|---|---|
| **경로** | `/my-team` |
| **내비게이션** | `[TAB]` — 탭바 2번째 |

**UI 컴포넌트:**
- 팀 헤더 (팀명 · Level · 팀원 수, 그린 그라디언트) + '팀 공유하기' 버튼
- **오늘 경기 카드**: 날짜·상대팀·장소·참석현황(참석N·미정N·불참N) → `/today-match`
- **팀 전적**: 총경기/승/무/패/승률 (5열 그리드 + 승률 프로그레스 바)
- **최근 경기 목록** (3개): 날짜·상대팀·결과뱃지·스코어
- **주요 선수 TOP 3**: 랭크뱃지(금/은/동) + 이름·포지션·평점·MVP 수
- **게시판 미리보기**: 공지 배지 + 최근 공지 → `/team-board`
- **회비 정보 카드**: 월 회비·납부 현황·납부일 → `/team-fees`
- **가입 신청 관리** (팀장 전용): 대기 수 뱃지 → `/team-join-requests`
- Action Buttons: 팀원 보기 → `/team-members`, 포지션 배정 → `/position-setup`, 경기 기록 보기 → `/match-record`

**데이터 인터페이스:**
```typescript
interface MyTeamData {
  team: Team;
  stats: { totalGames: number; wins: number; draws: number; losses: number; winRate: number; };
  recentMatches: Array<{ date: string; opponent: string; result: 'win'|'draw'|'loss'; score: string; }>;
  topPlayers: Array<{ rank: number; name: string; position: string; rating: number; mvpCount: number; }>;
  pendingJoinRequests: number;  // 팀장 전용
  fees: { amount: number; paid: number; total: number; nextDueDate: string; };
}
```

**Redux 슬라이스:** `teamSlice` — `{ myTeam, stats, recentMatches, topPlayers }`

**API:**
| 메서드 | 엔드포인트 | 설명 |
|---|---|---|
| `GET` | `/api/teams/my` | 내 팀 종합 데이터 |
| `GET` | `/api/teams/:teamId/stats` | 팀 전적 통계 |
| `GET` | `/api/teams/:teamId/matches/recent` | 최근 경기 목록 |

---

### S06. 팀 찾기

| 항목 | 내용 |
|---|---|
| **경로** | `/team-search` |
| **내비게이션** | `[STACK]` — 홈 추천 팀 또는 프로필에서 진입 |

**UI 컴포넌트:**
- 검색창 TextInput (팀명 검색)
- 필터 칩 그룹: 지역 · 레벨
- 팀 카드 FlatList: 팀 로고 이니셜 · 팀명 · 지역 · 레벨 · 팀원 수 · 별점 · 모집 상태 배지
- '가입 신청' 버튼 (카드 내부)

**데이터 인터페이스:**
```typescript
interface TeamSearchResult {
  id: number;
  name: string;
  region: string;
  level: number;
  members: number;
  rating: number;
  isRecruiting: boolean;
  hasApplied: boolean;
}
```

**Redux 슬라이스:** `teamSlice.searchResults`

**API:**
| 메서드 | 엔드포인트 | 설명 |
|---|---|---|
| `GET` | `/api/teams/search?q=&region=&level=` | 팀 검색 |
| `POST` | `/api/teams/:teamId/join-request` | 가입 신청 |

---

### S07. 팀 생성

| 항목 | 내용 |
|---|---|
| **경로** | `/team-create` |
| **내비게이션** | `[STACK]` — 프로필 > '새 팀 만들기' |

**UI 컴포넌트:**
- Step 1: 팀명 TextInput + 중복 확인 버튼 / 지역 Picker / 레벨 Picker
- Step 2: 팀 로고 이미지 업로드 (선택) / 팀 소개 TextArea (선택)
- Step 3: 팀원 초대 (링크 생성 또는 건너뛰기)
- 진행 Step Indicator (1/2/3)
- '다음' / '이전' / '팀 생성 완료' 버튼

**데이터 인터페이스:**
```typescript
interface TeamCreateRequest {
  name: string;
  region: string;
  level: number;
  description?: string;
  logoImage?: string;  // base64 또는 업로드 URL
}
```

**API:**
| 메서드 | 엔드포인트 | 설명 |
|---|---|---|
| `GET` | `/api/teams/check-name?name=` | 팀명 중복 확인 |
| `POST` | `/api/teams` | 팀 생성 |

---

### S08. 팀 가입 (초대 링크)

| 항목 | 내용 |
|---|---|
| **경로** | `/team-join/:inviteCode` |
| **내비게이션** | `[STACK]` — Deep Link 진입 |

**UI 컴포넌트:**
- 팀 정보 미리보기 (이름·지역·레벨·팀원 수·소개)
- '가입하기' Primary Button
- '취소' 텍스트 링크
- 만료/오류 시 Error State UI

**API:**
| 메서드 | 엔드포인트 | 설명 |
|---|---|---|
| `GET` | `/api/invite/:inviteCode` | 초대 코드 정보 조회 |
| `POST` | `/api/invite/:inviteCode/join` | 초대 링크로 가입 |

---

### S09. 팀원 목록

| 항목 | 내용 |
|---|---|
| **경로** | `/team-members` |
| **내비게이션** | `[STACK]` — 내 팀 > '팀원 보기' |

**UI 컴포넌트:**
- 검색창 + 포지션 필터 탭 (전체/GK/DF/MF/FW)
- 팀원 카드 FlatList:
  - 프로필 이미지 / 이름 / 포지션 배지 / 등번호 / 역할(팀장뱃지) / 평점 / MVP 수
  - 팀장 전용: 카드 롱프레스 → '팀에서 내보내기' 액션 시트
- 하단 팀원 수 요약

**데이터 인터페이스:**
```typescript
interface TeamMember {
  id: number;
  name: string;
  position: string;
  rating: number;
  gamesPlayed: number;
  goals: number;
  assists: number;
  mvpCount: number;
  joinDate: string;
  phone?: string;
  preferredFoot: string;
  role: 'captain' | 'member';
  jerseyNumber?: number;
}
```

**API:**
| 메서드 | 엔드포인트 | 설명 |
|---|---|---|
| `GET` | `/api/teams/:teamId/members` | 팀원 목록 |
| `DELETE` | `/api/teams/:teamId/members/:userId` | 팀원 추방 (팀장 전용) |

---

### S10. 선수 프로필 상세

| 항목 | 내용 |
|---|---|
| **경로** | `/player/:id` 또는 `/player-profile/:id` |
| **내비게이션** | `[STACK]` — 팀원 목록 카드 탭 |

**UI 컴포넌트:**
- FIFA 스타일 PlayerCard (full size)
- 경기 통계 그리드 (경기 수 · 승률 · 골 · 어시스트)
- 업적 목록 (MVP 횟수 · 해트트릭 여부 · 연속 출석)
- 매너 점수 섹션 → `/mercenary/manner-score/:id` 링크

**데이터 인터페이스:**
```typescript
interface PlayerProfile {
  id: number;
  name: string;
  position: string;
  rating: number;
  gamesPlayed: number;
  goals: number;
  assists: number;
  mvpCount: number;
  winRate: number;
  mannerScore?: MannerScore;
}
```

**API:**
| 메서드 | 엔드포인트 | 설명 |
|---|---|---|
| `GET` | `/api/users/:id/profile` | 선수 상세 프로필 |

---

### S11. 팀 게시판

| 항목 | 내용 |
|---|---|
| **경로** | `/team-board` |
| **내비게이션** | `[STACK]` — 내 팀 > 게시판 섹션 |

**UI 컴포넌트:**
- 탭 필터: 전체 / 공지사항 / 자유게시판
- 게시글 카드 FlatList: 유형 배지 · 제목 · 작성자 · 시간 · 댓글 수
- 공지사항 배지 (빨강)
- 작성 FAB 버튼 (+) → `/team-board/write`
- 게시글 탭 → 상세 모달 또는 Stack 이동

**데이터 인터페이스:**
```typescript
interface BoardPost {
  id: number;
  type: 'notice' | 'free';
  title: string;
  content: string;
  author: string;
  authorId: number;
  createdAt: string;
  commentCount: number;
  sendFcm?: boolean;  // 공지사항만
}
```

**API:**
| 메서드 | 엔드포인트 | 설명 |
|---|---|---|
| `GET` | `/api/teams/:teamId/posts` | 게시글 목록 |
| `POST` | `/api/teams/:teamId/posts` | 게시글 작성 |
| `DELETE` | `/api/teams/:teamId/posts/:postId` | 게시글 삭제 (본인만) |
| `POST` | `/api/teams/:teamId/posts/:postId/comments` | 댓글 작성 |

---

### S12. 게시글 작성

| 항목 | 내용 |
|---|---|
| **경로** | `/team-board/write` |
| **내비게이션** | `[MODAL]` — 게시판 FAB 버튼 |

**UI 컴포넌트:**
- 유형 선택 (공지사항/자유게시판) - 팀장은 공지 선택 가능
- 제목 TextInput
- 내용 TextArea (multiline)
- 'FCM 발송' 토글 (팀장, 공지사항 선택 시만 표시)
- '등록' 버튼

---

### S13. 회비 관리

| 항목 | 내용 |
|---|---|
| **경로** | `/team-fees` |
| **내비게이션** | `[STACK]` — 내 팀 > 회비 정보 카드 |

**UI 컴포넌트:**
- 월 회비 금액 + 다음 납부일
- 납부 현황 프로그레스 바 (N/M명 완료)
- 팀원별 납부 상태 목록: 이름 · 납부여부 토글 (팀장 전용) · 알림 버튼
- '미납자 전체 알림' 버튼 (팀장 전용)

**데이터 인터페이스:**
```typescript
interface TeamFees {
  monthlyAmount: number;
  nextDueDate: string;
  bankAccount?: string;
  members: Array<{
    id: number;
    name: string;
    isPaid: boolean;
  }>;
}
```

**API:**
| 메서드 | 엔드포인트 | 설명 |
|---|---|---|
| `GET` | `/api/teams/:teamId/fees` | 회비 목록 |
| `PATCH` | `/api/teams/:teamId/fees/:userId` | 납부 상태 변경 |
| `POST` | `/api/teams/:teamId/fees/notify` | 미납자 알림 발송 |

---

### S14. 가입 신청 관리 (팀장 전용)

| 항목 | 내용 |
|---|---|
| **경로** | `/team-join-requests` |
| **내비게이션** | `[STACK]` — 내 팀 > 가입 신청 관리 카드 |

**UI 컴포넌트:**
- 신청자 카드 FlatList: 이름 · 포지션 · 신청 시간
- '수락' 버튼 (초록) / '거절' 버튼 (빨강)
- 빈 상태: "대기 중인 가입 신청이 없습니다"

**API:**
| 메서드 | 엔드포인트 | 설명 |
|---|---|---|
| `GET` | `/api/teams/:teamId/join-requests` | 가입 신청 목록 |
| `PATCH` | `/api/teams/:teamId/join-requests/:requestId` | 수락/거절 (`{ status: 'accepted' | 'rejected' }`) |

---

### S15. 팀 초대 링크 생성

| 항목 | 내용 |
|---|---|
| **경로** | `/team-invite` |
| **내비게이션** | `[MODAL]` — 프로필 > '팀원 초대하기' |

**UI 컴포넌트:**
- 초대 링크 텍스트 + '복사' 버튼
- '카카오톡 공유' 버튼 (카카오 SDK)
- '문자 공유' 버튼
- 링크 유효 기간 표시 (7일)
- '새 링크 생성' 버튼 (기존 링크 무효화)

**API:**
| 메서드 | 엔드포인트 | 설명 |
|---|---|---|
| `POST` | `/api/teams/:teamId/invite` | 초대 링크 생성 |
| `GET` | `/api/teams/:teamId/invite` | 현재 초대 링크 조회 |

---

### S16. 팀 나가기

| 항목 | 내용 |
|---|---|
| **경로** | `/team-leave` |
| **내비게이션** | `[MODAL]` — 프로필 > '팀 나가기' |

**UI 컴포넌트:**
- 경고 메시지 ("탈퇴 시 경기 기록은 유지되지만 팀 접근 권한이 사라집니다")
- 팀장 제한 안내: "팀장은 팀을 양도한 후 나갈 수 있습니다"
- '팀 나가기 확인' 버튼 (빨강) / '취소' 버튼

**API:**
| 메서드 | 엔드포인트 | 설명 |
|---|---|---|
| `DELETE` | `/api/teams/:teamId/members/me` | 팀 탈퇴 |

---

### S17. 포지션 배정 (드래그 앤 드롭)

| 항목 | 내용 |
|---|---|
| **경로** | `/position-setup` |
| **내비게이션** | `[STACK]` — 내 팀 > 포지션 배정 |

**UI 컴포넌트:**
- **FormationModal**: 포메이션 선택 목록 (4-4-2, 4-3-3, 4-2-3-1, 3-5-2, 5-3-2 등 20+종)
- **FormationBoard**: 그린 축구장 배경, 포메이션에 따른 PositionSlot 배치
- **PositionSlot** (`useDrop`): 빈 슬롯(점선 원) / 배정된 선수(이름+번호 원)
- **DraggablePlayer** (`useDrag`): 하단 선수 목록 카드 (이름·포지션·등번호)
- 하단 선수 풀 HorizontalScrollView (미배정 선수 목록)
- Action Buttons: '저장' / '초기화' / '무작위 배정' / '이미지 저장·공유'
- '지난 경기 불러오기' / '즐겨찾기 저장·불러오기'

**데이터 인터페이스:**
```typescript
// formations.ts 기반
type PositionKey = 'GK' | 'LB' | 'CB1' | 'CB2' | 'RB' | 'LM' | 'CM' | 'RM' |
                   'LW' | 'ST' | 'RW' | 'CAM' | 'CDM' | 'LWB' | 'RWB' | ...;

interface FormationConfig {
  forward?: PositionKey[];
  attacking?: PositionKey[];
  midfield?: PositionKey[];
  defensive?: PositionKey[];
  defense: PositionKey[];
}

interface PositionAssignment {
  matchId?: number;
  formation: string;       // '4-3-3'
  positions: Record<PositionKey, { playerId: number; playerName: string; jerseyNumber: number; } | null>;
}
```

**Redux 슬라이스:** `matchSlice.positionSetup` — `{ formation, positions, unsavedChanges }`

**API:**
| 메서드 | 엔드포인트 | 설명 |
|---|---|---|
| `GET` | `/api/teams/:teamId/position-setup` | 저장된 포지션 배정 조회 |
| `PUT` | `/api/teams/:teamId/position-setup` | 포지션 배정 저장 |

---

## 4. 경기 관리 화면

---

### S18. 경기 투표 목록

| 항목 | 내용 |
|---|---|
| **경로** | `/voting` |
| **내비게이션** | `[TAB]` — 탭바 3번째 |

**UI 컴포넌트:**
- 팀장 전용 '새 투표 만들기' CTA 버튼 → `/vote-create`
- **진행 중인 투표** 섹션:
  - 투표 카드: 제목·날짜·시간·장소·마감일
  - **3-state 투표 버튼**: 참석(초록) / 미정(노랑) / 불참(빨강)
  - 선택된 버튼 강조 (myVote 상태 반영)
  - 투표 현황 바 (참석 N / 미정 N / 불참 N, 프로그레스 바 3종)
  - 팀장 전용: '리마인드 알림 발송' 버튼 (1시간 쿨다운)
- **종료된 투표** 섹션 (collapsed/folding)

**데이터 인터페이스:**
```typescript
interface Poll {
  id: number;
  title: string;
  date: string;        // '2026-03-08'
  time: string;        // '10:00'
  location: string;
  deadline: string;    // 마감 날짜
  responses: {
    yes: number;       // 참석
    no: number;        // 불참
    maybe: number;     // 미정
  };
  myVote?: 'yes' | 'no' | 'maybe';  // 내 투표 상태
  status: 'active' | 'closed';
}
```

**Redux 슬라이스:** `matchSlice.polls` — `{ items: Poll[], isLoading, error }`

**API:**
| 메서드 | 엔드포인트 | 설명 |
|---|---|---|
| `GET` | `/api/teams/:teamId/polls` | 투표 목록 |
| `POST` | `/api/polls/:pollId/vote` | 투표 (`{ vote: 'yes' | 'no' | 'maybe' }`) |
| `DELETE` | `/api/polls/:pollId/vote` | 투표 취소 |
| `POST` | `/api/polls/:pollId/remind` | 리마인드 알림 발송 |

---

### S19. 투표 생성

| 항목 | 내용 |
|---|---|
| **경로** | `/vote-create` |
| **내비게이션** | `[MODAL]` — 투표 목록 > '새 투표 만들기' |

**UI 컴포넌트:**
- 날짜 DatePicker
- 경기 시간 TimePicker / 집합 시간 TimePicker
- 장소 검색창 (카카오 로컬 API) + 결과 드롭다운
- 상대팀명 TextInput (선택)
- 참가비 NumericInput (선택)
- 메모 TextArea (선택)
- 'FCM 발송 여부' 토글 스위치
- '투표 만들기' Primary Button

**데이터 인터페이스:**
```typescript
interface PollCreateRequest {
  date: string;
  time: string;
  gatherTime?: string;
  location: string;
  locationLat?: number;
  locationLng?: number;
  opponentTeam?: string;
  fee?: number;
  memo?: string;
  sendFcm: boolean;
}
```

**API:**
| 메서드 | 엔드포인트 | 설명 |
|---|---|---|
| `POST` | `/api/teams/:teamId/polls` | 투표 생성 |
| `GET` | `/api/kakao/local/search?q=` | 카카오 로컬 검색 (BFF 경유) |

---

### S20. 오늘의 경기

| 항목 | 내용 |
|---|---|
| **경로** | `/today-match` |
| **내비게이션** | `[STACK]` — 홈·내 팀 > 오늘 경기 카드 탭 |

**UI 컴포넌트:**
- **VS 헤더 카드**: 우리팀 vs 상대팀명, 날짜·장소 (그린 그라디언트)
- **참여 현황**: 참석(초록) / 미정(노랑) / 불참(빨강) 3개 원형 아이콘 + 수치
- 참석 선수 목록 (ChipList)
- **포메이션 미리보기**: FormationBoard (읽기 전용) + '수정' 버튼 → `/position-setup`
- **상대팀 정보**: 레벨·별점·최근 전적·스카우팅 코멘트
- **경기장 정보**: 주소 + '지도에서 보기' 버튼 → 카카오맵 앱 딥링크
- `isMatchEnded` 분기:
  - **경기 전**: '투표 보기' / '포지션 수정' 버튼
  - **경기 후**: 노란 배너 + '경기 기록하기' CTA → `/match-record-detail`

**데이터 인터페이스:**
```typescript
interface TodayMatchInfo {
  pollId: number;
  date: string;
  time: string;
  endTime: string;             // 경기 종료 예정 시간
  location: string;
  locationAddress: string;
  opponent?: string;
  opponentLevel?: number;
  opponentRating?: number;
  formation: string;
  positions: Record<PositionKey, { player: string; number: number; }>;
  attendance: { yes: number; no: number; maybe: number; };
  attendingPlayers: string[];
  notAttendingPlayers: string[];
  isMatchEnded: boolean;       // 현재 시간 > endTime
  isRecordSubmitted: boolean;  // 기록 제출 여부
}
```

**Redux 슬라이스:** `matchSlice.todayMatch`

**API:**
| 메서드 | 엔드포인트 | 설명 |
|---|---|---|
| `GET` | `/api/teams/:teamId/today-match` | 오늘 경기 종합 데이터 |

---

### S21. 경기 기록 목록

| 항목 | 내용 |
|---|---|
| **경로** | `/match-record` |
| **내비게이션** | `[STACK]` — 내 팀 > '경기 기록 보기' |

**UI 컴포넌트:**
- 전적 요약 (승/무/패 3색 카드)
- 필터 탭: 전체 / 승 / 무 / 패
- '경기 기록 추가' 버튼 (팀장 전용) → 하단 시트 모달
- **경기 카드 FlatList**:
  - 그린 헤더: 날짜 · 결과 뱃지 · 상대팀 · 스코어
  - 카드 바디: 득점자 목록 · 어시스트 목록 · MVP 뱃지
  - 탭 → `/match-record/:id`

**데이터 인터페이스:**
```typescript
interface MatchRecord {
  id: number;
  date: string;
  opponent: string;
  result: 'win' | 'draw' | 'loss';
  score: string;          // '3-2'
  myTeamScore: number;
  opponentScore: number;
  goals: Array<{ player: string; count: number; }>;
  assists: Array<{ player: string; count: number; }>;
  mvp?: string;
  players: string[];      // 출전 선수
}
```

**API:**
| 메서드 | 엔드포인트 | 설명 |
|---|---|---|
| `GET` | `/api/teams/:teamId/matches` | 경기 기록 목록 |
| `POST` | `/api/teams/:teamId/matches` | 경기 기록 추가 |

---

### S22. 경기 기록 상세 (4-Tab)

| 항목 | 내용 |
|---|---|
| **경로** | `/match-record/:id` 또는 `/match-record-detail` |
| **내비게이션** | `[STACK]` — 경기 기록 목록 카드 탭 |

**UI 컴포넌트:**
- 헤더: 날짜·상대팀·스코어·결과
- **4 Tab Navigator**:
  1. **기록 탭**: 득점자·어시스트·출전 선수 목록 / PlayerSelectModal (팀장 수정)
  2. **댓글 탭**: 댓글 FlatList + 입력창
  3. **영상 탭**: 유튜브 URL 썸네일 카드 목록 → `/match-record/:matchId/video/:videoId/comments`
  4. **리뷰 탭**: 상대팀 MVP 투표 결과 (P2)
- **MVP 투표 섹션** (기록 탭 하단):
  - mvpCandidates 선수 목록 (1인 선택)
  - 투표 버튼 / 결과 뱃지
- 팀장 전용: '수정' / '삭제' 버튼

**데이터 인터페이스:**
```typescript
interface MatchDetail extends MatchRecord {
  comments: Array<{ id: number; author: string; content: string; createdAt: string; }>;
  videos: Array<{ id: number; youtubeUrl: string; thumbnail: string; title: string; }>;
  mvpVoting: {
    isOpen: boolean;
    myVote?: number;
    candidates: Array<{ id: number; name: string; votes: number; }>;
  };
  players: Array<{ id: number; name: string; position: string; }>;
}
```

**API:**
| 메서드 | 엔드포인트 | 설명 |
|---|---|---|
| `GET` | `/api/matches/:matchId` | 경기 상세 |
| `PUT` | `/api/matches/:matchId` | 경기 기록 수정 (팀장) |
| `DELETE` | `/api/matches/:matchId` | 경기 기록 삭제 (팀장) |
| `POST` | `/api/matches/:matchId/comments` | 댓글 등록 |
| `POST` | `/api/matches/:matchId/videos` | 영상 URL 등록 |
| `POST` | `/api/matches/:matchId/mvp-vote` | MVP 투표 |

---

### S23. 영상 댓글

| 항목 | 내용 |
|---|---|
| **경로** | `/match-record/:matchId/video/:videoId/comments` 또는 `/video-comments/:videoId` |
| **내비게이션** | `[STACK]` — 경기 상세 > 영상 탭 > 영상 카드 탭 |

**UI 컴포넌트:**
- 상단 영상 섹션 (유튜브 썸네일 + 제목)
- 댓글 FlatList
- 하단 댓글 입력창 + '등록' 버튼

**API:**
| 메서드 | 엔드포인트 | 설명 |
|---|---|---|
| `GET` | `/api/videos/:videoId/comments` | 영상 댓글 목록 |
| `POST` | `/api/videos/:videoId/comments` | 영상 댓글 등록 |

---

## 5. 프로필 화면

---

### S24. 내 프로필

| 항목 | 내용 |
|---|---|
| **경로** | `/profile` |
| **내비게이션** | `[TAB]` — 탭바 4번째 (또는 5번째) |

**UI 컴포넌트:**
- 프로필 헤더 (이름·포지션·레벨, 그린 그라디언트) + 편집 버튼
- **PlayerCard** (FIFA 스타일, full size)
- 경기 통계 그리드 (경기 수·승률·골·어시스트)
- 업적 목록 (MVP 수·해트트릭·연속 출석)
- **매너 점수 섹션**: `MannerScoreBadge` + 항목별 점수 그리드 → `/mercenary/manner-score/:userId`
- 소속 팀 카드
- 팀 관리 버튼 그룹: 팀원 초대 · 새 팀 만들기 · 팀 나가기
- 설정 버튼 · 로그아웃 버튼 · 회원 탈퇴 버튼 (빨강)

**데이터 인터페이스:**
```typescript
interface UserStats {
  userId: number;
  name: string;
  position: string;
  rating: number;
  gamesPlayed: number;
  goals: number;
  assists: number;
  mvpCount: number;
  winRate: number;
  achievements: Achievement[];
  mannerScore?: MannerScore;
}

interface MannerScore {
  totalScore: number;
  punctuality: number;
  skill: number;
  attitude: number;
  communication: number;
  reviews: number;
}
```

**Redux 슬라이스:** `userSlice` — `{ profile, stats, mannerScore }`

**API:**
| 메서드 | 엔드포인트 | 설명 |
|---|---|---|
| `GET` | `/api/users/me` | 내 프로필 + 통계 |
| `PUT` | `/api/users/me/profile` | 프로필 수정 |

---

### S25. 회원 탈퇴

| 항목 | 내용 |
|---|---|
| **경로** | `/account-delete` |
| **내비게이션** | `[STACK]` — 프로필 > '회원 탈퇴' |

**UI 컴포넌트:**
- 탈퇴 경고 문구 (데이터 삭제 안내)
- 비밀번호 재확인 TextInput
- 탈퇴 사유 선택 (RadioButton: 서비스 불만족·개인정보 삭제·기타)
- '탈퇴 확인' 버튼 (빨강) / '취소' 버튼

**API:**
| 메서드 | 엔드포인트 | 설명 |
|---|---|---|
| `DELETE` | `/api/users/me` | 회원 탈퇴 |

---

## 6. 용병 매칭 화면

---

### S26. 용병 매칭 목록

| 항목 | 내용 |
|---|---|
| **경로** | `/mercenary` |
| **내비게이션** | `[TAB]` — 탭바 (또는 홈 빠른 메뉴) |

**UI 컴포넌트:**
- 탭 스위치: **용병 구함** (주황) / **용병 가능** (파랑)
- '등록' CTA 버튼 (탭에 따라 `/mercenary/create-wanted` 또는 `/mercenary/create-available`)
- 필터 버튼 (포지션·지역·레벨·날짜)
- **게시글 카드 FlatList** (`MercenaryPost`):
  - 작성자·레벨 배지·별점
  - `wanted` 탭에는 지원자 수 표시
  - `available` 탭에는 `MannerScoreBadge` 표시 (매너 점수 클릭 → MannerScoreDetail)
  - 포지션 박스 (그린 그라디언트)
  - 장소·날짜·시간·설명
  - 탭 → 상세 화면

**데이터 인터페이스:**
```typescript
interface MercenaryPost {
  id: number;
  type: 'wanted' | 'available';
  author: string;
  authorId: number;
  position: string;
  date: string;
  time: string;
  location: string;
  rating: number;
  description: string;
  level?: string;
  applicants?: number;    // wanted 타입만
  hasApplied?: boolean;   // 현재 사용자 지원 여부
}
```

**API:**
| 메서드 | 엔드포인트 | 설명 |
|---|---|---|
| `GET` | `/api/mercenary?type=wanted&position=&region=` | 용병 구함 목록 |
| `GET` | `/api/mercenary?type=available&position=&region=` | 용병 가능 목록 |

---

### S27. 용병 구함 상세 / S28. 용병 가능 상세

| 경로 | `/mercenary/wanted/:postId` / `/mercenary/available/:postId` |
|---|---|
| **내비게이션** | `[STACK]` |

**UI 컴포넌트:**
- 상세 정보 (작성자·포지션·날짜·장소·설명·레벨)
- `wanted`: '지원하기' 버튼 → 지원 완료 시 '지원 완료' 비활성 버튼
- `available`: '채팅하기' 버튼 → `/chat/:authorId`
- 매너 점수 섹션 → `/mercenary/manner-score/:authorId`

**API:**
| 메서드 | 엔드포인트 | 설명 |
|---|---|---|
| `GET` | `/api/mercenary/:postId` | 게시글 상세 |
| `POST` | `/api/mercenary/:postId/apply` | 지원하기 |

---

### S29. 지원자 목록 (작성자 전용)

| 항목 | 내용 |
|---|---|
| **경로** | `/mercenary/applicants/:postId` |
| **내비게이션** | `[STACK]` |

**UI 컴포넌트:**
- 지원자 카드: 이름·포지션·매너 점수·지원 시간
- '채팅' 버튼 → `/chat/:applicantId`
- '수락' / '거절' 버튼

**API:**
| 메서드 | 엔드포인트 | 설명 |
|---|---|---|
| `GET` | `/api/mercenary/:postId/applicants` | 지원자 목록 |
| `PATCH` | `/api/mercenary/:postId/applicants/:userId` | 수락/거절 |

---

## 7. 매너 점수 화면

---

### S30. 매너 점수 상세

| 항목 | 내용 |
|---|---|
| **경로** | `/mercenary/manner-score/:userId` |
| **내비게이션** | `[STACK]` |

**UI 컴포넌트:**
- 총점 + 레벨 뱃지 (MannerScoreBadge large)
- 항목별 점수 그리드:
  - 시간 준수(파랑) / 실력(초록) / 태도(보라) / 의사소통(주황)
- 최근 리뷰 목록 (익명 처리된 작성자)
- 리뷰 수 부족 시 안내 메시지

**데이터 인터페이스:**
```typescript
interface MannerScoreDetail {
  userId: number;
  totalScore: number;
  punctuality: number;
  skill: number;
  attitude: number;
  communication: number;
  reviews: number;
  recentReviews: Array<{
    id: number;
    content?: string;
    createdAt: string;
  }>;
}
```

**API:**
| 메서드 | 엔드포인트 | 설명 |
|---|---|---|
| `GET` | `/api/users/:userId/manner-score` | 매너 점수 조회 |

---

### S31. 경기 평가

| 항목 | 내용 |
|---|---|
| **경로** | `/mercenary/evaluate/:matchId` |
| **내비게이션** | `[STACK]` — FCM 알림 탭 또는 경기 기록 상세 |

**UI 컴포넌트:**
- 경기 정보 헤더 (날짜·상대팀)
- 선수 목록 (본인 제외): 각 선수별 4항목 별점 (1~5점)
- '평가 완료' Primary Button

**API:**
| 메서드 | 엔드포인트 | 설명 |
|---|---|---|
| `POST` | `/api/matches/:matchId/evaluate` | 경기 평가 제출 |

---

### S32. 노쇼 신고

| 항목 | 내용 |
|---|---|
| **경로** | `/mercenary/report-noshow/:matchId` |
| **내비게이션** | `[STACK]` |

**UI 컴포넌트:**
- 노쇼 선수 선택 목록
- 신고 사유 선택 (RadioButton)
- '신고하기' 버튼 (빨강)

**API:**
| 메서드 | 엔드포인트 | 설명 |
|---|---|---|
| `POST` | `/api/matches/:matchId/report-noshow` | 노쇼 신고 |

---

### S33. 내 평가 내역

| 항목 | 내용 |
|---|---|
| **경로** | `/mercenary/my-evaluations` |
| **내비게이션** | `[STACK]` — 프로필 또는 매너 점수 상세 |

**UI 컴포넌트:**
- 받은 평가 / 남긴 평가 탭
- 평가 카드 목록: 날짜·경기·평균 점수·코멘트

**API:**
| 메서드 | 엔드포인트 | 설명 |
|---|---|---|
| `GET` | `/api/users/me/evaluations` | 내 평가 내역 |

---

## 8. 채팅 화면

---

### S34. 채팅 목록

| 항목 | 내용 |
|---|---|
| **경로** | `/chat-list` |
| **내비게이션** | `[TAB]` 또는 `[STACK]` |

**UI 컴포넌트:**
- 채팅 방 FlatList: 상대방 이름·프로필 이미지·마지막 메시지·시간·미읽음 뱃지

**API:**
| 메서드 | 엔드포인트 | 설명 |
|---|---|---|
| `GET` | `/api/chats` | 채팅 목록 |

---

### S35. 1:1 채팅

| 항목 | 내용 |
|---|---|
| **경로** | `/chat/:userId` |
| **내비게이션** | `[STACK]` — 용병 게시글 상세 또는 채팅 목록 |

**UI 컴포넌트:**
- 메시지 FlatList (날짜 구분선, 내 메시지 오른쪽/상대 왼쪽)
- 하단 TextInput + 전송 버튼
- 실시간 업데이트 (WebSocket 또는 Polling)

**데이터 인터페이스:**
```typescript
interface ChatMessage {
  id: number;
  senderId: number;
  content: string;
  createdAt: string;
  isRead: boolean;
}
```

**API:**
| 메서드 | 엔드포인트 | 설명 |
|---|---|---|
| `GET` | `/api/chats/:userId/messages` | 채팅 메시지 목록 |
| `POST` | `/api/chats/:userId/messages` | 메시지 전송 |
| `WS` | `ws://api/chats/:userId` | 실시간 메시지 (WebSocket) |

---

## 9. 축구장 지도 화면

---

### S36. 전국 축구장 찾기

| 항목 | 내용 |
|---|---|
| **경로** | `/field-map` |
| **내비게이션** | `[STACK]` — 홈 빠른 메뉴 > '축구장 찾기' |

**UI 컴포넌트:**
- **FieldSearchFilter**: 키워드 검색창 + 필터 (지역/타입/크기 Picker)
- **SoccerFieldMap** (카카오 지도): 축구장 위치 마커, 마커 클릭 시 말풍선 상세
- 결과 수 카운트 ("N개 결과")
- 안내 문구

**데이터 인터페이스:**
```typescript
interface SoccerField {
  id: number;
  name: string;
  address: string;
  lat: number;
  lng: number;
  type: '천연잔디' | '인조잔디' | '풋살장';
  size: '11인제' | '8인제' | '5인제';
  phone?: string;
}

interface FilterOptions {
  region: string;   // '전체' | '강남' | '강북' | ...
  type: string;     // '전체' | '천연잔디' | '인조잔디' | '풋살장'
  size: string;     // '전체' | '11인제' | '8인제' | '5인제'
}
```

**API (카카오 지도 BFF):**
| 메서드 | 엔드포인트 | 설명 |
|---|---|---|
| `GET` | `/api/fields?region=&type=&size=&q=` | 축구장 목록 (서버 캐싱) |

---

## 10. 화면 전체 목록 요약

| # | 화면명 | 경로 | 내비 | 우선순위 | 비고 |
|---|---|---|---|---|---|
| S01 | 로그인 | `/login` | STACK | P0 | |
| S02 | 회원가입 | `/register` | STACK | P0 | |
| S03 | 프로필 초기 설정 | `/onboarding` | STACK | P0 | |
| S04 | 홈 | `/` | TAB | P0 | |
| S05 | 내 팀 | `/my-team` | TAB | P0 | |
| S06 | 팀 찾기 | `/team-search` | STACK | P0 | |
| S07 | 팀 생성 | `/team-create` | STACK | P0 | |
| S08 | 팀 가입 (초대 링크) | `/team-join/:inviteCode` | STACK | P0 | Deep Link |
| S09 | 팀원 목록 | `/team-members` | STACK | P0 | |
| S10 | 선수 프로필 | `/player/:id` | STACK | P0 | |
| S11 | 팀 게시판 | `/team-board` | STACK | P0 | |
| S12 | 게시글 작성 | `/team-board/write` | MODAL | P0 | |
| S13 | 회비 관리 | `/team-fees` | STACK | P1 | |
| S14 | 가입 신청 관리 | `/team-join-requests` | STACK | P0 | 팀장 전용 |
| S15 | 팀 초대 링크 | `/team-invite` | MODAL | P0 | |
| S16 | 팀 나가기 | `/team-leave` | MODAL | P0 | |
| S17 | 포지션 배정 | `/position-setup` | STACK | P0 | DnD |
| S18 | 경기 투표 목록 | `/voting` | TAB | P0 | 3-state |
| S19 | 투표 생성 | `/vote-create` | MODAL | P0 | 팀장 전용 |
| S20 | 오늘의 경기 | `/today-match` | STACK | P0 | |
| S21 | 경기 기록 목록 | `/match-record` | STACK | P0 | |
| S22 | 경기 기록 상세 | `/match-record/:id` | STACK | P0 | 4 Tab |
| S23 | 영상 댓글 | `/match-record/:matchId/video/:videoId/comments` | STACK | P2 | |
| S24 | 내 프로필 | `/profile` | TAB | P0 | |
| S25 | 회원 탈퇴 | `/account-delete` | STACK | P0 | |
| S26 | 용병 매칭 목록 | `/mercenary` | TAB/STACK | P1 | |
| S27 | 용병 구함 상세 | `/mercenary/wanted/:postId` | STACK | P1 | |
| S28 | 용병 가능 상세 | `/mercenary/available/:postId` | STACK | P1 | |
| S29 | 지원자 목록 | `/mercenary/applicants/:postId` | STACK | P1 | |
| S30 | 매너 점수 상세 | `/mercenary/manner-score/:userId` | STACK | P2 | |
| S31 | 경기 평가 | `/mercenary/evaluate/:matchId` | STACK | P2 | |
| S32 | 노쇼 신고 | `/mercenary/report-noshow/:matchId` | STACK | P2 | |
| S33 | 내 평가 내역 | `/mercenary/my-evaluations` | STACK | P2 | |
| S34 | 채팅 목록 | `/chat-list` | TAB/STACK | P2 | |
| S35 | 1:1 채팅 | `/chat/:userId` | STACK | P2 | WebSocket |
| S36 | 축구장 지도 | `/field-map` | STACK | P2 | 카카오맵 |

---

## 11. Redux 슬라이스 구조 요약

```typescript
// store 구조 (RootState)
{
  auth: {
    user: User | null,
    accessToken: string | null,
    refreshToken: string | null,
    isLoggedIn: boolean,
    isLoading: boolean,
    error: string | null,
  },
  user: {
    profile: UserStats | null,
    isProfileComplete: boolean,
    mannerScore: MannerScoreDetail | null,
  },
  team: {
    myTeam: Team | null,
    myTeamStats: TeamStats | null,
    recentMatches: MatchRecord[],
    topPlayers: TopPlayer[],
    members: TeamMember[],
    searchResults: TeamSearchResult[],
    pendingRequests: JoinRequest[],
    fees: TeamFees | null,
    positionSetup: PositionAssignment | null,
  },
  match: {
    polls: Poll[],
    todayMatch: TodayMatchInfo | null,
    matchRecords: MatchRecord[],
    currentMatch: MatchDetail | null,
  },
  mercenary: {
    posts: MercenaryPost[],
    currentPost: MercenaryPost | null,
    applicants: Applicant[],
  },
  chat: {
    rooms: ChatRoom[],
    messages: Record<number, ChatMessage[]>,
    unreadCount: number,
  },
}
```

> **TanStack Query 역할 분리 원칙**
> - **서버 상태 (TanStack Query)**: API 응답 캐싱, 백그라운드 리페치, 무한 스크롤 (`useInfiniteQuery`)
> - **클라이언트 상태 (Redux Toolkit)**: 인증 토큰, 사용자 정보, UI 전역 상태 (토스트, 모달 오픈 여부)
> - 명명 규칙: Query Key는 `['matches', teamId]` 형식의 배열, Mutation은 `use[Action][Entity]Mutation` 네이밍
