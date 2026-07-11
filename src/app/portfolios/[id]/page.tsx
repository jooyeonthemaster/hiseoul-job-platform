'use client';
import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  getProgramForPortfolio,
  isEmployerProgramRestricted,
  type PortfolioProgram,
} from '@/lib/programs';
import { getAllPrograms } from '@/lib/customPrograms';

// 커스텀 훅
import { usePortfolioAccess } from './hooks/usePortfolioAccess';
import { usePortfolioData } from './hooks/usePortfolioData';

// 컴포넌트
import PortfolioAccessModal from '@/components/PortfolioAccessModal';
import PortfolioHeader from './components/PortfolioHeader';
import PortfolioProfile from './components/PortfolioProfile';
import IntroVideo from './components/PortfolioContent/IntroVideo';
import PortfolioVideos from './components/PortfolioContent/PortfolioVideos';
import SelfIntroduction from './components/PortfolioContent/SelfIntroduction';
import ExternalPortfolioLinks from './components/PortfolioContent/ExternalPortfolioLinks';
import PDFImageViewer from '@/components/PDFImageViewer';
import { DocumentList } from '@/components/DocumentUpload';
import { getYouTubeId } from '@/lib/youtube';

// UI 프리미티브
import { GlassButton } from '@/components/ui/GlassButton';
import { Badge } from '@/components/ui/Badge';
import { AuroraBackground } from '@/components/ui/AuroraBackground';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

// Heroicons
import {
  BriefcaseIcon,
  DocumentIcon,
  AcademicCapIcon,
  TrophyIcon,
  PlayIcon,
  FolderIcon,
  FilmIcon,
  SparklesIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/outline';
import type { ElementType, ReactNode } from 'react';

// 단일 컬럼 섹션의 공통 카드 헤더 — 아이콘·제목·개수 배지를 모든 섹션에서 동일한 리듬으로 정렬한다.
function SectionCard({
  icon: Icon,
  title,
  count,
  children,
}: {
  icon: ElementType;
  title: string;
  count?: string | number;
  children: ReactNode;
}) {
  return (
    <div className="glass-card p-6 md:p-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-azure-400 to-azure-600 text-white shadow-glow">
            <Icon className="h-6 w-6" />
          </div>
          <h2 className="truncate font-display text-xl md:text-2xl font-bold tracking-tight text-ink-900">
            {title}
          </h2>
        </div>
        {count != null && (
          <span className="flex-shrink-0 rounded-full border border-azure-100 bg-azure-50 px-3 py-1 text-sm font-semibold text-azure-700">
            {count}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

export default function PortfolioDetailPage() {
  const params = useParams();
  const portfolioId = params?.id as string;
  const searchParams = useSearchParams();
  // 목록에서 넘어올 때 실제로 보던 과정 id 를 ?from= 으로 전달받는다 (뒤로가기 목적지 정확도↑)
  const fromProgramId = searchParams?.get('from') ?? null;
  const { userData } = useAuth();

  // 커스텀 훅 사용
  const { hasAccess, accessChecked, showAccessModal, employerStatus } = usePortfolioAccess(portfolioId);
  const { portfolio, loading } = usePortfolioData(portfolioId, hasAccess, accessChecked);

  // 과정 열람 권한 판정에는 커스텀 과정(2025 아카이브 등)까지 병합된 목록이 필요하다
  const [allPrograms, setAllPrograms] = useState<PortfolioProgram[] | null>(null);
  useEffect(() => {
    getAllPrograms().then(setAllPrograms);
  }, []);

  // 접근 권한 확인 중일 때 로딩 화면
  if (!accessChecked) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-azure-mist flex items-center justify-center">
        <AuroraBackground />
        <div className="relative z-10 glass-card px-10 py-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-azure-200 border-t-azure-500 mx-auto mb-5" />
          <p className="text-ink-500">접근 권한을 확인하고 있습니다...</p>
        </div>
      </div>
    );
  }

  // 접근 권한이 없는 경우
  if (!hasAccess) {
    return (
      <>
        <div className="relative min-h-screen overflow-hidden bg-azure-mist flex items-center justify-center px-5">
          <AuroraBackground />
          <div className="relative z-10 glass-card max-w-md w-full px-10 py-14 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-azure-50 border border-azure-100 text-5xl shadow-glass-sm">
              🔒
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-ink-900 mb-3">접근 권한이 필요합니다</h1>
            <p className="text-ink-500 leading-relaxed">승인된 기업 회원만 포트폴리오를 열람할 수 있습니다.</p>
          </div>
        </div>
        <PortfolioAccessModal
          isOpen={showAccessModal}
          onClose={() => {}}
          userRole={employerStatus?.role}
          approvalStatus={employerStatus?.approvalStatus}
        />
      </>
    );
  }

  // 로딩 중
  if (loading) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-azure-mist flex items-center justify-center">
        <AuroraBackground />
        <div className="relative z-10 animate-spin rounded-full h-12 w-12 border-2 border-azure-200 border-t-azure-500" />
      </div>
    );
  }

  // 포트폴리오가 없는 경우
  if (!portfolio) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-azure-mist flex items-center justify-center px-5">
        <AuroraBackground />
        <div className="relative z-10 glass-card max-w-md w-full px-10 py-14 text-center">
          <h1 className="font-display text-2xl font-bold tracking-tight text-ink-900 mb-6">포트폴리오를 찾을 수 없습니다</h1>
          <GlassButton href="/portfolios" variant="secondary">
            포트폴리오 목록으로 돌아가기
          </GlassButton>
        </div>
      </div>
    );
  }

  const hasIntroVideo = Boolean(portfolio.introVideo || portfolio.introVideos?.length);
  const hasAdminAccess = userData?.role === 'admin' || userData?.isAdmin === true;

  // ── 기업별 과정 열람 권한 게이트 ──
  //  관리자가 employers.allowedProgramIds 로 제한한 기업은 허용된 과정의 교육생만 열람 가능.
  //  과정을 알 수 없는 포트폴리오는 개인정보 보호 원칙에 따라 보수적으로 차단한다.
  const isRestrictedEmployer =
    userData?.role === 'employer' && !hasAdminAccess && isEmployerProgramRestricted(employerStatus);
  if (isRestrictedEmployer) {
    if (allPrograms === null) {
      return (
        <div className="relative min-h-screen overflow-hidden bg-azure-mist flex items-center justify-center">
          <AuroraBackground />
          <div className="relative z-10 animate-spin rounded-full h-12 w-12 border-2 border-azure-200 border-t-azure-500" />
        </div>
      );
    }

    const allowedIds = ((employerStatus as any).allowedProgramIds as unknown[]).filter(
      (id): id is string => typeof id === 'string',
    );
    const portfolioProgram = getProgramForPortfolio(portfolio, allPrograms);
    const programAllowed = Boolean(portfolioProgram && allowedIds.includes(portfolioProgram.id));

    if (!programAllowed) {
      return (
        <div className="relative min-h-screen overflow-hidden bg-azure-mist flex items-center justify-center px-5">
          <AuroraBackground />
          <div className="relative z-10 glass-card max-w-md w-full px-10 py-14 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-azure-50 border border-azure-100 text-5xl shadow-glass-sm">
              🔒
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-ink-900 mb-3">
              열람 권한이 없는 과정입니다
            </h1>
            <p className="text-ink-500 leading-relaxed mb-8">
              교육생 개인정보 보호를 위해 관리자가 허용한 과정의 포트폴리오만 열람할 수 있습니다.
            </p>
            <GlassButton href="/portfolios" variant="secondary">
              포트폴리오 목록으로 돌아가기
            </GlassButton>
          </div>
        </div>
      );
    }
  }

  // 구직자 연락처(집주소·이메일·전화)는 개인정보. 관리자·본인(구직자)만 기본 노출하고,
  // 기업 회원에게는 관리자가 '그 기업'에 연락처 열람 권한(canViewApplicantContacts)을 부여한 경우에만 노출한다.
  const canViewContact =
    hasAdminAccess ||
    userData?.role === 'jobseeker' ||
    (userData?.role === 'employer' && (employerStatus as any)?.canViewApplicantContacts === true);

  const hasSkills = portfolio.skills && portfolio.skills.length > 0;
  const hasLanguages = portfolio.languages && portfolio.languages.length > 0;

  // '포트폴리오 목록' 뒤로가기 목적지 — 이 교육생이 속한 과정의 '교육생 목록' 단계로 되돌린다.
  //  (기존에는 무조건 /portfolios 로 이동해 과정 선택 화면으로 튕기던 문제를 수정)
  //  실제로 보던 과정(?from=)을 최우선으로 사용하고, 없으면 포트폴리오의 과정에서 추론한다.
  const inferredProgram = allPrograms ? getProgramForPortfolio(portfolio, allPrograms) : null;
  const listBackProgramId = fromProgramId || inferredProgram?.id || null;
  const listBackHref = listBackProgramId
    ? `/portfolios?program=${encodeURIComponent(listBackProgramId)}&view=talents`
    : '/portfolios';

  // 정상적인 포트폴리오 렌더링 — 시선 분산을 줄이기 위해 단일 세로 컬럼으로 정렬.
  // overflow-hidden 은 sticky 헤더를 무력화하므로 x축 clip 만 적용
  return (
    <div className="relative min-h-screen overflow-x-clip bg-azure-mist">
      <AuroraBackground />

      <div className="relative z-10">
        <PortfolioHeader
          portfolioName={portfolio.name}
          portfolioId={portfolioId}
          canApply={userData?.role === 'employer'}
          backHref={listBackHref}
        />

        {/* 단일 컬럼이되 좌우 여백을 넉넉히 활용 — 모든 섹션을 위→아래 한 줄씩 정렬 */}
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-12 sm:px-6 md:gap-8 md:py-16 lg:px-8 xl:px-10">
          {/* 1. 프로필 */}
          <ScrollReveal>
            <PortfolioProfile portfolio={portfolio} canViewContact={canViewContact} />
          </ScrollReveal>

          {/* 2. 자기소개 영상 */}
          {hasIntroVideo && (
            <ScrollReveal>
              <IntroVideo
                introVideo={portfolio.introVideo}
                introVideos={portfolio.introVideos}
              />
            </ScrollReveal>
          )}

          {/* 2-2. 포트폴리오 및 기타영상 — 자기소개 영상 바로 아래에 배치(두 영상 섹션을 상단에 묶어 노출) */}
          {portfolio.portfolioVideos && portfolio.portfolioVideos.length > 0 && (
            <ScrollReveal>
              <PortfolioVideos videos={portfolio.portfolioVideos} />
            </ScrollReveal>
          )}

          {/* 3. 미디어 콘텐츠 */}
          {portfolio.mediaContent && portfolio.mediaContent.length > 0 && (
            <ScrollReveal>
              <SectionCard icon={FilmIcon} title="미디어 콘텐츠" count={`${portfolio.mediaContent.length}개`}>
                <div className="space-y-6">
                  {portfolio.mediaContent.map((media, index) => {
                    const youtubeId = getYouTubeId(media.url);

                    return (
                      <div key={index} className="border-b border-ink-100 pb-6 last:border-b-0 last:pb-0">
                        <div className="flex items-center space-x-3 mb-4">
                          <PlayIcon className="h-5 w-5 text-azure-600" />
                          <h3 className="font-semibold text-ink-900">{media.title}</h3>
                        </div>
                        {media.description && (
                          <p className="text-ink-500 text-sm mb-4">{media.description}</p>
                        )}

                        {youtubeId ? (
                          <div className="relative aspect-video overflow-hidden rounded-2xl shadow-glass">
                            <iframe
                              src={`https://www.youtube.com/embed/${youtubeId}`}
                              title={media.title}
                              className="absolute inset-0 h-full w-full"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          </div>
                        ) : (
                          <div className="relative flex aspect-video items-center justify-center rounded-2xl glass">
                            <div className="text-center">
                              <PlayIcon className="h-16 w-16 text-azure-300 mx-auto mb-4" />
                              <p className="text-ink-500">영상을 재생할 수 없습니다</p>
                              <a
                                href={media.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-azure-600 hover:text-azure-700 text-sm font-medium mt-2 inline-block"
                              >
                                원본 링크로 보기 →
                              </a>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </SectionCard>
            </ScrollReveal>
          )}

          {/* 4. 전문 스킬 · 사용 가능 언어 (통합) */}
          {(hasSkills || hasLanguages) && (
            <ScrollReveal>
              <SectionCard
                icon={SparklesIcon}
                title={hasSkills && hasLanguages ? '전문 스킬 · 언어' : hasSkills ? '전문 스킬' : '사용 가능 언어'}
              >
                <div className="space-y-6">
                  {hasSkills && (
                    <div>
                      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-400">전문 스킬</h3>
                      <div className="flex flex-wrap gap-2">
                        {portfolio.skills.map((skill, index) => (
                          <Badge key={index} tone="azure" className="text-sm">
                            {typeof skill === 'string' ? skill : String(skill)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {hasLanguages && (
                    <div className={hasSkills ? 'border-t border-ink-100 pt-6' : ''}>
                      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-400">사용 가능 언어</h3>
                      <div className="flex flex-wrap gap-2">
                        {portfolio.languages.map((language, index) => (
                          <Badge key={index} tone="mint" className="text-sm">
                            {typeof language === 'string' ? language : String(language)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </SectionCard>
            </ScrollReveal>
          )}

          {/* 5. 학력 */}
          {portfolio.detailedEducation && portfolio.detailedEducation.length > 0 && (
            <ScrollReveal>
              <SectionCard icon={AcademicCapIcon} title="학력">
                <div className="space-y-4">
                  {portfolio.detailedEducation.map((edu, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <AcademicCapIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-azure-600" />
                      <div className="min-w-0">
                        <h4 className="font-medium text-ink-900">{edu.institution}</h4>
                        <p className="text-sm text-ink-500">{edu.degree} - {edu.field}</p>
                        <p className="text-sm text-ink-400">
                          {edu.startDate} - {edu.endDate || '재학중'}
                        </p>
                        {edu.grade && (
                          <p className="text-sm text-ink-600">학점: {edu.grade}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>
            </ScrollReveal>
          )}

          {/* 6. 경력 사항 */}
          {portfolio.workHistory && portfolio.workHistory.length > 0 && (
            <ScrollReveal>
              <SectionCard icon={BriefcaseIcon} title="경력 사항">
                <div className="space-y-5">
                  {portfolio.workHistory.map((work, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-azure-100 bg-azure-50 text-azure-600">
                        <BriefcaseIcon className="h-5 w-5" />
                      </span>
                      <div className="min-w-0 flex-grow">
                        <div className="mb-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                          <h4 className="font-medium text-ink-900" style={{ wordBreak: 'break-all', overflowWrap: 'anywhere' }}>{work.company}</h4>
                          <div className="flex items-center gap-x-2">
                            <span className="text-ink-300">•</span>
                            <span className="text-sm text-ink-500">{work.position}</span>
                          </div>
                        </div>
                        <p className="mb-1 text-sm text-ink-400">{work.period}</p>
                        <p className="text-sm text-ink-600">{work.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>
            </ScrollReveal>
          )}

          {/* 7. 자격증 */}
          {portfolio.certificates && portfolio.certificates.length > 0 && (
            <ScrollReveal>
              <SectionCard icon={CheckBadgeIcon} title="자격증">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {portfolio.certificates.map((cert, index) => (
                    <div key={index} className="rounded-2xl border-l-4 border-azure-400 bg-azure-50/50 py-3 pl-4 pr-3">
                      <h4 className="font-medium text-ink-900">{cert.name}</h4>
                      <p className="text-sm text-ink-500">{cert.issuer}</p>
                      <p className="text-sm text-ink-400">{cert.issueDate}</p>
                    </div>
                  ))}
                </div>
              </SectionCard>
            </ScrollReveal>
          )}

          {/* 8. 수상 경력 */}
          {portfolio.awards && portfolio.awards.length > 0 && (
            <ScrollReveal>
              <SectionCard icon={TrophyIcon} title="수상 경력">
                <div className="space-y-4">
                  {portfolio.awards.map((award, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <TrophyIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-honey-500" />
                      <div className="min-w-0">
                        <h4 className="font-medium text-ink-900">{award.title}</h4>
                        <p className="text-sm text-ink-500">{award.organization}</p>
                        <p className="text-sm text-ink-400">{award.date}</p>
                        {award.description && (
                          <p className="mt-1 text-sm text-ink-600">{award.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>
            </ScrollReveal>
          )}

          {/* 9. 상세 자기소개 (자기소개서) */}
          {portfolio.selfIntroduction && (
            <ScrollReveal>
              <SelfIntroduction selfIntroduction={portfolio.selfIntroduction} />
            </ScrollReveal>
          )}

          {/* 10. 웹 작업물 (외부 포트폴리오 링크) */}
          {portfolio.externalLinks && portfolio.externalLinks.length > 0 && (
            <ScrollReveal>
              <ExternalPortfolioLinks links={portfolio.externalLinks} />
            </ScrollReveal>
          )}

          {/* 11. 포트폴리오 문서 */}
          {portfolio.portfolioPdfs && portfolio.portfolioPdfs.length > 0 && (
            <ScrollReveal>
              <SectionCard icon={DocumentIcon} title="포트폴리오 문서" count={`${portfolio.portfolioPdfs.length}개 문서`}>
                <div className="grid grid-cols-1 gap-8">
                  {portfolio.portfolioPdfs.map((pdf, index) => (
                    <div key={index} className="min-w-0">
                      <PDFImageViewer pdfUrl={pdf.url} fileName={pdf.fileName} className="w-full" large />
                    </div>
                  ))}
                </div>
              </SectionCard>
            </ScrollReveal>
          )}

          {/* 12. 추가 자료 */}
          {portfolio.additionalDocuments && portfolio.additionalDocuments.length > 0 && (
            <ScrollReveal>
              <SectionCard icon={FolderIcon} title="추가 자료" count={`${portfolio.additionalDocuments.length}개 파일`}>
                <p className="mb-6 leading-relaxed text-ink-500">
                  구직자가 업로드한 추가 문서 파일들입니다. 클릭하여 다운로드할 수 있습니다.
                </p>
                <DocumentList
                  documents={portfolio.additionalDocuments}
                  onRemove={undefined}
                />
              </SectionCard>
            </ScrollReveal>
          )}
        </div>
      </div>
    </div>
  );
}
