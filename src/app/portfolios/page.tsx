'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeftIcon, MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { getAllPortfolios } from '@/lib/auth';

interface Portfolio {
  id: string;
  userId: string;
  name: string;
  email: string;
  speciality: string;
  phone?: string;
  address?: string;
  skills: string[];
  languages: string[];
  experience?: any[];
  education?: any[];
  description: string;
  rating: number;
  projects: number;
  verified: boolean;
  isPublic: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// 아바타 매핑
const getAvatarBySpeciality = (speciality: string) => {
  const avatarMap: { [key: string]: string } = {
    'SNS마케팅': '👩',
    '키워드광고': '👨',
    '브랜드마케팅': '🎨',
    '퍼포먼스마케팅': '📊',
    '콘텐츠마케팅': '🎬',
    '마케팅기획': '💼',
    '이커머스마케팅': '🛒',
    '데이터마케팅': '🔬',
    '웹개발': '💻',
    '앱개발': '📱',
    '디자인': '🎨',
    '기타': '👤'
  };
  return avatarMap[speciality] || '👤';
};

const specialities = ['전체', 'SNS마케팅', '키워드광고', '브랜드마케팅', '퍼포먼스마케팅', '콘텐츠마케팅', '마케팅기획', '이커머스마케팅', '데이터마케팅', '웹개발', '앱개발', '디자인', '기타'];

// 기본 샘플 데이터
const samplePortfolios: Portfolio[] = [
  {
    id: 'sample-1',
    userId: 'sample-user-1',
    name: '김민수',
    email: 'minsu.kim@example.com',
    speciality: 'SNS마케팅',
    phone: '010-1234-5678',
    address: '서울시 강남구',
    skills: ['Instagram', 'Facebook', 'TikTok', '브랜드마케팅', '콘텐츠기획'],
    languages: ['한국어', '영어'],
    description: '소셜미디어 플랫폼별 맞춤형 마케팅 전략 수립 및 실행 전문가입니다.',
    rating: 4.9,
    projects: 15,
    verified: true,
    isPublic: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'sample-2',
    userId: 'sample-user-2',
    name: '박영희',
    email: 'younghee.park@example.com',
    speciality: '웹개발',
    phone: '010-2345-6789',
    address: '서울시 서초구',
    skills: ['React', 'Next.js', 'TypeScript', 'Node.js', 'MongoDB'],
    languages: ['한국어', '영어', '일본어'],
    description: '현대적인 웹 애플리케이션 개발 전문가입니다.',
    rating: 4.8,
    projects: 22,
    verified: true,
    isPublic: true,
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02')
  },
  {
    id: 'sample-3',
    userId: 'sample-user-3',
    name: '이준호',
    email: 'junho.lee@example.com',
    speciality: '디자인',
    phone: '010-3456-7890',
    address: '서울시 마포구',
    skills: ['Figma', 'Adobe XD', 'Photoshop', 'Illustrator', 'UI/UX'],
    languages: ['한국어', '영어'],
    description: '사용자 경험을 중시하는 UI/UX 디자이너입니다.',
    rating: 4.7,
    projects: 18,
    verified: true,
    isPublic: true,
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-03')
  }
];

export default function PortfoliosPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpeciality, setSelectedSpeciality] = useState('전체');
  const [sortBy, setSortBy] = useState('projects');
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPortfolios();
  }, []);

  const loadPortfolios = async () => {
    try {
      setLoading(true);
      const data = await getAllPortfolios();
      // 실제 데이터와 샘플 데이터를 합침 (실제 데이터가 적을 경우 샘플 데이터로 보완)
      const combinedData = [...(data as Portfolio[]), ...samplePortfolios];
      setPortfolios(combinedData);
    } catch (error) {
      console.error('Error loading portfolios:', error);
      // 에러 발생 시 최소한 샘플 데이터라도 보여줌
      setPortfolios(samplePortfolios);
    } finally {
      setLoading(false);
    }
  };

  const filteredPortfolios = portfolios
    .filter((portfolio: Portfolio) => {
      const matchesSearch = portfolio.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          portfolio.speciality.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          portfolio.skills.some((skill: string) => skill.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesSpeciality = selectedSpeciality === '전체' || portfolio.speciality === selectedSpeciality;
      return matchesSearch && matchesSpeciality;
    })
    .sort((a: Portfolio, b: Portfolio) => {
      switch (sortBy) {
        case 'projects':
          return b.projects - a.projects;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'recent':
          return (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0);
        default:
          return 0;
      }
    });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors">
                <ArrowLeftIcon className="h-5 w-5" />
                <span>홈으로</span>
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                포트폴리오
              </h1>
            </div>
            <div className="text-sm text-gray-500">
              총 {filteredPortfolios.length}명의 전문가
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search and Filter Section */}
        <div className="mb-12">
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/20">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="이름, 전문분야, 스킬로 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Speciality Filter */}
              <div className="flex items-center space-x-3">
                <FunnelIcon className="h-5 w-5 text-gray-400" />
                <select
                  value={selectedSpeciality}
                  onChange={(e) => setSelectedSpeciality(e.target.value)}
                  className="px-4 py-4 bg-gray-50/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {specialities.map(speciality => (
                    <option key={speciality} value={speciality}>{speciality}</option>
                  ))}
                </select>
              </div>

              {/* Sort */}
              <div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-4 bg-gray-50/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="projects">프로젝트순</option>
                  <option value="recent">최신순</option>
                  <option value="name">이름순</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Portfolio Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPortfolios.map((portfolio: Portfolio) => (
              <div
                key={portfolio.id}
                className="group relative bg-white/80 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/20 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 hover:bg-white/90"
              >
                {/* Verification Badge - Positioned absolutely */}
                {portfolio.verified && (
                  <div className="absolute top-4 right-4 flex items-center space-x-1 bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-medium">
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>인증</span>
                  </div>
                )}

                {/* Avatar and Name */}
                <div className="flex items-center space-x-4 mb-6">
                  <div className="text-4xl bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full w-16 h-16 flex items-center justify-center group-hover:scale-110 transition-transform">
                    {getAvatarBySpeciality(portfolio.speciality)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {portfolio.name}
                    </h3>
                    <p className="text-sm text-gray-500">{portfolio.email}</p>
                  </div>
                </div>

                {/* Speciality Badge */}
                <div className="mb-4">
                  <span className="inline-block bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-full text-sm font-medium">
                    {portfolio.speciality}
                  </span>
                </div>

                {/* Description */}
                <p className="text-gray-600 mb-6 leading-relaxed line-clamp-3">
                  {portfolio.description || `${portfolio.speciality} 전문가입니다.`}
                </p>

                {/* Location and Contact */}
                {(portfolio.address || portfolio.phone) && (
                  <div className="mb-4 space-y-2">
                    {portfolio.address && (
                      <div className="flex items-center text-sm text-gray-500">
                        <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {portfolio.address}
                      </div>
                    )}
                    {portfolio.phone && (
                      <div className="flex items-center text-sm text-gray-500">
                        <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        {portfolio.phone}
                      </div>
                    )}
                  </div>
                )}

                {/* Languages */}
                {portfolio.languages && portfolio.languages.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">언어</h4>
                    <div className="flex flex-wrap gap-1">
                      {portfolio.languages.slice(0, 3).map((language: string, index: number) => (
                        <span
                          key={index}
                          className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs"
                        >
                          {language}
                        </span>
                      ))}
                      {portfolio.languages.length > 3 && (
                        <span className="text-gray-400 text-xs">+{portfolio.languages.length - 3}</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Skills */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">주요 스킬</h4>
                  <div className="flex flex-wrap gap-2">
                    {portfolio.skills.slice(0, 4).map((skill: string, index: number) => (
                      <span
                        key={index}
                        className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-sm hover:bg-gray-200 transition-colors"
                      >
                        {skill}
                      </span>
                    ))}
                    {portfolio.skills.length > 4 && (
                      <span className="text-gray-400 text-sm">+{portfolio.skills.length - 4}개</span>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-center mb-6 p-4 bg-gray-50/80 rounded-xl">
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900">{portfolio.projects}</div>
                    <div className="text-xs text-gray-500">완료 프로젝트</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <Link 
                    href={`/portfolios/${portfolio.id}`}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all hover:shadow-lg transform hover:scale-[1.02] text-center"
                  >
                    포트폴리오 보기
                  </Link>
                  <button className="px-4 py-3 border-2 border-blue-600 text-blue-600 rounded-xl font-medium hover:bg-blue-600 hover:text-white transition-all hover:shadow-lg">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}

            {/* Empty State */}
            {filteredPortfolios.length === 0 && !loading && (
              <div className="col-span-full text-center py-20">
                <div className="text-6xl mb-6">🔍</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">검색 결과가 없습니다</h3>
                <p className="text-gray-600 mb-8">다른 키워드로 검색해보세요.</p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedSpeciality('전체');
                  }}
                  className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors"
                >
                  전체 보기
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Floating Contact Button */}
      <div className="fixed bottom-8 right-8">
        <button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-300">
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>
      </div>
    </div>
  );
} 