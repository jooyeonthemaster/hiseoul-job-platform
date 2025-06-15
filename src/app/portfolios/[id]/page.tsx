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
import PDFViewer from '@/components/PDFViewer';

// 타입
import { Portfolio } from './types/portfolio.types';

// 유틸리티
import { formatFirebaseDate } from './utils/portfolio.utils';

// Heroicons
import { 
  BriefcaseIcon,
  CheckBadgeIcon,
  DocumentIcon,
  AcademicCapIcon,
  TrophyIcon,
  PlayIcon
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
            <IntroVideo introVideo={portfolio.introVideo} />
            
            {/* 상세 자기소개서 */}
            {portfolio.selfIntroduction && (
              <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/20">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">상세 자기소개</h2>
                <div className="space-y-6">
                  {portfolio.selfIntroduction.motivation && (
                    <div className="border-l-4 border-blue-500 pl-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">지원 동기</h3>
                      <p className="text-gray-700 leading-relaxed">{portfolio.selfIntroduction.motivation}</p>
                    </div>
                  )}
                  {portfolio.selfIntroduction.personality && (
                    <div className="border-l-4 border-green-500 pl-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">성격 및 장점</h3>
                      <p className="text-gray-700 leading-relaxed">{portfolio.selfIntroduction.personality}</p>
                    </div>
                  )}
                  {portfolio.selfIntroduction.experience && (
                    <div className="border-l-4 border-purple-500 pl-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">경험 및 역량</h3>
                      <p className="text-gray-700 leading-relaxed">{portfolio.selfIntroduction.experience}</p>
                    </div>
                  )}
                  {portfolio.selfIntroduction.aspiration && (
                    <div className="border-l-4 border-orange-500 pl-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">포부 및 목표</h3>
                      <p className="text-gray-700 leading-relaxed">{portfolio.selfIntroduction.aspiration}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 미디어 콘텐츠 */}
            {portfolio.mediaContent && portfolio.mediaContent.length > 0 && (
              <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/20">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">미디어 콘텐츠</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {portfolio.mediaContent.map((media, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <PlayIcon className="h-5 w-5 text-blue-600" />
                        <h3 className="font-semibold text-gray-900">{media.title}</h3>
                      </div>
                      {media.description && (
                        <p className="text-gray-600 text-sm mb-3">{media.description}</p>
                      )}
                      <a 
                        href={media.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        콘텐츠 보기 →
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 포트폴리오 문서 */}
            {portfolio.portfolioPdfs && portfolio.portfolioPdfs.length > 0 && (
              <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/20">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">포트폴리오 문서</h2>
                <div className="space-y-6">
                  {portfolio.portfolioPdfs.map((pdf, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <DocumentIcon className="h-8 w-8 text-red-500" />
                          <div>
                            <h3 className="font-semibold text-gray-900">{pdf.fileName}</h3>
                            <p className="text-sm text-gray-500">
                              업로드: {pdf.uploadedAt ? formatFirebaseDate(pdf.uploadedAt) : '날짜 정보 없음'}
                            </p>
                          </div>
                        </div>
                        <a
                          href={pdf.url}
                          download={pdf.fileName}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          다운로드
                        </a>
                      </div>
                      <PDFViewer pdfUrl={pdf.url} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 프로젝트 상세 */}
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/20">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">프로젝트 상세</h2>
              <div className="space-y-6">
                {portfolio.projectDetails.map((project, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">{project.title}</h3>
                    <p className="text-gray-700 mb-4">{project.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">사용 기술</h4>
                        <div className="flex flex-wrap gap-2">
                          {project.technologies.map((tech, techIndex) => (
                            <span key={techIndex} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                              {typeof tech === 'string' ? tech : String(tech)}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">프로젝트 기간</h4>
                        <p className="text-gray-700">{project.duration}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">주요 성과</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {project.results.map((result, resultIndex) => (
                          <li key={resultIndex} className="text-gray-700">{typeof result === 'string' ? result : String(result)}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 경력 사항 */}
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/20">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">경력 사항</h2>
              <div className="space-y-6">
                {portfolio.workHistory.map((work, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <BriefcaseIcon className="h-6 w-6 text-blue-600 mt-1" />
                    </div>
                    <div className="flex-grow">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900">{work.company}</h3>
                        <span className="text-gray-500">•</span>
                        <span className="text-gray-700">{work.position}</span>
                      </div>
                      <p className="text-gray-600 mb-2">{work.period}</p>
                      <p className="text-gray-700">{work.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
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

            {/* 성과 및 실적 */}
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/20">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">주요 성과</h3>
              <div className="space-y-3">
                {portfolio.achievements.map((achievement, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <CheckBadgeIcon className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 text-sm">{typeof achievement === 'string' ? achievement : String(achievement)}</span>
                  </div>
                ))}
              </div>
            </div>

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
      </div>
    </div>
  );
}