'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  BriefcaseIcon,
  MapPinIcon,
  ClockIcon,
  CurrencyDollarIcon,
  BuildingOfficeIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  TagIcon,
  CalendarIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { JobPosting } from '@/types';

export default function JobsPage() {
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const [crawledCount, setCrawledCount] = useState(0);
  const [sampleCount, setSampleCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setError(null);
        const response = await fetch('/api/jobs?includeCrawled=true&limit=100');
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setJobs(data.data.jobs || []);
            setCrawledCount(data.data.crawledCount || 0);
            setSampleCount(data.data.sampleCount || 0);
            console.log(`총 ${data.data.jobs.length}개 채용공고 로드 (샘플: ${data.data.sampleCount}, 크롤링: ${data.data.crawledCount})`);
          } else {
            setError(data.message || '채용공고를 불러오는데 실패했습니다.');
          }
        } else {
          setError('채용공고를 불러오는데 실패했습니다.');
        }
      } catch (error) {
        console.error('API 호출 오류:', error);
        setError('네트워크 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // 크롤링 데이터 새로고침 함수
  const refreshCrawledData = async () => {
    setLoading(true);
    try {
      setError(null);
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'refresh-crawled-data' })
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // 데이터 새로고침
          const refreshResponse = await fetch('/api/jobs?includeCrawled=true&limit=100');
          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            if (refreshData.success) {
              setJobs(refreshData.data.jobs || []);
              setCrawledCount(refreshData.data.crawledCount || 0);
              setSampleCount(refreshData.data.sampleCount || 0);
            }
          }
        }
      }
    } catch (error) {
      console.error('크롤링 새로고침 오류:', error);
      setError('크롤링 새로고침 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 필터링된 채용공고
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || job.jobCategory === selectedCategory;
    const matchesLocation = selectedLocation === 'all' || job.location.includes(selectedLocation);
    
    return matchesSearch && matchesCategory && matchesLocation;
  });

  // 카테고리 목록 추출
  const categories = Array.from(new Set(jobs.map(job => job.jobCategory)));
  
  // 지역 목록 추출 (간단하게 처리)
  const locations = Array.from(new Set(jobs.map(job => {
    const parts = job.location.split(' ');
    return parts[0]; // 첫 번째 단어만 (서울특별시, 경기도 등)
  })));

  const getWorkTypeLabel = (workType: string) => {
    const labels: { [key: string]: string } = {
      'fulltime': '정규직',
      'parttime': '계약직',
      'contract': '파트타임',
      'intern': '인턴'
    };
    return labels[workType] || workType;
  };

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return '상시모집';
    
    // 문자열인 경우 Date 객체로 변환
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // 유효한 날짜인지 확인
    if (isNaN(dateObj.getTime())) return '상시모집';
    
    return dateObj.toLocaleDateString('ko-KR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // 확장된 카테고리별 색상 테마 (Gemini 분석 카테고리 포함)
  const getCategoryTheme = (category: string) => {
    const themes: { [key: string]: { bg: string, border: string, badge: string, badgeText: string, button: string } } = {
      // 기존 카테고리
      '개발': {
        bg: 'bg-blue-50',
        border: 'border-blue-200 hover:border-blue-300',
        badge: 'bg-blue-100 text-blue-800',
        badgeText: 'text-blue-600',
        button: 'bg-blue-600 hover:bg-blue-700'
      },
      '디자인': {
        bg: 'bg-purple-50',
        border: 'border-purple-200 hover:border-purple-300',
        badge: 'bg-purple-100 text-purple-800',
        badgeText: 'text-purple-600',
        button: 'bg-purple-600 hover:bg-purple-700'
      },
      '데이터': {
        bg: 'bg-green-50',
        border: 'border-green-200 hover:border-green-300',
        badge: 'bg-green-100 text-green-800',
        badgeText: 'text-green-600',
        button: 'bg-green-600 hover:bg-green-700'
      },
      '마케팅': {
        bg: 'bg-orange-50',
        border: 'border-orange-200 hover:border-orange-300',
        badge: 'bg-orange-100 text-orange-800',
        badgeText: 'text-orange-600',
        button: 'bg-orange-600 hover:bg-orange-700'
      },
      '영업': {
        bg: 'bg-red-50',
        border: 'border-red-200 hover:border-red-300',
        badge: 'bg-red-100 text-red-800',
        badgeText: 'text-red-600',
        button: 'bg-red-600 hover:bg-red-700'
      },
      '기획': {
        bg: 'bg-indigo-50',
        border: 'border-indigo-200 hover:border-indigo-300',
        badge: 'bg-indigo-100 text-indigo-800',
        badgeText: 'text-indigo-600',
        button: 'bg-indigo-600 hover:bg-indigo-700'
      },
      
      // 새로운 Gemini 카테고리들
      '프론트엔드 개발': {
        bg: 'bg-cyan-50',
        border: 'border-cyan-200 hover:border-cyan-300',
        badge: 'bg-cyan-100 text-cyan-800',
        badgeText: 'text-cyan-600',
        button: 'bg-cyan-600 hover:bg-cyan-700'
      },
      '백엔드 개발': {
        bg: 'bg-blue-50',
        border: 'border-blue-200 hover:border-blue-300',
        badge: 'bg-blue-100 text-blue-800',
        badgeText: 'text-blue-600',
        button: 'bg-blue-600 hover:bg-blue-700'
      },
      '모바일 개발': {
        bg: 'bg-teal-50',
        border: 'border-teal-200 hover:border-teal-300',
        badge: 'bg-teal-100 text-teal-800',
        badgeText: 'text-teal-600',
        button: 'bg-teal-600 hover:bg-teal-700'
      },
      '데브옵스': {
        bg: 'bg-emerald-50',
        border: 'border-emerald-200 hover:border-emerald-300',
        badge: 'bg-emerald-100 text-emerald-800',
        badgeText: 'text-emerald-600',
        button: 'bg-emerald-600 hover:bg-emerald-700'
      },
      'QA/테스트': {
        bg: 'bg-lime-50',
        border: 'border-lime-200 hover:border-lime-300',
        badge: 'bg-lime-100 text-lime-800',
        badgeText: 'text-lime-600',
        button: 'bg-lime-600 hover:bg-lime-700'
      },
      'UI/UX 디자인': {
        bg: 'bg-purple-50',
        border: 'border-purple-200 hover:border-purple-300',
        badge: 'bg-purple-100 text-purple-800',
        badgeText: 'text-purple-600',
        button: 'bg-purple-600 hover:bg-purple-700'
      },
      '그래픽 디자인': {
        bg: 'bg-pink-50',
        border: 'border-pink-200 hover:border-pink-300',
        badge: 'bg-pink-100 text-pink-800',
        badgeText: 'text-pink-600',
        button: 'bg-pink-600 hover:bg-pink-700'
      },
      '서비스 기획': {
        bg: 'bg-indigo-50',
        border: 'border-indigo-200 hover:border-indigo-300',
        badge: 'bg-indigo-100 text-indigo-800',
        badgeText: 'text-indigo-600',
        button: 'bg-indigo-600 hover:bg-indigo-700'
      },
      '경영지원': {
        bg: 'bg-amber-50',
        border: 'border-amber-200 hover:border-amber-300',
        badge: 'bg-amber-100 text-amber-800',
        badgeText: 'text-amber-600',
        button: 'bg-amber-600 hover:bg-amber-700'
      },
      '고객서비스': {
        bg: 'bg-orange-50',
        border: 'border-orange-200 hover:border-orange-300',
        badge: 'bg-orange-100 text-orange-800',
        badgeText: 'text-orange-600',
        button: 'bg-orange-600 hover:bg-orange-700'
      },
      '금융': {
        bg: 'bg-yellow-50',
        border: 'border-yellow-200 hover:border-yellow-300',
        badge: 'bg-yellow-100 text-yellow-800',
        badgeText: 'text-yellow-600',
        button: 'bg-yellow-600 hover:bg-yellow-700'
      },
      '의료': {
        bg: 'bg-red-50',
        border: 'border-red-200 hover:border-red-300',
        badge: 'bg-red-100 text-red-800',
        badgeText: 'text-red-600',
        button: 'bg-red-600 hover:bg-red-700'
      },
      '교육': {
        bg: 'bg-violet-50',
        border: 'border-violet-200 hover:border-violet-300',
        badge: 'bg-violet-100 text-violet-800',
        badgeText: 'text-violet-600',
        button: 'bg-violet-600 hover:bg-violet-700'
      },
      '법무': {
        bg: 'bg-stone-50',
        border: 'border-stone-200 hover:border-stone-300',
        badge: 'bg-stone-100 text-stone-800',
        badgeText: 'text-stone-600',
        button: 'bg-stone-600 hover:bg-stone-700'
      },
      '제조/생산': {
        bg: 'bg-gray-50',
        border: 'border-gray-200 hover:border-gray-300',
        badge: 'bg-gray-100 text-gray-800',
        badgeText: 'text-gray-600',
        button: 'bg-gray-600 hover:bg-gray-700'
      },
      '물류/유통': {
        bg: 'bg-neutral-50',
        border: 'border-neutral-200 hover:border-neutral-300',
        badge: 'bg-neutral-100 text-neutral-800',
        badgeText: 'text-neutral-600',
        button: 'bg-neutral-600 hover:bg-neutral-700'
      },
      '건설/건축': {
        bg: 'bg-brown-50',
        border: 'border-brown-200 hover:border-brown-300',
        badge: 'bg-brown-100 text-brown-800',
        badgeText: 'text-brown-600',
        button: 'bg-brown-600 hover:bg-brown-700'
      },
      '미디어/콘텐츠': {
        bg: 'bg-rose-50',
        border: 'border-rose-200 hover:border-rose-300',
        badge: 'bg-rose-100 text-rose-800',
        badgeText: 'text-rose-600',
        button: 'bg-rose-600 hover:bg-rose-700'
      }
    };
    
    return themes[category] || {
      bg: 'bg-slate-50',
      border: 'border-slate-200 hover:border-slate-300',
      badge: 'bg-slate-100 text-slate-800',
      badgeText: 'text-slate-600',
      button: 'bg-slate-600 hover:bg-slate-700'
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="text-slate-600 font-medium">채용공고를 불러오고 있습니다...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              채용공고
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">
              서울시 우수 기업들의 최신 채용 정보를 확인하고 지원해보세요
            </p>
            
            {/* 데이터 통계 및 새로고침 */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6">
              <div className="flex items-center gap-6 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span>샘플 데이터: {sampleCount}개</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span>크롤링 데이터: {crawledCount}개</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                  <span>총 {jobs.length}개</span>
                </div>
              </div>
              
              <button
                onClick={refreshCrawledData}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                크롤링 새로고침
              </button>
            </div>
            
            {/* 에러 메시지 */}
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 text-red-800">
                  <ExclamationTriangleIcon className="w-5 h-5" />
                  <span>{error}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search and Filters */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm mb-8">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search Bar */}
              <div className="flex-1">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="채용공고 제목, 회사명, 기술스택으로 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 placeholder-slate-500"
                  />
                </div>
              </div>
              
              {/* Filter Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center px-6 py-3 border border-slate-300 rounded-xl text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors"
              >
                <AdjustmentsHorizontalIcon className="w-5 h-5 mr-2" />
                필터
              </button>
            </div>

            {/* Filters */}
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-6 pt-6 border-t border-slate-200"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Category Filter */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-3">직무 카테고리</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900"
                    >
                      <option value="all">모든 직무</option>
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>

                  {/* Location Filter */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-3">근무 지역</label>
                    <select
                      value={selectedLocation}
                      onChange={(e) => setSelectedLocation(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900"
                    >
                      <option value="all">모든 지역</option>
                      {locations.map(location => (
                        <option key={location} value={location}>{location}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Job Statistics */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  채용공고 ({filteredJobs.length}개)
                </h2>
                <p className="text-sm text-slate-600 mt-1">
                  {searchTerm ? `"${searchTerm}"에 대한 검색 결과` : '최신 채용공고를 확인해보세요'}
                </p>
              </div>
              <div className="flex items-center space-x-2 text-sm text-slate-500">
                <span>정렬:</span>
                <select className="border border-slate-300 rounded-lg px-3 py-1 text-slate-700">
                  <option>최신순</option>
                  <option>마감임박순</option>
                  <option>급여순</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Job Listings */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredJobs.map((job, index) => {
            const theme = getCategoryTheme(job.jobCategory);
            return (
              <motion.div
                key={job.id}
                className={`${theme.bg} rounded-2xl border ${theme.border} shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden h-fit`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02 }}
              >
                <div className="p-6">
                  {/* Company Name - Highlighted */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <div className={`w-8 h-8 rounded-lg ${theme.badge} flex items-center justify-center`}>
                          <BuildingOfficeIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className={`text-sm font-bold ${theme.badgeText}`}>
                            {job.companyName}
                          </h4>
                          {/* 크롤링 소스 표시 */}
                          {job.source && job.source !== 'manual' && (
                            <div className="flex items-center gap-1 mt-1">
                              <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                                {job.source === 'jobkorea' ? '잡코리아' : '잡플래닛'}
                              </span>
                              {job.externalUrl && (
                                <a 
                                  href={job.externalUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-xs text-blue-600 hover:text-blue-800 underline"
                                >
                                  원본보기
                                </a>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <span className={`text-xs font-medium ${theme.badgeText}`}>
                        {getWorkTypeLabel(job.workType)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium ${theme.badge}`}>
                        <TagIcon className="w-4 h-4 mr-1" />
                        {job.jobCategory}
                      </span>
                      {/* 데이터 타입 배지 */}
                      {job.source ? (
                        <span className="text-xs px-2 py-1 bg-green-50 text-green-600 rounded-md font-medium">
                          실시간
                        </span>
                      ) : (
                        <span className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded-md font-medium">
                          샘플
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Job Header */}
                  <div className="mb-4">
                    <Link 
                      href={`/jobs/${job.id}`}
                      className="group"
                    >
                      <h3 className={`text-lg font-bold text-slate-900 group-hover:${theme.badgeText} transition-colors mb-3 line-clamp-2`}>
                        {job.title}
                      </h3>
                    </Link>
                    <div className="flex items-center text-sm text-slate-600">
                      <MapPinIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{job.location}</span>
                    </div>
                  </div>

                  {/* Job Description */}
                  <p className="text-slate-700 mb-4 text-sm line-clamp-3">
                    {job.description}
                  </p>

                  {/* Skills */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {job.skills.slice(0, 4).map((skill, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-white/80 text-slate-700"
                      >
                        {skill}
                      </span>
                    ))}
                    {job.skills.length > 4 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-white/80 text-slate-600">
                        +{job.skills.length - 4}
                      </span>
                    )}
                  </div>

                  {/* Job Details */}
                  <div className="space-y-2 mb-6 text-sm text-slate-600">
                    {job.salary.amount && (
                      <div className="flex items-center">
                        <CurrencyDollarIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span className="truncate">{job.salary.amount}</span>
                        {job.salary.negotiable && (
                          <span className={`ml-1 text-xs ${theme.badgeText}`}>(협의가능)</span>
                        )}
                      </div>
                    )}
                    <div className="flex items-center">
                      <CalendarIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span>마감: {formatDate(job.deadline)}</span>
                    </div>
                    {job.workingHours && (
                      <div className="flex items-center">
                        <ClockIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span className="truncate">{job.workingHours}</span>
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <Link
                    href={`/jobs/${job.id}`}
                    className={`inline-flex items-center justify-center w-full px-4 py-3 ${theme.button} text-white font-medium rounded-xl transition-colors`}
                  >
                    상세보기
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* No Results */}
        {filteredJobs.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12">
            <div className="text-center">
              <BriefcaseIcon className="mx-auto w-16 h-16 text-slate-300 mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">검색 결과가 없습니다</h3>
              <p className="text-slate-600 mb-6">다른 검색 조건을 시도해보세요.</p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                  setSelectedLocation('all');
                }}
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                필터 초기화
              </button>
            </div>
          </div>
        )}

        {/* Load More Button */}
        {filteredJobs.length > 0 && (
          <div className="text-center mt-12">
            <button className="inline-flex items-center px-8 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors">
              더 많은 채용공고 보기
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 