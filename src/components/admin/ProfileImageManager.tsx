'use client';

import React, { useState } from 'react';
import Image from 'next/image';

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
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        프로필 이미지 관리 - {userName}
      </h3>
      
      <div className="space-y-4">
        {/* 현재 이미지 표시 */}
        <div className="flex items-center space-x-4">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
            {currentImageUrl || previewUrl ? (
              <Image
                src={previewUrl || currentImageUrl || ''}
                alt={`${userName} 프로필`}
                width={80}
                height={80}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-gray-400 text-sm text-center">
                이미지<br />없음
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <p className="text-sm text-gray-600">
              {currentImageUrl ? '현재 프로필 이미지' : '프로필 이미지가 설정되지 않았습니다'}
            </p>
            {previewUrl && (
              <p className="text-sm text-blue-600 mt-1">
                새 이미지 미리보기 (업로드 중...)
              </p>
            )}
          </div>
        </div>

        {/* 업로드 버튼들 */}
        <div className="flex space-x-3">
          <label className="cursor-pointer inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleImageUpload}
              disabled={uploading}
              className="hidden"
            />
            {uploading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                업로드 중...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                {currentImageUrl ? '이미지 변경' : '이미지 업로드'}
              </>
            )}
          </label>

          {currentImageUrl && (
            <button
              onClick={handleRemoveImage}
              disabled={uploading}
              className="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              이미지 제거
            </button>
          )}
        </div>

        {/* 안내 메시지 */}
        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
          <p>• 지원 형식: JPG, PNG, WebP</p>
          <p>• 최대 크기: 5MB</p>
          <p>• 권장 크기: 400x400 픽셀 (정사각형)</p>
          <p>• 업로드된 이미지는 자동으로 400x400으로 리사이즈됩니다</p>
        </div>
      </div>
    </div>
  );
}