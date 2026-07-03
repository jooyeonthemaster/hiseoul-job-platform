// ════════════════════════════════════════════════════════════════
//  관리자 데이터 엑셀(.xlsx) 내보내기 유틸
//  - 구직자 정보 / 기업 정보 / 선택(매칭) 기록 3종을 시트로 생성
//  - 관리자(admin 역할로 로그인)만 호출되어야 함. Firestore 보안규칙의
//    isAdmin() catch-all 로 전체 컬렉션 조회가 허용된다.
//  - 선택 기록 = 기업→구직자(채용제안 jobInquiries, 관심인재 likes/favoriteTalents)
//                + 구직자→기업(관심기업 favoriteCompanies)
// ════════════════════════════════════════════════════════════════
import * as XLSX from 'xlsx';
import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';

/** Firestore Timestamp / Date / string 을 'YYYY-MM-DD HH:mm' 로 변환 */
function fmtDate(value: any): string {
  if (!value) return '';
  try {
    let date: Date;
    if (value instanceof Date) date = value;
    else if (typeof value === 'object' && typeof value.toDate === 'function') date = value.toDate();
    else if (typeof value === 'object' && typeof value.seconds === 'number') date = new Date(value.seconds * 1000);
    else date = new Date(value);
    if (isNaN(date.getTime())) return '';
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
  } catch {
    return '';
  }
}

/** 배열/객체를 사람이 읽을 수 있는 문자열로 평탄화 */
function joinArr(arr: any, sep = ', '): string {
  if (!Array.isArray(arr)) return arr ? String(arr) : '';
  return arr
    .map((item) => {
      if (item == null) return '';
      if (typeof item === 'string') return item;
      // 경력/학력/자격증 등 객체는 핵심 필드를 요약
      if (typeof item === 'object') {
        if ('company' in item) return `${item.company || ''}(${item.position || ''})`;
        if ('institution' in item) return `${item.institution || ''}(${item.degree || ''}/${item.field || ''})`;
        if ('name' in item && 'issuer' in item) return `${item.name || ''}(${item.issuer || ''})`;
        if ('title' in item && 'organization' in item) return `${item.title || ''}(${item.organization || ''})`;
        if ('url' in item) return `${item.title ? item.title + ': ' : ''}${item.url}`;
        return JSON.stringify(item);
      }
      return String(item);
    })
    .filter(Boolean)
    .join(sep);
}

function courseTypeLabel(courseType: any): string {
  if (courseType === 'domestic') return '내국인';
  if (courseType === 'foreign') return '외국인';
  return '';
}

async function snapshotToMap(collectionName: string): Promise<Map<string, any>> {
  const snap = await getDocs(collection(db, collectionName));
  const map = new Map<string, any>();
  snap.docs.forEach((d) => map.set(d.id, { id: d.id, ...d.data() }));
  return map;
}

/** 모든 관리자 데이터를 병렬로 조회 */
async function fetchAll() {
  const [users, jobseekers, portfolios, employers, jobInquiries, likes] = await Promise.all([
    snapshotToMap('users'),
    snapshotToMap('jobseekers'),
    snapshotToMap('portfolios'),
    snapshotToMap('employers'),
    snapshotToMap('jobInquiries'),
    snapshotToMap('likes').catch(() => new Map<string, any>()),
  ]);
  return { users, jobseekers, portfolios, employers, jobInquiries, likes };
}

/** 구직자 정보 시트 행 생성 */
function buildJobseekerRows(data: Awaited<ReturnType<typeof fetchAll>>) {
  const { users, jobseekers, portfolios } = data;
  const rows: Record<string, any>[] = [];

  // jobseekers 컬렉션 기준 (프로필 상세 보유), 없으면 portfolios 로 보완
  const seen = new Set<string>();
  const addRow = (userId: string, profile: any, portfolio: any) => {
    if (seen.has(userId)) return;
    seen.add(userId);
    const user = users.get(userId) || {};
    const p = profile || {};
    const intro = p.selfIntroduction || {};
    rows.push({
      '사용자ID': userId,
      '이름': user.name || portfolio?.name || '',
      '이메일': user.email || portfolio?.email || '',
      '휴대폰': p.phone || portfolio?.phone || '',
      '주소': p.address || portfolio?.address || '',
      '생년월일': fmtDate(p.dateOfBirth),
      '전문분야': p.speciality || portfolio?.speciality || '',
      '수행과정': p.currentCourse || portfolio?.currentCourse || '',
      '과정구분': courseTypeLabel(p.courseType ?? portfolio?.courseType),
      '스킬': joinArr(p.skills || portfolio?.skills),
      '언어': joinArr(p.languages || portfolio?.languages),
      '경력': joinArr(p.experience || portfolio?.experience),
      '학력': joinArr(p.education || portfolio?.education),
      '자격증': joinArr(p.certificates || portfolio?.certificates),
      '수상': joinArr(p.awards || portfolio?.awards),
      '자기소개_지원동기': intro.motivation || '',
      '자기소개_성격': intro.personality || '',
      '자기소개_경험': intro.experience || '',
      '자기소개_포부': intro.aspiration || '',
      '자기소개영상': joinArr(p.introVideos || portfolio?.introVideos) || p.introVideo || portfolio?.introVideo || '',
      '포트폴리오PDF': joinArr((p.portfolioPdfs || portfolio?.portfolioPdfs || []).map((f: any) => f.fileName)),
      '공개여부': portfolio ? (portfolio.isHidden ? '숨김' : '공개') : '',
      '가입일': fmtDate(user.createdAt || portfolio?.createdAt),
    });
  };

  jobseekers.forEach((js, userId) => {
    // 실제 구직자만 (users.role === 'jobseeker' 또는 profile 존재)
    const user = users.get(userId);
    if (user && user.role && user.role !== 'jobseeker') return;
    addRow(userId, js.profile, portfolios.get(userId));
  });
  // jobseekers 문서가 없지만 portfolio 만 있는 경우 보완
  portfolios.forEach((pf, userId) => addRow(userId, jobseekers.get(userId)?.profile, pf));

  return rows;
}

/** 기업 정보 시트 행 생성 */
function buildEmployerRows(data: Awaited<ReturnType<typeof fetchAll>>) {
  const { users, employers } = data;
  const rows: Record<string, any>[] = [];
  const statusLabel: Record<string, string> = { pending: '승인대기', approved: '승인완료', rejected: '거절/취소' };

  employers.forEach((emp, docId) => {
    const c = emp.company || {};
    const attraction = c.companyAttraction || {};
    const user = users.get(emp.userId) || {};
    rows.push({
      '기업문서ID': docId,
      '사용자ID': emp.userId || '',
      '이메일': user.email || '',
      '담당자명': c.contactName || user.name || '',
      '담당자직급': c.contactPosition || user.position || '',
      '담당자연락처': c.contactPhone || '',
      '회사명': c.name || '',
      '대표자': c.ceoName || '',
      '업종': c.industry || '',
      '사업유형': c.businessType || '',
      '회사규모': c.size || '',
      '위치': c.location || '',
      '홈페이지': c.website || '',
      '회사소개': c.description || '',
      '승인상태': statusLabel[emp.approvalStatus] || emp.approvalStatus || '',
      '거절/취소사유': emp.rejectedReason || emp.canceledReason || '',
      '숨김여부': emp.isHidden ? '숨김' : '표시',
      '근무시간': attraction.workingHours || '',
      '재택근무': attraction.remoteWork ? 'O' : '',
      '평균연봉': attraction.averageSalary || '',
      '복리후생': joinArr(attraction.benefits),
      '성장기회': attraction.growthOpportunity ? 'O' : '',
      '스톡옵션': attraction.stockOptions ? 'O' : '',
      '교육지원': attraction.trainingSupport ? 'O' : '',
      '가족친화': attraction.familyFriendly ? 'O' : '',
      '기타': attraction.etc || '',
      '가입일': fmtDate(emp.createdAt),
      '승인일': fmtDate(emp.approvedAt),
    });
  });

  return rows;
}

/** 선택(매칭) 기록 시트 행 생성 */
function buildSelectionRows(data: Awaited<ReturnType<typeof fetchAll>>) {
  const { users, employers, jobInquiries, likes } = data;
  const rows: Record<string, any>[] = [];
  const statusLabel: Record<string, string> = {
    sent: '발송됨', read: '읽음', responded: '응답함', accepted: '수락됨', rejected: '거절됨',
  };

  // 회사명 조회 헬퍼 (employerId 는 users 문서ID == employers.userId)
  const companyNameByUserId = new Map<string, string>();
  employers.forEach((emp) => {
    if (emp.userId) companyNameByUserId.set(emp.userId, emp.company?.name || '');
  });
  const userName = (id: string) => users.get(id)?.name || '';
  const userEmail = (id: string) => users.get(id)?.email || '';

  // 1) 채용 제안 (기업 → 구직자)
  jobInquiries.forEach((iq) => {
    rows.push({
      '선택유형': '채용제안(기업→구직자)',
      '기업명': iq.companyInfo?.name || companyNameByUserId.get(iq.employerId) || '',
      '기업담당자': iq.recruiterInfo?.name || '',
      '구직자명': userName(iq.jobSeekerId),
      '구직자이메일': userEmail(iq.jobSeekerId),
      '제안직무': iq.proposedPosition || '',
      '제안급여': iq.proposedSalary || '',
      '상태': statusLabel[iq.status] || iq.status || '',
      '메시지': (iq.message || '').slice(0, 500),
      '일시': fmtDate(iq.sentAt),
    });
  });

  // 2) 관심 인재 (기업 → 구직자, likes 컬렉션)
  likes.forEach((lk) => {
    rows.push({
      '선택유형': '관심인재(기업→구직자)',
      '기업명': lk.companyName || companyNameByUserId.get(lk.employerId) || '',
      '기업담당자': lk.employerName || '',
      '구직자명': userName(lk.jobSeekerId || lk.portfolioId),
      '구직자이메일': userEmail(lk.jobSeekerId || lk.portfolioId),
      '제안직무': '',
      '제안급여': '',
      '상태': '',
      '메시지': '',
      '일시': fmtDate(lk.createdAt),
    });
  });

  // 3) 관심 인재 (기업 → 구직자, users.favoriteTalents) & 관심 기업 (구직자 → 기업, users.favoriteCompanies)
  users.forEach((u, uid) => {
    (u.favoriteTalents || []).forEach((talentId: string) => {
      rows.push({
        '선택유형': '관심인재(기업→구직자)',
        '기업명': companyNameByUserId.get(uid) || u.companyName || u.name || '',
        '기업담당자': u.name || '',
        '구직자명': userName(talentId),
        '구직자이메일': userEmail(talentId),
        '제안직무': '', '제안급여': '', '상태': '', '메시지': '',
        '일시': '',
      });
    });
    (u.favoriteCompanies || []).forEach((companyUserId: string) => {
      rows.push({
        '선택유형': '관심기업(구직자→기업)',
        '기업명': companyNameByUserId.get(companyUserId) || userName(companyUserId) || '',
        '기업담당자': '',
        '구직자명': u.name || userName(uid),
        '구직자이메일': u.email || userEmail(uid),
        '제안직무': '', '제안급여': '', '상태': '', '메시지': '',
        '일시': '',
      });
    });
  });

  return rows;
}

/** 시트 1개를 워크북에 추가 (빈 데이터도 헤더만이라도 표시) */
function appendSheet(wb: XLSX.WorkBook, name: string, rows: Record<string, any>[], fallbackHeaders: string[]) {
  const ws = rows.length > 0
    ? XLSX.utils.json_to_sheet(rows)
    : XLSX.utils.aoa_to_sheet([fallbackHeaders]);
  // 컬럼 너비 자동(대략)
  if (rows.length > 0) {
    const headers = Object.keys(rows[0]);
    (ws['!cols'] as any) = headers.map((h) => ({ wch: Math.min(40, Math.max(10, h.length + 4)) }));
  }
  XLSX.utils.book_append_sheet(wb, ws, name);
}

function downloadWorkbook(wb: XLSX.WorkBook, fileName: string) {
  XLSX.writeFile(wb, fileName);
}

function todayStamp(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
}

// ──────────────── 공개 API ────────────────

export async function exportJobseekersToExcel() {
  const data = await fetchAll();
  const wb = XLSX.utils.book_new();
  appendSheet(wb, '구직자_정보', buildJobseekerRows(data), ['사용자ID', '이름', '이메일']);
  downloadWorkbook(wb, `구직자정보_${todayStamp()}.xlsx`);
}

export async function exportEmployersToExcel() {
  const data = await fetchAll();
  const wb = XLSX.utils.book_new();
  appendSheet(wb, '기업_정보', buildEmployerRows(data), ['회사명', '이메일', '승인상태']);
  downloadWorkbook(wb, `기업정보_${todayStamp()}.xlsx`);
}

export async function exportSelectionsToExcel() {
  const data = await fetchAll();
  const wb = XLSX.utils.book_new();
  appendSheet(wb, '선택_기록', buildSelectionRows(data), ['선택유형', '기업명', '구직자명']);
  downloadWorkbook(wb, `선택기록_${todayStamp()}.xlsx`);
}

/** 3종 데이터를 하나의 워크북(3시트)으로 통합 내보내기 */
export async function exportAllToExcel() {
  const data = await fetchAll();
  const wb = XLSX.utils.book_new();
  appendSheet(wb, '구직자_정보', buildJobseekerRows(data), ['사용자ID', '이름', '이메일']);
  appendSheet(wb, '기업_정보', buildEmployerRows(data), ['회사명', '이메일', '승인상태']);
  appendSheet(wb, '선택_기록', buildSelectionRows(data), ['선택유형', '기업명', '구직자명']);
  downloadWorkbook(wb, `면접심사매칭_전체데이터_${todayStamp()}.xlsx`);
}
