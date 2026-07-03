'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  PhotoIcon,
  ArrowUpTrayIcon,
  TrashIcon,
  CheckBadgeIcon,
} from '@heroicons/react/24/outline';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { GlassButton } from '@/components/ui/GlassButton';
import { Badge } from '@/components/ui/Badge';

interface ProfileImageManagerProps {
  currentImageUrl?: string;
  userId: string;
  onImageUpdate: (imageUrl: string) => void;
  userName: string;
}

export default function ProfileImageManager({
  currentImageUrl,
  userId,
  onImageUpdate,
  userName
}: ProfileImageManagerProps) {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 파일 형식 검증
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('JPG, PNG, WebP 형식의 이미지만 업로드 가능합니다.');
      return;
    }

    // 파일 크기 검증 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('파일 크기는 5MB 이하여야 합니다.');
      return;
    }

    setUploading(true);

    try {
      // 미리보기 설정
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // 서버에 업로드
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', userId);

      const response = await fetch('/api/upload-profile-image', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        onImageUpdate(result.imageUrl);
        alert(`${userName}님의 프로필 이미지가 성공적으로 업데이트되었습니다!`);
        setPreviewUrl(null); // 미리보기 초기화
      } else {
        alert(result.error || '이미지 업로드에 실패했습니다.');
        setPreviewUrl(null);
      }
    } catch (error) {
      console.error('이미지 업로드 오류:', error);
      alert('이미지 업로드 중 오류가 발생했습니다.');
      setPreviewUrl(null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    if (!confirm(`${userName}님의 프로필 이미지를 제거하시겠습니까?`)) {
      return;
    }

    try {
      onImageUpdate(''); // 빈 문자열로 이미지 제거
      alert(`${userName}님의 프로필 이미지가 제거되었습니다.`);
    } catch (error) {
      console.error('이미지 제거 오류:', error);
      alert('이미지 제거 중 오류가 발생했습니다.');
    }
  };

  return (
    <ScrollReveal>
      <div className="relative overflow-hidden glass-strong rounded-4xl shadow-glass p-7 sm:p-8">
        {/* 은은한 azure 글로우 */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -right-16 h-56 w-56 rounded-full bg-azure-300/20 blur-3xl"
        />

        {/* 헤더 */}
        <div className="relative flex items-center gap-3 mb-6">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-azure-500 to-azure-600 text-white shadow-glow">
            <PhotoIcon className="h-6 w-6" />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-azure-600">
              Profile Image
            </p>
            <h3 className="font-display font-semibold text-xl text-ink-900 tracking-tight truncate">
              프로필 이미지 관리 · {userName}
            </h3>
          </div>
        </div>

        <div className="relative space-y-6">
          {/* 현재 이미지 표시 */}
          <div className="flex items-center gap-5">
            <div className="relative w-24 h-24 rounded-3xl overflow-hidden bg-azure-50/70 border border-white/70 shadow-glass-sm flex items-center justify-center shrink-0">
              {currentImageUrl || previewUrl ? (
                <Image
                  src={previewUrl || currentImageUrl || ''}
                  alt={`${userName} 프로필`}
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-ink-400 text-xs font-medium text-center leading-snug">
                  이미지<br />없음
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                {currentImageUrl ? (
                  <Badge tone="mint" icon={<CheckBadgeIcon className="h-3.5 w-3.5" />}>
                    설정됨
                  </Badge>
                ) : (
                  <Badge tone="neutral">미설정</Badge>
                )}
              </div>
              <p className="text-sm text-ink-500 mt-2 leading-relaxed">
                {currentImageUrl ? '현재 프로필 이미지' : '프로필 이미지가 설정되지 않았습니다'}
              </p>
              {previewUrl && (
                <p className="text-sm text-azure-600 font-medium mt-1">
                  새 이미지 미리보기 (업로드 중...)
                </p>
              )}
            </div>
          </div>

          {/* 업로드 버튼들 */}
          <div className="flex flex-wrap gap-3">
            <motion.label
              whileHover={uploading ? undefined : { y: -2 }}
              whileTap={uploading ? undefined : { scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 420, damping: 26 }}
              className="cursor-pointer inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-azure-500 to-azure-600 px-6 py-3 text-sm font-semibold text-white shadow-glow transition-colors duration-300 hover:from-azure-400 hover:to-azure-500 hover:shadow-glow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-azure-400/60 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleImageUpload}
                disabled={uploading}
                className="hidden"
              />
              {uploading ? (
                <>
                  <svg className="animate-spin -ml-0.5 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  업로드 중...
                </>
              ) : (
                <>
                  <ArrowUpTrayIcon className="h-4 w-4" />
                  {currentImageUrl ? '이미지 변경' : '이미지 업로드'}
                </>
              )}
            </motion.label>

            {currentImageUrl && (
              <GlassButton
                variant="outline"
                size="md"
                onClick={handleRemoveImage}
                disabled={uploading}
                className="!border-coral-400/50 !text-coral-600 hover:!bg-coral-100/50 hover:!border-coral-400"
              >
                <TrashIcon className="h-4 w-4" />
                이미지 제거
              </GlassButton>
            )}
          </div>

          {/* 안내 메시지 */}
          <div className="rounded-3xl border border-white/60 bg-azure-50/50 px-5 py-4 text-xs text-ink-500 space-y-1.5 leading-relaxed">
            <p>• 지원 형식: JPG, PNG, WebP</p>
            <p>• 최대 크기: 5MB</p>
            <p>• 권장 크기: 400x400 픽셀 (정사각형)</p>
            <p>• 업로드된 이미지는 자동으로 400x400으로 리사이즈됩니다</p>
          </div>
        </div>
      </div>
    </ScrollReveal>
  );
}
