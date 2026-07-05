'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getEmployerById, addToFavorites, removeFromFavorites, isFavoriteCompany, getUserData } from '@/lib/auth';
import { motion, AnimatePresence } from 'framer-motion';
import Navigation from '@/components/Navigation';
import { GlassButton } from '@/components/ui/GlassButton';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/Badge';
import { AuroraBackground } from '@/components/ui/AuroraBackground';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
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
  SparklesIcon
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
        if (!params?.id || typeof params.id !== 'string') {
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
  }, [params?.id, user]);

  const getAttractionFeatures = (attraction: any) => {
    const features = [];
    if (attraction.remoteWork) features.push({ icon: HomeIcon, label: '재택근무 가능' });
    if (attraction.growthOpportunity) features.push({ icon: TrophyIcon, label: '높은 성장 기회' });
    if (attraction.stockOptions) features.push({ icon: CurrencyDollarIcon, label: '스톡옵션 제공' });
    if (attraction.trainingSupport) features.push({ icon: AcademicCapIcon, label: '교육비 지원' });
    if (attraction.familyFriendly) features.push({ icon: HeartIcon, label: '가족친화 기업' });
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

    if (!params?.id || typeof params.id !== 'string') return;

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
      <div className="min-h-screen bg-azure-aurora pt-24">
        <div className="container-wide">
          <div className="flex justify-center items-center py-32">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-azure-200 border-t-azure-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="relative min-h-screen bg-azure-aurora pt-24 overflow-hidden">
        <AuroraBackground />
        <div className="relative z-10 container-wide">
          <div className="flex justify-center py-28">
            <GlassCard strong className="max-w-lg w-full px-10 py-14 text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-azure-50 border border-azure-100 flex items-center justify-center text-azure-500 shadow-glass-sm">
                <BuildingOfficeIcon className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-semibold text-ink-900 mb-6">{error}</h3>
              <GlassButton href="/companies" variant="secondary" size="md">
                <ArrowLeftIcon className="w-5 h-5" />
                기업 목록으로 돌아가기
              </GlassButton>
            </GlassCard>
          </div>
        </div>
      </div>
    );
  }

  const attractionFeatures = getAttractionFeatures(company.company.companyAttraction);

  return (
    <div className="min-h-screen bg-azure-aurora overflow-x-clip">
      <Navigation />

      {/* Company Hero Section */}
      <section className="relative pt-28 pb-16 lg:pt-32 lg:pb-20 overflow-hidden">
        <AuroraBackground variant="vivid" />
        <div className="relative z-10 container-wide">
          <ScrollReveal>
            <GlassCard strong className="p-8 lg:p-14">
              {/* Company Header */}
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-10">
                <div className="flex items-center gap-6 mb-6 lg:mb-0">
                  <div className="w-24 h-24 shrink-0 rounded-4xl bg-gradient-to-br from-azure-400 to-azure-600 flex items-center justify-center shadow-glow">
                    <BuildingOfficeIconSolid className="w-12 h-12 text-white" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <h1 className="font-display font-bold text-3xl md:text-4xl lg:text-5xl tracking-tight text-ink-900">{company.company.name}</h1>
                      {company.approvalStatus === 'approved' && (
                        <Badge tone="mint" icon={<CheckBadgeIcon className="w-4 h-4" />}>
                          면접심사 매칭 플랫폼 참여
                        </Badge>
                      )}
                    </div>
                    <p className="text-lg md:text-xl text-ink-700 font-medium mb-1">{company.company.industry}</p>
                    <p className="text-ink-500">{company.company.businessType}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  {company.company.website && (
                    <GlassButton
                      href={formatWebsiteUrl(company.company.website)}
                      target="_blank"
                      rel="noopener noreferrer"
                      variant="secondary"
                      size="md"
                    >
                      <GlobeAltIcon className="w-5 h-5" />
                      웹사이트 방문
                    </GlassButton>
                  )}
                  <GlassButton
                    onClick={handleFavoriteToggle}
                    disabled={favoriteLoading}
                    variant={isFavorite ? 'outline' : 'primary'}
                    size="md"
                  >
                    {favoriteLoading ? (
                      <div className="w-5 h-5 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                    ) : (
                      isFavorite ? (
                        <HeartIconSolid className="w-5 h-5 text-coral-500" />
                      ) : (
                        <HeartIcon className="w-5 h-5" />
                      )
                    )}
                    {isFavorite ? '관심기업 해제' : '관심기업 등록'}
                  </GlassButton>
                </div>
              </div>

              {/* Quick Info */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { Icon: UserIcon, label: '대표이사', value: company.company.ceoName },
                  { Icon: UserGroupIcon, label: '기업규모', value: company.company.size },
                  { Icon: MapPinIcon, label: '위치', value: company.company.location },
                  { Icon: ClockIcon, label: '근무시간', value: company.company.companyAttraction.workingHours || '협의' },
                ].map(({ Icon, label, value }) => (
                  <div key={label} className="glass rounded-3xl p-5 text-center">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-azure-50 border border-azure-100 flex items-center justify-center text-azure-600">
                      <Icon className="w-6 h-6" />
                    </div>
                    <p className="text-sm text-ink-500">{label}</p>
                    <p className="font-semibold text-ink-900 mt-0.5">{value}</p>
                  </div>
                ))}
              </div>
            </GlassCard>
          </ScrollReveal>
        </div>
      </section>

      {/* Back to Companies Button */}
      <section className="pb-8">
        <div className="container-wide">
          <div className="text-center">
            <GlassButton href="/companies" variant="ghost" size="md">
              <ArrowLeftIcon className="w-5 h-5" />
              기업 목록으로 돌아가기
            </GlassButton>
          </div>
        </div>
      </section>

      {/* Company Details */}
      <section className="relative pb-24 overflow-hidden">
        <AuroraBackground />
        <div className="relative z-10 container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-8 space-y-8">
              {/* Company Description */}
              <ScrollReveal delay={0.05}>
                <GlassCard className="p-8 lg:p-10">
                  <h2 className="font-display font-bold text-2xl md:text-3xl tracking-tight text-ink-900 mb-6 flex items-center gap-3">
                    <span className="w-11 h-11 rounded-2xl bg-azure-50 border border-azure-100 flex items-center justify-center text-azure-600 shrink-0">
                      <SparklesIcon className="w-6 h-6" />
                    </span>
                    기업 소개
                  </h2>
                  <p className="text-ink-700 leading-relaxed text-base md:text-lg whitespace-pre-line">
                    {company.company.description}
                  </p>
                </GlassCard>
              </ScrollReveal>

              {/* Company Attractions */}
              <ScrollReveal delay={0.1}>
                <GlassCard className="p-8 lg:p-10">
                  <h2 className="font-display font-bold text-2xl md:text-3xl tracking-tight text-ink-900 mb-8 flex items-center gap-3">
                    <span className="w-11 h-11 rounded-2xl bg-azure-50 border border-azure-100 flex items-center justify-center text-azure-600 shrink-0">
                      <StarIcon className="w-6 h-6" />
                    </span>
                    우리 회사의 매력
                  </h2>

                  {/* Attraction Features */}
                  {attractionFeatures.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      {attractionFeatures.map((feature, index) => {
                        const IconComponent = feature.icon;
                        return (
                          <div key={index} className="flex items-center gap-3 glass rounded-2xl p-4">
                            <span className="w-10 h-10 rounded-xl bg-azure-50 border border-azure-100 flex items-center justify-center text-azure-600 shrink-0">
                              <IconComponent className="w-5 h-5" />
                            </span>
                            <span className="font-semibold text-ink-800">{feature.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Salary Information */}
                  {company.company.companyAttraction.averageSalary && (
                    <div className="glass rounded-3xl p-6 mb-6">
                      <h3 className="font-semibold text-lg text-ink-900 mb-2 flex items-center gap-2">
                        <CurrencyDollarIcon className="w-5 h-5 text-azure-600" />
                        평균 연봉 수준
                      </h3>
                      <p className="text-ink-700">{company.company.companyAttraction.averageSalary}</p>
                    </div>
                  )}

                  {/* Benefits */}
                  {company.company.companyAttraction.benefits.length > 0 && (
                    <div className="glass rounded-3xl p-6 mb-6">
                      <h3 className="font-semibold text-lg text-ink-900 mb-4 flex items-center gap-2">
                        <StarIcon className="w-5 h-5 text-azure-600" />
                        복리후생
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {company.company.companyAttraction.benefits.map((benefit, index) => (
                          <Badge key={index} tone="azure">
                            {benefit}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Additional Info */}
                  {company.company.companyAttraction.etc && (
                    <div className="glass-faint rounded-3xl p-6 border border-ink-100">
                      <h3 className="font-semibold text-lg text-ink-900 mb-2">기타 정보</h3>
                      <p className="text-ink-700">{company.company.companyAttraction.etc}</p>
                    </div>
                  )}
                </GlassCard>
              </ScrollReveal>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-4 space-y-8">
              {/* Contact Info */}
              <ScrollReveal delay={0.15}>
                <GlassCard strong className="p-8 sticky top-28">
                  <h3 className="font-display font-bold text-xl md:text-2xl tracking-tight text-ink-900 mb-6">기업 정보</h3>

                  <div className="space-y-5">
                    <div className="flex items-start gap-3">
                      <BuildingOfficeIcon className="w-5 h-5 text-azure-500 mt-1 shrink-0" />
                      <div>
                        <p className="text-sm text-ink-500">기업명</p>
                        <p className="font-semibold text-ink-900">{company.company.name}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <UserIcon className="w-5 h-5 text-azure-500 mt-1 shrink-0" />
                      <div>
                        <p className="text-sm text-ink-500">대표이사</p>
                        <p className="font-semibold text-ink-900">{company.company.ceoName}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <BriefcaseIcon className="w-5 h-5 text-azure-500 mt-1 shrink-0" />
                      <div>
                        <p className="text-sm text-ink-500">업종</p>
                        <p className="font-semibold text-ink-900">{company.company.industry}</p>
                        <p className="text-sm text-ink-500">{company.company.businessType}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <UserGroupIcon className="w-5 h-5 text-azure-500 mt-1 shrink-0" />
                      <div>
                        <p className="text-sm text-ink-500">기업규모</p>
                        <p className="font-semibold text-ink-900">{company.company.size}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <MapPinIcon className="w-5 h-5 text-azure-500 mt-1 shrink-0" />
                      <div>
                        <p className="text-sm text-ink-500">주소</p>
                        <p className="font-semibold text-ink-900">{company.company.location}</p>
                      </div>
                    </div>

                    {company.company.website && (
                      <div className="flex items-start gap-3">
                        <GlobeAltIcon className="w-5 h-5 text-azure-500 mt-1 shrink-0" />
                        <div>
                          <p className="text-sm text-ink-500">웹사이트</p>
                          <a
                            href={formatWebsiteUrl(company.company.website)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-azure-600 hover:text-azure-700 transition-colors"
                          >
                            바로가기
                          </a>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-8 space-y-3">
                    <GlassButton
                      onClick={handleFavoriteToggle}
                      disabled={favoriteLoading}
                      variant={isFavorite ? 'outline' : 'secondary'}
                      size="md"
                      className="w-full"
                    >
                      {favoriteLoading ? (
                        <div className="w-5 h-5 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                      ) : (
                        isFavorite ? '관심기업 해제' : '관심기업 등록'
                      )}
                    </GlassButton>
                  </div>
                </GlassCard>
              </ScrollReveal>
            </div>
          </div>
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
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 12 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="glass-strong rounded-4xl shadow-glass-lg p-8 max-w-md w-full"
            >
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-5 rounded-3xl bg-azure-50 border border-azure-100 flex items-center justify-center text-azure-500">
                  <HeartIcon className="w-10 h-10" />
                </div>
                <h3 className="font-display font-bold text-2xl tracking-tight text-ink-900 mb-3">로그인이 필요합니다</h3>
                <p className="text-ink-500 mb-7 leading-relaxed">
                  관심 기업을 등록하려면 구직자로 로그인해주세요.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <GlassButton href="/auth" size="md" className="flex-1">
                    로그인 / 회원가입
                  </GlassButton>
                  <GlassButton
                    onClick={() => setShowLoginModal(false)}
                    variant="secondary"
                    size="md"
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
      <footer className="relative mt-10 bg-ink-900 text-white overflow-hidden">
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
