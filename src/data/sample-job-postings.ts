import { JobPosting } from '../types';

export const sampleJobPostings: JobPosting[] = [
  {
    id: 'job-001',
    employerId: 'employer-001',
    companyName: '마카롱팩토리',
    title: '서버 개발자 (5년 이상)',
    jobCategory: '개발',
    description: '마카롱팩토리에서 서버 개발자를 모집합니다. Java, Kotlin, Spring Framework를 활용한 백엔드 개발 업무를 담당하게 됩니다.',
    requirements: [
      'Java, Kotlin 개발 경험 5년 이상',
      'Spring Framework 활용 경험',
      'AWS 클라우드 서비스 경험',
      'MySQL 데이터베이스 설계 및 운영 경험',
      '대용량 트래픽 처리 경험'
    ],
    responsibilities: [
      '백엔드 API 설계 및 개발',
      '데이터베이스 설계 및 최적화',
      'AWS 인프라 구축 및 운영',
      '코드 리뷰 및 기술 문서 작성',
      '주니어 개발자 멘토링'
    ],
    salary: {
      type: '연봉',
      amount: '4,000만원 ~ 6,000만원',
      negotiable: true
    },
    location: '서울특별시 강남구',
    workingHours: '09:00 ~ 18:00 (유연근무 가능)',
    workType: 'fulltime',
    benefits: [
      '4대보험',
      '퇴직금',
      '연차',
      '반차',
      '교육비 지원',
      '건강검진',
      '야근 식대',
      '자율 출퇴근',
      '재택근무'
    ],
    preferredQualifications: [
      'MSA(Microservice Architecture) 경험',
      'Docker, Kubernetes 경험',
      'CI/CD 파이프라인 구축 경험',
      '팀 리딩 경험',
      '신기술에 대한 관심과 학습 의지'
    ],
    recruiterInfo: {
      name: '김채용',
      position: '인사팀 매니저',
      phone: '02-1234-5678',
      email: 'hr@macarongfactory.com'
    },
    category: 'IT/웹/통신',
    skills: ['Java', 'Kotlin', 'Spring', 'AWS', 'MySQL'],
    isActive: true,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    deadline: new Date('2024-02-15')
  },
  {
    id: 'job-002',
    employerId: 'employer-002',
    companyName: '미소',
    title: 'Product Designer (Senior)',
    jobCategory: '디자인',
    description: '미소에서 Product Designer (Senior)를 모집합니다. UX/UI 디자인 전문성을 바탕으로 사용자 중심의 제품 디자인을 담당하게 됩니다.',
    requirements: [
      '디자인 관련 경력 5년 이상',
      'Figma, Sketch, Adobe XD 활용 능력',
      'UX 리서치 및 사용자 테스트 경험',
      '프로토타이핑 도구 활용 능력',
      '디자인 시스템 구축 경험'
    ],
    responsibilities: [
      '사용자 중심의 제품 디자인',
      'UX 리서치 및 사용자 테스트 진행',
      '디자인 시스템 구축 및 관리',
      '개발팀과의 협업 및 디자인 가이드 제공',
      '디자인 프로세스 개선'
    ],
    salary: {
      type: '연봉',
      amount: '5,000만원 ~ 7,000만원',
      negotiable: true
    },
    location: '서울특별시 성동구',
    workingHours: '10:00 ~ 19:00 (코어타임 11:00~16:00)',
    workType: 'fulltime',
    benefits: [
      '4대보험',
      '퇴직금',
      '연차',
      '반차',
      '교육비 지원',
      '건강검진',
      '중식 제공',
      '자율 출퇴근',
      '재택근무',
      '맥북 지급'
    ],
    preferredQualifications: [
      '스타트업 환경에서의 근무 경험',
      '제품 기획 및 전략 수립 경험',
      '데이터 기반 디자인 의사결정 경험',
      '팀 매니지먼트 경험',
      '영어 커뮤니케이션 가능'
    ],
    recruiterInfo: {
      name: '박디자인',
      position: '디자인팀 리드',
      phone: '02-2345-6789',
      email: 'design@miso.com'
    },
    category: '디자인',
    skills: ['UX디자인', '그래픽디자인', 'Figma', 'Adobe XD', 'Sketch'],
    isActive: true,
    createdAt: new Date('2024-01-16'),
    updatedAt: new Date('2024-01-16'),
    deadline: new Date('2024-02-16')
  },
  {
    id: 'job-003',
    employerId: 'employer-003',
    companyName: '더블엔씨',
    title: '백엔드 개발자 (Backend Developer)',
    jobCategory: '개발',
    description: '더블엔씨에서 백엔드 개발자를 모집합니다. Node.js와 TypeScript를 활용한 서버 개발 업무를 담당하게 됩니다.',
    requirements: [
      'Node.js 개발 경험 4년 이상',
      'TypeScript 활용 능력',
      'Express.js 프레임워크 경험',
      'RESTful API 설계 및 개발 경험',
      'MongoDB 또는 MySQL 사용 경험'
    ],
    responsibilities: [
      'Node.js 기반 백엔드 API 개발',
      'TypeScript를 활용한 타입 안전성 확보',
      '데이터베이스 설계 및 쿼리 최적화',
      '서버 성능 모니터링 및 최적화',
      '코드 리뷰 및 품질 관리'
    ],
    salary: {
      type: '연봉',
      amount: '4,500만원 ~ 6,500만원',
      negotiable: true
    },
    location: '서울특별시 마포구',
    workingHours: '09:30 ~ 18:30 (유연근무)',
    workType: 'fulltime',
    benefits: [
      '4대보험',
      '퇴직금',
      '연차 15일',
      '반차',
      '도서 구입비 지원',
      '건강검진',
      '야근 식대',
      '유연 근무제',
      '재택근무 주 2회'
    ],
    preferredQualifications: [
      'GraphQL 경험',
      'Docker 컨테이너 기술 경험',
      'AWS 또는 GCP 클라우드 경험',
      'Redis 캐시 시스템 경험',
      '테스트 코드 작성 경험'
    ],
    recruiterInfo: {
      name: '이개발',
      position: '개발팀 팀장',
      phone: '02-3456-7890',
      email: 'dev@doublenc.com'
    },
    category: 'IT/웹/통신',
    skills: ['Node.js', 'TypeScript', 'Express.js', 'MongoDB', 'API'],
    isActive: true,
    createdAt: new Date('2024-01-17'),
    updatedAt: new Date('2024-01-17'),
    deadline: new Date('2024-02-17')
  },
  {
    id: 'job-004',
    employerId: 'employer-004',
    companyName: '라포랩스',
    title: '데이터 분석가 (Data Analyst)',
    jobCategory: '데이터',
    description: '라포랩스에서 데이터 분석가를 모집합니다. 비즈니스 데이터를 분석하여 인사이트를 도출하고 의사결정을 지원하는 업무를 담당합니다.',
    requirements: [
      '데이터 분석 경력 3년 이상',
      'Python, R, SQL 활용 능력',
      '통계 분석 및 머신러닝 기초 지식',
      '데이터 시각화 도구 사용 경험 (Tableau, Power BI 등)',
      '비즈니스 도메인 이해도'
    ],
    responsibilities: [
      '비즈니스 데이터 분석 및 인사이트 도출',
      '데이터 기반 의사결정 지원',
      '대시보드 및 리포트 작성',
      'A/B 테스트 설계 및 결과 분석',
      '데이터 품질 관리 및 검증'
    ],
    salary: {
      type: '연봉',
      amount: '4,000만원 ~ 5,500만원',
      negotiable: true
    },
    location: '서울특별시 서초구',
    workingHours: '09:00 ~ 18:00',
    workType: 'fulltime',
    benefits: [
      '4대보험',
      '퇴직금',
      '연차',
      '반차',
      '교육비 전액 지원',
      '건강검진',
      '중식 제공',
      '카페테리아',
      '헬스장 이용'
    ],
    preferredQualifications: [
      '대용량 데이터 처리 경험',
      'Spark, Hadoop 등 빅데이터 기술 경험',
      '딥러닝 프레임워크 경험',
      '클라우드 플랫폼 사용 경험',
      '영어 문서 해석 가능'
    ],
    recruiterInfo: {
      name: '최데이터',
      position: '데이터팀 매니저',
      phone: '02-4567-8901',
      email: 'data@raaflabs.com'
    },
    category: '데이터',
    skills: ['Python', 'SQL', 'Tableau', '데이터분석', '머신러닝'],
    isActive: true,
    createdAt: new Date('2024-01-18'),
    updatedAt: new Date('2024-01-18'),
    deadline: new Date('2024-02-18')
  },
  {
    id: 'job-005',
    employerId: 'employer-005',
    companyName: '혁신스타트업',
    title: '프론트엔드 개발자 (React)',
    jobCategory: '개발',
    description: '혁신적인 스타트업에서 React 기반 프론트엔드 개발자를 모집합니다. 사용자 친화적인 웹 애플리케이션 개발을 담당합니다.',
    requirements: [
      'React 개발 경험 3년 이상',
      'JavaScript, TypeScript 능숙',
      'HTML5, CSS3, Sass/SCSS 경험',
      'Redux 또는 Context API 상태 관리 경험',
      'RESTful API 연동 경험'
    ],
    responsibilities: [
      'React 기반 웹 애플리케이션 개발',
      '반응형 웹 디자인 구현',
      'API 연동 및 상태 관리',
      '성능 최적화 및 사용자 경험 개선',
      '크로스 브라우저 호환성 확보'
    ],
    salary: {
      type: '연봉',
      amount: '3,500만원 ~ 5,000만원',
      negotiable: true
    },
    location: '서울특별시 송파구',
    workingHours: '10:00 ~ 19:00 (코어타임 11:00~15:00)',
    workType: 'fulltime',
    benefits: [
      '4대보험',
      '퇴직금',
      '연차 20일',
      '반차',
      '컨퍼런스 참석비 지원',
      '건강검진',
      '석식 제공',
      '유연 근무제',
      '개인 맥북 지급'
    ],
    preferredQualifications: [
      'Next.js 프레임워크 경험',
      'GraphQL 경험',
      'Jest, Cypress 테스트 도구 경험',
      'Git 버전 관리 숙련',
      '디자인 시스템 구축 경험'
    ],
    recruiterInfo: {
      name: '정프론트',
      position: '프론트엔드팀 리더',
      phone: '02-5678-9012',
      email: 'frontend@startup.com'
    },
    category: 'IT/웹/통신',
    skills: ['React', 'JavaScript', 'TypeScript', 'CSS', 'Redux'],
    isActive: true,
    createdAt: new Date('2024-01-19'),
    updatedAt: new Date('2024-01-19'),
    deadline: new Date('2024-02-19')
  },
  {
    id: 'job-006',
    employerId: 'employer-006',
    companyName: '이커머스코리아',
    title: '디지털 마케팅 매니저',
    jobCategory: '마케팅/시장조사',
    description: '성장하는 이커머스 기업에서 디지털 마케팅 매니저를 모집합니다. 온라인 마케팅 전략 수립 및 실행을 담당합니다.',
    requirements: [
      '디지털 마케팅 경력 4년 이상',
      '구글 애즈, 페이스북 광고 운영 경험',
      'SEO/SEM 최적화 경험',
      '데이터 분석 및 성과 측정 능력',
      '콘텐츠 마케팅 기획 및 실행 경험'
    ],
    responsibilities: [
      '디지털 마케팅 전략 수립 및 실행',
      '온라인 광고 캠페인 기획 및 운영',
      'SEO 최적화 및 콘텐츠 마케팅',
      '성과 분석 및 ROI 측정',
      '마케팅 자동화 도구 활용'
    ],
    salary: {
      type: '연봉',
      amount: '4,200만원 ~ 5,800만원',
      negotiable: true
    },
    location: '서울특별시 영등포구',
    workingHours: '09:00 ~ 18:00',
    workType: 'fulltime',
    benefits: [
      '4대보험',
      '퇴직금',
      '연차',
      '반차',
      '마케팅 교육비 지원',
      '건강검진',
      '중식 지원',
      '자율 복장',
      '성과급'
    ],
    preferredQualifications: [
      '이커머스 업계 경험',
      'GA4, GTM 활용 능력',
      '마케팅 자동화 도구 경험',
      '영어 커뮤니케이션 가능',
      '창의적 사고 및 문제 해결 능력'
    ],
    recruiterInfo: {
      name: '한마케팅',
      position: '마케팅팀 팀장',
      phone: '02-6789-0123',
      email: 'marketing@ecommerce.com'
    },
    category: '마케팅/시장조사',
    skills: ['디지털마케팅', '구글애즈', 'SEO', '데이터분석', '콘텐츠마케팅'],
    isActive: true,
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20'),
    deadline: new Date('2024-02-20')
  }
]; 