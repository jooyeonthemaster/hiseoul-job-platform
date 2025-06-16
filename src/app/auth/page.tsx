'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn, signUp, resetPassword, signInWithGoogle } from '@/lib/auth';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

type AuthMode = 'login' | 'signup' | 'reset';
type UserRole = 'jobseeker' | 'employer';

function AuthContent() {
  const searchParams = useSearchParams();
  const initialMode = (searchParams.get('mode') as AuthMode) || 'login';
  
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [role, setRole] = useState<UserRole>('jobseeker');
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">리다이렉트 중...</p>
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8"
      >
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            {mode === 'login' && '테크벤처 잡 매칭에 로그인'}
            {mode === 'signup' && '테크벤처 잡 매칭 회원가입'}
            {mode === 'reset' && '비밀번호 재설정'}
          </h2>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
              회원 유형을 선택해주세요
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('jobseeker')}
                className={`p-3 text-sm font-medium rounded-lg border-2 transition-colors ${
                  role === 'jobseeker'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                    : 'border-gray-300 text-gray-700 hover:border-gray-400'
                }`}
              >
                구직자
              </button>
              <button
                type="button"
                onClick={() => setRole('employer')}
                className={`p-3 text-sm font-medium rounded-lg border-2 transition-colors ${
                  role === 'employer'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                    : 'border-gray-300 text-gray-700 hover:border-gray-400'
                }`}
              >
                기업
              </button>
            </div>
          </div>
          <p className="mt-4 text-center text-sm text-gray-600">
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
              className="font-medium text-indigo-600 hover:text-indigo-500 cursor-pointer underline"
            >
              {mode === 'login' && '회원가입'}
              {mode === 'signup' && '로그인'}
              {mode === 'reset' && '돌아가기'}
            </span>
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-md bg-red-50 p-4 mb-4"
          >
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">오류</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-md bg-green-50 p-4 mb-4"
          >
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">성공</h3>
                <div className="mt-2 text-sm text-green-700">{success}</div>
              </div>
            </div>
          </motion.div>
        )}

        <motion.form
          className="mt-8 space-y-6"
          onSubmit={handleSubmit}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="space-y-4">
            {mode === 'signup' && role === 'jobseeker' && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  이름
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="이름을 입력하세요"
                />
              </div>
            )}

            {mode === 'signup' && role === 'employer' && (
              <>
                <div>
                  <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
                    회사 이름
                  </label>
                  <input
                    id="companyName"
                    name="companyName"
                    type="text"
                    required
                    value={formData.companyName}
                    onChange={handleInputChange}
                    className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    placeholder="회사 이름을 입력하세요"
                  />
                </div>
                
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    담당자 이름
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    placeholder="담당자 이름을 입력하세요"
                  />
                </div>

                <div>
                  <label htmlFor="position" className="block text-sm font-medium text-gray-700">
                    담당자 직급
                  </label>
                  <input
                    id="position"
                    name="position"
                    type="text"
                    required
                    value={formData.position}
                    onChange={handleInputChange}
                    className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    placeholder="예: 인사팀 대리, 대표, HR 담당자"
                  />
                </div>
              </>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                {mode === 'signup' && role === 'employer' ? '담당자 이메일' : '이메일'}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder={mode === 'signup' && role === 'employer' ? '담당자 이메일 주소' : '이메일 주소'}
              />
            </div>

            {mode !== 'reset' && (
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  비밀번호
                </label>
                <div className="relative mt-1">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="appearance-none relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    placeholder="비밀번호"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
            )}

            {mode === 'signup' && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  비밀번호 확인
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="비밀번호 확인"
                />
              </div>
            )}
          </div>

          <div>
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  처리 중...
                </div>
              ) : (
                <>
                  {mode === 'login' && '로그인'}
                  {mode === 'signup' && '회원가입'}
                  {mode === 'reset' && '재설정 이메일 발송'}
                </>
              )}
            </motion.button>
          </div>

          {mode !== 'reset' && (
            <>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">또는</span>
                </div>
              </div>

              <motion.button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={googleLoading || loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {googleLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-700 mr-2"></div>
                    구글 로그인 중...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
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
              </motion.button>
            </>
          )}

          {mode === 'login' && (
            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setMode('reset');
                  setError('');
                  setSuccess('');
                }}
                className="text-sm text-indigo-600 hover:text-indigo-500"
              >
                비밀번호를 잊으셨나요?
              </button>
            </div>
          )}
        </motion.form>
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