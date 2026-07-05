'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  useMotionValue,
  useSpring,
} from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { logOut, getUserData, getJobSeekerProfile, getPortfolio } from '@/lib/auth';
import { usePlatformStats } from '@/lib/usePlatformStats';
import { useRouter } from 'next/navigation';
import { calculateProfileCompletion, ProfileCompletionResult } from '@/lib/profileCompletion';
import { JobSeekerProfile } from '@/types';
import {
  BriefcaseIcon,
  UserGroupIcon,
  ChartBarIcon,
  ArrowRightIcon,
  UserIcon,
  Cog6ToothIcon,
  BuildingOfficeIcon,
  ClockIcon,
  SparklesIcon,
  PencilSquareIcon,
} from '@heroicons/react/24/outline';
import {
  CheckCircleIcon,
  StarIcon,
  BuildingOfficeIcon as BuildingOfficeIconSolid,
} from '@heroicons/react/24/solid';
import { ArrowUpRight, PlayCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import TutorialOverlay from '@/components/TutorialOverlay';
import { GlassButton } from '@/components/ui/GlassButton';
import { GlassCard } from '@/components/ui/GlassCard';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { AuroraBackground } from '@/components/ui/AuroraBackground';
import { ScrollReveal, ScrollRevealStagger, ScrollRevealItem } from '@/components/ui/ScrollReveal';
import { PORTFOLIO_PROGRAMS } from '@/lib/programs';

const EASE = [0.22, 1, 0.36, 1] as const;
const HERO_SKILLS = ['React', 'TypeScript', 'Figma', 'Next.js', 'Node'];

const LANDING_ASSETS = {
  hero: '/images/landing/hero-talent-network.png',
  process: '/images/landing/process-journey-map.png',
  features: '/images/landing/feature-glass-stack.png',
  capability: '/images/landing/capability-dashboard.png',
  aiWorkbench: '/images/landing/ai-workbench.png',
  cta: '/images/landing/cta-connection-bridge.png',
} as const;

function DecorativeImage({
  src,
  className = 'inset-0',
  imageClassName = 'object-cover',
  objectPosition = 'center',
  priority = false,
  sizes = '100vw',
  maskImage,
}: {
  src: string;
  className?: string;
  imageClassName?: string;
  objectPosition?: string;
  priority?: boolean;
  sizes?: string;
  /** 가장자리를 부드럽게 페이드시켜 사각 경계선이 드러나지 않게 하는 CSS mask */
  maskImage?: string;
}) {
  return (
    <div aria-hidden="true" className={`pointer-events-none absolute ${className}`}>
      <Image
        src={src}
        alt=""
        fill
        priority={priority}
        sizes={sizes}
        className={imageClassName}
        style={{
          objectPosition,
          ...(maskImage ? { maskImage, WebkitMaskImage: maskImage } : {}),
        }}
      />
    </div>
  );
}



/* ── Glass stat card ── */
function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="hover-lift flex h-full min-h-[7rem] flex-col justify-between rounded-4xl border border-white/60 bg-white/55 p-5 shadow-glass backdrop-blur-xl">
      <p className="font-display text-4xl lg:text-5xl font-bold tabular-nums tracking-[-0.03em] leading-none text-ink-900">
        {value}
      </p>
      <p className="mt-3 text-sm font-medium text-ink-500">{label}</p>
    </div>
  );
}

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'jobseeker' | 'employer'>('employer');
  const { isAuthenticated, user, userData, loading } = useAuth();
  const { companyCount, portfolioCount, industryCount, loading: statsLoading } = usePlatformStats();
  const router = useRouter();
  const [userRole, setUserRole] = useState<'jobseeker' | 'employer' | 'admin' | null>(null);
  const [profileCompletion, setProfileCompletion] = useState<ProfileCompletionResult | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  const reduce = useReducedMotion();
  const heroRef = useRef<HTMLElement | null>(null);
  const { scrollYProgress: heroScroll } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const auroraY = useTransform(heroScroll, [0, 1], ['0%', '22%']);
  const heroFade = useTransform(heroScroll, [0, 0.7], [1, 0]);
  const heroLift = useTransform(heroScroll, [0, 1], ['0%', '-6%']);
  const indicatorRaw = useTransform(heroScroll, [0, 0.15], [1, 0]);
  const indicatorOpacity = useSpring(indicatorRaw, { stiffness: 140, damping: 24, mass: 0.4 });


  // 새 기업 회원가입 시 강제 새로고침 처리
  useEffect(() => {
    const newEmployerSignup = localStorage.getItem('newEmployerSignup');
    if (newEmployerSignup === 'true') {
      // 플래그 제거
      localStorage.removeItem('newEmployerSignup');

      // 강제 새로고침 실행
      window.location.reload();
    }
  }, []);

  useEffect(() => {
    const checkUserRole = async () => {
      // loading이 완료되고 user가 있을 때만 체크
      if (!loading && user) {
        if (userData) {
          setUserRole(userData.role);

          // 기업 사용자이고 첫 로그인이거나 설정을 완료하지 않은 경우 튜토리얼 표시
          if (userData.role === 'employer' &&
              (userData.isFirstLogin || !userData.hasCompletedSetup)) {
            setShowTutorial(true);
          } else {
            setShowTutorial(false);
          }
        }
      } else if (!loading && !user) {
        // 로그인하지 않은 경우
        setUserRole(null);
        setShowTutorial(false);
      }
    };

    checkUserRole();
  }, [user, userData, loading]);

  // 구직자 프로필 완성도 가져오기
  useEffect(() => {
    const fetchProfileCompletion = async () => {
      if (user && userData?.role === 'jobseeker') {
        console.log('🏠 메인 페이지: 프로필 완성도 계산 시작');
        setProfileLoading(true);
        try {
          const [profile, portfolio] = await Promise.all([
            getJobSeekerProfile(user.uid),
            getPortfolio(user.uid)
          ]);

          console.log('🏠 메인 페이지: 가져온 데이터');
          console.log('   - profile:', profile);
          console.log('   - profile.profile:', profile?.profile);
          console.log('   - profile.profile.skills:', profile?.profile?.skills);
          console.log('   - profile.profile.languages:', profile?.profile?.languages);
          console.log('   - portfolio:', portfolio);

          // 프로필 페이지와 동일한 방식으로 데이터 변환
          const profileData = profile?.profile ? {
            ...profile.profile,
            // 배열이 아닌 경우 빈 배열로 초기화
            skills: Array.isArray(profile.profile.skills) ? profile.profile.skills : [],
            languages: Array.isArray(profile.profile.languages) ? profile.profile.languages : [],
            experience: Array.isArray(profile.profile.experience) ? profile.profile.experience : [],
            education: Array.isArray(profile.profile.education) ? profile.profile.education : []
          } : null;

          console.log('🏠 메인 페이지: 변환된 profileData:', profileData);

          const completion = calculateProfileCompletion(
            profileData,
            !!portfolio
          );
          console.log('🏠 메인 페이지: 계산된 완성도:', completion);
          setProfileCompletion(completion);
        } catch (error) {
          console.error('프로필 완성도 계산 오류:', error);
        } finally {
          setProfileLoading(false);
        }
      }
    };

    fetchProfileCompletion();
  }, [user, userData]);

  const handleTutorialComplete = () => {
    setShowTutorial(false);
  };

  const features = [
    {
      title: '자기소개 영상',
      description: '교육생 1분 자기소개 영상으로 인재의 역량과 개성을 확인하세요',
      icon: ({ className }: { className?: string }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      title: '다국적 인재',
      description: '귀사에서 필요로 하는 다양한 국가의 우수 인재들이 참가합니다',
      icon: ({ className }: { className?: string }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      title: '이력서 & 포트폴리오',
      description: '이력서와 자소서, 개별 포트폴리오까지 한눈에 확인 가능합니다',
      icon: ({ className }: { className?: string }) => (
        <BriefcaseIcon className={className} />
      ),
    },
  ];

  // ── 프로세스 단계 (정적 콘텐츠) ──
  const VideoIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  );
  const DocIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
  const TeamIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  );

  const employerSteps = [
    { num: '01', title: '자기소개 영상 확인', desc: ['참가자들의 1분 자기소개 영상을 확인하고', '귀사에 맞는 인재들을 선별하세요'], bullets: ['전체 영상 한번에 확인', '인재 스크리닝 완료'], Icon: VideoIcon },
    { num: '02', title: '포트폴리오 확인', desc: ['상단의 포트폴리오 버튼을 눌러서', '지원자의 상세 포트폴리오를 확인하세요'], bullets: ['실무 프로젝트 확인', '스킬셋 검증'], Icon: BriefcaseIcon },
    { num: '03', title: '채용 신청서 작성', desc: ['선별된 인재에게 채용 신청서를', '작성하여 전송하세요'], bullets: ['간편한 신청서 양식', '마감: 6월 19일'], Icon: DocIcon },
    { num: '04', title: '인턴 매칭', desc: ['6월 20일에 기업별로', '면접 안내를 드립니다'], bullets: ['면접 일정 자동 배정', '최종 매칭 완료'], Icon: UserGroupIcon },
  ];
  const jobseekerSteps = [
    { num: '01', title: '포트폴리오 & 영상 제작', desc: ['전문적인 포트폴리오와', '1분 자기소개 영상을 제작하세요'], bullets: ['포트폴리오 템플릿 제공', '영상 가이드라인 제공'], Icon: BriefcaseIcon },
    { num: '02', title: '플랫폼 등록', desc: ['플랫폼에 프로필을 등록하고', '포트폴리오를 업로드하세요'], bullets: ['프로필 검증 완료', '포트폴리오 공개'], Icon: UserIcon },
    { num: '03', title: '기업 매칭 대기', desc: ['기업들이 포트폴리오를 확인하고', '채용 신청을 할 때까지 대기하세요'], bullets: ['실시간 관심 기업 알림', '매칭 현황 확인'], Icon: ClockIcon },
    { num: '04', title: '면접 & 최종 선발', desc: ['6월 20일 면접 안내를 받고', '최종 선발 과정을 진행하세요'], bullets: ['면접 일정 안내', '인턴십 기회 확정'], Icon: TeamIcon },
  ];
  const steps = activeTab === 'employer' ? employerSteps : jobseekerSteps;

  const aiToolGroups = [
    {
      category: '텍스트 기반 콘텐츠',
      tools: [
        { name: 'ChatGPT', items: ['블로그 글, 기사, 소셜 미디어 포스트', '이메일 뉴스레터, 광고 문구', '다양한 텍스트 콘텐츠 작성'] },
        { name: '딥시크', items: ['데이터 기반 리포트, 분석 자료', '자동 요약, 전문 문서', '정밀성 콘텐츠 제작'] },
      ],
    },
    {
      category: '이미지 기반 콘텐츠',
      tools: [
        { name: '달리 (DALL-E)', items: ['SNS 포스트, 광고 배너, 일러스트', '포스터, 제품 디자인 목업', '창의적인 이미지 제작'] },
        { name: '캔바 (Canva)', items: ['인포그래픽, 프레젠테이션 슬라이드', 'SNS 이미지, 브로셔, 초대장', '디자인 작업 전반'] },
      ],
    },
    {
      category: '프레젠테이션 콘텐츠',
      tools: [
        { name: '감마', items: ['비즈니스 프레젠테이션, 제품 소개', '투자 제안서, 교육 자료', '슬라이드 콘텐츠 제작'] },
        { name: '기타 전문 도구', items: ['Figma, Adobe Creative Suite', 'Notion, Miro, Slack 협업 도구', 'Google Workspace, Microsoft 365'] },
      ],
    },
  ];

  return (
    <div className="min-h-screen pt-16 -mt-16 overflow-x-clip">

      {/* ════════════════════════ HERO — Wide & Spacious Redesign ════════════════════════ */}
      <section id="hero" ref={heroRef} className="relative flex flex-col overflow-hidden pt-12 pb-10 md:pt-14 lg:min-h-[calc(100svh-4rem)] lg:justify-center lg:pt-6 lg:pb-10">
        {/* ambient aurora canvas (no stock photo) */}
        <motion.div aria-hidden style={reduce ? undefined : { y: auroraY }} className="pointer-events-none absolute inset-0 -z-10">
          <DecorativeImage
            src={LANDING_ASSETS.hero}
            priority
            imageClassName="object-cover opacity-80"
            objectPosition="center"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/45 via-white/30 to-azure-50/45" />
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(circle at 50% 47%, rgba(255,255,255,0.88) 0%, rgba(255,255,255,0.70) 26%, rgba(240,247,255,0.20) 58%, rgba(240,247,255,0) 76%)',
            }}
          />
          <div className="absolute inset-0 bg-azure-aurora" />
          <div className="absolute -top-40 -left-32 h-[45rem] w-[45rem] rounded-full bg-azure-300/35 blur-3xl animate-float-slow" />
          <div className="absolute top-24 right-[-10rem] h-[40rem] w-[40rem] rounded-full bg-sky-cool-300/35 blur-3xl animate-float-slower" />
          <div className="absolute bottom-[-12rem] left-1/4 h-[42rem] w-[42rem] rounded-full bg-azure-200/35 blur-3xl animate-float-slow" />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                'linear-gradient(to right, #1B4A89 1px, transparent 1px), linear-gradient(to bottom, #1B4A89 1px, transparent 1px)',
              backgroundSize: '96px 96px',
            }}
          />
        </motion.div>

        {/* Expansive wide container */}
        <div className="max-w-[1400px] w-full mx-auto px-6 sm:px-10 lg:px-16">
          <motion.div style={reduce ? undefined : { opacity: heroFade, y: heroLift }} className="flex flex-col items-center text-center gap-6 lg:gap-7 w-full">
            
            {/* ── TOP ROW: Center Aligned Text & CTAs ── */}
            <div className="flex flex-col items-center w-full max-w-4xl mx-auto">
              <motion.h1
                initial={false}
                animate={reduce ? {} : { opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: EASE, delay: 0.08 }}
                className="mt-4 sm:mt-5 font-sans font-extrabold tracking-[-0.045em] leading-[1.04] text-ink-900 text-3xl min-[390px]:text-[2.35rem] sm:text-5xl lg:text-[3.4rem] xl:text-[4.1rem]"
              >
                준비된 인재와
                <br />
                <span className="relative inline-block my-2 sm:ml-4">
                  <span className="text-gradient-azure">우수한 기업</span>
                  <motion.svg aria-hidden viewBox="0 0 300 24" className="absolute -bottom-2 left-0 h-3.5 w-full overflow-visible" preserveAspectRatio="none">
                    <motion.path
                      d="M4 16 C 70 6, 150 6, 296 14"
                      fill="none"
                      stroke="url(#swoosh-hero)"
                      strokeWidth="5"
                      strokeLinecap="round"
                      initial={reduce ? false : { pathLength: 0 }}
                      animate={reduce ? {} : { pathLength: 1 }}
                      transition={{ duration: 1, ease: EASE, delay: 0.55 }}
                    />
                    <defs>
                      <linearGradient id="swoosh-hero" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#3B8AF0" />
                        <stop offset="100%" stopColor="#5EA8FB" />
                      </linearGradient>
                    </defs>
                  </motion.svg>
                </span>
                <span className="sm:hidden">을</span>
                <br className="sm:hidden" />
                <span className="hidden sm:inline">을 </span>연결합니다
              </motion.h1>

              <motion.p
                initial={false}
                animate={reduce ? {} : { opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: EASE, delay: 0.18 }}
                className="mx-auto mt-4 max-w-[20.5rem] text-sm font-medium leading-relaxed text-ink-500 sm:max-w-2xl sm:text-lg lg:text-xl"
              >
                서울시 민간기업 참여형 매력일자리 사업
                <br className="hidden sm:block" />
                <span className="font-semibold text-ink-700"> 구직자 · 구인기업 면접심사 매칭 플랫폼</span>
              </motion.p>

              {/* CTAs */}
              <motion.div
                initial={false}
                animate={reduce ? {} : { opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: EASE, delay: 0.26 }}
                className="mt-5 lg:mt-6 flex w-full max-w-[19rem] flex-col items-stretch justify-center gap-3.5 sm:max-w-none sm:flex-row sm:flex-wrap sm:items-center"
              >
                {isAuthenticated && userRole === 'employer' ? (
                  <>
                    <GlassButton href="/employer-dashboard" size="lg" className="group">
                      <BuildingOfficeIcon className="h-5 w-5" />
                      기업 대시보드
                      <ArrowUpRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </GlassButton>
                    <GlassButton href="/portfolios" variant="secondary" size="lg">
                      인재 검색
                      <UserGroupIcon className="h-5 w-5" />
                    </GlassButton>
                  </>
                ) : isAuthenticated && userRole === 'jobseeker' ? (
                  <>
                    <GlassButton href={`/portfolios/${user?.uid}`} size="lg" className="group">
                      내 포트폴리오
                      <ArrowUpRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </GlassButton>
                    <GlassButton href="/profile" variant="secondary" size="lg">
                      마이페이지
                      <UserIcon className="h-5 w-5" />
                    </GlassButton>
                  </>
                ) : (
                  <>
                    <GlassButton href="/auth?mode=signup&type=jobseeker" size="lg" className="group">
                      <UserIcon className="h-5 w-5" />
                      구직자로 시작하기
                      <ArrowUpRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </GlassButton>
                    <GlassButton href="/auth?mode=signup&type=employer" variant="secondary" size="lg" className="group">
                      <BuildingOfficeIcon className="h-5 w-5" />
                      구인기업으로 시작하기
                      <ArrowUpRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </GlassButton>
                  </>
                )}
              </motion.div>

              {/* Ultra-slim Profile Completion Banner (if jobseeker) */}
              {isAuthenticated && userRole === 'jobseeker' && profileCompletion && (
                <motion.div
                  initial={reduce ? false : { opacity: 0, y: 18 }}
                  animate={reduce ? {} : { opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, ease: EASE, delay: 0.3 }}
                  className="mt-4 w-full max-w-lg mx-auto"
                >
                  <div className="flex items-center gap-4 py-2.5 px-4 rounded-full bg-white/60 border border-azure-100/80 shadow-glass-sm backdrop-blur-md">
                    <SparklesIcon className="w-4 h-4 text-azure-500 shrink-0" />
                    <div className="flex-1 flex items-center gap-3">
                      <div className="text-[0.75rem] font-bold text-ink-800 shrink-0">프로필 완성도</div>
                      <div className="relative flex-1 h-1.5 bg-ink-100/80 rounded-full overflow-hidden">
                        <div 
                          className="absolute left-0 top-0 h-full bg-gradient-to-r from-azure-400 to-azure-600 rounded-full" 
                          style={{ width: `${profileCompletion.percentage}%` }} 
                        />
                      </div>
                      <div className="text-[0.75rem] font-bold text-azure-600 shrink-0 w-8 text-right">
                        {profileCompletion.percentage}%
                      </div>
                    </div>
                    {profileCompletion.percentage < 100 && (
                      <Link href="/profile" className="shrink-0 flex items-center gap-1 text-[0.7rem] font-bold text-ink-500 hover:text-azure-600 transition-colors pl-2 border-l border-ink-200">
                        완성하기
                        <ArrowUpRight className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
        {!reduce && (
          <motion.div
            aria-hidden
            style={{ opacity: indicatorOpacity }}
            className="pointer-events-none absolute inset-x-0 bottom-5 z-20 hidden lg:flex flex-col items-center gap-1.5 text-azure-600/80"
          >
            <span className="text-[0.6rem] font-bold uppercase tracking-[0.2em]">Scroll</span>
            <span className="relative flex h-7 w-[18px] items-start justify-center rounded-full border border-azure-400/60 bg-white/40 p-1 shadow-glass-sm backdrop-blur-sm">
              <motion.span
                className="h-1.5 w-1.5 rounded-full bg-azure-500"
                animate={{ y: [0, 8, 0], opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.6, ease: 'easeInOut', repeat: Infinity }}
              />
            </span>
          </motion.div>
        )}
      </section>

      {/* ====================== How It Works ====================== */}
      <section id="process" className="relative py-24 lg:py-36 overflow-hidden">
        <DecorativeImage
          src={LANDING_ASSETS.process}
          className="inset-x-0 top-0 h-full"
          imageClassName="object-cover opacity-45"
          objectPosition="center top"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-azure-50/80 to-white/95" />
        <AuroraBackground className="opacity-25" />
        <div className="relative z-10 container-wide">
          <SectionHeading
            eyebrow="검증된 매칭 시스템"
            title={
              <>
                성공적인 매칭을 위한
                <br />
                <span className="text-gradient-azure">스마트 프로세스</span>
              </>
            }
          />

          {/* Tab switcher */}
          <div className="flex justify-center mt-12 mb-16">
            <div className="relative glass-strong flex w-full max-w-[19rem] gap-1 rounded-3xl p-2 sm:w-auto sm:max-w-none">
              {(['employer', 'jobseeker'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`relative flex-1 rounded-2xl px-3 py-4 text-sm font-bold transition-colors duration-300 sm:flex-none sm:px-12 sm:py-5 sm:text-base lg:text-lg ${
                    activeTab === tab ? 'text-white' : 'text-ink-500 hover:text-ink-800'
                  }`}
                >
                  {activeTab === tab && (
                    <motion.span
                      layoutId="homeTabPill"
                      className="absolute inset-0 rounded-2xl bg-gradient-to-r from-azure-500 to-azure-600 shadow-glow"
                      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                    />
                  )}
                  <span className="relative flex items-center gap-2">
                    {tab === 'employer' ? <BuildingOfficeIcon className="w-5 h-5 sm:w-6 sm:h-6" /> : <UserGroupIcon className="w-5 h-5 sm:w-6 sm:h-6" />}
                    {tab === 'employer' ? '기업 여정' : '구직자 여정'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Process flow */}
          <ScrollRevealStagger className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {steps.map((step) => (
              <ScrollRevealItem key={step.num}>
                <GlassCard hover className="h-full p-8 pt-12 text-center">
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-12 h-12 rounded-2xl bg-gradient-to-br from-azure-500 to-azure-600 text-white font-display font-bold flex items-center justify-center shadow-glow">
                    {step.num}
                  </div>
                  <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-azure-50 border border-azure-100 flex items-center justify-center text-azure-600 shadow-glass-sm">
                    <step.Icon className="w-10 h-10" />
                  </div>
                  <h3 className="text-xl font-bold text-ink-900 mb-3">{step.title}</h3>
                  <p className="text-ink-500 text-sm leading-relaxed mb-6 text-pretty break-keep">
                    {step.desc[0]} {step.desc[1]}
                  </p>
                  <div className="space-y-2">
                    {step.bullets.map((b) => (
                      <div key={b} className="flex items-center justify-center gap-1.5 text-xs text-azure-600">
                        <CheckCircleIcon className="w-4 h-4" />
                        <span>{b}</span>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              </ScrollRevealItem>
            ))}
          </ScrollRevealStagger>

          {/* Bottom CTA */}
          <ScrollReveal className="mt-16 text-center">
            {!isAuthenticated ? (
              <GlassButton href="/auth" size="lg">
                {activeTab === 'employer' ? '기업 회원가입' : '무료로 시작하기'}
                <ArrowRightIcon className="w-5 h-5" />
              </GlassButton>
            ) : (
              <GlassButton
                href={userRole === 'employer' ? '/employer-dashboard' : userRole === 'jobseeker' ? '/profile' : '/profile'}
                size="lg"
              >
                {userRole === 'employer' ? '대시보드로 이동' : userRole === 'jobseeker' ? '포트폴리오 작성하기' : '마이페이지로 이동'}
                <ArrowRightIcon className="w-5 h-5" />
              </GlassButton>
            )}
            <p className="text-ink-400 text-sm mt-4">
              {!isAuthenticated
                ? activeTab === 'employer'
                  ? '면접심사 매칭 플랫폼'
                  : '지금 가입하면 포트폴리오 템플릿 무료 제공'
                : userRole === 'employer'
                ? '우수한 인재들을 발굴하고 채용하세요'
                : userRole === 'jobseeker'
                ? '나만의 포트폴리오를 만들어 취업 기회를 늘려보세요'
                : '서비스를 최대한 활용해보세요'}
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* ====================== Program & Business Benefits ====================== */}
      <section id="program-benefits" className="relative overflow-hidden py-24 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-azure-50/75 to-white" />
        <DecorativeImage
          src={LANDING_ASSETS.capability}
          className="inset-x-0 top-0 hidden h-[42rem] lg:block"
          imageClassName="object-cover opacity-30"
          objectPosition="center"
          sizes="100vw"
          maskImage="linear-gradient(to bottom, transparent 0%, #000 12%, #000 58%, transparent 100%)"
        />
        <div className="relative z-10 container-wide">
          <SectionHeading
            eyebrow="수요기업 참여 사업"
            title={
              <>
                교육을 마친 인재를 검토하고
                <br />
                <span className="text-gradient-azure">채용 초기 부담을 낮추세요</span>
              </>
            }
            subtitle="서울시 매력일자리 사업과 연계해 교육생 포트폴리오를 먼저 확인하고, 매칭 후 채용 초기 3개월 인건비 지원을 받을 수 있습니다."
          />

          <ScrollRevealStagger className="mt-14 grid gap-5 md:grid-cols-3">
            {[
              { title: '포트폴리오 선검토', desc: '수료생의 자기소개 영상, 프로젝트, 문서를 먼저 확인한 뒤 면접 희망자를 선택합니다.', Icon: BriefcaseIcon },
              { title: '인건비 지원', desc: '채용 연계 조건 충족 시 최대 3개월 인건비와 4대 보험 사업주 부담분을 지원받을 수 있습니다.', Icon: ChartBarIcon },
              { title: '과정별 매칭', desc: '내국인 AI 마케팅 과정과 외국인 유학생 글로벌 과정 중 기업 수요에 맞는 인재군을 선택합니다.', Icon: UserGroupIcon },
            ].map(({ title, desc, Icon }) => (
              <ScrollRevealItem key={title}>
                <GlassCard hover className="h-full p-6 md:p-7">
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-azure-100 bg-azure-50 text-azure-600 shadow-glass-sm">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-display text-xl font-bold tracking-tight text-ink-900">{title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-ink-500">{desc}</p>
                </GlassCard>
              </ScrollRevealItem>
            ))}
          </ScrollRevealStagger>

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            {PORTFOLIO_PROGRAMS.map((program) => (
              <ScrollReveal key={program.id}>
                <GlassCard className="h-full p-6 md:p-8">
                  <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="inline-flex items-center gap-2 rounded-full border border-azure-100 bg-azure-50 px-3 py-1 text-xs font-semibold text-azure-700">
                        {program.audience} · {program.hours}
                      </div>
                      <h3 className="mt-4 font-display text-2xl font-bold leading-tight tracking-tight text-ink-900">
                        {program.name}
                      </h3>
                      <p className="mt-3 text-sm leading-relaxed text-ink-500">{program.summary}</p>
                    </div>
                    <div className="shrink-0 rounded-3xl border border-white/70 bg-white/70 px-5 py-4 text-center shadow-glass-sm">
                      <div className="font-display text-2xl font-bold text-azure-700">{program.curriculum.length}</div>
                      <div className="text-xs font-semibold text-ink-400">커리큘럼 단계</div>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    {program.skills.slice(0, 4).map((skill) => (
                      <div key={skill.title} className="flex gap-3 rounded-2xl border border-white/70 bg-white/65 p-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-azure-50 text-lg">
                          {skill.icon}
                        </span>
                        <div>
                          <h4 className="text-sm font-bold text-ink-900">{skill.title}</h4>
                          <p className="mt-1 text-xs leading-relaxed text-ink-500">{skill.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6">
                    <h4 className="text-sm font-bold text-ink-900">{program.curriculumLabel}</h4>
                    <div className="mt-3 grid gap-2">
                      {program.curriculum.map((item) => (
                        <div key={item.step} className="flex gap-3 rounded-2xl bg-azure-50/60 px-4 py-3">
                          <span className="w-20 shrink-0 text-xs font-bold text-azure-600">{item.step}</span>
                          <div>
                            <div className="text-sm font-semibold text-ink-900">{item.title}</div>
                            <div className="mt-0.5 text-xs text-ink-500">{item.description}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {program.workHoursNote && (
                    <div className="mt-5 rounded-2xl border border-honey-400/40 bg-honey-100/50 p-4">
                      <h4 className="text-sm font-bold text-ink-900">{program.workHoursNote.title}</h4>
                      <p className="mt-1 text-xs leading-relaxed text-ink-500">{program.workHoursNote.description}</p>
                    </div>
                  )}
                </GlassCard>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ====================== Features ====================== */}
      <section id="features" className="relative py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-white/95 via-azure-50/75 to-white/90" />
        <DecorativeImage
          src={LANDING_ASSETS.features}
          className="inset-x-0 top-0 hidden h-[42rem] lg:block"
          imageClassName="object-cover opacity-30"
          objectPosition="center"
          sizes="100vw"
          maskImage="linear-gradient(to bottom, transparent 0%, #000 12%, #000 55%, transparent 100%)"
        />
        <div className="relative z-10 container-wide">
          <SectionHeading
            eyebrow="차별화된 서비스"
            title={
              <>
                왜 <span className="text-gradient-azure">면접심사 매칭 플랫폼</span>을<br />선택하나요?
              </>
            }
            subtitle="기존 구인구직 사이트와는 차원이 다른 혁신적인 서비스로 성공적인 매칭을 보장합니다"
          />

          <ScrollRevealStagger className="grid md:grid-cols-3 gap-6 lg:gap-8 mt-16">
            {features.map((feature, index) => (
              <ScrollRevealItem key={index}>
                <GlassCard hover className="h-full p-10 text-center">
                  <div className="relative mb-8">
                    <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br from-azure-400 to-azure-600 flex items-center justify-center shadow-glow">
                      <feature.icon className="w-12 h-12 text-white" />
                    </div>
                    <div className="absolute top-0 right-1/2 translate-x-12 -translate-y-1 w-7 h-7 rounded-full bg-white text-azure-600 text-sm font-bold flex items-center justify-center shadow-glass-sm border border-azure-100">
                      {index + 1}
                    </div>
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-ink-900 mb-4">{feature.title}</h3>
                  <p className="text-ink-500 text-base leading-relaxed">{feature.description}</p>
                  <div className="mt-6 inline-flex items-center gap-2 text-sm text-azure-600 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-azure-500" />
                    {index === 0 && '1분 완성형 영상'}
                    {index === 1 && '글로벌 인재풀'}
                    {index === 2 && '통합 문서 관리'}
                    <span className="w-1.5 h-1.5 rounded-full bg-azure-500" />
                  </div>
                </GlassCard>
              </ScrollRevealItem>
            ))}
          </ScrollRevealStagger>

          {/* 참가자 역량 섹션 */}
          <ScrollReveal className="mt-20">
            <div className="relative overflow-hidden rounded-5xl bg-gradient-to-br from-azure-600 via-azure-500 to-sky-cool-500 p-8 sm:p-12 text-white shadow-glass-lg">
              <DecorativeImage
                src={LANDING_ASSETS.capability}
                className="inset-0"
                imageClassName="object-cover opacity-55 mix-blend-screen"
                objectPosition="center"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-azure-700/95 via-azure-600/80 to-sky-cool-500/55" />
              <AuroraBackground variant="vivid" className="opacity-30 mix-blend-overlay" />
              <div className="relative grid md:grid-cols-2 gap-10 items-center">
                <div>
                  <h3 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold mb-6 text-white">참가자 역량</h3>
                  <h4 className="text-lg md:text-2xl font-bold mb-4 text-white/95">해외 판로개척 위한 자국 시장조사</h4>
                  <div className="text-base md:text-lg mb-8 leading-relaxed text-white/85">
                    <p className="mb-3">+ 생성형 AI활용 시장조사 보고서 작성</p>
                    <p>글로벌 시장 진출을 위한 전문적인 시장 분석과 AI 기반 인사이트를 제공합니다.</p>
                  </div>
                  {isAuthenticated && (userRole === 'employer' || userRole === 'admin') ? (
                    <GlassButton href="/portfolios" variant="secondary" size="lg" className="!text-azure-700">
                      <BriefcaseIcon className="w-5 h-5" />
                      Explore Portfolio
                      <ArrowRightIcon className="w-5 h-5" />
                    </GlassButton>
                  ) : !isAuthenticated ? (
                    <GlassButton href="/auth?mode=signup&type=employer" variant="secondary" size="lg" className="!text-azure-700">
                      <BuildingOfficeIcon className="w-5 h-5" />
                      구인기업으로 시작하기
                      <ArrowRightIcon className="w-5 h-5" />
                    </GlassButton>
                  ) : null}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                  {[
                    { t: '자기소개 영상', d: '교육생 1분 자기소개 영상', Icon: VideoIcon },
                    { t: '다국적 인재', d: '귀사에서 필요로 하는 다양한 국가의 인재 참가', Icon: ({ className }: { className?: string }) => (
                      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    ) },
                    { t: '이력서 자소서', d: '이력서와 자소서, 개별 포트폴리오까지 한눈에 확인', Icon: BriefcaseIcon },
                  ].map(({ t, d, Icon }) => (
                    <div key={t} className="bg-white/15 backdrop-blur-md border border-white/25 rounded-3xl p-5">
                      <Icon className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 text-white" />
                      <h5 className="font-bold text-base sm:text-lg mb-1.5">{t}</h5>
                      <p className="text-xs sm:text-sm text-white/85">{d}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* AI 도구 활용 능력 섹션 */}
          <div id="ai-tools" className="relative mt-24 scroll-mt-24">
            <SectionHeading
              eyebrow="전문 도구 활용 능력"
              title={
                <>
                  우리 인재들이 활용하는 <br />
                  <span className="text-gradient-azure">최신 AI 도구</span>
                </>
              }
              subtitle="최신 AI 기술과 디자인 도구를 자유자재로 활용하여 프로페셔널한 결과물을 만들어내는 인재들입니다"
            />

            <ScrollRevealStagger className="grid lg:grid-cols-3 gap-6 lg:gap-8 mt-14">
              {aiToolGroups.map((group) => (
                <ScrollRevealItem key={group.category}>
                  <GlassCard hover className="h-full p-8">
                    <div className="inline-flex items-center gap-2 rounded-full bg-azure-50 border border-azure-100 px-4 py-2 text-azure-700 font-semibold text-sm mb-6">
                      <SparklesIcon className="w-4 h-4" />
                      {group.category}
                    </div>
                    <div className="space-y-5">
                      {group.tools.map((tool) => (
                        <div key={tool.name} className="glass rounded-2xl p-5">
                          <h4 className="font-bold text-lg mb-3 text-ink-900">{tool.name}</h4>
                          <ul className="space-y-2 text-sm text-ink-500">
                            {tool.items.map((item) => (
                              <li key={item} className="flex items-center gap-3">
                                <span className="w-1.5 h-1.5 rounded-full bg-azure-500 shrink-0" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </GlassCard>
                </ScrollRevealItem>
              ))}
            </ScrollRevealStagger>

            {/* 하단 CTA */}
            <ScrollReveal className="text-center mt-14">
              <div className="relative overflow-hidden rounded-4xl bg-gradient-to-r from-azure-600 to-sky-cool-500 p-8 sm:p-10 text-white shadow-glass-lg">
                <DecorativeImage
                  src={LANDING_ASSETS.aiWorkbench}
                  className="inset-0"
                  imageClassName="object-cover opacity-30 mix-blend-screen"
                  objectPosition="center"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-azure-700/90 to-sky-cool-500/70" />
                <AuroraBackground variant="vivid" className="opacity-30 mix-blend-overlay" />
                <div className="relative">
                  <h4 className="text-xl md:text-2xl font-bold mb-3">이런 전문 도구들을 자유자재로 활용하는 인재들</h4>
                  <p className="text-base md:text-lg mb-6 text-white/85">최신 기술과 트렌드를 빠르게 습득하고 적용하는 능력을 갖춘 우수 인재들입니다</p>
                  {isAuthenticated && (userRole === 'employer' || userRole === 'admin') ? (
                    <GlassButton href="/portfolios" variant="secondary" size="lg" className="!text-azure-700">
                      <UserGroupIcon className="w-5 h-5" />
                      인재 포트폴리오 확인하기
                      <ArrowRightIcon className="w-5 h-5" />
                    </GlassButton>
                  ) : !isAuthenticated ? (
                    <GlassButton href="/auth?mode=signup&type=employer" variant="secondary" size="lg" className="!text-azure-700">
                      <BuildingOfficeIcon className="w-5 h-5" />
                      구인기업으로 시작하기
                      <ArrowRightIcon className="w-5 h-5" />
                    </GlassButton>
                  ) : null}
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ====================== Final CTA ====================== */}
      <section id="final-cta" className="relative py-24 overflow-hidden">
        <div className="container-wide">
          <ScrollReveal>
            <div className="relative overflow-hidden rounded-5xl bg-gradient-to-br from-azure-700 via-azure-600 to-sky-cool-600 px-6 py-16 sm:px-12 sm:py-20 text-center shadow-glass-lg">
              <DecorativeImage
                src={LANDING_ASSETS.cta}
                className="inset-0"
                imageClassName="object-cover opacity-70"
                objectPosition="center"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-azure-900/85 via-azure-700/75 to-sky-cool-600/65" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.22),rgba(255,255,255,0)_55%)]" />
              <AuroraBackground variant="vivid" className="opacity-40 mix-blend-overlay" />
              <div className="relative max-w-3xl mx-auto">
                {!isAuthenticated ? (
                  <>
                    <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">지금 바로 시작하세요</h2>
                    <p className="text-base sm:text-lg md:text-xl text-azure-50 mb-10 leading-relaxed">무료 회원가입으로 더 나은 커리어의 첫걸음을 내디뎌보세요</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <GlassButton href="/auth?mode=signup&type=jobseeker" variant="secondary" size="lg" className="!text-azure-700">구직자로 시작하기</GlassButton>
                      <GlassButton href="/auth?mode=signup&type=employer" variant="outline" size="lg" className="!border-white/70 !text-white hover:!bg-white/15">구인기업으로 시작하기</GlassButton>
                    </div>
                  </>
                ) : (
                  <>
                    <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
                      {userRole === 'jobseeker' ? '취업 성공을 위한 다음 단계' : userRole === 'employer' ? '채용 성공을 위한 다음 단계' : '서비스를 더 활용해보세요'}
                    </h2>
                    <p className="text-base sm:text-lg md:text-xl text-azure-50 mb-10 leading-relaxed">
                      {userRole === 'jobseeker'
                        ? '포트폴리오를 완성하고 맞춤형 채용 정보를 받아보세요'
                        : userRole === 'employer'
                        ? '우수한 인재를 찾고 효율적인 채용 프로세스를 경험하세요'
                        : '면접심사 매칭 플랫폼의 다양한 기능을 통해 목표를 달성하세요'}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      {userRole === 'jobseeker' ? (
                        <GlassButton href="/profile" variant="secondary" size="lg" className="!text-azure-700">포트폴리오 작성하기</GlassButton>
                      ) : userRole === 'employer' ? (
                        <GlassButton href="/employer-dashboard" variant="secondary" size="lg" className="!text-azure-700">대시보드로 이동</GlassButton>
                      ) : (
                        <>
                          <GlassButton href="/profile" variant="secondary" size="lg" className="!text-azure-700">마이페이지</GlassButton>
                          <GlassButton href="/settings" variant="outline" size="lg" className="!border-white/70 !text-white hover:!bg-white/15">설정</GlassButton>
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ====================== Footer ====================== */}
      <footer id="footer" className="relative mt-10 bg-ink-900 text-white overflow-hidden">
        <DecorativeImage
          src={LANDING_ASSETS.cta}
          className="inset-0"
          imageClassName="object-cover opacity-25"
          objectPosition="center bottom"
        />
        <div className="absolute inset-0 bg-ink-900/85" />
        <div className="absolute inset-0 bg-azure-aurora opacity-25" />
        <div className="relative container-wide py-20">
          <div className="grid md:grid-cols-4 gap-12">
            <div>
              <div className="flex items-center gap-3 mb-7">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-glass p-1">
                  <img src="/images/logo.png" alt="면접심사 매칭 플랫폼 Logo" className="w-full h-full object-contain" />
                </div>
                <span className="text-base font-bold">(사)기술벤처스타트업협회</span>
              </div>
              <p className="text-ink-300 leading-relaxed">서울시 민간기업 참여형 매력일자리 사업 · 구직자 · 구인기업 면접심사 매칭 플랫폼</p>
            </div>

            <div>
              <h3 className="font-bold mb-5 text-lg text-white">서비스</h3>
              <ul className="space-y-3 text-ink-300">
                {isAuthenticated && (userRole === 'employer' || userRole === 'admin') && (
                  <li><Link href="/portfolios" className="hover:text-azure-300 transition-colors">포트폴리오</Link></li>
                )}
                <li><Link href="/companies" className="hover:text-azure-300 transition-colors">기업정보</Link></li>
                <li><span className="text-ink-400 cursor-not-allowed">AI 매칭 (준비중)</span></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold mb-5 text-lg text-white">지원</h3>
              <ul className="space-y-3 text-ink-300">
                <li><Link href="/help" className="hover:text-azure-300 transition-colors">도움말</Link></li>
                <li><Link href="/contact" className="hover:text-azure-300 transition-colors">문의하기</Link></li>
                <li><Link href="/faq" className="hover:text-azure-300 transition-colors">FAQ</Link></li>
                <li><Link href="/privacy" className="hover:text-azure-300 transition-colors">개인정보처리방침</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold mb-5 text-lg text-white">연락처</h3>
              <div className="text-ink-300 space-y-3">
                <p>이메일: tvs@techventure.co.kr</p>
                <p>전화: 010-2734-8624</p>
                <p>담당: 조지형 사무국장</p>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 mt-14 pt-8 text-center text-ink-400">
            <p>&copy; 2025 (사)기술벤처스타트업협회 All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* 튜토리얼 오버레이 */}
      <TutorialOverlay
        isVisible={showTutorial}
        onComplete={handleTutorialComplete}
      />
    </div>
  );
}
