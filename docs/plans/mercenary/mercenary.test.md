# 용병 기능 테스트 가이드

> seed 실행 전제: `cd server && npm run db:seed && npm run seed:club && npm run seed:match && npm run seed:matching && npm run seed:mercenary`
> 마이그레이션 전제: `cd server && npx prisma migrate dev --name add-mercenary-feature`

---

## 🚩 시나리오 1: 용병 구함 등록 (관리자)

**[CASE ID: MERC-05-001, MERC-05-002]**

### 준비물
- 마무리FC 주장 (`captain@mamurifc.test`) — phone=010-1111-2222

### 테스트 순서
1. `captain@mamurifc.test`로 로그인
2. 하단 탭 바 **[용병]** 탭 탭
3. **[용병 구함]** 탭 → 우측 하단 `+` FAB 탭
4. 폼 입력:
   - 포지션: FW 칩 탭
   - 필요 인원: `1`
   - 경기 날짜: 달력에서 미래 날짜 선택
   - 시작/종료 시간: `14:00` / `16:00`
   - 구장: `테스트구장`
   - 지역: `서울 종로구`
   - 레벨: `AMATEUR`
   - 참가비: `0`
   - 담당자 이름/연락처: 자동 채워짐 확인
5. **[등록하기]** 탭

### 체크포인트
- [ ] "용병 구함 게시글이 등록되었습니다!" 토스트 노출
- [ ] 등록 후 해당 게시글 상세 화면으로 자동 이동
- [ ] 목록 화면에서 OPEN 배지 노출
- [ ] 등록자 본인은 "지원하기" 버튼 미노출, 수정/삭제 버튼 노출

---

## 🚩 시나리오 2: phone 미등록 가드 (등록 차단)

**[CASE ID: MERC-05-003]**

### 준비물
- 마무리FC 부주장 (`vice@mamurifc.test`) — phone=null

### 테스트 순서
1. `vice@mamurifc.test`로 로그인
2. 용병 탭 → FAB 탭

### 체크포인트
- [ ] "연락처를 등록해주세요" AlertDialog 노출
- [ ] 확인 탭 → 프로필 화면으로 이동

---

## 🚩 시나리오 3: 블랙리스트 차단 (등록 거절)

**[CASE ID: MERC-05-004, MERC-05-017]**

### 준비물
- 블랙리스트 유저 (`blacklist@mercenary.test`) — mannerScore=15

### 테스트 순서
1. `blacklist@mercenary.test`로 로그인
2. 용병 탭 → **[용병 구함]** FAB → 폼 작성 후 제출
3. 용병 탭 → **[용병 가능]** FAB → 폼 작성 후 제출

### 체크포인트
- [ ] 두 경우 모두 "게시글 등록이 제한된 계정입니다." 토스트 노출
- [ ] 화면 이동 없음

---

## 🚩 시나리오 4: 용병 구함 지원하기 (개인 → 팀)

**[CASE ID: MERC-05-008, MERC-05-009, MERC-05-010]**

### 준비물
- 카동FC 주장 (`captain@kadongfc.test`) — phone=010-3333-4444
- seed 데이터: `POST_OPEN_1` (마무리FC, OPEN, FW·MF, 지원 없음)

### 테스트 순서
1. `captain@kadongfc.test`로 로그인
2. 용병 탭 → **[용병 구함]** 탭 → `POST_OPEN_1`("서울 월드컵경기장 A구장") 탭
3. 상세 화면 하단 **[지원하기]** 버튼 탭
4. ApplyBottomSheet: 메시지 입력 → **[지원하기]** 탭

### 체크포인트
- [ ] ApplyBottomSheet 정상 노출
- [ ] 제출 후 "지원 완료" 토스트 노출
- [ ] 상세 화면 버튼이 "지원 완료" 상태로 변경 (재지원 불가)
- [ ] 앱 재시작 후 동일 게시글 진입 시에도 "지원 완료" 유지

---

## 🚩 시나리오 5: 지원자 수락/거절

**[CASE ID: MERC-05-011, MERC-05-013]**

### 준비물
- 마무리FC 주장 (`captain@mamurifc.test`)
- seed 데이터: `POST_OPEN_2` (카동FC `APP_PENDING_1` PENDING)

### 테스트 순서
1. `captain@mamurifc.test`로 로그인
2. 용병 탭 → **[내 게시글]** or `POST_OPEN_2`("뚝섬 유수지 풋살장") 상세 탭
3. **[지원자 관리]** 탭 → 카동FC 주장 카드 확인
4. **[수락]** 버튼 탭

### 체크포인트
- [ ] 수락 후 연락처 Modal 노출 (카동FC 주장 이름/전화번호)
- [ ] 지원자 카드 상태 "ACCEPTED"로 변경, 수락/거절 버튼 사라짐
- [ ] `POST_OPEN_2` acceptedCount 1 증가 (상세 화면에서 "1/2명" 확인)

**거절 확인:**
1. `APP_PENDING_1` 대신 새 지원을 넣거나, POST_OPEN_1의 다른 지원자로 테스트
2. **[거절]** 버튼 탭 → 카드 상태 "REJECTED"

---

## 🚩 시나리오 6: requiredCount 충족 시 CLOSED 자동 전환

**[CASE ID: MERC-05-012]**

### 준비물
- 마무리FC 주장 (`captain@mamurifc.test`)
- seed 데이터: `POST_PENDING_ACCEPT` (requiredCount=1, 카동FC PENDING `APP_FOR_ACCEPT`)

### 테스트 순서
1. `captain@mamurifc.test`로 로그인
2. `POST_PENDING_ACCEPT`("잠실 보조구장") 게시글 상세 → **[지원자 관리]** 탭
3. 카동FC 지원자 **[수락]** 탭

### 체크포인트
- [ ] 수락 후 연락처 Modal 노출
- [ ] 게시글 배지 OPEN → **CLOSED** 로 변경
- [ ] 지원자 관리 목록에서 잔여 PENDING 없음 (이미 유일한 지원자)
- [ ] 수정 버튼 비활성화 또는 미노출

---

## 🚩 시나리오 7: CLOSED 게시글 수정 불가

**[CASE ID: MERC-05-006]**

### 준비물
- 마무리FC 주장 (`captain@mamurifc.test`)
- seed 데이터: `POST_CLOSED` (마무리FC, CLOSED)

### 테스트 순서
1. `captain@mamurifc.test`로 로그인
2. 용병 탭 → `POST_CLOSED`("강남 실내 풋살장") 상세 진입

### 체크포인트
- [ ] CLOSED 배지 노출
- [ ] 수정 버튼 미노출 or 비활성화

---

## 🚩 시나리오 8: 용병 가능 등록

**[CASE ID: MERC-05-015, MERC-05-016]**

### 준비물
- 클럽 미소속 유저 (`newbie@test.com`)

### 테스트 순서
1. `newbie@test.com`으로 로그인
2. 용병 탭 → **[용병 가능]** 탭 → FAB 탭
3. 폼 입력:
   - 포지션: MF 선택
   - 가능 날짜: 달력에서 날짜 3개 선택 (칩으로 표시 확인)
   - 가능 지역: 서울 종로구
   - 가능 시간대: `주말 오전`
   - 자기소개: 텍스트 입력
   - 참가비 수락: 토글 확인
4. **[등록하기]** 탭

### 체크포인트
- [ ] DateMultiPicker에서 날짜 탭 → 선택된 날짜 파란 원 표시
- [ ] 선택된 날짜 칩 하단 표시, 칩 탭 시 해제
- [ ] 이전/다음 월 네비게이션 동작
- [ ] 등록 성공 토스트 + 상세 화면 이동

---

## 🚩 시나리오 9: 영입 신청 (팀 → 개인)

**[CASE ID: MERC-05-020, MERC-05-021]**

### 준비물
- 카동FC 주장 (`captain@kadongfc.test`)
- seed 데이터: `AVAIL_OPEN` (player@, FW·MF, 영입 신청 없음)

### 테스트 순서
1. `captain@kadongfc.test`로 로그인
2. 용병 탭 → **[용병 가능]** 탭 → `AVAIL_OPEN`("용병플레이어") 카드 탭
3. 상세 화면 **[영입 신청]** 버튼 탭
4. RecruitBottomSheet: contactName/contactPhone 확인, message 입력 → 제출

### 체크포인트
- [ ] RecruitBottomSheet 노출, 담당자 정보 자동 채워짐
- [ ] 제출 후 성공 토스트 노출
- [ ] 버튼 "영입 신청 완료" 상태로 변경

---

## 🚩 시나리오 10: 영입 신청 수락/거절 (개인)

**[CASE ID: MERC-05-023, MERC-05-024, MERC-05-025]**

### 준비물
- 용병 가능 등록 유저 (`player@mercenary.test`)
- seed 데이터: `AVAIL_WITH_RECRUIT` (마무리FC 영입 신청 `RECRUIT_PENDING` PENDING)

### 테스트 순서
1. `player@mercenary.test`로 로그인
2. 용병 탭 → 우측 상단 **[내 영입 신청]** 또는 용병 가능 상세 → 영입 신청 목록
3. 마무리FC 카드 확인 (PENDING 상태)
4. **[수락]** 버튼 탭

### 체크포인트
- [ ] 수락 후 팀 연락처 Modal 노출 (마무리FC 김주장/010-1111-2222)
- [ ] 카드 상태 "ACCEPTED"로 변경
- [ ] **[거절]** 시 카드 상태 "REJECTED"로 변경, Modal 미노출

---

## 🚩 시나리오 11: 만료된 게시글 확인

**[CASE ID: MERC-05-019]**

### 준비물
- 마무리FC 주장 (`captain@mamurifc.test`)
- seed 데이터: `POST_EXPIRED` (2025-12-01 과거 날짜)

### 테스트 순서
1. 용병 탭 → **[용병 구함]** 목록

### 체크포인트
- [ ] 기본 목록에 `POST_EXPIRED`("노원 풋살장") 미노출
- [ ] (서버에서 includeExpired=true 쿼리 시) 만료 배지(회색) 노출

---

## 🚩 시나리오 12: 일반 멤버 권한 제한

**[CASE ID: MERC-05-014]**

### 준비물
- 마무리FC 일반 멤버 (`member1@mamurifc.test`)

### 테스트 순서
1. `member1@mamurifc.test`로 로그인
2. 용병 탭 → **[용병 구함]** 탭 확인
3. 마무리FC 게시글 상세 진입

### 체크포인트
- [ ] 용병 구함 FAB 탭 시 등록 불가 (권한 없음 에러 or 버튼 미노출)
- [ ] 지원자 관리 URL 직접 접근 시 403 에러 화면

---

## 📋 시드 데이터 요약

| 이름 | 상태 | 설명 |
|---|---|---|
| `POST_OPEN_1` | OPEN | 마무리FC, FW·MF, 지원 없음 → 지원 시나리오 진입 |
| `POST_OPEN_2` | OPEN | 마무리FC, DF, 카동FC PENDING → 수락/거절 확인 |
| `POST_PENDING_ACCEPT` | OPEN (requiredCount=1) | 카동FC PENDING → 수락 시 자동 CLOSED |
| `POST_CLOSED` | CLOSED | 마무리FC → 수정 버튼 미노출 확인 |
| `POST_EXPIRED` | OPEN (과거 날짜) | 기본 목록 제외 확인 |
| `AVAIL_OPEN` | OPEN | player@, FW·MF, 영입 신청 없음 → 영입 신청 진입 |
| `AVAIL_WITH_RECRUIT` | OPEN | player@, DF, 마무리FC PENDING → 수락/거절 확인 |
