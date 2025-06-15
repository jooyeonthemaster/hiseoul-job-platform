import { Portfolio } from '../types/portfolio.types';

// 상세 포트폴리오 더미 데이터
export const portfoliosDetail: Portfolio[] = [
  {
    id: 'sample-1',
    name: '권예림',
    speciality: 'SNS마케팅',
    experience: '3년',
    skills: ['Instagram', 'Facebook', 'TikTok', '브랜드마케팅', '콘텐츠기획'],
    languages: ['한국어', '영어', '중국어'],
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
          '브랜드 인지도 60% 상승',
          '신제품 매출 300% 증가'
        ]
      },
      {
        title: '페이스북 광고 최적화 프로젝트',
        description: '중소 쇼핑몰의 페이스북 광고 ROAS 개선 프로젝트',
        technologies: ['Facebook Ads Manager', 'Google Analytics', 'Pixel 추적'],
        duration: '4개월',
        results: [
          'ROAS 300% 향상 (1.2 → 3.6)',
          'CPC 40% 절감',
          '전환율 250% 증가',
          '월 매출 180% 증가'
        ]
      }
    ],
    selfIntroduction: {
      motivation: '디지털 마케팅의 무한한 가능성에 매료되어 이 분야에 뛰어들게 되었습니다. 특히 SNS를 통해 브랜드와 고객이 소통하는 방식이 급변하는 시대에, 창의적이고 효과적인 마케팅 전략으로 기업의 성장에 기여하고 싶습니다.',
      personality: '트렌드에 민감하고 창의적인 사고를 가지고 있으며, 데이터 분석을 통한 논리적 접근을 선호합니다. 팀워크를 중시하며, 새로운 도전을 두려워하지 않는 적극적인 성격입니다.',
      experience: '3년간 다양한 규모의 브랜드와 함께 일하며 SNS 마케팅의 전 과정을 경험했습니다. 콘텐츠 기획부터 광고 집행, 성과 분석까지 전반적인 업무를 담당하며 실질적인 성과를 창출해왔습니다.',
      aspiration: '앞으로는 글로벌 브랜드의 디지털 마케팅을 담당하며, 한국의 창의적인 마케팅 노하우를 세계에 알리고 싶습니다. 또한 AI와 빅데이터를 활용한 차세대 마케팅 전략 개발에도 도전하고 싶습니다.'
    },
    mediaContent: [
      {
        type: 'video',
        url: 'https://example.com/portfolio-video-1',
        title: '인스타그램 리브랜딩 프로젝트 소개',
        description: '패션 브랜드의 인스타그램 계정을 성공적으로 리브랜딩한 과정을 소개합니다.'
      },
      {
        type: 'presentation',
        url: 'https://example.com/presentation-1',
        title: 'TikTok 마케팅 전략 발표자료',
        description: 'Z세대를 타겟으로 한 TikTok 마케팅 전략과 실행 결과를 정리한 자료입니다.'
      }
    ],
    certificates: [
      {
        name: '구글 애널리틱스 개인 자격증',
        issuer: 'Google',
        issueDate: '2023.05'
      },
      {
        name: '페이스북 블루프린트 자격증',
        issuer: 'Meta',
        issueDate: '2023.03'
      },
      {
        name: '디지털마케팅 전문가',
        issuer: '한국디지털마케팅협회',
        issueDate: '2022.11'
      }
    ],
    awards: [
      {
        title: '올해의 SNS 마케터상',
        organization: '한국마케팅협회',
        date: '2023.12',
        description: 'TikTok 바이럴 캠페인으로 업계에서 인정받아 수상'
      },
      {
        title: '크리에이티브 캠페인 대상',
        organization: '디지털마케팅어워드',
        date: '2023.08',
        description: '창의적인 인스타그램 캠페인으로 대상 수상'
      }
    ],
    detailedEducation: [
      {
        institution: '연세대학교',
        degree: '학사',
        field: '경영학과',
        startDate: '2017.03',
        endDate: '2021.02',
        grade: '3.8/4.5'
      },
      {
        institution: '패스트캠퍼스',
        degree: '수료',
        field: '디지털마케팅 부트캠프',
        startDate: '2021.03',
        endDate: '2021.06'
      }
    ]
  },
  {
    id: 'sample-2',
    name: '김민수',
    speciality: '키워드광고',
    experience: '5년',
    skills: ['Google Ads', 'Naver 광고', 'SEO', 'SEM', '데이터분석'],
    languages: ['한국어', '영어'],
    description: '검색엔진 마케팅 및 키워드 광고 최적화 전문가',
    avatar: '👨',
    projects: 25,
    verified: true,
    location: '서울시 서초구',
    email: 'minsu.kim@example.com',
    phone: '010-2345-6789',
    education: '서울대학교 통계학과',
    introduction: '5년간 다양한 업종의 키워드 광고를 담당하며 평균 ROAS 400% 이상의 성과를 달성해왔습니다. 데이터 분석을 통한 정밀한 타겟팅과 지속적인 최적화로 광고 효율을 극대화하는 것이 저의 강점입니다.',
    achievements: [
      '평균 ROAS 400% 이상 달성',
      '키워드 광고비 30% 절감',
      '전환율 평균 250% 향상',
      '검색 순위 1페이지 진입률 90%',
      '월 광고 예산 5억원 규모 관리'
    ],
    workHistory: [
      {
        company: '(주)디지털마케팅솔루션',
        position: 'SEM 팀장',
        period: '2021.01 - 현재',
        description: '대형 이커머스 및 금융사의 키워드 광고 전략 수립 및 실행. 팀원 5명 관리'
      },
      {
        company: '온라인마케팅그룹',
        position: 'SEM 전문가',
        period: '2019.03 - 2020.12',
        description: '중소기업 대상 구글 애즈 및 네이버 광고 운영. 월 평균 20개사 관리'
      }
    ],
    projectDetails: [
      {
        title: '이커머스 키워드 광고 최적화',
        description: '대형 온라인 쇼핑몰의 키워드 광고 성과 개선 프로젝트',
        technologies: ['Google Ads', 'Naver 광고', 'Google Analytics', 'GTM'],
        duration: '12개월',
        results: [
          'ROAS 450% 달성',
          '광고비 대비 매출 300% 증가',
          '키워드 품질점수 평균 8점 이상',
          '전환율 280% 향상'
        ]
      }
    ]
  }
];