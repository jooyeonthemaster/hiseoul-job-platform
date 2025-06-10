'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  ArrowLeftIcon, 
  StarIcon, 
  MapPinIcon, 
  BriefcaseIcon, 
  CalendarIcon,
  CheckBadgeIcon,
  EnvelopeIcon,
  PhoneIcon
} from '@heroicons/react/24/outline';
import { getPortfolio } from '@/lib/auth';

interface Portfolio {
  id: string;
  name: string;
  speciality: string;
  experience: string;
  skills: string[];
  description: string;
  avatar: string;
  projects: number;
  verified: boolean;
  location: string;
  email: string;
  phone: string;
  education: string;
  introduction: string;
  achievements: string[];
  workHistory: Array<{
    company: string;
    position: string;
    period: string;
    description: string;
  }>;
  projectDetails: Array<{
    title: string;
    description: string;
    technologies: string[];
    duration: string;
    results: string[];
  }>;
}

// 상세 포트폴리오 데이터
const portfoliosDetail: Portfolio[] = [
  {
    id: 'sample-1',
    name: '권예림',
    speciality: 'SNS마케팅',
    experience: '3년',
    skills: ['Instagram', 'Facebook', 'TikTok', '브랜드마케팅', '콘텐츠기획'],
    description: '소셜미디어 플랫폼별 맞춤형 마케팅 전략 수립 및 실행 전문가',
    avatar: '👩',
    projects: 15,
    verified: true,
    location: '서울시 강남구',
    email: 'yerim.kwon@example.com',
    phone: '010-1234-5678',
    education: '연세대학교 경영학과',
    introduction: '3년간 다양한 브랜드의 SNS 마케팅을 담당하며 인스타그램 팔로워 10배 증가, 페이스북 광고 ROAS 300% 향상 등의 성과를 달성했습니다. 특히 Z세대 타겟 마케팅에 강점을 가지고 있으며, 트렌드에 민감한 콘텐츠 기획으로 바이럴 캠페인을 성공시킨 경험이 다수 있습니다.',
    achievements: [
      '인스타그램 팔로워 10배 증가 (5만 → 50만)',
      '페이스북 광고 ROAS 300% 향상',
      'TikTok 바이럴 콘텐츠 5건 제작 (각 100만 조회수 돌파)',
      '브랜드 인지도 40% 상승',
      '소셜 커머스 매출 250% 증가'
    ],
    workHistory: [
      {
        company: '(주)브랜드마케팅',
        position: 'SNS 마케팅 매니저',
        period: '2022.03 - 현재',
        description: '패션 브랜드 3개사의 SNS 마케팅 총괄 담당. 인스타그램, 페이스북, TikTok 계정 운영 및 광고 집행'
      },
      {
        company: '디지털에이전시 ABC',
        position: 'SNS 마케팅 전문가',
        period: '2021.01 - 2022.02',
        description: '중소기업 대상 SNS 마케팅 컨설팅 및 콘텐츠 제작. 월 평균 15개사 마케팅 지원'
      }
    ],
    projectDetails: [
      {
        title: '패션 브랜드 인스타그램 리브랜딩',
        description: '기존 팔로워 5만명의 패션 브랜드 계정을 50만명으로 성장시킨 프로젝트',
        technologies: ['Instagram', 'Facebook Creator Studio', 'Canva', '포토샵'],
        duration: '6개월',
        results: [
          '팔로워 수 10배 증가 (5만 → 50만)',
          '월 평균 도달률 300% 향상',
          '브랜드 사이트 유입 500% 증가',
          '온라인 매출 180% 증가'
        ]
      },
      {
        title: 'TikTok 바이럴 챌린지 캠페인',
        description: '신제품 런칭을 위한 TikTok 해시태그 챌린지 기획 및 실행',
        technologies: ['TikTok', 'CapCut', '트렌드 분석 도구'],
        duration: '2개월',
        results: [
          '해시태그 조회수 1억회 달성',
          '참여 영상 5,000개 생성',
          '브랜드 인지도 40% 상승',
          '신제품 판매량 목표 대비 150% 달성'
        ]
      }
    ]
  },
  {
    id: 'sample-2',
    name: '김대훈',
    speciality: '키워드광고',
    experience: '4년',
    skills: ['Google Ads', 'Naver 광고', 'SEO', '데이터분석', 'ROI최적화'],
    description: '검색광고 및 디스플레이 광고 운영으로 높은 전환율 달성',
    avatar: '👨',
    projects: 22,
    verified: true,
    location: '서울시 서초구',
    email: 'daehoon.kim@example.com',
    phone: '010-2345-6789',
    education: '고려대학교 컴퓨터학과',
    introduction: '4년간 검색광고 운영 전문가로 활동하며 Google Ads와 네이버 광고에서 평균 ROAS 400% 이상을 유지해왔습니다. 데이터 기반의 정교한 키워드 분석과 A/B 테스트를 통해 광고 성과를 지속적으로 개선하는 것이 저의 강점입니다.',
    achievements: [
      'Google Ads ROAS 평균 450% 달성',
      '네이버 광고 클릭률 업계 평균 대비 3배 상승',
      '검색광고 최적화로 광고비 30% 절감',
      'SEO 최적화로 자연검색 유입 200% 증가',
      '전환율 개선으로 매출 300% 상승'
    ],
    workHistory: [
      {
        company: '(주)디지털마케팅솔루션',
        position: '검색광고 전문가',
        period: '2021.06 - 현재',
        description: 'B2B, B2C 기업 대상 Google Ads 및 네이버 광고 운영. 월 광고비 3억원 규모 관리'
      },
      {
        company: '퍼포먼스마케팅 에이전시',
        position: 'SEM 스페셜리스트',
        period: '2020.01 - 2021.05',
        description: '이커머스 업체 대상 검색광고 운영 및 SEO 컨설팅. 평균 ROAS 350% 달성'
      }
    ],
    projectDetails: [
      {
        title: 'E-commerce 검색광고 최적화',
        description: '온라인 쇼핑몰의 Google Ads 캠페인 전면 개편으로 ROAS 500% 달성',
        technologies: ['Google Ads', 'Google Analytics', '키워드 플래너', 'Data Studio'],
        duration: '4개월',
        results: [
          'ROAS 300% → 500% 향상',
          '클릭당 비용 40% 절감',
          '전환율 2.5배 증가',
          '월 매출 400% 상승'
        ]
      }
    ]
  },
  {
    id: 'sample-3',
    name: '김민지',
    speciality: '브랜드마케팅',
    experience: '5년',
    skills: ['브랜딩', '마케팅전략', '캠페인기획', '크리에이티브', 'PR'],
    description: '브랜드 아이덴티티 구축과 통합 마케팅 캠페인 기획 전문',
    avatar: '🎨',
    projects: 18,
    verified: true,
    location: '서울시 마포구',
    email: 'minji.kim@example.com',
    phone: '010-3456-7890',
    education: '이화여자대학교 시각디자인학과',
    introduction: '5년간 브랜드 마케팅 전문가로 활동하며 20여개 브랜드의 리브랜딩과 캠페인을 성공적으로 진행했습니다. 특히 브랜드 스토리텔링과 시각적 아이덴티티 구축에 강점을 가지고 있으며, 통합 마케팅 캠페인으로 브랜드 가치를 극대화하는 것이 저의 전문 분야입니다.',
    achievements: [
      '브랜드 인지도 평균 60% 상승',
      '리브랜딩 프로젝트 15건 성공',
      '캠페인 참여율 400% 증가',
      '브랜드 가치 평가 300% 상승',
      '어워드 수상 3회 (브랜드 대상, 마케팅 대상)'
    ],
    workHistory: [
      {
        company: '(주)크리에이티브에이전시',
        position: '브랜드 디렉터',
        period: '2022.01 - 현재',
        description: '대기업 브랜드 리뉴얼 및 캠페인 기획. 연 매출 100억 규모 브랜드 5개사 담당'
      },
      {
        company: '글로벌브랜딩',
        position: '브랜드 매니저',
        period: '2020.03 - 2021.12',
        description: '중소기업 브랜딩 컨설팅 및 디자인 시스템 구축. 월 평균 3개사 브랜딩 진행'
      }
    ],
    projectDetails: [
      {
        title: '럭셔리 패션 브랜드 리브랜딩',
        description: '30년 전통의 패션 브랜드를 MZ세대 타겟으로 완전히 리뉴얼한 프로젝트',
        technologies: ['Adobe Creative Suite', 'Figma', 'Sketch', '브랜딩 가이드라인'],
        duration: '8개월',
        results: [
          '브랜드 인지도 70% 상승',
          'MZ세대 고객 비율 50% 증가',
          '온라인 매출 300% 상승',
          '브랜드 가치 평가 400% 증가'
        ]
      }
    ]
  },
  {
    id: '4',
    name: '김병규',
    speciality: '퍼포먼스마케팅',
    experience: '6년',
    skills: ['성과분석', 'CRM', '고객세분화', 'A/B테스트', '전환최적화'],
    description: '데이터 기반 성과 마케팅으로 매출 증대에 기여',
    avatar: '📊',
    projects: 28,
    verified: true,
    location: '서울시 송파구',
    email: 'byungkyu.kim@example.com',
    phone: '010-4567-8901',
    education: '서울대학교 통계학과',
    introduction: '6년간 퍼포먼스 마케팅 전문가로 활동하며 데이터 기반의 정확한 성과 분석과 최적화로 고객사의 매출을 평균 250% 증가시켰습니다. A/B 테스트와 고객 세분화를 통한 맞춤형 마케팅 전략 수립이 저의 핵심 역량입니다.',
    achievements: [
      '평균 ROAS 500% 달성',
      '전환율 평균 300% 개선',
      'CRM 최적화로 고객 유지율 80% 향상',
      'A/B 테스트 1,000회 이상 진행',
      '마케팅 ROI 연평균 400% 달성'
    ],
    workHistory: [
      {
        company: '(주)데이터드리븐마케팅',
        position: '퍼포먼스 마케팅 리드',
        period: '2021.09 - 현재',
        description: '이커머스 및 서비스 기업 대상 퍼포먼스 마케팅 총괄. 월 마케팅 예산 5억원 규모 관리'
      },
      {
        company: '그로스해킹랩',
        position: '데이터 애널리스트',
        period: '2019.01 - 2021.08',
        description: '스타트업 대상 그로스해킹 및 데이터 분석. 평균 매출 증가율 200% 달성'
      }
    ],
    projectDetails: [
      {
        title: '이커머스 퍼포먼스 마케팅 최적화',
        description: '온라인 쇼핑몰의 전 채널 퍼포먼스 마케팅 최적화 프로젝트',
        technologies: ['Google Analytics', 'Facebook Ads Manager', 'Tableau', 'SQL'],
        duration: '1년',
        results: [
          'ROAS 200% → 600% 향상',
          '신규 고객 획득 비용 50% 절감',
          '고객 생애 가치 300% 증가',
          '월 매출 500% 상승'
        ]
      }
    ]
  },
  {
    id: '5',
    name: '김보미',
    speciality: '콘텐츠마케팅',
    experience: '3년',
    skills: ['콘텐츠기획', '영상제작', '스토리텔링', '인플루언서', '바이럴'],
    description: '매력적인 콘텐츠로 고객 참여도를 높이는 마케팅 전문가',
    avatar: '🎬',
    projects: 20,
    verified: true,
    location: '서울시 홍대구',
    email: 'bomi.kim@example.com',
    phone: '010-5678-9012',
    education: '중앙대학교 미디어커뮤니케이션학과',
    introduction: '3년간 콘텐츠 마케팅 전문가로 활동하며 브랜드 스토리를 매력적인 콘텐츠로 전달하는 것에 특화되어 있습니다. 영상 콘텐츠 제작부터 인플루언서 마케팅까지, 고객의 마음을 움직이는 콘텐츠로 브랜드 참여도를 극대화합니다.',
    achievements: [
      '평균 콘텐츠 조회수 500만회 달성',
      '바이럴 콘텐츠 50건 제작',
      '브랜드 참여율 600% 증가',
      '인플루언서 협업 100건 이상',
      '콘텐츠 어워드 수상 2회'
    ],
    workHistory: [
      {
        company: '(주)콘텐츠크리에이터스',
        position: '콘텐츠 디렉터',
        period: '2022.06 - 현재',
        description: '브랜드 콘텐츠 기획 및 제작 총괄. 월 평균 영상 콘텐츠 20편 제작'
      },
      {
        company: '소셜미디어에이전시',
        position: '콘텐츠 기획자',
        period: '2021.03 - 2022.05',
        description: '브랜드 SNS 콘텐츠 기획 및 인플루언서 마케팅 진행'
      }
    ],
    projectDetails: [
      {
        title: '뷰티 브랜드 바이럴 캠페인',
        description: '신제품 런칭을 위한 바이럴 콘텐츠 캠페인 기획 및 제작',
        technologies: ['Premier Pro', 'After Effects', 'Photoshop', '인플루언서 플랫폼'],
        duration: '3개월',
        results: [
          '누적 조회수 2,000만회 달성',
          '브랜드 언급량 1,000% 증가',
          '신제품 매출 목표 대비 300% 달성',
          '브랜드 팔로워 500% 증가'
        ]
      }
    ]
  },
  {
    id: '6',
    name: '김재원',
    speciality: '마케팅기획',
    experience: '7년',
    skills: ['전략기획', '시장조사', '경쟁분석', '프로젝트관리', '팀리딩'],
    description: '시장 트렌드 분석을 통한 효과적인 마케팅 전략 수립',
    avatar: '💼',
    projects: 32,
    verified: true,
    location: '서울시 강남구',
    email: 'jaewon.kim@example.com',
    phone: '010-6789-0123',
    education: 'KAIST 경영대학원 MBA',
    introduction: '7년간 마케팅 기획 전문가로 활동하며 시장 분석과 전략 수립을 통해 기업의 마케팅 목표 달성을 이끌어왔습니다. 데이터 기반의 체계적인 접근법으로 효과적인 마케팅 전략을 구축하고, 팀을 이끌어 성공적인 결과를 만들어내는 것이 저의 강점입니다.',
    achievements: [
      '마케팅 전략 수립 50건 이상',
      '평균 마케팅 ROI 400% 달성',
      '시장점유율 평균 25% 상승',
      '프로젝트 성공률 95% 이상',
      '팀 성과 평가 최우수 3년 연속'
    ],
    workHistory: [
      {
        company: '(주)글로벌마케팅컨설팅',
        position: '마케팅 전략 디렉터',
        period: '2020.01 - 현재',
        description: '대기업 마케팅 전략 컨설팅 및 프로젝트 총괄. 연 매출 1,000억 규모 기업 담당'
      },
      {
        company: '전략기획컨설팅',
        position: '시니어 컨설턴트',
        period: '2018.03 - 2019.12',
        description: '중견기업 대상 마케팅 전략 수립 및 실행 지원'
      }
    ],
    projectDetails: [
      {
        title: '대기업 디지털 전환 마케팅 전략',
        description: '전통 제조업체의 디지털 마케팅 전환을 위한 종합 전략 수립',
        technologies: ['Market Research Tools', 'SWOT Analysis', 'Customer Journey Mapping'],
        duration: '1년 6개월',
        results: [
          '디지털 매출 비중 0% → 40% 달성',
          '브랜드 인지도 80% 상승',
          '온라인 고객 기반 50만명 구축',
          '마케팅 ROI 500% 달성'
        ]
      }
    ]
  },
  {
    id: '7',
    name: '김지윤',
    speciality: '이커머스마케팅',
    experience: '4년',
    skills: ['온라인몰운영', '상품기획', '고객분석', '판매최적화', '리뷰관리'],
    description: '온라인 쇼핑몰 매출 증대를 위한 통합 마케팅 솔루션 제공',
    avatar: '🛒',
    projects: 25,
    verified: true,
    location: '서울시 성동구',
    email: 'jiyoon.kim@example.com',
    phone: '010-7890-1234',
    education: '성균관대학교 경영학과',
    introduction: '4년간 이커머스 마케팅 전문가로 활동하며 온라인 쇼핑몰의 매출 최적화와 고객 경험 개선에 특화되어 있습니다. 데이터 분석을 통한 상품 기획부터 고객 리텐션까지, 이커머스 전 과정의 마케팅을 총괄할 수 있는 역량을 보유하고 있습니다.',
    achievements: [
      '이커머스 매출 평균 400% 증가',
      '전환율 최적화로 CVR 300% 향상',
      '고객 재구매율 80% 달성',
      '상품 리뷰 평점 평균 4.8점 유지',
      '마케팅 비용 대비 매출 500% 달성'
    ],
    workHistory: [
      {
        company: '(주)이커머스솔루션',
        position: '이커머스 마케팅 매니저',
        period: '2021.04 - 현재',
        description: '중소 온라인쇼핑몰 10개사 마케팅 총괄. 월 평균 매출 50억원 규모 관리'
      },
      {
        company: '온라인리테일컴퍼니',
        position: '상품기획 전문가',
        period: '2020.01 - 2021.03',
        description: '패션 이커머스 상품 기획 및 마케팅. 월 신상품 100개 이상 기획'
      }
    ],
    projectDetails: [
      {
        title: '패션 이커머스 매출 최적화',
        description: '중소 패션 쇼핑몰의 매출 5배 증가를 달성한 종합 마케팅 프로젝트',
        technologies: ['Google Analytics', 'Facebook Pixel', '카카오톡 스토어', '네이버 스마트스토어'],
        duration: '8개월',
        results: [
          '월 매출 1억 → 5억원 달성',
          '전환율 1% → 3.5% 개선',
          '재구매율 20% → 65% 상승',
          '고객 획득 비용 60% 절감'
        ]
      }
    ]
  },
  {
    id: '8',
    name: '류태경',
    speciality: '데이터마케팅',
    experience: '5년',
    skills: ['데이터분석', 'SQL', 'Python', '머신러닝', '예측모델링'],
    description: '빅데이터 분석을 통한 고객 인사이트 도출 및 마케팅 최적화',
    avatar: '🔬',
    projects: 19,
    verified: true,
    location: '서울시 서초구',
    email: 'taekyung.ryu@example.com',
    phone: '010-8901-2345',
    education: '연세대학교 응용통계학과',
    introduction: '5년간 데이터 마케팅 전문가로 활동하며 빅데이터 분석을 통한 고객 인사이트 도출과 예측 모델링으로 마케팅 성과를 극대화해왔습니다. Python과 SQL을 활용한 고급 데이터 분석과 머신러닝 기법으로 정확한 마케팅 전략을 수립합니다.',
    achievements: [
      '예측 모델 정확도 평균 95% 달성',
      '고객 세분화로 마케팅 효율 300% 향상',
      '데이터 기반 의사결정으로 ROI 400% 개선',
      '고객 이탈 예측 모델 구축 (정확도 92%)',
      '마케팅 자동화 시스템 구축 5건'
    ],
    workHistory: [
      {
        company: '(주)빅데이터마케팅',
        position: '데이터 사이언티스트',
        period: '2020.09 - 현재',
        description: '대기업 고객 데이터 분석 및 마케팅 최적화 모델 개발. PB급 데이터 처리'
      },
      {
        company: 'AI마케팅연구소',
        position: '데이터 애널리스트',
        period: '2019.01 - 2020.08',
        description: '머신러닝 기반 마케팅 모델 개발 및 A/B 테스트 분석'
      }
    ],
    projectDetails: [
      {
        title: '고객 생애가치 예측 모델 개발',
        description: '머신러닝을 활용한 고객 LTV 예측 모델 구축 및 마케팅 최적화',
        technologies: ['Python', 'TensorFlow', 'SQL', 'Tableau', 'AWS'],
        duration: '6개월',
        results: [
          '예측 정확도 93% 달성',
          '마케팅 예산 효율 250% 향상',
          '고가치 고객 식별률 400% 개선',
          '고객 유지율 45% 상승'
        ]
      }
    ]
  }
];

export default function PortfolioDetailPage() {
  const params = useParams();
  const portfolioId = params?.id as string;
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPortfolio = async () => {
      try {
        setLoading(true);
        
        // 먼저 정적 데이터에서 찾기
        const staticPortfolio = portfoliosDetail.find(p => p.id === portfolioId);
        if (staticPortfolio) {
          setPortfolio(staticPortfolio);
          setLoading(false);
          return;
        }

        // Firebase에서 포트폴리오 찾기
        try {
          const firebasePortfolio = await getPortfolio(portfolioId);
          if (firebasePortfolio && typeof firebasePortfolio === 'object' && 'name' in firebasePortfolio) {
            // Firebase 데이터를 상세 페이지 형식으로 변환
            const convertedPortfolio: Portfolio = {
              id: portfolioId,
              name: (firebasePortfolio as any).name || '이름 없음',
              speciality: (firebasePortfolio as any).speciality || '일반',
              experience: '경력',
              skills: (firebasePortfolio as any).skills || [],
              description: (firebasePortfolio as any).description || '설명이 없습니다.',
              avatar: getAvatarBySpeciality((firebasePortfolio as any).speciality || '일반'),
              projects: (firebasePortfolio as any).projects || 0,
              verified: (firebasePortfolio as any).verified || false,
              location: (firebasePortfolio as any).address || '위치 정보 없음',
              email: (firebasePortfolio as any).email || '이메일 정보 없음',
              phone: (firebasePortfolio as any).phone || '연락처 정보 없음',
              education: '학력 정보 없음',
              introduction: (firebasePortfolio as any).description || `안녕하세요, ${(firebasePortfolio as any).speciality || '일반'} 전문가 ${(firebasePortfolio as any).name || ''}입니다.`,
              achievements: ['포트폴리오 등록 완료'],
              workHistory: (firebasePortfolio as any).experience || [{
                company: '회사명',
                position: ((firebasePortfolio as any).speciality || '일반') + ' 전문가',
                period: '경력 정보 업데이트 예정',
                description: '자세한 경력 정보는 추후 업데이트 예정입니다.'
              }],
              projectDetails: [{
                title: '주요 프로젝트',
                description: '프로젝트 상세 정보는 추후 업데이트 예정입니다.',
                technologies: (firebasePortfolio as any).skills || [],
                duration: '프로젝트 기간',
                results: ['성과 정보 업데이트 예정']
              }]
            };
            setPortfolio(convertedPortfolio);
          }
        } catch (error) {
          console.error('Error loading portfolio from Firebase:', error);
        }
      } catch (error) {
        console.error('Error loading portfolio:', error);
      } finally {
        setLoading(false);
      }
    };

    if (portfolioId) {
      loadPortfolio();
    }
  }, [portfolioId]);

  // 아바타 함수 정의
  const getAvatarBySpeciality = (speciality: string) => {
    const avatarMap: { [key: string]: string } = {
      'SNS마케팅': '📱',
      '키워드광고': '🎯',
      '브랜드마케팅': '🎨',
      '퍼포먼스마케팅': '📊',
      '콘텐츠마케팅': '✍️',
      '마케팅기획': '💡',
      '이커머스마케팅': '🛒',
      '데이터마케팅': '📈',
      '웹개발': '💻',
      '앱개발': '📱',
      '디자인': '🎨',
      '기타': '👤'
    };
    return avatarMap[speciality] || '👤';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">포트폴리오를 찾을 수 없습니다</h1>
          <Link href="/portfolios" className="text-blue-600 hover:underline">
            포트폴리오 목록으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4">
            <Link href="/portfolios" className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors">
              <ArrowLeftIcon className="h-5 w-5" />
              <span>포트폴리오 목록</span>
            </Link>
            <div className="h-6 w-px bg-gray-300"></div>
            <h1 className="text-2xl font-bold text-gray-900">{portfolio.name}님의 포트폴리오</h1>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Profile Header */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 shadow-xl border border-white/20 mb-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">
            {/* Avatar and Basic Info */}
            <div className="flex items-center space-x-6">
              <div className="text-6xl bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full w-24 h-24 flex items-center justify-center">
                {portfolio.avatar}
              </div>
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">{portfolio.name}</h1>
                  {portfolio.verified && (
                    <CheckBadgeIcon className="h-8 w-8 text-blue-500" />
                  )}
                </div>
                <div className="flex items-center space-x-4 text-gray-600 mb-3">
                  <span className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-full font-medium">
                    {portfolio.speciality}
                  </span>
                  <div className="flex items-center space-x-1">
                    <BriefcaseIcon className="h-4 w-4" />
                    <span>{portfolio.experience} 경력</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MapPinIcon className="h-4 w-4" />
                    <span>{portfolio.location}</span>
                  </div>
                </div>
                <p className="text-lg text-gray-700">{portfolio.description}</p>
              </div>
            </div>
            
            {/* Contact Info */}
            <div className="lg:ml-auto bg-gray-50/80 rounded-2xl p-6">
              <h3 className="font-semibold text-gray-900 mb-4">연락처</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-sm">
                  <EnvelopeIcon className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">{portfolio.email}</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <PhoneIcon className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">{portfolio.phone}</span>
                </div>
              </div>
              <div className="flex space-x-3 mt-6">
                <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-xl font-medium hover:bg-blue-700 transition-colors">
                  연락하기
                </button>
                <button className="px-4 py-2 border border-gray-300 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors">
                  저장
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Introduction */}
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/20">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">자기소개</h2>
              <p className="text-gray-700 leading-relaxed">{portfolio.introduction}</p>
            </div>

            {/* Project Details */}
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/20">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">주요 프로젝트</h2>
              <div className="space-y-8">
                {portfolio.projectDetails.map((project, index) => (
                  <div key={index} className="border-l-4 border-blue-500 pl-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{project.title}</h3>
                    <p className="text-gray-600 mb-4">{project.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-2">사용 기술</h4>
                        <div className="flex flex-wrap gap-2">
                          {project.technologies.map((tech, techIndex) => (
                            <span key={techIndex} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-sm">
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-2">기간</h4>
                        <p className="text-gray-600">{project.duration}</p>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <h4 className="font-semibold text-gray-700 mb-2">성과</h4>
                      <ul className="list-disc list-inside space-y-1 text-gray-600">
                        {project.results.map((result, resultIndex) => (
                          <li key={resultIndex}>{result}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Work History */}
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/20">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">경력사항</h2>
              <div className="space-y-6">
                {portfolio.workHistory.map((work, index) => (
                  <div key={index} className="flex space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <BriefcaseIcon className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{work.position}</h3>
                      <p className="text-blue-600 font-medium">{work.company}</p>
                      <p className="text-gray-500 text-sm mb-2">{work.period}</p>
                      <p className="text-gray-700">{work.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Skills */}
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/20">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">핵심 스킬</h3>
              <div className="flex flex-wrap gap-2">
                {portfolio.skills.map((skill, index) => (
                  <span key={index} className="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-sm hover:bg-gray-200 transition-colors">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/20">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">활동 통계</h3>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{portfolio.projects}</div>
                <div className="text-gray-500">완료 프로젝트</div>
              </div>
            </div>

            {/* Education */}
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/20">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">학력</h3>
              <p className="text-gray-700">{portfolio.education}</p>
            </div>

            {/* Achievements */}
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/20">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">주요 성과</h3>
              <ul className="space-y-2">
                {portfolio.achievements.map((achievement, index) => (
                  <li key={index} className="flex items-start space-x-2 text-sm">
                    <CheckBadgeIcon className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{achievement}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}