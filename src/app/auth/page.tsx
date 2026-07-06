'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn, signUp, resetPassword, signInWithGoogle } from '@/lib/auth';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  EyeIcon,
  EyeSlashIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  UserIcon,
  BuildingOfficeIcon,
  ArrowRightIcon,
  CalendarDaysIcon,
  ClockIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';
import { AuroraBackground } from '@/components/ui/AuroraBackground';
import { GlassButton } from '@/components/ui/GlassButton';
import { GlassInput } from '@/components/ui/GlassField';

type AuthMode = 'login' | 'signup' | 'reset';
type UserRole = 'jobseeker' | 'employer';

function AuthContent() {
  const searchParams = useSearchParams();
  const initialMode = (searchParams?.get('mode') as AuthMode) || 'login';
  const typeParam = searchParams?.get('type');
  const initialRole: UserRole =
    typeParam === 'employer' || typeParam === 'jobseeker' ? typeParam : 'jobseeker';

  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [role, setRole] = useState<UserRole>(initialRole);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    companyName: '',
    position: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const router = useRouter();
  const { user } = useAuth();

  // 이미 로그인된 사용자는 메인 페이지로 리다이렉트 (useEffect 사용)
  // 로그인/회원가입 처리 중일 때는 리다이렉션하지 않음
  useEffect(() => {
    if (user && !googleLoading && !loading) {
      router.push('/');
    }
  }, [user, router, googleLoading, loading]);

  // 로그인된 사용자는 로딩 상태 표시
  if (user) {
    return (
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-azure-50/70 via-white to-[#eef4fc]/90">
        <AuroraBackground />
        <div className="relative z-10 text-center">
          <div className="animate-spin rounded-full h-9 w-9 border-2 border-azure-200 border-t-azure-500 mx-auto"></div>
          <p className="mt-4 text-ink-500">리다이렉트 중...</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (mode === 'login') {
        const user = await signIn(formData.email, formData.password, role);

        if (user) {
          if (role === 'employer') {
            router.push('/employer-dashboard');
          } else {
            router.push('/');
          }
        } else {
          setError('로그인에 실패했습니다.');
        }
      } else if (mode === 'signup') {
        if (formData.password !== formData.confirmPassword) {
          throw new Error('비밀번호가 일치하지 않습니다.');
        }
        if (formData.password.length < 6) {
          throw new Error('비밀번호는 최소 6자 이상이어야 합니다.');
        }
        const result = await signUp(
          formData.email,
          formData.password,
          formData.name,
          role,
          role === 'employer' ? { companyName: formData.companyName, position: formData.position } : undefined
        );
        if (result) {
          console.log('✅ 회원가입 성공:', result);
          // AuthContext가 사용자 데이터를 로드할 시간을 주기 위해 약간의 지연 후 강제 새로고침
          setTimeout(() => {
            if (role === 'employer') {
              // 기업 회원가입 후 새로고침 플래그 설정
              localStorage.setItem('newEmployerSignup', 'true');
            }
            // 강제 새로고침으로 모든 상태를 완전히 초기화
            window.location.href = '/';
          }, 1000); // 1초 지연
        }
      } else if (mode === 'reset') {
        await resetPassword(formData.email);
        setSuccess('비밀번호 재설정 이메일이 발송되었습니다.');
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await signInWithGoogle(role);

      if (result) {
        console.log('✅ 구글 로그인 성공:', result);
        // AuthContext가 사용자 데이터를 로드할 시간을 주기 위해 약간의 지연
        setTimeout(() => {
          if (result.isNewUser) {
            if (role === 'employer') {
              // 기업 신규 구글 로그인시에도 새로고침 플래그 설정
              localStorage.setItem('newEmployerSignup', 'true');
            }
            // 신규 사용자는 강제 새로고침으로 모든 상태를 완전히 초기화
            window.location.href = '/';
          } else {
            // 기존 사용자는 일반 라우팅 사용
            if (role === 'employer') {
              router.push('/employer-dashboard');
            } else {
              router.push('/');
            }
          }
        }, 1000); // 1초 지연
      } else {
        setError('구글 로그인에 실패했습니다.');
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const roleOptions: { value: UserRole; label: string; Icon: typeof UserIcon }[] = [
    { value: 'jobseeker', label: '구직자', Icon: UserIcon },
    { value: 'employer', label: '기업', Icon: BuildingOfficeIcon },
  ];

  const compactInputClass = '!rounded-xl !py-2.5 text-sm sm:text-base';
  const compactButtonClass = 'w-full !rounded-xl !px-6 !py-3 !text-base sm:!text-base';

  return (
    <div className="relative min-h-screen flex items-start justify-center overflow-x-hidden overflow-y-auto bg-gradient-to-b from-azure-50/70 via-white to-[#eef4fc]/90 py-6 px-5 sm:px-8 lg:py-8">
      <AuroraBackground variant="vivid" />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full min-w-0 max-w-[calc(100vw_-_2.5rem)] sm:max-w-md"
      >
        {/* 글래스 카드 */}
        <div className="relative w-full min-w-0 glass-strong rounded-4xl shadow-glass-lg p-5 sm:p-6">
          {/* 헤더 */}
          <div className="text-center">
            <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 bg-white/60 backdrop-blur-md border border-white/70 text-azure-700 font-semibold text-xs mb-3 shadow-glass-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-azure-500 animate-pulse" />
              면접심사 매칭 플랫폼
            </span>
            <h2 className="font-display text-xl sm:text-2xl font-bold leading-tight tracking-tight text-ink-900">
              {mode === 'login' && '면접심사 매칭 플랫폼에 로그인'}
              {mode === 'signup' && '면접심사 매칭 플랫폼 회원가입'}
              {mode === 'reset' && '비밀번호 재설정'}
            </h2>
          </div>

          {/* 회원 유형 선택 */}
          <div className="mt-4">
            <label className="block text-xs sm:text-sm font-medium text-ink-700 mb-2 text-center">
              회원 유형을 선택해주세요
            </label>
            <div className="relative grid grid-cols-2 gap-1.5 glass rounded-2xl p-1">
              {roleOptions.map(({ value, label, Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRole(value)}
                  className={`relative flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-semibold rounded-xl transition-colors duration-300 ${
                    role === value ? 'text-white' : 'text-ink-500 hover:text-ink-800'
                  }`}
                >
                  {role === value && (
                    <motion.span
                      layoutId="authRolePill"
                      className="absolute inset-0 rounded-xl bg-gradient-to-r from-azure-500 to-azure-600 shadow-glow"
                      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                    />
                  )}
                  <span className="relative flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    {label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 모드 전환 안내 */}
          <p className="mt-3 text-center text-sm text-ink-500">
            {mode === 'login' && '계정이 없으신가요? '}
            {mode === 'signup' && '이미 계정이 있으신가요? '}
            {mode === 'reset' && '로그인 페이지로 '}
            <span
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();

                if (mode === 'login') {
                  setMode('signup');
                } else if (mode === 'signup') {
                  setMode('login');
                } else {
                  setMode('login');
                }
                setError('');
                setSuccess('');
              }}
              className="font-semibold text-azure-600 hover:text-azure-700 cursor-pointer underline underline-offset-2 decoration-azure-300 hover:decoration-azure-500 transition-colors"
            >
              {mode === 'login' && '회원가입'}
              {mode === 'signup' && '로그인'}
              {mode === 'reset' && '돌아가기'}
            </span>
          </p>

          {/* 기업 회원가입 시 매칭데이 행사 안내 */}
          {mode === 'signup' && role === 'employer' && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="mt-4 rounded-2xl bg-azure-50/80 border border-azure-200/70 backdrop-blur-md p-4 shadow-glass-sm"
            >
              <div className="flex items-start gap-2.5">
                <CalendarDaysIcon className="h-5 w-5 text-azure-600 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-azure-700">매칭데이 행사 안내</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-ink-600 break-keep">
                    채용 기업과 구직자 간의 뜻깊은 만남이 이루어지는 &lsquo;매칭데이&rsquo; 행사가 개최됩니다.
                    원활한 면접 진행을 위해 바쁘시더라도 행사장에 직접 방문하시어 자리를 빛내주시기를 부탁드립니다.
                    부득이한 사정으로 7월 22일(수) 행사 참석이 어려우신 경우, 채용 신청서 작성 시 [참석 불가] 항목에 체크해 주시기 바랍니다.
                  </p>
                  <div className="mt-3 flex flex-col gap-1.5 border-t border-azure-200/60 pt-3">
                    <div className="flex items-center gap-2 text-xs text-ink-700">
                      <ClockIcon className="h-4 w-4 shrink-0 text-azure-600" />
                      <span className="font-semibold shrink-0">일정</span>
                      <span className="text-ink-600">7월 22일(수)</span>
                    </div>
                    <div className="flex items-start gap-2 text-xs text-ink-700">
                      <MapPinIcon className="h-4 w-4 shrink-0 text-azure-600 mt-0.5" />
                      <span className="font-semibold shrink-0">장소</span>
                      <span className="text-ink-600 break-keep">서울특별시 영등포구 영등포로 33, 5층 스타트런 행사장</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* 알림 */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="mt-4 rounded-2xl bg-coral-100/70 border border-coral-400/40 backdrop-blur-md p-3 shadow-glass-sm"
              >
                <div className="flex items-start gap-3">
                  <ExclamationCircleIcon className="h-5 w-5 text-coral-500 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-semibold text-coral-600">오류</h3>
                    <div className="mt-1 text-sm text-ink-600">{error}</div>
                  </div>
                </div>
              </motion.div>
            )}

            {success && (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="mt-4 rounded-2xl bg-mint-100/70 border border-mint-400/40 backdrop-blur-md p-3 shadow-glass-sm"
              >
                <div className="flex items-start gap-3">
                  <CheckCircleIcon className="h-5 w-5 text-mint-500 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-semibold text-mint-600">성공</h3>
                    <div className="mt-1 text-sm text-ink-600">{success}</div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {mode !== 'reset' && (
            <div className="mt-4 space-y-2">
              <GlassButton
                type="button"
                onClick={handleGoogleSignIn}
                disabled={googleLoading || loading}
                variant="secondary"
                size="lg"
                className={`${compactButtonClass} !text-ink-700`}
              >
                {googleLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-azure-200 border-t-azure-500"></div>
                    구글 로그인 중...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Google로 {mode === 'login' ? '로그인' : '회원가입'}
                  </div>
                )}
              </GlassButton>

              <div className="relative py-0">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-ink-100" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-3 bg-white/70 backdrop-blur-sm rounded-full text-ink-400">또는 이메일로</span>
                </div>
              </div>
            </div>
          )}

          {/* 폼 */}
          <motion.form
            className="mt-4 space-y-3"
            onSubmit={handleSubmit}
          >
            <div className={mode === 'signup' ? 'grid grid-cols-1 gap-3 sm:grid-cols-2' : 'space-y-3'}>
              {mode === 'signup' && role === 'jobseeker' && (
                <div className="space-y-1.5">
                  <label htmlFor="name" className="block text-xs sm:text-sm font-medium text-ink-700">
                    이름
                  </label>
                  <GlassInput
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className={compactInputClass}
                    placeholder="이름을 입력하세요"
                  />
                </div>
              )}

              {mode === 'signup' && role === 'employer' && (
                <>
                  <div className="space-y-1.5">
                    <label htmlFor="companyName" className="block text-xs sm:text-sm font-medium text-ink-700">
                      회사 이름
                    </label>
                    <GlassInput
                      id="companyName"
                      name="companyName"
                      type="text"
                      required
                      value={formData.companyName}
                      onChange={handleInputChange}
                      className={compactInputClass}
                      placeholder="회사 이름을 입력하세요"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="name" className="block text-xs sm:text-sm font-medium text-ink-700">
                      담당자 이름
                    </label>
                    <GlassInput
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className={compactInputClass}
                      placeholder="담당자 이름을 입력하세요"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="position" className="block text-xs sm:text-sm font-medium text-ink-700">
                      담당자 직급
                    </label>
                    <GlassInput
                      id="position"
                      name="position"
                      type="text"
                      required
                      value={formData.position}
                      onChange={handleInputChange}
                      className={compactInputClass}
                      placeholder="예: 인사팀 대리, 대표, HR 담당자"
                    />
                  </div>
                </>
              )}

              <div className="space-y-1.5">
                <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-ink-700">
                  {mode === 'signup' && role === 'employer' ? '담당자 이메일' : '이메일'}
                </label>
                <GlassInput
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className={compactInputClass}
                  placeholder={mode === 'signup' && role === 'employer' ? '담당자 이메일 주소' : '이메일 주소'}
                />
              </div>

              {mode !== 'reset' && (
                <div className="space-y-1.5">
                  <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-ink-700">
                    비밀번호
                  </label>
                  <div className="relative">
                    <GlassInput
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`${compactInputClass} pr-12`}
                      placeholder="비밀번호"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-ink-400 hover:text-azure-600 transition-colors"
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="h-5 w-5" />
                      ) : (
                        <EyeIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {mode === 'signup' && (
                <div className="space-y-1.5">
                  <label htmlFor="confirmPassword" className="block text-xs sm:text-sm font-medium text-ink-700">
                    비밀번호 확인
                  </label>
                  <GlassInput
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={compactInputClass}
                    placeholder="비밀번호 확인"
                  />
                </div>
              )}
            </div>

            <div className="pt-0">
              <GlassButton
                type="submit"
                disabled={loading}
                size="lg"
                className={compactButtonClass}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/40 border-t-white"></div>
                    처리 중...
                  </div>
                ) : (
                  <>
                    {mode === 'login' && '로그인'}
                    {mode === 'signup' && '회원가입'}
                    {mode === 'reset' && '재설정 이메일 발송'}
                  </>
                )}
              </GlassButton>
            </div>

            {mode === 'login' && (
              <div className="text-center pt-0">
                <button
                  type="button"
                  onClick={() => {
                    setMode('reset');
                    setError('');
                    setSuccess('');
                  }}
                  className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-azure-700 transition-colors"
                >
                  비밀번호를 잊으셨나요?
                  <ArrowRightIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </motion.form>
        </div>
      </motion.div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthContent />
    </Suspense>
  );
}
