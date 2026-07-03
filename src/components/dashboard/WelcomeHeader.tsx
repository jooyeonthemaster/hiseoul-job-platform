'use client';

import { motion } from 'framer-motion';
import { useState, useRef } from 'react';
import { CameraIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { GlassButton } from '@/components/ui/GlassButton';

interface DashboardStats {
  totalFavorites: number;
  totalInquiries: number;
  profileCompletion: number;
}

interface WelcomeHeaderProps {
  userName: string;
  stats: DashboardStats;
  profileImage?: string;
  onProfileImageUpdate?: (imageUrl: string) => void;
}

export default function WelcomeHeader({ userName, stats, profileImage, onProfileImageUpdate }: WelcomeHeaderProps) {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) {
      console.log('파일 또는 사용자 정보가 없습니다:', { file: !!file, user: !!user });
      return;
    }

    console.log('업로드할 파일 정보:', {
      name: file.name,
      size: file.size,
      type: file.type,
      userId: user.uid
    });

    // 파일 크기 제한 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('파일 크기가 5MB를 초과할 수 없습니다.');
      return;
    }

    // 이미지 파일 형식 검증
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('JPG, PNG, WebP 형식의 이미지만 업로드 가능합니다.');
      return;
    }

    try {
      setUploading(true);
      console.log('업로드 시작...');

      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', user.uid);

      console.log('API 요청 전송 중...');
      const response = await fetch('/api/upload-profile-image', {
        method: 'POST',
        body: formData,
      });

      console.log('API 응답 상태:', response.status);
      const result = await response.json();
      console.log('API 응답 결과:', result);

      if (result.success) {
        console.log('업로드 성공, 이미지 URL:', result.imageUrl);
        onProfileImageUpdate?.(result.imageUrl);
        alert('프로필 이미지가 성공적으로 업로드되었습니다!');
      } else {
        console.error('업로드 실패:', result.error);
        alert(result.error || '이미지 업로드에 실패했습니다.');
      }
    } catch (error) {
      console.error('이미지 업로드 오류:', error);
      alert('이미지 업로드 중 오류가 발생했습니다.');
    } finally {
      setUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // REQ2(관리자 중개형): 구직자에게 '받은 채용 제안' 개념을 노출하지 않는다.
  // 본인 선택(관심 기업)/본인 프로필 완성도 등 자기 정보만 표시.
  const statItems = [
    { value: stats.totalFavorites, label: '관심 기업', suffix: '' },
    { value: stats.profileCompletion, label: '프로필 완성도', suffix: '%' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="mb-5"
    >
      <div className="relative overflow-hidden rounded-3xl border border-white/60 bg-white/60 backdrop-blur-xl shadow-glass-lg">
        {/* azure 오로라 글로우 레이어 */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-azure-500/12 via-white/20 to-sky-cool-400/12"
        />
        {/* 상단 흰 림라이트 하이라이트 */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent"
        />

        <div className="relative p-5 md:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4 sm:gap-5">
              {/* 프로필 이미지 */}
              <div className="flex-shrink-0 relative group">
                <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-azure-400/40 to-azure-600/40 blur-md opacity-70 transition-opacity duration-300 group-hover:opacity-100" aria-hidden="true" />
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt={`${userName}님의 프로필`}
                    className="relative h-16 w-16 rounded-full border-4 border-white/70 object-cover shadow-glass"
                  />
                ) : (
                  <div className="relative flex h-16 w-16 items-center justify-center rounded-full border-4 border-white/70 bg-gradient-to-br from-azure-500 to-azure-600 shadow-glow">
                    <span className="font-display text-2xl font-bold text-white">
                      {userName.charAt(0)}
                    </span>
                  </div>
                )}

                {/* 이미지 변경 버튼 오버레이 */}
                <button
                  type="button"
                  onClick={triggerFileInput}
                  disabled={uploading}
                  className="absolute inset-0 z-10 bg-ink-900/45 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 disabled:cursor-not-allowed"
                  title="프로필 이미지 변경"
                >
                  {uploading ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-white/40 border-t-white"></div>
                  ) : (
                    <CameraIcon className="w-6 h-6 text-white" />
                  )}
                </button>

                {/* 파일 입력 (숨김) */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>

              {/* 환영 메시지 */}
              <div>
                <h1 className="mb-1 font-display text-2xl font-bold tracking-tight text-ink-900 md:text-3xl">
                  안녕하세요, <span className="text-gradient-azure">{userName}</span>님
                </h1>
                <p className="mb-3 text-sm leading-relaxed text-ink-500 md:text-base">
                  오늘도 새로운 기회를 찾아보세요
                </p>

                {/* 프로필 사진 변경 버튼 */}
                <GlassButton
                  type="button"
                  onClick={triggerFileInput}
                  disabled={uploading}
                  variant="secondary"
                  size="sm"
                >
                  <CameraIcon className="w-4 h-4" />
                  {uploading ? '업로드 중...' : '프로필 사진 변경'}
                </GlassButton>
              </div>
            </div>

            {/* 통계 */}
            <div className="grid grid-cols-2 gap-3 md:min-w-[300px]">
              {statItems.map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-white/60 bg-white/65 px-4 py-3 text-center shadow-glass-sm backdrop-blur-md transition-all duration-300 hover:bg-white/80 hover:shadow-glass"
                >
                  <div className="font-display text-2xl font-bold tabular-nums text-gradient-azure">
                    {item.value}{item.suffix}
                  </div>
                  <div className="mt-1 text-sm font-medium text-ink-500 whitespace-nowrap">
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
