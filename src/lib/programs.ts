export type ProgramCourseType = 'domestic' | 'foreign';

export interface PortfolioProgram {
  id: string;
  name: string;
  shortName: string;
  aliases?: string[];
  courseType: ProgramCourseType;
  audience: string;
  hours: string;
  /** 과정 소개 영상. 커스텀 과정은 빈 문자열일 수 있다(미등록 상태). */
  youtubeId: string;
  /** 교육생 전체 자기소개 영상 — 인재 목록 상단에 노출. 없으면 youtubeId 로 대체. */
  introVideoId?: string;
  /** 관리자가 Firestore(programs 컬렉션)에서 직접 추가한 과정 여부 */
  isCustom?: boolean;
  heroTitle: string;
  summary: string;
  overview: string;
  benefit: string;
  talentNote: string;
  tags: string[];
  skills: Array<{
    icon: string;
    title: string;
    description: string;
  }>;
  curriculumLabel: string;
  curriculumIntro: string;
  curriculum: Array<{
    step: string;
    title: string;
    description: string;
    topics: string[];
  }>;
  curriculumOutcome: {
    title: string;
    description: string;
  };
  workHoursNote?: {
    title: string;
    description: string;
    table: Array<{
      period: string;
      hours: string;
    }>;
    note: string;
  };
}

export const PORTFOLIO_PROGRAMS: PortfolioProgram[] = [
  {
    id: '2026-ai-digital-marketing',
    name: '2026 프로젝트기반 생성형 AI 디지털 마케팅 전문가 양성과정',
    shortName: '생성형 AI 디지털 마케팅',
    aliases: ['AI 마케팅 역량 강화 교육', '영상콘텐츠 마케터', '영상콘텐츠 마케터 양성과정'],
    courseType: 'domestic',
    audience: '내국인 청년',
    hours: '300시간',
    youtubeId: '9wG8lT-XZWY',
    heroTitle: '300시간 실전 교육을 마친 AI 전문 우수 인재',
    summary:
      '생성형 AI를 업무 도구로 자유자재로 활용하며 콘텐츠 제작, 데이터 분석, 업무 자동화, AI 에이전트 구축까지 실무 프로젝트로 훈련한 과정입니다.',
    overview:
      '서울시 매력일자리 사업의 일환으로 운영되는 채용연계형 과정입니다. 교육생은 실제 기업 프로젝트를 수행하며 수료 시점에 성과물 중심의 포트폴리오를 보유하게 됩니다.',
    benefit:
      '수요기업으로 선정되면 교육 수료생의 포트폴리오를 먼저 검토하고, 매칭 후 채용 초기 3개월 인건비를 사업비로 지원받을 수 있습니다.',
    talentNote:
      '만 18~39세 서울 청년 중 선발 기준을 통과한 교육생으로, 학습 의지와 실무 프로젝트 수행 경험을 함께 검증했습니다.',
    tags: ['서울시 매력일자리', '채용연계', '300시간 AI 전문 교육', '인건비 3개월 지원'],
    skills: [
      { icon: '🧠', title: '생성형 AI 활용', description: 'ChatGPT, Claude 등을 활용한 전략 수립, 콘텐츠 생성, 업무 처리' },
      { icon: '🎬', title: 'AI 영상·콘텐츠 제작', description: 'SNS, 숏폼, 광고 소재 등 AI 기반 영상 및 콘텐츠 제작' },
      { icon: '🎨', title: '디자인·비주얼', description: 'AI 디자인 도구를 활용한 브랜드 콘텐츠와 시각 자료 제작' },
      { icon: '📈', title: '데이터 분석', description: '광고 성과 분석, 인사이트 도출, 보고서 작성' },
      { icon: '🤖', title: 'AI 에이전트 구축', description: '기업 맞춤형 AI 도구 개발과 업무 자동화 시스템 운영' },
      { icon: '🌐', title: '전략 기획·실행', description: '실제 기업 대상 디지털 전략 기획과 AI 기반 실행 경험' },
    ],
    curriculumLabel: '5단계 실전 커리큘럼 (총 300시간)',
    curriculumIntro:
      'AI 콘텐츠 마케팅부터 에이전트 구축, 실제 기업 파이널 프로젝트까지 — 단계마다 실무 결과물을 쌓아 올리는 프로젝트 중심 구성입니다.',
    curriculum: [
      {
        step: 'STEP 01',
        title: 'AI 콘텐츠 마케팅',
        description: '생성형 AI 활용 카피라이팅·콘텐츠 기획',
        topics: ['ChatGPT·Claude 카피라이팅', 'SNS 콘텐츠 기획', '브랜드 메시지 설계'],
      },
      {
        step: 'STEP 02',
        title: 'AI 업무 자동화',
        description: 'Claude 등 AI 도구를 활용한 업무 자동화',
        topics: ['프롬프트 엔지니어링', '반복 업무 자동화', '업무 프로세스 설계'],
      },
      {
        step: 'STEP 03',
        title: '데이터 분석',
        description: '광고 성과 분석과 인사이트 도출',
        topics: ['광고 성과 분석', '인사이트 도출', '데이터 리포트 작성'],
      },
      {
        step: 'STEP 04',
        title: 'AI 에이전트 구축',
        description: '맞춤형 AI 도구 개발',
        topics: ['맞춤형 AI 도구 개발', '에이전트 워크플로 설계', '운영 자동화'],
      },
      {
        step: 'STEP 05',
        title: '파이널 프로젝트',
        description: '실제 기업 AI 전략 수립 및 실행',
        topics: ['실제 기업 과제 수행', 'AI 전략 수립·실행', '성과 발표'],
      },
    ],
    curriculumOutcome: {
      title: '수료 결과물',
      description: '실제 기업 프로젝트를 직접 수행하고, 그 성과물을 담은 실무 중심 포트폴리오를 완성합니다.',
    },
  },
  {
    id: '2026-foreign-ai-market-research',
    name: '2026 외국인 유학생 대상 해외시장 조사 및 AI 마케팅 역량강화 과정',
    shortName: '2026 외국인 유학생 AI 마케팅',
    // 주의: 과거에 여기 있던 '외국인 유학생 AI 마케터 인턴과정' 등의 별칭은 전부
    // 작년(2025) 과정 실데이터의 과정명이므로 2025 과정(관리자 등록 커스텀 과정)으로 이관했다.
    aliases: ['2026 외국인 유학생 AI 마케팅'],
    courseType: 'foreign',
    audience: '외국인 유학생',
    hours: '155시간',
    youtubeId: 'pt85XMcEhng',
    heroTitle: '155시간 실전 교육을 마친 글로벌 AI 마케팅 우수 인재',
    summary:
      '다국어 역량과 글로벌 시각을 갖춘 외국인 유학생이 생성형 AI 마케팅, 해외 시장 조사, SNS·SEO 실무를 집중 훈련한 과정입니다.',
    overview:
      '외국인 유학생을 대상으로 생성형 AI 마케팅 및 해외 시장 조사 역량을 155시간 집중 양성하는 채용연계형 프로그램입니다.',
    benefit:
      '인턴 종료 후 계약직·기간제 형태의 채용 연계가 이루어질 경우 최대 3개월까지 인건비와 4대 보험 사업주 부담분을 사업비로 지원받을 수 있습니다.',
    talentNote:
      '서울 거주 외국인 유학생(D-2/D-10 비자) 중 한국어 소통이 가능하고 다국어 커뮤니케이션 역량을 갖춘 교육생입니다.',
    tags: ['서울시 매력일자리', '글로벌 인재', '해외 시장 조사', '채용연계 시 인건비 지원'],
    skills: [
      { icon: '🧠', title: '생성형 AI 마케팅', description: 'ChatGPT, Claude 등을 활용한 전략 수립 및 콘텐츠 생성' },
      { icon: '🎬', title: 'AI 영상·콘텐츠 제작', description: 'AI 영상 도구를 활용한 SNS·숏폼·광고 소재 제작' },
      { icon: '🌍', title: '해외 시장 조사', description: '글로벌 마켓 리서치, 해외 소비자 분석, 진출 전략 수립' },
      { icon: '🎨', title: '디자인·비주얼', description: 'Canva 등 AI 디자인 도구를 활용한 브랜드 콘텐츠 제작' },
      { icon: '📱', title: 'SNS·디지털마케팅', description: 'SNS 채널 운영 전략, SEO 최적화, 데이터 분석' },
      { icon: '🗣️', title: '다국어 커뮤니케이션', description: '한국어, 모국어, 영어 기반의 다국어 마케팅 콘텐츠 제작' },
    ],
    curriculumLabel: '3파트 실전 커리큘럼 (총 155시간)',
    curriculumIntro:
      '생성형 AI 실무, 글로벌 마케팅, 한국 직장 적응까지 — 외국인 유학생이 한국 기업에서 바로 일할 수 있도록 설계된 집중 구성입니다.',
    curriculum: [
      {
        step: 'PART 01',
        title: '생성형 AI',
        description: 'AI 텍스트·이미지·영상 제작, 마케팅 자동화',
        topics: ['ChatGPT·Claude 활용', 'AI 이미지·영상 제작', '마케팅 자동화 실습'],
      },
      {
        step: 'PART 02',
        title: '마케팅 & 글로벌 시장',
        description: '디지털마케팅, 해외 시장 조사, SNS·SEO',
        topics: ['글로벌 마켓 리서치', 'SNS 채널 전략', 'SEO 최적화'],
      },
      {
        step: 'PART 03',
        title: '직무 기초',
        description: '한국 기업문화, 이력서·면접, 직장 적응',
        topics: ['한국 기업문화 이해', '이력서·면접 준비', '직장 커뮤니케이션'],
      },
    ],
    curriculumOutcome: {
      title: '수료 결과물',
      description: '다국어 마케팅 콘텐츠와 해외 시장 조사 리포트를 담은 글로벌 마케팅 포트폴리오를 완성합니다.',
    },
    workHoursNote: {
      title: '근로 시간 안내',
      description:
        '수료생의 비자 상태(D-2 유학 비자) 및 재학 상태에 따라 9월 개강 후에는 최대 주 25시간 범위에서 근무 일정을 조율해야 합니다.',
      table: [
        { period: '2026년 8월 (방학 기간)', hours: '주 40시간 근로 가능' },
        { period: '2026년 9~10월 (학기 중)', hours: '최대 주 25시간 근로 가능' },
      ],
      note: '인건비는 실제 근로 시간에 따라 지급되며, 채용 확정 후 시간제 취업 허가 절차는 협회 안내를 받을 수 있습니다.',
    },
  },
];

export const DEFAULT_VISIBLE_PROGRAM_IDS = PORTFOLIO_PROGRAMS.map((program) => program.id);

export const SPECIALITY_OPTIONS = [
  'SNS마케팅',
  '키워드광고',
  '브랜드마케팅',
  '퍼포먼스마케팅',
  '콘텐츠마케팅',
  '마케팅기획',
  '이커머스마케팅',
  '데이터마케팅',
  '해외시장조사',
  'AI콘텐츠제작',
  'AI업무자동화',
  '웹개발',
  '앱개발',
  '디자인',
  '기타',
];

export const SPECIALITY_ICON_MAP: Record<string, string> = {
  SNS마케팅: '📱',
  키워드광고: '🎯',
  브랜드마케팅: '🎨',
  퍼포먼스마케팅: '📊',
  콘텐츠마케팅: '✍️',
  마케팅기획: '💡',
  이커머스마케팅: '🛒',
  데이터마케팅: '📈',
  해외시장조사: '🌍',
  AI콘텐츠제작: '🎬',
  AI업무자동화: '🤖',
  웹개발: '💻',
  앱개발: '📱',
  디자인: '🎨',
  기타: '👤',
};

// ── 매칭 헬퍼 ──────────────────────────────────────────────────────────
//  programs 인자를 생략하면 정적 과정만 대상으로 한다.
//  관리자 커스텀 과정(Firestore)까지 포함하려면 usePrograms() 등으로 병합한 목록을 전달할 것.

function normalizedNamesOf(program: PortfolioProgram) {
  return [program.name, program.shortName, ...(program.aliases || [])]
    .map((name) => name.trim().toLowerCase())
    .filter(Boolean);
}

export function getProgramById(programId?: string | null, programs: PortfolioProgram[] = PORTFOLIO_PROGRAMS) {
  return programs.find((program) => program.id === programId);
}

export function getProgramByCourseName(
  courseName?: string | null,
  programs: PortfolioProgram[] = PORTFOLIO_PROGRAMS,
) {
  if (!courseName) return undefined;
  const normalizedCourseName = courseName.trim().toLowerCase();

  // 1차: 정확 일치 — '2025 외국인 유학생 AI 마케팅'이 다른 과정의 부분 문자열과
  //      겹쳐도 공식 과정명이 항상 우선하도록 한다.
  const exact = programs.find((program) => normalizedNamesOf(program).some((name) => name === normalizedCourseName));
  if (exact) return exact;

  // 2차: 양방향 부분 일치 (과거 수기 입력 데이터의 변형 표기 흡수용)
  return programs.find((program) =>
    normalizedNamesOf(program).some(
      (name) => normalizedCourseName.includes(name) || name.includes(normalizedCourseName),
    ),
  );
}

export function getProgramByCourseType(
  courseType?: ProgramCourseType | null,
  programs: PortfolioProgram[] = PORTFOLIO_PROGRAMS,
) {
  if (!courseType) return undefined;
  return programs.find((program) => program.courseType === courseType);
}

export function getProgramForPortfolio(
  portfolio: { currentCourse?: string; courseType?: ProgramCourseType | null },
  programs: PortfolioProgram[] = PORTFOLIO_PROGRAMS,
) {
  return getProgramByCourseName(portfolio.currentCourse, programs) || getProgramByCourseType(portfolio.courseType, programs);
}

export function portfolioMatchesProgram(
  portfolio: { currentCourse?: string; courseType?: ProgramCourseType | null },
  programId: string,
  programs: PortfolioProgram[] = PORTFOLIO_PROGRAMS,
) {
  const program = getProgramById(programId, programs);
  if (!program) return false;
  const portfolioProgram = getProgramForPortfolio(portfolio, programs);
  if (portfolioProgram) return portfolioProgram.id === program.id;
  return portfolio.courseType === program.courseType;
}

// ── 기업별 과정 열람 권한 ──────────────────────────────────────────────
//  employers/{uid}.allowedProgramIds:
//   - 필드 없음(레거시)  → 전체 허용 (기존 기업의 접근이 배포로 끊기지 않도록)
//   - 배열              → 해당 과정만 허용. 빈 배열 = 전면 차단(매칭기간 종료 상태).
export function getAllowedProgramIdsForEmployer(
  employerData: { allowedProgramIds?: unknown } | null | undefined,
  allProgramIds: string[],
): string[] {
  const raw = employerData?.allowedProgramIds;
  if (!Array.isArray(raw)) return allProgramIds;
  const allowed = raw.filter((id): id is string => typeof id === 'string');
  return allProgramIds.filter((id) => allowed.includes(id));
}

export function isEmployerProgramRestricted(employerData: { allowedProgramIds?: unknown } | null | undefined) {
  return Array.isArray(employerData?.allowedProgramIds);
}

export function splitSpecialities(value?: string | string[] | null) {
  if (Array.isArray(value)) return value.map((item) => item.trim()).filter(Boolean);
  if (!value) return [];
  return value
    .split(/[,;|]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function formatSpecialities(values: string[]) {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean))).join(', ');
}

export function getPrimarySpeciality(value?: string | null) {
  return splitSpecialities(value)[0] || '기타';
}
