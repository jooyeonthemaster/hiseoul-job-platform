'use client';

import { motion } from 'framer-motion';
import { useState, useRef } from 'react';
import { CameraIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';

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
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* 프로필 이미지 */}
            <div className="flex-shrink-0 relative group">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt={`${userName}님의 프로필`}
                  className="w-16 h-16 rounded-full object-cover border-4 border-white/20 shadow-lg"
                />
              ) : (
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center border-4 border-white/20 shadow-lg">
                  <span className="text-2xl font-bold text-white">
                    {userName.charAt(0)}
                  </span>
                </div>
              )}
              
              {/* 이미지 변경 버튼 오버레이 */}
              <button
                type="button"
                onClick={triggerFileInput}
                disabled={uploading}
                className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 disabled:cursor-not-allowed"
                title="프로필 이미지 변경"
              >
                {uploading ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
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
              <h1 className="text-3xl font-bold mb-2">
                안녕하세요, {userName}님! 👋
              </h1>
              <p className="text-indigo-100 text-lg mb-3">
                오늘도 새로운 기회를 찾아보세요
              </p>
              
              {/* 프로필 사진 변경 버튼 */}
              <button
                type="button"
                onClick={triggerFileInput}
                disabled={uploading}
                className="inline-flex items-center px-4 py-2 bg-white/20 hover:bg-white/30 text-white text-sm font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CameraIcon className="w-4 h-4 mr-2" />
                {uploading ? '업로드 중...' : '프로필 사진 변경'}
              </button>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.totalFavorites}</div>
              <div className="text-sm text-indigo-200">관심 기업</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.totalInquiries}</div>
              <div className="text-sm text-indigo-200">채용 제안</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.profileCompletion}%</div>
              <div className="text-sm text-indigo-200">프로필 완성도</div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}