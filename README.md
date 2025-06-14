# HiSeoul Job Platform

외국인 구직자와 한국 기업을 연결하는 채용 플랫폼

## 🚀 최근 업데이트 (2025년 1월)

### Google Sheets 실시간 연동 기능 추가

모든 회원가입, 포트폴리오, 채용제안 등의 데이터가 Google Sheets에 실시간으로 기록되며, 중요 이벤트 발생 시 이메일 알림이 자동으로 전송됩니다.

#### 주요 기능:
- **실시간 데이터 동기화**: Firebase → Google Sheets 자동 기록
- **이메일 알림**: 회원가입, 기업 승인요청, 채용제안 시 즉시 알림
- **일일 리포트**: 매일 오전 9시 자동 리포트 발송
- **통합 대시보드**: Google Sheets 기반 실시간 모니터링

## 🚀 최근 업데이트 (2024)

### 프로필 페이지 → 대시보드로 전면 개편

기존의 단순한 프로필 편집 페이지를 구직자 중심의 종합 대시보드로 개선했습니다.

#### 주요 개선사항

1. **컴포넌트 기반 아키텍처**
   - 875줄의 단일 파일을 모듈화된 컴포넌트로 분리
   - 재사용 가능한 대시보드 컴포넌트 라이브러리 구축
   - 유지보수성과 확장성 대폭 향상

2. **새로운 대시보드 기능**
   - **환영 헤더**: 맞춤형 인사말과 주요 통계 한눈에 보기
   - **프로필 완성도**: 시각적 진행률 표시 및 미완성 항목 안내
   - **관심 기업 관리**: 즐겨찾기한 기업 목록과 빠른 접근
   - **채용 제안 관리**: 받은 제안을 상태별로 정리하여 표시
   - **포트폴리오 상태**: 등록 여부, 조회수 통계 확인
   - **추천 기업**: 사용자 스킬 기반 맞춤형 기업 추천

3. **UX/UI 개선**
   - 반응형 그리드 레이아웃 (모바일 최적화)
   - Framer Motion을 활용한 부드러운 애니메이션
   - 직관적인 카드 기반 정보 구조
   - 모달 방식의 프로필 편집

4. **성능 최적화**
   - 비동기 데이터 로딩
   - 컴포넌트별 독립적인 로딩 상태 관리
   - 불필요한 리렌더링 방지

## 🛠 기술 스택

- **Framework**: Next.js 15.3 (App Router)
- **Language**: TypeScript
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Styling**: Tailwind CSS
- **Animation**: Framer Motion
- **Icons**: Heroicons

## 📁 프로젝트 구조

```
src/
├── app/
│   └── profile/
│       ├── page.tsx (새로운 대시보드)
│       └── page.old.tsx (기존 파일 백업)
├── components/
│   └── dashboard/
│       ├── WelcomeHeader.tsx
│       ├── ProfileCompletionCard.tsx
│       ├── FavoriteCompaniesCard.tsx
│       ├── JobInquiriesCard.tsx
│       ├── PortfolioStatusCard.tsx
│       ├── RecommendedCompaniesCard.tsx
│       ├── ProfileEditModal.tsx
│       └── index.ts
├── contexts/
│   └── AuthContext.tsx
├── lib/
│   ├── auth.ts
│   └── firebase.ts
└── types/
    └── index.ts
```

## 🔧 설치 및 실행

1. 의존성 설치
```bash
npm install
```

2. 환경 변수 설정
```bash
npm run setup-env
```

3. 개발 서버 실행
```bash
npm run dev
```

## 📊 데이터 모델

### Users Collection
- 기본 사용자 정보 (이름, 이메일, 역할)

### JobSeekers Collection
- 구직자 프로필 정보 (스킬, 경력, 학력, 언어)

### Employers Collection
- 기업 정보 (회사명, 업종, 규모, 위치)

### Portfolios Collection
- 구직자 포트폴리오 정보

### JobInquiries Collection
- 채용 제안 및 문의 내용

## 🚧 향후 개선 계획

- [ ] 실시간 알림 시스템
- [ ] 채팅 기능 구현
- [ ] 고급 검색 필터
- [ ] 이력서 업로드 기능
- [ ] 다국어 지원 확대

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 있습니다.

## 📊 Google Sheets 연동 설정

### 빠른 시작
1. Google Sheets 복사: [템플릿 시트](https://docs.google.com/spreadsheets/d/1jzVOvR-EKLWadgaYt_VnsFDZ_gFeRE56WVbE07M_UZ4/edit?usp=sharing)
2. Apps Script 설정 (확장프로그램 > Apps Script)
3. 웹앱으로 배포하고 URL 복사
4. `.env.local`에 URL 추가:
   ```
   NEXT_PUBLIC_GOOGLE_SCRIPT_URL=your_web_app_url_here
   ```

### 자동 기록 항목
- 구직자/기업 회원가입
- 포트폴리오 등록
- 채용제안
- 승인요청
- 로그인 기록

### 이메일 알림
`nadr.jooyeon@gmail.com`으로 자동 발송:
- 신규 회원가입
- 기업 승인요청 (🚨)
- 채용제안 등록

자세한 설정 방법은 `src/artifacts/google-sheets-setup-guide.md` 참조

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 있습니다.

## 최근 업데이트 (채용 제안서 시스템 개선)

### 📊 구글 스프레드시트 저장 필드 확장
채용 제안서에서 구글 스프레드시트에 저장되는 정보가 대폭 확장되었습니다:

**기존 필드:**
- 제안일시, 기업명, 구직자명, 제목, 내용, 급여제안, 근무형태, 상태, 응답일시, 비고

**추가된 필드:**
- 제안 직무 (proposedPosition)
- 직무 카테고리 (jobCategory)  
- 근무 시간 (workingHours)
- 복리후생 (benefits)
- 채용 담당자 정보:
  - 담당자명 (recruiterName)
  - 직위/직책 (recruiterPosition)
  - 연락처 (recruiterPhone)
  - 이메일 (recruiterEmail)
- 회사 상세 정보:
  - 대표자명 (companyCeoName)
  - 업종 (companyIndustry)
  - 사업 형태 (companyBusinessType)
  - 위치 (companyLocation)
  - 회사 소개 (companyDescription)

### 🔧 Apps Script 업데이트 필요
Google Apps Script에서 `ADD_JOB_INQUIRY` 액션을 처리할 때 위의 새로운 필드들을 받아서 스프레드시트에 저장하도록 업데이트가 필요합니다.

### 👨‍💼 어드민 페이지 기능 추가
- **새로운 탭**: "채용 제안서" 탭이 추가되어 모든 채용 제안서를 관리할 수 있습니다
- **목록 보기**: 기업이 구직자에게 보낸 모든 채용 제안서를 시간순으로 확인 가능
- **상세 보기**: 각 채용 제안서의 전체 내용을 모달로 상세히 확인 가능
- **상태 표시**: 발송됨, 읽음, 응답함, 수락됨, 거절됨 등의 상태를 뱃지로 표시

### 📧 이메일 발송 개선
- CC 이메일이 `nadr.jooyeon@gmail.com`으로 변경됨
- 개발 환경에서도 이메일 내용을 콘솔에서 확인 가능
- SendGrid 설정 시 실제 이메일 발송, 미설정 시 콘솔 출력

### 🎯 사용법
1. 기업이 채용 제안서를 작성하여 발송
2. Firestore에 상세 정보 저장
3. 구글 스프레드시트에 확장된 정보 저장
4. 이메일 발송 (구직자 + CC로 관리자)
5. 어드민 페이지에서 모든 채용 제안서 관리 및 모니터링