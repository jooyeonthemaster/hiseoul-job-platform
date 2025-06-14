'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getEmployerById, addToFavorites, removeFromFavorites, isFavoriteCompany, getUserData } from '@/lib/auth';
import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import { 
  BuildingOfficeIcon, 
  MapPinIcon,
  UserGroupIcon,
  GlobeAltIcon,
  UserIcon,
  BriefcaseIcon,
  ArrowLeftIcon,
  ClockIcon,
  CurrencyDollarIcon,
  StarIcon,
  HeartIcon,
  AcademicCapIcon,
  HomeIcon,
  TrophyIcon,
  SparklesIcon,
  PhoneIcon,
  EnvelopeIcon
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

export default function CompanyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const loadCompany = async () => {
      try {
        if (!params.id || typeof params.id !== 'string') {
          setError('잘못된 기업 ID입니다.');
          return;
        }

        const companyData = await getEmployerById(params.id);
        if (!companyData || !companyData.company.name) {
          setError('기업 정보를 찾을 수 없습니다.');
          return;
        }

        setCompany(companyData);

        // 로그인한 사용자의 관심 기업 여부 확인
        if (user) {
          const userData = await getUserData(user.uid);
          setUserRole(userData?.role || null);
          
          if (userData?.role === 'jobseeker') {
            const favorite = await isFavoriteCompany(user.uid, params.id);
            setIsFavorite(favorite);
          }
        }
      } catch (error) {
        console.error('Error loading company:', error);
        setError('기업 정보를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadCompany();
  }, [params.id, user]);

  const getAttractionFeatures = (attraction: any) => {
    const features = [];
    if (attraction.remoteWork) features.push({ icon: HomeIcon, label: '재택근무 가능', color: 'text-green-600 bg-green-50 border-green-200' });
    if (attraction.growthOpportunity) features.push({ icon: TrophyIcon, label: '높은 성장 기회', color: 'text-purple-600 bg-purple-50 border-purple-200' });
    if (attraction.stockOptions) features.push({ icon: CurrencyDollarIcon, label: '스톡옵션 제공', color: 'text-yellow-600 bg-yellow-50 border-yellow-200' });
    if (attraction.trainingSupport) features.push({ icon: AcademicCapIcon, label: '교육비 지원', color: 'text-blue-600 bg-blue-50 border-blue-200' });
    if (attraction.familyFriendly) features.push({ icon: HeartIcon, label: '가족친화 기업', color: 'text-pink-600 bg-pink-50 border-pink-200' });
    return features;
  };

  const formatWebsiteUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `https://${url}`;
  };

  const handleFavoriteToggle = async () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    if (userRole !== 'jobseeker') {
      alert('관심 기업 등록은 구직자만 이용할 수 있습니다.');
      return;
    }

    if (!params.id || typeof params.id !== 'string') return;

    setFavoriteLoading(true);
    try {
      let success;
      if (isFavorite) {
        success = await removeFromFavorites(user.uid, params.id);
      } else {
        success = await addToFavorites(user.uid, params.id);
      }

      if (success) {
        setIsFavorite(!isFavorite);
      } else {
        alert('관심 기업 등록 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      alert('관심 기업 등록 중 오류가 발생했습니다.');
    } finally {
      setFavoriteLoading(false);
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

  if (error || !company) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <BuildingOfficeIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">{error}</h3>
            <Link href="/companies" className="text-blue-600 hover:text-blue-700 transition-colors">
              기업 목록으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Navigation />

      {/* Company Hero Section */}
      <section className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-3xl shadow-2xl p-8 lg:p-12 border border-gray-100"
          >
            {/* Company Header */}
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-8">
              <div className="flex items-center space-x-6 mb-6 lg:mb-0">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-3xl flex items-center justify-center border border-blue-200 shadow-lg">
                  <BuildingOfficeIconSolid className="w-12 h-12 text-blue-600" />
                </div>
                <div>
                  <div className="flex items-center mb-2">
                    <h1 className="text-4xl font-bold text-gray-900 mr-4">{company.company.name}</h1>
                    {company.approvalStatus === 'approved' && (
                      <div className="flex items-center bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                        <CheckBadgeIcon className="w-5 h-5 text-emerald-500 mr-1" />
                        <span className="text-sm font-medium text-emerald-700">하이서울 인증</span>
                      </div>
                    )}
                  </div>
                  <p className="text-xl text-gray-600 mb-2">{company.company.industry}</p>
                  <p className="text-gray-500">{company.company.businessType}</p>
                </div>
              </div>
              
              <div className="flex space-x-4">
                {company.company.website && (
                  <a
                    href={formatWebsiteUrl(company.company.website)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all duration-200"
                  >
                    <GlobeAltIcon className="w-5 h-5 mr-2" />
                    웹사이트 방문
                  </a>
                )}
                <button 
                  onClick={handleFavoriteToggle}
                  disabled={favoriteLoading}
                  className={`inline-flex items-center px-6 py-3 font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl ${
                    isFavorite 
                      ? 'bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white' 
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white'
                  } ${favoriteLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {favoriteLoading ? (
                    <div className="w-5 h-5 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  ) : (
                    isFavorite ? (
                      <HeartIconSolid className="w-5 h-5 mr-2 text-white" />
                    ) : (
                      <HeartIcon className="w-5 h-5 mr-2" />
                    )
                  )}
                  {isFavorite ? '관심기업 해제' : '관심기업 등록'}
                </button>
              </div>
            </div>

            {/* Quick Info */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 p-6 bg-gray-50 rounded-2xl">
              <div className="text-center">
                <UserIcon className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">대표이사</p>
                <p className="font-semibold text-gray-900">{company.company.ceoName}</p>
              </div>
              <div className="text-center">
                <UserGroupIcon className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">기업규모</p>
                <p className="font-semibold text-gray-900">{company.company.size}</p>
              </div>
              <div className="text-center">
                <MapPinIcon className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">위치</p>
                <p className="font-semibold text-gray-900">{company.company.location}</p>
              </div>
              <div className="text-center">
                <ClockIcon className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">근무시간</p>
                <p className="font-semibold text-gray-900">{company.company.companyAttraction.workingHours || '협의'}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Back to Companies Button */}
      <section className="pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Link 
              href="/companies"
              className="inline-flex items-center px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all duration-200"
            >
              <ArrowLeftIcon className="w-5 h-5 mr-2" />
              기업 목록으로 돌아가기
            </Link>
          </div>
        </div>
      </section>

      {/* Company Details */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Company Description */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <SparklesIcon className="w-6 h-6 mr-3 text-blue-600" />
                  기업 소개
                </h2>
                <p className="text-gray-700 leading-relaxed text-lg whitespace-pre-line">
                  {company.company.description}
                </p>
              </motion.div>

              {/* Company Attractions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <StarIcon className="w-6 h-6 mr-3 text-blue-600" />
                  우리 회사의 매력
                </h2>
                
                {/* Attraction Features */}
                {getAttractionFeatures(company.company.companyAttraction).length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {getAttractionFeatures(company.company.companyAttraction).map((feature, index) => {
                      const IconComponent = feature.icon;
                      return (
                        <div key={index} className={`flex items-center p-4 rounded-xl border ${feature.color}`}>
                          <IconComponent className="w-6 h-6 mr-3" />
                          <span className="font-semibold">{feature.label}</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Salary Information */}
                {company.company.companyAttraction.averageSalary && (
                  <div className="bg-blue-50 rounded-xl p-6 border border-blue-200 mb-6">
                    <h3 className="font-semibold text-lg text-gray-900 mb-2 flex items-center">
                      <CurrencyDollarIcon className="w-5 h-5 mr-2 text-blue-600" />
                      평균 연봉 수준
                    </h3>
                    <p className="text-gray-700">{company.company.companyAttraction.averageSalary}</p>
                  </div>
                )}

                {/* Benefits */}
                {company.company.companyAttraction.benefits.length > 0 && (
                  <div className="bg-green-50 rounded-xl p-6 border border-green-200 mb-6">
                    <h3 className="font-semibold text-lg text-gray-900 mb-3 flex items-center">
                      <StarIcon className="w-5 h-5 mr-2 text-green-600" />
                      복리후생
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {company.company.companyAttraction.benefits.map((benefit, index) => (
                        <span key={index} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium border border-green-200">
                          {benefit}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Additional Info */}
                {company.company.companyAttraction.etc && (
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <h3 className="font-semibold text-lg text-gray-900 mb-2">기타 정보</h3>
                    <p className="text-gray-700">{company.company.companyAttraction.etc}</p>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Contact Info */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 sticky top-28"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-6">기업 정보</h3>
                
                <div className="space-y-4">
                  <div className="flex items-start">
                    <BuildingOfficeIcon className="w-5 h-5 text-gray-400 mr-3 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">기업명</p>
                      <p className="font-semibold text-gray-900">{company.company.name}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <UserIcon className="w-5 h-5 text-gray-400 mr-3 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">대표이사</p>
                      <p className="font-semibold text-gray-900">{company.company.ceoName}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <BriefcaseIcon className="w-5 h-5 text-gray-400 mr-3 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">업종</p>
                      <p className="font-semibold text-gray-900">{company.company.industry}</p>
                      <p className="text-sm text-gray-600">{company.company.businessType}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <UserGroupIcon className="w-5 h-5 text-gray-400 mr-3 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">기업규모</p>
                      <p className="font-semibold text-gray-900">{company.company.size}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <MapPinIcon className="w-5 h-5 text-gray-400 mr-3 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">주소</p>
                      <p className="font-semibold text-gray-900">{company.company.location}</p>
                    </div>
                  </div>
                  
                                        {company.company.website && (
                        <div className="flex items-start">
                          <GlobeAltIcon className="w-5 h-5 text-gray-400 mr-3 mt-1" />
                          <div>
                            <p className="text-sm text-gray-600">웹사이트</p>
                            <a 
                              href={formatWebsiteUrl(company.company.website)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                            >
                              바로가기
                            </a>
                          </div>
                        </div>
                      )}
                </div>

                {/* Action Buttons */}
                <div className="mt-8 space-y-3">
                  <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl">
                    채용 문의하기
                  </button>
                  <button 
                    onClick={handleFavoriteToggle}
                    disabled={favoriteLoading}
                    className={`w-full font-semibold py-3 rounded-xl transition-all duration-200 ${
                      isFavorite
                        ? 'bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    } ${favoriteLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {favoriteLoading ? (
                      <div className="w-5 h-5 mx-auto animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                    ) : (
                      isFavorite ? '관심기업 해제' : '관심기업 등록'
                    )}
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
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
                    alt="HiSeoul Logo" 
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="text-2xl font-bold">HiSeoul</span>
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
            <p>&copy; 2025 HiSeoul Job Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}