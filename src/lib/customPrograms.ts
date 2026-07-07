// 관리자 커스텀 과정 (Firestore `programs` 컬렉션)
//  - 정적 과정(PORTFOLIO_PROGRAMS)은 커리큘럼 등 풍부한 콘텐츠를 코드로 관리하고,
//    연도별 아카이브·신규 과정은 관리자 페이지에서 직접 추가/수정한다.
//  - 커스텀 과정은 커리큘럼/역량 데이터가 없으므로 빈 배열로 변환해
//    소비처(UI)가 length 가드만으로 자연스럽게 생략하도록 한다.
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { PORTFOLIO_PROGRAMS, type PortfolioProgram, type ProgramCourseType } from '@/lib/programs';

const PROGRAMS_COLLECTION = 'programs';

export interface CustomProgramInput {
  name: string;
  shortName: string;
  courseType: ProgramCourseType;
  audience: string;
  hours: string;
  summary: string;
  overview?: string;
  talentNote?: string;
  heroTitle?: string;
  youtubeId?: string;
  introVideoId?: string;
  aliases?: string[];
  tags?: string[];
  /** 연도별 아카이브 — 메인 과정 선택 대신 상단 네비 탭으로 노출 */
  archived?: boolean;
}

function toPortfolioProgram(id: string, data: Record<string, any>): PortfolioProgram {
  return {
    id,
    isCustom: true,
    archived: data.archived === true,
    name: data.name || '',
    shortName: data.shortName || data.name || '',
    aliases: Array.isArray(data.aliases) ? data.aliases.filter(Boolean) : [],
    courseType: data.courseType === 'foreign' ? 'foreign' : 'domestic',
    audience: data.audience || '',
    hours: data.hours || '',
    youtubeId: data.youtubeId || '',
    introVideoId: data.introVideoId || '',
    heroTitle: data.heroTitle || data.name || '',
    summary: data.summary || '',
    overview: data.overview || '',
    benefit: data.benefit || '',
    talentNote: data.talentNote || '',
    tags: Array.isArray(data.tags) ? data.tags.filter(Boolean) : [],
    skills: [],
    curriculumLabel: '',
    curriculumIntro: '',
    curriculum: [],
    curriculumOutcome: { title: '', description: '' },
  };
}

export async function fetchCustomPrograms(): Promise<PortfolioProgram[]> {
  const snapshot = await getDocs(collection(db, PROGRAMS_COLLECTION));
  return snapshot.docs
    .map((docSnap) => ({ program: toPortfolioProgram(docSnap.id, docSnap.data()), raw: docSnap.data() }))
    .sort((a, b) => (a.raw.createdAt?.seconds || 0) - (b.raw.createdAt?.seconds || 0))
    .map((entry) => entry.program);
}

// 모듈 캐시 — 같은 세션에서 페이지를 오갈 때마다 재조회하지 않는다.
let mergedCache: PortfolioProgram[] | null = null;
let mergedCachePromise: Promise<PortfolioProgram[]> | null = null;

export function invalidateProgramsCache() {
  mergedCache = null;
  mergedCachePromise = null;
}

/** 정적 과정 + 관리자 커스텀 과정 병합 목록. 조회 실패 시 정적 과정만 반환한다. */
export async function getAllPrograms(): Promise<PortfolioProgram[]> {
  if (mergedCache) return mergedCache;
  if (!mergedCachePromise) {
    mergedCachePromise = fetchCustomPrograms()
      .then((custom) => {
        const staticIds = new Set(PORTFOLIO_PROGRAMS.map((program) => program.id));
        mergedCache = [...PORTFOLIO_PROGRAMS, ...custom.filter((program) => !staticIds.has(program.id))];
        return mergedCache;
      })
      .catch((error) => {
        console.warn('커스텀 과정 조회 실패 — 정적 과정만 사용:', error);
        mergedCachePromise = null;
        return PORTFOLIO_PROGRAMS;
      });
  }
  return mergedCachePromise;
}

function sanitizeInput(input: CustomProgramInput) {
  return {
    name: input.name.trim(),
    shortName: (input.shortName || input.name).trim(),
    courseType: input.courseType,
    audience: input.audience.trim(),
    hours: input.hours.trim(),
    summary: input.summary.trim(),
    overview: (input.overview || '').trim(),
    talentNote: (input.talentNote || '').trim(),
    heroTitle: (input.heroTitle || '').trim(),
    youtubeId: (input.youtubeId || '').trim(),
    introVideoId: (input.introVideoId || '').trim(),
    aliases: (input.aliases || []).map((alias) => alias.trim()).filter(Boolean),
    tags: (input.tags || []).map((tag) => tag.trim()).filter(Boolean),
    archived: input.archived === true,
  };
}

export async function createCustomProgram(programId: string, input: CustomProgramInput) {
  await setDoc(doc(db, PROGRAMS_COLLECTION, programId), {
    ...sanitizeInput(input),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  invalidateProgramsCache();
}

export async function updateCustomProgram(programId: string, input: CustomProgramInput) {
  await updateDoc(doc(db, PROGRAMS_COLLECTION, programId), {
    ...sanitizeInput(input),
    updatedAt: serverTimestamp(),
  });
  invalidateProgramsCache();
}

export async function deleteCustomProgram(programId: string) {
  await deleteDoc(doc(db, PROGRAMS_COLLECTION, programId));
  invalidateProgramsCache();
}

/** 과정명으로 URL-안전한 문서 ID 생성 (한글 유지 — Firestore ID 는 유니코드 허용) */
export function buildProgramId(name: string) {
  const slug = name
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[/\\.#$\[\]]/g, '')
    .slice(0, 80);
  return slug || `program-${Math.random().toString(36).slice(2, 8)}`;
}
