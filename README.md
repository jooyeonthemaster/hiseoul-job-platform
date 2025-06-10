# HiSeoul Job Platform

외국인 구직자와 한국 기업을 연결하는 채용 플랫폼

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