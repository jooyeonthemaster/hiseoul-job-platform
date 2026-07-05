'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { getAllEmployers, addToFavorites, removeFromFavorites, getFavoriteCompanies, getUserData } from '@/lib/auth';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import { GlassButton } from '@/components/ui/GlassButton';
import { GlassCard } from '@/components/ui/GlassCard';
import { AuroraBackground } from '@/components/ui/AuroraBackground';
import { Badge } from '@/components/ui/Badge';
import { GlassInput, GlassSelect } from '@/components/ui/GlassField';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { staggerContainer, fadeUp } from '@/components/ui/motion';
import {
  BuildingOfficeIcon,
  MapPinIcon,
  UserGroupIcon,
  GlobeAltIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ClockIcon,
  UserIcon,
  BriefcaseIcon,
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
  const reduceMotion = useReducedMotion();

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
      <div className="min-h-screen bg-azure-aurora pt-24">
        <div className="container-wide">
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-azure-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-clip">
      <Navigation />

      {/* Search + Companies — 하나의 섹션으로 묶어 sticky 툴바가 목록 전체 구간에서 유지되도록 함.
          overflow-hidden 을 두지 않아야 position:sticky 가 동작한다 (AuroraBackground 는 자체 clip). */}
      <section className="relative pb-24">
        <AuroraBackground />
        <div className="relative z-10 mx-auto w-full max-w-[1760px] px-4 sm:px-6 lg:px-10 pt-24">
          {/* Sticky 검색·필터 툴바 (fixed 네비 64px 아래에 고정) */}
          <div className="sticky top-[72px] z-30 pb-5">
            <GlassCard strong className="p-5 sm:p-6">
              <div className="flex flex-col lg:flex-row gap-5">
                {/* Search */}
                <div className="flex-1">
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-azure-400 w-5 h-5 pointer-events-none z-10" />
                    <GlassInput
                      type="text"
                      placeholder="기업명, 업종, 지역으로 검색하세요..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-12 py-4 text-base sm:text-lg"
                    />
                  </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <GlassSelect
                    value={selectedIndustry}
                    onChange={(e) => setSelectedIndustry(e.target.value)}
                    className="py-4"
                  >
                    <option value="all">모든 업종</option>
                    {industries.map((industry) => (
                      <option key={industry} value={industry}>{industry}</option>
                    ))}
                  </GlassSelect>

                  <GlassSelect
                    value={selectedSize}
                    onChange={(e) => setSelectedSize(e.target.value)}
                    className="py-4"
                  >
                    <option value="all">모든 규모</option>
                    {sizes.map((size) => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </GlassSelect>
                </div>
              </div>

              {/* Results Count */}
              <div className="mt-6 pt-6 border-t border-ink-100 flex items-center gap-2">
                <FunnelIcon className="w-5 h-5 text-azure-500" />
                <p className="text-ink-500">
                  총 <span className="font-semibold text-azure-600">{filteredCompanies.length}개</span>의 기업이 있습니다.
                </p>
              </div>
            </GlassCard>
          </div>

          {filteredCompanies.length === 0 ? (
            <ScrollReveal>
              <GlassCard className="text-center py-20 px-6">
                <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-azure-50 border border-azure-100 flex items-center justify-center text-azure-400 shadow-glass-sm">
                  <BuildingOfficeIcon className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-semibold text-ink-900 mb-2">검색 결과가 없습니다</h3>
                <p className="text-ink-500">다른 검색어나 필터를 시도해보세요.</p>
              </GlassCard>
            </ScrollReveal>
          ) : (
            // 마운트 기반 animate: 필터로 다시 추가되는 카드도 즉시 나타남
            // (whileInView+once는 재추가 카드를 opacity:0에 가둬 필터가 걸린 것처럼 보이는 버그였음)
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 xl:gap-7"
              variants={reduceMotion ? undefined : staggerContainer()}
              initial={reduceMotion ? false : 'hidden'}
              animate={reduceMotion ? false : 'show'}
            >
              {filteredCompanies.map((company) => (
                <motion.div key={company.id} variants={reduceMotion ? undefined : fadeUp}>
                  <GlassCard hover className="group h-full flex flex-col overflow-hidden">
                    {/* Company Header */}
                    <div className="p-6 border-b border-ink-100">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-azure-400 to-azure-600 flex items-center justify-center shadow-glow shrink-0">
                            <BuildingOfficeIconSolid className="w-8 h-8 text-white" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-xl font-bold text-ink-900 group-hover:text-azure-600 transition-colors break-keep">
                              {company.company.name}
                            </h3>
                            <p className="text-sm text-ink-500 mt-1">{company.company.industry}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          {company.approvalStatus === 'approved' && (
                            <Badge tone="mint" icon={<CheckBadgeIcon className="w-4 h-4" />}>
                              인증
                            </Badge>
                          )}
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleFavoriteToggle(company.id);
                            }}
                            disabled={favoriteLoading === company.id}
                            className={`p-2 rounded-full transition-all duration-200 border ${
                              favoriteCompanies.includes(company.id)
                                ? 'bg-coral-100/70 border-coral-400/40 text-coral-500 hover:bg-coral-100'
                                : 'bg-white/60 border-white/70 text-ink-400 hover:text-coral-500 hover:bg-white/90'
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
                        <div className="flex items-center text-ink-500">
                          <UserIcon className="w-4 h-4 mr-2 text-azure-400 shrink-0" />
                          {company.company.ceoName}
                        </div>
                        <div className="flex items-center text-ink-500">
                          <UserGroupIcon className="w-4 h-4 mr-2 text-azure-400 shrink-0" />
                          {company.company.size}
                        </div>
                        <div className="flex items-center text-ink-500 col-span-2">
                          <MapPinIcon className="w-4 h-4 mr-2 text-azure-400 shrink-0" />
                          {company.company.location}
                        </div>
                      </div>
                    </div>

                    {/* Company Description */}
                    <div className="p-6 flex-1 flex flex-col">
                      <p className="text-ink-700 text-sm leading-relaxed mb-4 line-clamp-3">
                        {company.company.description}
                      </p>

                      {/* Attraction Tags */}
                      {getAttractionTags(company.company.companyAttraction).length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {getAttractionTags(company.company.companyAttraction).slice(0, 3).map((tag, i) => (
                            <Badge key={i} tone="azure">
                              {tag}
                            </Badge>
                          ))}
                          {getAttractionTags(company.company.companyAttraction).length > 3 && (
                            <Badge tone="neutral">
                              +{getAttractionTags(company.company.companyAttraction).length - 3}
                            </Badge>
                          )}
                        </div>
                      )}

                      {/* Company Info */}
                      <div className="space-y-2 text-sm mt-auto">
                        {company.company.companyAttraction.workingHours && (
                          <div className="flex items-center text-ink-500">
                            <ClockIcon className="w-4 h-4 mr-2 text-azure-400 shrink-0" />
                            {company.company.companyAttraction.workingHours}
                          </div>
                        )}
                        {company.company.companyAttraction.averageSalary && (
                          <div className="flex items-center text-ink-500">
                            <BriefcaseIcon className="w-4 h-4 mr-2 text-azure-400 shrink-0" />
                            평균 연봉: {company.company.companyAttraction.averageSalary}
                          </div>
                        )}
                        {company.company.website && (
                          <div className="flex items-center text-ink-500">
                            <GlobeAltIcon className="w-4 h-4 mr-2 text-azure-400 shrink-0" />
                            <a
                              href={formatWebsiteUrl(company.company.website)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-azure-600 hover:text-azure-700 transition-colors font-medium"
                            >
                              기업 웹사이트
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="px-6 pb-6">
                      <GlassButton href={`/companies/${company.id}`} className="w-full">
                        기업 상세보기
                      </GlassButton>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* Login Modal */}
      <AnimatePresence>
        {showLoginModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-ink-900/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowLoginModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="glass-strong rounded-4xl p-8 max-w-md w-full shadow-glass-lg"
            >
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-azure-50 border border-azure-100 flex items-center justify-center text-azure-400 shadow-glass-sm">
                  <HeartIcon className="w-10 h-10" />
                </div>
                <h3 className="font-display text-2xl font-bold text-ink-900 mb-4 tracking-tight">로그인이 필요합니다</h3>
                <p className="text-ink-500 mb-7 leading-relaxed">
                  관심 기업을 등록하려면 구직자로 로그인해주세요.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <GlassButton href="/auth" className="flex-1">
                    로그인 / 회원가입
                  </GlassButton>
                  <GlassButton
                    variant="secondary"
                    onClick={() => setShowLoginModal(false)}
                    className="flex-1"
                  >
                    취소
                  </GlassButton>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="relative bg-ink-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-azure-aurora opacity-25" />
        <div className="relative container-wide py-20">
          <div className="grid md:grid-cols-4 gap-12">
            <div>
              <div className="flex items-center gap-3 mb-7">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-glass p-1">
                  <img
                    src="/images/logo.png"
                    alt="면접심사 매칭 플랫폼 Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="text-2xl font-bold">면접심사 매칭 플랫폼</span>
              </div>
              <p className="text-ink-300 text-lg leading-relaxed">
                서울시 중소기업과 모든 직군의 전문 인재를 연결하는 구직자·구인기업 면접심사 매칭 플랫폼
              </p>
            </div>

            <div>
              <h3 className="font-bold mb-6 text-lg text-white">서비스</h3>
              <ul className="space-y-3 text-ink-300">
                <li><Link href="/portfolios" className="hover:text-azure-300 transition-colors text-lg">포트폴리오</Link></li>
                <li><Link href="/companies" className="hover:text-azure-300 transition-colors text-lg">기업정보</Link></li>
                <li><span className="text-ink-400 text-lg cursor-not-allowed">AI 매칭 (준비중)</span></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold mb-6 text-lg text-white">지원</h3>
              <ul className="space-y-3 text-ink-300">
                <li><Link href="/help" className="hover:text-azure-300 transition-colors text-lg">도움말</Link></li>
                <li><Link href="/contact" className="hover:text-azure-300 transition-colors text-lg">문의하기</Link></li>
                <li><Link href="/faq" className="hover:text-azure-300 transition-colors text-lg">FAQ</Link></li>
                <li><Link href="/privacy" className="hover:text-azure-300 transition-colors text-lg">개인정보처리방침</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold mb-6 text-lg text-white">연락처</h3>
              <div className="text-ink-300 space-y-3 text-lg">
                <p>이메일: tvs@techventure.co.kr</p>
                <p>전화: 010-2734-8624</p>
                <p>담당: 조지형 사무국장</p>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 mt-16 pt-10 text-center text-ink-400 text-lg">
            <p>&copy; 2025 면접심사 매칭 플랫폼. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}