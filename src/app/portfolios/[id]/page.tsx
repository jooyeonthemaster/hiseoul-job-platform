'use client';
import { useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

// 커스텀 훅
import { usePortfolioAccess } from './hooks/usePortfolioAccess';
import { usePortfolioData } from './hooks/usePortfolioData';

// 컴포넌트
import PortfolioAccessModal from '@/components/PortfolioAccessModal';
import PortfolioHeader from './components/PortfolioHeader';
import PortfolioProfile from './components/PortfolioProfile';
import IntroVideo from './components/PortfolioContent/IntroVideo';
import SelfIntroduction from './components/PortfolioContent/SelfIntroduction';
import ExternalPortfolioLinks from './components/PortfolioContent/ExternalPortfolioLinks';
import PDFImageViewer from '@/components/PDFImageViewer';
import { DocumentList } from '@/components/DocumentUpload';

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
  FolderIcon
} from '@heroicons/react/24/outline';

export default function PortfolioDetailPage() {
  const params = useParams();
  const portfolioId = params?.id as string;
  const { userData } = useAuth();

  // 커스텀 훅 사용
  const { hasAccess, accessChecked, showAccessModal, employerStatus } = usePortfolioAccess(portfolioId);
  const { portfolio, loading } = usePortfolioData(portfolioId, hasAccess, accessChecked);

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
  const canViewContact =
    hasAdminAccess ||
    userData?.role === 'jobseeker' ||
    (userData?.role === 'employer' && portfolio.contactInfoVisibleToEmployers === true);

  // 정상적인 포트폴리오 렌더링
  return (
    <div className="relative min-h-screen overflow-hidden bg-azure-mist">
      <AuroraBackground />

      <div className="relative z-10">
        <PortfolioHeader portfolioName={portfolio.name} />

        <div className="mx-auto w-full max-w-[1680px] px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-12 md:py-16 lg:py-20">
          <ScrollReveal>
            <PortfolioProfile portfolio={portfolio} canViewContact={canViewContact} />
          </ScrollReveal>

          {portfolio.selfIntroduction && (
            <ScrollReveal className="mt-6 xl:mt-8">
              <SelfIntroduction selfIntroduction={portfolio.selfIntroduction} />
            </ScrollReveal>
          )}

          {portfolio.externalLinks && portfolio.externalLinks.length > 0 && (
            <ScrollReveal className="mt-6 xl:mt-8">
              <ExternalPortfolioLinks links={portfolio.externalLinks} />
            </ScrollReveal>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 xl:gap-8 mt-6 xl:mt-8">
            {/* Main Content */}
            <div className="lg:col-span-8 xl:col-span-9 flex h-full flex-col gap-8">
              {hasIntroVideo && (
                <ScrollReveal className="lg:flex-1 lg:min-h-0">
                  <IntroVideo
                    introVideo={portfolio.introVideo}
                    introVideos={portfolio.introVideos}
                  />
                </ScrollReveal>
              )}

              {/* 미디어 콘텐츠 */}
              {portfolio.mediaContent && portfolio.mediaContent.length > 0 && (
                <ScrollReveal>
                  <div className="glass-card p-8 md:p-10">
                    <div className="flex items-center gap-3 mb-7">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-azure-400 to-azure-600 text-white shadow-glow">
                        <PlayIcon className="h-6 w-6" />
                      </div>
                      <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-ink-900">미디어 콘텐츠</h2>
                    </div>
                    <div className="space-y-6">
                      {portfolio.mediaContent.map((media, index) => {
                        const getYouTubeId = (url: string) => {
                          const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
                          const match = url.match(regExp);
                          return match && match[2].length === 11 ? match[2] : null;
                        };

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
                              <div className="relative aspect-video rounded-2xl overflow-hidden shadow-glass">
                                <iframe
                                  src={`https://www.youtube.com/embed/${youtubeId}`}
                                  title={media.title}
                                  className="w-full h-full"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                />
                              </div>
                            ) : (
                              <div className="relative aspect-video glass rounded-2xl flex items-center justify-center">
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
                  </div>
                </ScrollReveal>
              )}




            </div>

            {/* Sidebar */}
            <div className="lg:col-span-4 xl:col-span-3 space-y-6">
              {/* 스킬 */}
              <ScrollReveal>
                <div className="glass-card p-6 md:p-7">
                  <h3 className="text-lg font-semibold text-ink-900 mb-4">전문 스킬</h3>
                  <div className="flex flex-wrap gap-2">
                    {portfolio.skills.map((skill, index) => (
                      <Badge key={index} tone="azure" className="text-sm">
                        {typeof skill === 'string' ? skill : String(skill)}
                      </Badge>
                    ))}
                  </div>
                </div>
              </ScrollReveal>

              {/* 사용 가능 언어 */}
              {portfolio.languages && portfolio.languages.length > 0 && (
                <ScrollReveal>
                  <div className="glass-card p-6 md:p-7">
                    <h3 className="text-lg font-semibold text-ink-900 mb-4">사용 가능 언어</h3>
                    <div className="flex flex-wrap gap-2">
                      {portfolio.languages.map((language, index) => (
                        <Badge key={index} tone="mint" className="text-sm">
                          {typeof language === 'string' ? language : String(language)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </ScrollReveal>
              )}

              {/* 경력 사항 */}
              {portfolio.workHistory && portfolio.workHistory.length > 0 && (
                <ScrollReveal>
                  <div className="glass-card p-6 md:p-7">
                    <h3 className="text-lg font-semibold text-ink-900 mb-4">경력 사항</h3>
                    <div className="space-y-4">
                      {portfolio.workHistory.map((work, index) => (
                        <div key={index} className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-azure-50 border border-azure-100 text-azure-600">
                              <BriefcaseIcon className="h-5 w-5" />
                            </span>
                          </div>
                          <div className="flex-grow">
                            <div className="mb-1">
                              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                <h4 className="font-medium text-ink-900 break-all overflow-hidden max-w-full" style={{wordBreak: 'break-all', overflowWrap: 'anywhere'}}>{work.company}</h4>
                                <div className="flex items-center gap-x-2 flex-shrink-0">
                                  <span className="text-ink-300">•</span>
                                  <span className="text-sm text-ink-500">{work.position}</span>
                                </div>
                              </div>
                            </div>
                            <p className="text-sm text-ink-400 mb-1">{work.period}</p>
                            <p className="text-sm text-ink-600">{work.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </ScrollReveal>
              )}



              {/* 자격증 */}
              {portfolio.certificates && portfolio.certificates.length > 0 && (
                <ScrollReveal>
                  <div className="glass-card p-6 md:p-7">
                    <h3 className="text-lg font-semibold text-ink-900 mb-4">자격증</h3>
                    <div className="space-y-3">
                      {portfolio.certificates.map((cert, index) => (
                        <div key={index} className="border-l-4 border-azure-400 pl-3">
                          <h4 className="font-medium text-ink-900">{cert.name}</h4>
                          <p className="text-sm text-ink-500">{cert.issuer}</p>
                          <p className="text-sm text-ink-400">{cert.issueDate}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </ScrollReveal>
              )}

              {/* 수상 경력 */}
              {portfolio.awards && portfolio.awards.length > 0 && (
                <ScrollReveal>
                  <div className="glass-card p-6 md:p-7">
                    <h3 className="text-lg font-semibold text-ink-900 mb-4">수상 경력</h3>
                    <div className="space-y-3">
                      {portfolio.awards.map((award, index) => (
                        <div key={index} className="flex items-start space-x-2">
                          <TrophyIcon className="h-5 w-5 text-honey-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="font-medium text-ink-900">{award.title}</h4>
                            <p className="text-sm text-ink-500">{award.organization}</p>
                            <p className="text-sm text-ink-400">{award.date}</p>
                            {award.description && (
                              <p className="text-sm text-ink-600 mt-1">{award.description}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </ScrollReveal>
              )}

              {/* 학력 */}
              {portfolio.detailedEducation && portfolio.detailedEducation.length > 0 && (
                <ScrollReveal>
                  <div className="glass-card p-6 md:p-7">
                    <h3 className="text-lg font-semibold text-ink-900 mb-4">학력</h3>
                    <div className="space-y-3">
                      {portfolio.detailedEducation.map((edu, index) => (
                        <div key={index} className="flex items-start space-x-2">
                          <AcademicCapIcon className="h-5 w-5 text-azure-600 mt-0.5 flex-shrink-0" />
                          <div>
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
                  </div>
                </ScrollReveal>
              )}
            </div>
          </div>

          {/* 포트폴리오 문서 - 전체 너비 */}
          {portfolio.portfolioPdfs && portfolio.portfolioPdfs.length > 0 && (
            <ScrollReveal className="mt-8">
              <div className="glass-card p-4 md:p-5">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-azure-400 to-azure-600 text-white shadow-glow">
                      <DocumentIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="font-display text-xl md:text-2xl font-bold tracking-tight text-ink-900">포트폴리오 문서</h2>
                      <p className="mt-1 text-sm font-semibold text-ink-400">{portfolio.portfolioPdfs.length}개 문서</p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-8">
                  {portfolio.portfolioPdfs.map((pdf, index) => (
                    <div key={index} className="min-w-0">
                      <PDFImageViewer pdfUrl={pdf.url} fileName={pdf.fileName} className="w-full" large />
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          )}

          {/* 추가 문서 - 전체 너비 */}
          {portfolio.additionalDocuments && portfolio.additionalDocuments.length > 0 && (
            <ScrollReveal className="mt-8">
              <div className="glass-card p-8 md:p-10">
                <div className="flex items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-azure-400 to-azure-600 text-white shadow-glow">
                      <FolderIcon className="h-6 w-6" />
                    </div>
                    <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-ink-900">추가 자료</h2>
                  </div>
                  <div className="text-sm text-ink-400">
                    {portfolio.additionalDocuments.length}개의 파일
                  </div>
                </div>
                <p className="text-ink-500 mb-6 leading-relaxed">
                  구직자가 업로드한 추가 문서 파일들입니다. 클릭하여 다운로드할 수 있습니다.
                </p>
                <DocumentList
                  documents={portfolio.additionalDocuments}
                  onRemove={undefined}
                />
              </div>
            </ScrollReveal>
          )}
        </div>
      </div>
    </div>
  );
}
