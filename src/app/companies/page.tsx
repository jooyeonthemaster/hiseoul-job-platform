'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { getAllEmployers, addToFavorites, removeFromFavorites, getFavoriteCompanies, getUserData } from '@/lib/auth';
import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import { 
  BuildingOfficeIcon, 
  MapPinIcon,
  UserGroupIcon,
  GlobeAltIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CheckCircleIcon,
  StarIcon,
  ClockIcon,
  UserIcon,
  BriefcaseIcon,
  ArrowLeftIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import { 
  BuildingOfficeIcon as BuildingOfficeIconSolid,
  CheckBadgeIcon,
  HeartIcon as HeartIconSolid
} from '@heroicons/react/24/solid';

interface Company {
  id: string;
  userId: string;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  company: {
    name: string;
    ceoName: string;
    industry: string;
    businessType: string;
    size: string;
    location: string;
    website: string;
    description: string;
    companyAttraction: {
      workingHours: string;
      remoteWork: boolean;
      averageSalary: string;
      benefits: string[];
      growthOpportunity: boolean;
      stockOptions: boolean;
      trainingSupport: boolean;
      familyFriendly: boolean;
      etc: string;
    };
  };
  createdAt?: Date;
  updatedAt?: Date;
}

export default function CompaniesPage() {
  const { isAuthenticated, user } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('all');
  const [selectedSize, setSelectedSize] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [favoriteCompanies, setFavoriteCompanies] = useState<string[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState<string | null>(null);

  useEffect(() => {
    const loadCompanies = async () => {
      try {
        const employersData = await getAllEmployers();
        setCompanies(employersData);
      } catch (error) {
        console.error('Error loading companies:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCompanies();
  }, []);

  useEffect(() => {
    const loadUserData = async () => {
      if (user) {
        const userData = await getUserData(user.uid);
        setUserRole(userData?.role || null);
        
        if (userData?.role === 'jobseeker') {
          const favorites = await getFavoriteCompanies(user.uid);
          setFavoriteCompanies(favorites);
        }
      } else {
        setFavoriteCompanies([]);
        setUserRole(null);
      }
    };

    loadUserData();
  }, [user]);

  // 필터링 로직
  const filteredCompanies = companies.filter(company => {
    const matchesSearch = 
      company.company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.company.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.company.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.company.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesIndustry = selectedIndustry === 'all' || company.company.industry === selectedIndustry;
    const matchesSize = selectedSize === 'all' || company.company.size === selectedSize;
    
    return matchesSearch && matchesIndustry && matchesSize;
  });

  const industries = [...new Set(companies.map(c => c.company.industry).filter(Boolean))];
  const sizes = [...new Set(companies.map(c => c.company.size).filter(Boolean))];

  const getAttractionTags = (attraction: any) => {
    const tags = [];
    if (attraction.remoteWork) tags.push('재택근무');
    if (attraction.growthOpportunity) tags.push('성장기회');
    if (attraction.stockOptions) tags.push('스톡옵션');
    if (attraction.trainingSupport) tags.push('교육지원');
    if (attraction.familyFriendly) tags.push('가족친화');
    return tags;
  };

  const formatWebsiteUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `https://${url}`;
  };

  const handleFavoriteToggle = async (companyId: string) => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    if (userRole !== 'jobseeker') {
      alert('관심 기업 등록은 구직자만 이용할 수 있습니다.');
      return;
    }

    setFavoriteLoading(companyId);
    try {
      const isFavorite = favoriteCompanies.includes(companyId);
      let success;
      
      if (isFavorite) {
        success = await removeFromFavorites(user.uid, companyId);
        if (success) {
          setFavoriteCompanies(prev => prev.filter(id => id !== companyId));
        }
      } else {
        success = await addToFavorites(user.uid, companyId);
        if (success) {
          setFavoriteCompanies(prev => [...prev, companyId]);
        }
      }

      if (!success) {
        alert('관심 기업 등록 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      alert('관심 기업 등록 중 오류가 발생했습니다.');
    } finally {
      setFavoriteLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center px-4 py-2 bg-blue-50 border border-blue-200 rounded-full text-blue-700 font-medium text-sm mb-8">
              <CheckBadgeIcon className="w-4 h-4 mr-2" />
              테크벤처 잡 매칭 인증 기업
            </div>
            
            <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              <span className="text-gray-900">혁신적인</span>
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">서울 기업들</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            테크벤처 잡 매칭 인증을 받은 우수 기업들과 다양한 성장 기회를 만나보세요.<br />
              투명한 정보 공개와 전문적인 채용 프로세스를 제공합니다.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
              <motion.div 
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <div className="text-3xl font-bold text-blue-600 mb-2">{companies.length}+</div>
                <div className="text-gray-600 font-medium">등록 기업</div>
              </motion.div>
              <motion.div 
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="text-3xl font-bold text-indigo-600 mb-2">{industries.length}+</div>
                <div className="text-gray-600 font-medium">다양한 업종</div>
              </motion.div>
              <motion.div 
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <div className="text-3xl font-bold text-purple-600 mb-2">85%</div>
                <div className="text-gray-600 font-medium">매칭 성공률</div>
              </motion.div>
              <motion.div 
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <div className="text-3xl font-bold text-emerald-600 mb-2">4.8/5</div>
                <div className="text-gray-600 font-medium">만족도 평점</div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="기업명, 업종, 지역으로 검색하세요..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <select
                  value={selectedIndustry}
                  onChange={(e) => setSelectedIndustry(e.target.value)}
                  className="px-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">모든 업종</option>
                  {industries.map((industry) => (
                    <option key={industry} value={industry}>{industry}</option>
                  ))}
                </select>

                <select
                  value={selectedSize}
                  onChange={(e) => setSelectedSize(e.target.value)}
                  className="px-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">모든 규모</option>
                  {sizes.map((size) => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Results Count */}
            <div className="mt-6 pt-6 border-t border-gray-100">
              <p className="text-gray-600">
                총 <span className="font-semibold text-blue-600">{filteredCompanies.length}개</span>의 기업이 있습니다.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Companies Grid */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredCompanies.length === 0 ? (
            <div className="text-center py-20">
              <BuildingOfficeIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">검색 결과가 없습니다</h3>
              <p className="text-gray-500">다른 검색어나 필터를 시도해보세요.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCompanies.map((company, index) => (
                <motion.div
                  key={company.id}
                  className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden hover:-translate-y-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  {/* Company Header */}
                  <div className="p-6 border-b border-gray-50">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center border border-blue-200">
                          <BuildingOfficeIconSolid className="w-8 h-8 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {company.company.name}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">{company.company.industry}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        {company.approvalStatus === 'approved' && (
                          <div className="flex items-center">
                            <CheckBadgeIcon className="w-5 h-5 text-emerald-500 mr-1" />
                            <span className="text-xs font-medium text-emerald-600">인증</span>
                          </div>
                        )}
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleFavoriteToggle(company.id);
                          }}
                          disabled={favoriteLoading === company.id}
                          className={`p-2 rounded-full transition-all duration-200 ${
                            favoriteCompanies.includes(company.id)
                              ? 'bg-pink-50 hover:bg-pink-100 text-pink-500'
                              : 'bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-pink-500'
                          } ${favoriteLoading === company.id ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'}`}
                        >
                          {favoriteLoading === company.id ? (
                            <div className="w-5 h-5 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                          ) : (
                            favoriteCompanies.includes(company.id) ? (
                              <HeartIconSolid className="w-5 h-5" />
                            ) : (
                              <HeartIcon className="w-5 h-5" />
                            )
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center text-gray-600">
                        <UserIcon className="w-4 h-4 mr-2" />
                        {company.company.ceoName}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <UserGroupIcon className="w-4 h-4 mr-2" />
                        {company.company.size}
                      </div>
                      <div className="flex items-center text-gray-600 col-span-2">
                        <MapPinIcon className="w-4 h-4 mr-2" />
                        {company.company.location}
                      </div>
                    </div>
                  </div>

                  {/* Company Description */}
                  <div className="p-6">
                    <p className="text-gray-700 text-sm leading-relaxed mb-4 line-clamp-3">
                      {company.company.description}
                    </p>

                    {/* Attraction Tags */}
                    {getAttractionTags(company.company.companyAttraction).length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {getAttractionTags(company.company.companyAttraction).slice(0, 3).map((tag, i) => (
                          <span 
                            key={i}
                            className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium border border-blue-200"
                          >
                            {tag}
                          </span>
                        ))}
                        {getAttractionTags(company.company.companyAttraction).length > 3 && (
                          <span className="px-3 py-1 bg-gray-50 text-gray-600 rounded-full text-xs font-medium">
                            +{getAttractionTags(company.company.companyAttraction).length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Company Info */}
                    <div className="space-y-2 text-sm">
                      {company.company.companyAttraction.workingHours && (
                        <div className="flex items-center text-gray-600">
                          <ClockIcon className="w-4 h-4 mr-2" />
                          {company.company.companyAttraction.workingHours}
                        </div>
                      )}
                      {company.company.companyAttraction.averageSalary && (
                        <div className="flex items-center text-gray-600">
                          <BriefcaseIcon className="w-4 h-4 mr-2" />
                          평균 연봉: {company.company.companyAttraction.averageSalary}
                        </div>
                      )}
                      {company.company.website && (
                        <div className="flex items-center text-gray-600">
                          <GlobeAltIcon className="w-4 h-4 mr-2" />
                          <a 
                            href={formatWebsiteUrl(company.company.website)} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700 transition-colors"
                          >
                            기업 웹사이트
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="px-6 pb-6">
                    <Link href={`/companies/${company.id}`} className="block w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl group-hover:scale-105 text-center">
                      기업 상세보기
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
          >
            <div className="text-center">
              <HeartIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-4">로그인이 필요합니다</h3>
              <p className="text-gray-600 mb-6">
                관심 기업을 등록하려면 구직자로 로그인해주세요.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/auth"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors text-center"
                >
                  로그인 / 회원가입
                </Link>
                <button
                  onClick={() => setShowLoginModal(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-xl transition-colors"
                >
                  취소
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-20 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12">
            <div>
              <div className="flex items-center space-x-3 mb-8">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg p-1">
                  <img 
                    src="/images/logo.png" 
                    alt="테크벤처 잡 매칭 Logo" 
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="text-2xl font-bold">테크벤처 잡 매칭</span>
              </div>
              <p className="text-gray-400 text-lg leading-relaxed">
                서울시 중소기업과 모든 직군의 전문 인재를 연결하는 프리미엄 구인구직 플랫폼
              </p>
            </div>
            
            <div>
              <h3 className="font-bold mb-6 text-lg">서비스</h3>
              <ul className="space-y-3 text-gray-400">
                <li><Link href="/portfolios" className="hover:text-white transition-colors text-lg">포트폴리오</Link></li>
                <li><Link href="/companies" className="hover:text-white transition-colors text-lg">기업정보</Link></li>
                <li><span className="text-gray-500 text-lg cursor-not-allowed">AI 매칭 (준비중)</span></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold mb-6 text-lg">지원</h3>
              <ul className="space-y-3 text-gray-400">
                <li><Link href="/help" className="hover:text-white transition-colors text-lg">도움말</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors text-lg">문의하기</Link></li>
                <li><Link href="/faq" className="hover:text-white transition-colors text-lg">FAQ</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors text-lg">개인정보처리방침</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold mb-6 text-lg">연락처</h3>
              <div className="text-gray-400 space-y-3 text-lg">
                <p>이메일: tvs@techventure.co.kr</p>
                <p>전화: 010-2734-8624</p>
                <p>담당: 조지형 사무국장</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-16 pt-10 text-center text-gray-400 text-lg">
            <p>&copy; 2025 테크벤처 잡 매칭 Job Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}