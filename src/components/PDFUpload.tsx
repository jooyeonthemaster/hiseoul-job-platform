'use client';

import { useState, useRef, useCallback } from 'react';
import { DocumentIcon, CloudArrowUpIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface PDFUploadProps {
  onUploadSuccess: (url: string, fileName: string) => void;
  onUploadError: (error: string) => void;
  className?: string;
  maxSize?: number; // MB 단위
}

interface UploadingFile {
  file: File;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  error?: string;
}

export default function PDFUpload({ 
  onUploadSuccess, 
  onUploadError, 
  className = '',
  maxSize = 10 
}: PDFUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    // 파일 타입 검증
    if (file.type !== 'application/pdf') {
      return 'PDF 파일만 업로드 가능합니다.';
    }

    // 파일 크기 검증
    const maxSizeBytes = maxSize * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return `파일 크기는 ${maxSize}MB를 초과할 수 없습니다.`;
    }

    return null;
  };

  const uploadFile = async (file: File, index: number) => {
    const validationError = validateFile(file);
    if (validationError) {
      setUploadingFiles(prev => prev.map((f, i) => 
        i === index ? { ...f, status: 'error', error: validationError } : f
      ));
      onUploadError(validationError);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload-pdf', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'PDF 업로드에 실패했습니다.');
      }

      const result = await response.json();
      
      // 업로드 완료 상태로 변경
      setUploadingFiles(prev => prev.map((f, i) => 
        i === index ? { ...f, progress: 100, status: 'success' } : f
      ));
      
      // 성공 콜백 호출
      onUploadSuccess(result.url, file.name);
      
      // 일정 시간 후 목록에서 제거
      setTimeout(() => {
        setUploadingFiles(prev => prev.filter((_, i) => i !== index));
      }, 2000);

    } catch (error) {
      console.error('PDF 업로드 에러:', error);
      const errorMessage = error instanceof Error ? error.message : 'PDF 업로드 중 오류가 발생했습니다.';
      
      setUploadingFiles(prev => prev.map((f, i) => 
        i === index ? { ...f, status: 'error', error: errorMessage } : f
      ));
      
      onUploadError(errorMessage);
    }
  };

  const handleFiles = (files: FileList) => {
    const newFiles = Array.from(files).map(file => ({
      file,
      progress: 0,
      status: 'uploading' as const
    }));

    setUploadingFiles(prev => [...prev, ...newFiles]);

    // 각 파일을 개별적으로 업로드
    newFiles.forEach((fileData, relativeIndex) => {
      const absoluteIndex = uploadingFiles.length + relativeIndex;
      uploadFile(fileData.file, absoluteIndex);
    });
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFiles(files);
    }
  }, [uploadingFiles.length]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const removeUploadingFile = (index: number) => {
    setUploadingFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* 드래그 앤 드롭 영역 */}
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragging 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }
        `}
      >
        <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <div className="text-lg font-medium text-gray-900 mb-2">
          PDF 파일을 업로드하세요
        </div>
        <div className="text-sm text-gray-500 mb-4">
          파일을 드래그하여 놓거나 클릭하여 선택하세요
        </div>
        <div className="text-xs text-gray-400">
          최대 {maxSize}MB, PDF 파일만 지원 • 여러 파일 동시 선택 가능
        </div>
      </div>

      {/* 업로딩 중인 파일들 */}
      {uploadingFiles.length > 0 && (
        <div className="mt-4 space-y-3">
          {uploadingFiles.map((uploadingFile, index) => (
            <div key={index} className="border border-gray-300 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <DocumentIcon className="h-8 w-8 text-red-500" />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{uploadingFile.file.name}</div>
                    <div className="text-sm text-gray-500">
                      {formatFileSize(uploadingFile.file.size)} • 
                      {uploadingFile.status === 'uploading' && ' 업로드 중...'}
                      {uploadingFile.status === 'success' && ' 업로드 완료!'}
                      {uploadingFile.status === 'error' && ` 오류: ${uploadingFile.error}`}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => removeUploadingFile(index)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <XMarkIcon className="h-5 w-5 text-gray-400" />
                </button>
              </div>
              
              {/* 진행률 바 */}
              {uploadingFile.status === 'uploading' && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadingFile.progress}%` }}
                  />
                </div>
              )}
              
              {/* 성공 표시 */}
              {uploadingFile.status === 'success' && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full w-full" />
                </div>
              )}
              
              {/* 오류 표시 */}
              {uploadingFile.status === 'error' && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-red-600 h-2 rounded-full w-full" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 