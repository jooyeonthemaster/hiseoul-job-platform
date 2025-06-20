'use client';
import { useParams } from 'next/navigation';
import Link from 'next/link';

// 커스텀 훅
import { usePortfolioAccess } from './hooks/usePortfolioAccess';
import { usePortfolioData } from './hooks/usePortfolioData';
import { useFavoriteTalent } from './hooks/useFavoriteTalent';

// 컴포넌트
import PortfolioAccessModal from '@/components/PortfolioAccessModal';
import PortfolioHeader from './components/PortfolioHeader';
import PortfolioProfile from './components/PortfolioProfile';
import IntroVideo from './components/PortfolioContent/IntroVideo';
import PortfolioImageGallery from '@/components/PortfolioImageGallery';
import PDFImageViewer from '@/components/PDFImageViewer';
import { DocumentList } from '@/components/DocumentUpload';

// 타입
import { Portfolio } from './types/portfolio.types';

// 유틸리티
import { formatFirebaseDate } from './utils/portfolio.utils';

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

  // 커스텀 훅 사용
  const { hasAccess, accessChecked, showAccessModal, employerStatus } = usePortfolioAccess(portfolioId);
  const { portfolio, loading } = usePortfolioData(portfolioId, hasAccess, accessChecked);
  const { isFavorite, favoriteLoading, handleFavoriteToggle } = useFavoriteTalent(portfolioId);

  // 접근 권한 확인 중일 때 로딩 화면
  if (!accessChecked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">접근 권한을 확인하고 있습니다...</p>
        </div>
      </div>
    );
  }

  // 접근 권한이 없는 경우
  if (!hasAccess) {
    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">🔒</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">접근 권한이 필요합니다</h1>
            <p className="text-gray-600">승인된 기업 회원만 포트폴리오를 열람할 수 있습니다.</p>
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // 포트폴리오가 없는 경우
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

  // 정상적인 포트폴리오 렌더링
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <PortfolioHeader portfolioName={portfolio.name} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <PortfolioProfile 
          portfolio={portfolio}
          isFavorite={isFavorite}
          favoriteLoading={favoriteLoading}
          onFavoriteToggle={handleFavoriteToggle}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <IntroVideo 
              introVideo={portfolio.introVideo} 
              introVideos={portfolio.introVideos}
            />
            
            {/* 상세 자기소개서 */}
            {portfolio.selfIntroduction && (
              <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/20">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">상세 자기소개</h2>
                <div className="space-y-6">
                  {/* 새로운 섹션 기반 구조 우선 표시 */}
                  {portfolio.selfIntroduction.useCustomSections && portfolio.selfIntroduction.sections ? (
                    portfolio.selfIntroduction.sections
                      .sort((a, b) => a.order - b.order)
                      .map((section, index) => {
                        const getColorClasses = (color: string) => {
                          const colorMap: { [key: string]: string } = {
                            blue: 'border-blue-500 bg-blue-50/50',
                            green: 'border-green-500 bg-green-50/50',
                            purple: 'border-purple-500 bg-purple-50/50',
                            orange: 'border-orange-500 bg-orange-50/50',
                            red: 'border-red-500 bg-red-50/50',
                            indigo: 'border-indigo-500 bg-indigo-50/50',
                            pink: 'border-pink-500 bg-pink-50/50',
                            yellow: 'border-yellow-500 bg-yellow-50/50'
                          };
                          return colorMap[color] || 'border-gray-500 bg-gray-50/50';
                        };

                        return (
                          <div key={section.id} className={`border-l-4 ${getColorClasses(section.color || 'blue')} pl-6 py-4 rounded-r-lg`}>
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">{section.title}</h3>
                            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{section.content}</p>
                          </div>
                        );
                      })
                  ) : (
                    /* 기존 구조 (하위 호환성) */
                    <>
                      {portfolio.selfIntroduction.motivation && (
                        <div className="border-l-4 border-blue-500 bg-blue-50/50 pl-6 py-4 rounded-r-lg">
                          <h3 className="text-lg font-semibold text-gray-900 mb-3">지원 동기</h3>
                          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{portfolio.selfIntroduction.motivation}</p>
                        </div>
                      )}
                      {portfolio.selfIntroduction.personality && (
                        <div className="border-l-4 border-green-500 bg-green-50/50 pl-6 py-4 rounded-r-lg">
                          <h3 className="text-lg font-semibold text-gray-900 mb-3">성격 및 장점</h3>
                          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{portfolio.selfIntroduction.personality}</p>
                        </div>
                      )}
                      {portfolio.selfIntroduction.experience && (
                        <div className="border-l-4 border-purple-500 bg-purple-50/50 pl-6 py-4 rounded-r-lg">
                          <h3 className="text-lg font-semibold text-gray-900 mb-3">경험 및 역량</h3>
                          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{portfolio.selfIntroduction.experience}</p>
                        </div>
                      )}
                      {portfolio.selfIntroduction.aspiration && (
                        <div className="border-l-4 border-orange-500 bg-orange-50/50 pl-6 py-4 rounded-r-lg">
                          <h3 className="text-lg font-semibold text-gray-900 mb-3">포부 및 목표</h3>
                          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{portfolio.selfIntroduction.aspiration}</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            {/* 미디어 콘텐츠 */}
            {portfolio.mediaContent && portfolio.mediaContent.length > 0 && (
              <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/20">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">미디어 콘텐츠</h2>
                <div className="space-y-6">
                  {portfolio.mediaContent.map((media, index) => {
                    const getYouTubeId = (url: string) => {
                      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
                      const match = url.match(regExp);
                      return match && match[2].length === 11 ? match[2] : null;
                    };
                    
                    const youtubeId = getYouTubeId(media.url);
                    
                    return (
                      <div key={index} className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0">
                        <div className="flex items-center space-x-3 mb-4">
                          <PlayIcon className="h-5 w-5 text-blue-600" />
                          <h3 className="font-semibold text-gray-900">{media.title}</h3>
                        </div>
                        {media.description && (
                          <p className="text-gray-600 text-sm mb-4">{media.description}</p>
                        )}
                        
                        {youtubeId ? (
                          <div className="relative aspect-video rounded-lg overflow-hidden shadow-lg">
                            <iframe
                              src={`https://www.youtube.com/embed/${youtubeId}`}
                              title={media.title}
                              className="w-full h-full"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          </div>
                        ) : (
                          <div className="relative aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                            <div className="text-center">
                              <PlayIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                              <p className="text-gray-600">영상을 재생할 수 없습니다</p>
                              <a 
                                href={media.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-2 inline-block"
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
            )}






          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* 스킬 */}
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/20">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">전문 스킬</h3>
              <div className="flex flex-wrap gap-2">
                {portfolio.skills.map((skill, index) => (
                  <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                    {typeof skill === 'string' ? skill : String(skill)}
                  </span>
                ))}
              </div>
            </div>

            {/* 사용 가능 언어 */}
            {portfolio.languages && portfolio.languages.length > 0 && (
              <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/20">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">사용 가능 언어</h3>
                <div className="flex flex-wrap gap-2">
                  {portfolio.languages.map((language, index) => (
                    <span key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                      {typeof language === 'string' ? language : String(language)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 경력 사항 */}
            {portfolio.workHistory && portfolio.workHistory.length > 0 && (
              <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/20">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">경력 사항</h3>
                <div className="space-y-4">
                  {portfolio.workHistory.map((work, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <BriefcaseIcon className="h-5 w-5 text-blue-600 mt-0.5" />
                      </div>
                      <div className="flex-grow">
                        <div className="mb-1">
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                            <h4 className="font-medium text-gray-900 break-all overflow-hidden max-w-full" style={{wordBreak: 'break-all', overflowWrap: 'anywhere'}}>{work.company}</h4>
                            <div className="flex items-center gap-x-2 flex-shrink-0">
                              <span className="text-gray-400">•</span>
                              <span className="text-sm text-gray-600">{work.position}</span>
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-gray-500 mb-1">{work.period}</p>
                        <p className="text-sm text-gray-700">{work.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}



            {/* 자격증 */}
            {portfolio.certificates && portfolio.certificates.length > 0 && (
              <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/20">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">자격증</h3>
                <div className="space-y-3">
                  {portfolio.certificates.map((cert, index) => (
                    <div key={index} className="border-l-4 border-blue-500 pl-3">
                      <h4 className="font-medium text-gray-900">{cert.name}</h4>
                      <p className="text-sm text-gray-600">{cert.issuer}</p>
                      <p className="text-sm text-gray-500">{cert.issueDate}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 수상 경력 */}
            {portfolio.awards && portfolio.awards.length > 0 && (
              <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/20">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">수상 경력</h3>
                <div className="space-y-3">
                  {portfolio.awards.map((award, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <TrophyIcon className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-gray-900">{award.title}</h4>
                        <p className="text-sm text-gray-600">{award.organization}</p>
                        <p className="text-sm text-gray-500">{award.date}</p>
                        {award.description && (
                          <p className="text-sm text-gray-700 mt-1">{award.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 학력 */}
            {portfolio.detailedEducation && portfolio.detailedEducation.length > 0 && (
              <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/20">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">학력</h3>
                <div className="space-y-3">
                  {portfolio.detailedEducation.map((edu, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <AcademicCapIcon className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-gray-900">{edu.institution}</h4>
                        <p className="text-sm text-gray-600">{edu.degree} - {edu.field}</p>
                        <p className="text-sm text-gray-500">
                          {edu.startDate} - {edu.endDate || '재학중'}
                        </p>
                        {edu.grade && (
                          <p className="text-sm text-gray-700">학점: {edu.grade}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 포트폴리오 문서 - 전체 너비 */}
        {portfolio.portfolioPdfs && portfolio.portfolioPdfs.length > 0 && (
          <div className="mt-8">
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/20">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">포트폴리오 문서</h2>
                {portfolio.portfolioPdfs && portfolio.portfolioPdfs.length === 1 && (
                  <a
                    href={portfolio.portfolioPdfs?.[0]?.url}
                    download={portfolio.portfolioPdfs?.[0]?.fileName}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                  >
                    <DocumentIcon className="h-5 w-5" />
                    <span>다운로드</span>
                  </a>
                )}
              </div>
              <div className="space-y-8">
                {portfolio.portfolioPdfs.map((pdf, index) => (
                  <div key={index} className="space-y-4">
                    {portfolio.portfolioPdfs && portfolio.portfolioPdfs.length > 1 && (
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-900">{pdf.fileName}</h3>
                        <a
                          href={pdf.url}
                          download={pdf.fileName}
                          className="bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 text-sm"
                        >
                          <DocumentIcon className="h-4 w-4" />
                          <span>다운로드</span>
                        </a>
                      </div>
                    )}
                    <PDFImageViewer pdfUrl={pdf.url} fileName={pdf.fileName} className="w-full" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 추가 문서 - 전체 너비 */}
        {portfolio.additionalDocuments && portfolio.additionalDocuments.length > 0 && (
          <div className="mt-8">
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/20">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <FolderIcon className="h-8 w-8 text-blue-600" />
                  <h2 className="text-2xl font-bold text-gray-900">추가 자료</h2>
                </div>
                <div className="text-sm text-gray-500">
                  {portfolio.additionalDocuments.length}개의 파일
                </div>
              </div>
              <p className="text-gray-600 mb-6">
                구직자가 업로드한 추가 문서 파일들입니다. 클릭하여 다운로드할 수 있습니다.
              </p>
              <DocumentList 
                documents={portfolio.additionalDocuments}
                onRemove={undefined}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}