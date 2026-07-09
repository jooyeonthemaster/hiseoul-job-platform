'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { DocumentIcon, CloudArrowUpIcon, XMarkIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/Badge';

interface PDFUploadProps {
  onUploadSuccess: (url: string, fileName: string) => void;
  onUploadError: (error: string) => void;
  className?: string;
  maxSize?: number; // MB 단위
}

interface UploadingFile {
  id: string;
  file: File;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  error?: string;
}

export default function PDFUpload({
  onUploadSuccess,
  onUploadError,
  className = '',
  maxSize = 50
}: PDFUploadProps) {
  const { user } = useAuth();
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const reduce = useReducedMotion();

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

    if (!user) {
      const msg = '로그인 후 업로드할 수 있습니다.';
      setUploadingFiles(prev => prev.map((f, i) => (i === index ? { ...f, status: 'error', error: msg } : f)));
      onUploadError(msg);
      return;
    }

    try {
      // Firebase Storage 로 직접 업로드 (Cloudinary 10MB 플랜 한도 제거 — 대용량 PDF 지원).
      // 규칙상 portfolio-pdfs/{본인uid}/ 아래에만 쓰기 가능, 읽기는 공개.
      const safeName = file.name.replace(/[^\w.\-]+/g, '_').slice(-80);
      const objectPath = `portfolio-pdfs/${user.uid}/${Date.now()}_${Math.random().toString(36).slice(2, 8)}_${safeName}`;
      const task = uploadBytesResumable(ref(storage, objectPath), file, { contentType: 'application/pdf' });

      const downloadUrl = await new Promise<string>((resolve, reject) => {
        task.on(
          'state_changed',
          (snapshot) => {
            const progress = snapshot.totalBytes
              ? Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)
              : 0;
            setUploadingFiles(prev => prev.map((f, i) => (i === index ? { ...f, progress } : f)));
          },
          (err) => {
            const code = (err as { code?: string })?.code;
            reject(new Error(
              code === 'storage/unauthorized'
                ? '업로드 권한이 없습니다. 다시 로그인 후 시도해 주세요.'
                : 'PDF 업로드에 실패했습니다. 잠시 후 다시 시도해 주세요.'
            ));
          },
          async () => {
            try {
              resolve(await getDownloadURL(task.snapshot.ref));
            } catch {
              reject(new Error('업로드된 PDF 주소를 받지 못했습니다.'));
            }
          },
        );
      });

      // 업로드 완료 상태로 변경
      setUploadingFiles(prev => prev.map((f, i) =>
        i === index ? { ...f, progress: 100, status: 'success' } : f
      ));

      // 성공 콜백 호출
      onUploadSuccess(downloadUrl, file.name);

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
      id: crypto.randomUUID(),
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
      <motion.div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        whileHover={reduce ? undefined : { y: -4 }}
        whileTap={reduce ? undefined : { scale: 0.99 }}
        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        style={{ willChange: 'transform' }}
        className={`
          group relative overflow-hidden rounded-4xl border-2 border-dashed p-10 sm:p-14 text-center cursor-pointer
          backdrop-blur-xl transition-all duration-300 ease-out
          before:content-[''] before:absolute before:inset-0 before:rounded-[inherit] before:pointer-events-none
          before:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.65)]
          ${isDragging
            ? 'border-azure-400 bg-azure-50/70 shadow-glow-lg'
            : 'border-azure-200 bg-white/55 shadow-glass hover:border-azure-300 hover:bg-white/70 hover:shadow-glass-lg'
          }
        `}
      >
        {/* 은은한 azure 글로우 (배경) */}
        <div
          aria-hidden
          className={`pointer-events-none absolute -inset-px rounded-[inherit] bg-azure-aurora opacity-0 transition-opacity duration-500 ${isDragging ? 'opacity-100' : 'group-hover:opacity-60'}`}
        />

        <div className="relative">
          {/* 아이콘 오브 */}
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-azure-400 to-azure-600 shadow-glow ring-1 ring-white/60">
            <CloudArrowUpIcon
              className={`h-10 w-10 text-white transition-transform duration-300 ${isDragging ? 'scale-110 -translate-y-0.5' : 'group-hover:scale-105 group-hover:-translate-y-0.5'}`}
            />
          </div>

          <div className="font-display text-xl sm:text-2xl font-bold tracking-tight text-ink-900 mb-2">
            PDF 파일을 업로드하세요
          </div>
          <div className="text-sm sm:text-base text-ink-500 leading-relaxed mb-5">
            파일을 드래그하여 놓거나 클릭하여 선택하세요
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Badge tone="azure">최대 {maxSize}MB</Badge>
            <Badge tone="neutral">PDF 파일만 지원</Badge>
            <Badge tone="neutral">여러 파일 동시 선택 가능</Badge>
          </div>
        </div>
      </motion.div>

      {/* 업로딩 중인 파일들 */}
      {uploadingFiles.length > 0 && (
        <div className="mt-5 space-y-3">
          <AnimatePresence initial={false}>
            {uploadingFiles.map((uploadingFile, index) => (
              <motion.div
                key={uploadingFile.id}
                layout
                initial={reduce ? false : { opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={reduce ? undefined : { opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="relative overflow-hidden rounded-3xl border border-white/60 bg-white/65 backdrop-blur-xl shadow-glass p-5
                  before:content-[''] before:absolute before:inset-0 before:rounded-[inherit] before:pointer-events-none
                  before:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.65)]"
              >
                <div className="relative flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-azure-50 ring-1 ring-azure-100">
                      <DocumentIcon className="h-6 w-6 text-azure-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-ink-900 truncate">{uploadingFile.file.name}</div>
                      <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-ink-500">
                        <span>{formatFileSize(uploadingFile.file.size)}</span>
                        {uploadingFile.status === 'uploading' && (
                          <Badge tone="azure">업로드 중...</Badge>
                        )}
                        {uploadingFile.status === 'success' && (
                          <Badge tone="mint" icon={<CheckCircleIcon className="h-3.5 w-3.5" />}>업로드 완료!</Badge>
                        )}
                        {uploadingFile.status === 'error' && (
                          <Badge tone="coral" icon={<ExclamationCircleIcon className="h-3.5 w-3.5" />}>오류: {uploadingFile.error}</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <motion.button
                    whileTap={reduce ? undefined : { scale: 0.9 }}
                    onClick={() => removeUploadingFile(index)}
                    className="flex-shrink-0 p-1.5 rounded-xl text-ink-400 hover:text-ink-700 hover:bg-azure-50/70 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-azure-400/60"
                    aria-label="파일 제거"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </motion.button>
                </div>

                {/* 진행률 바 */}
                {uploadingFile.status === 'uploading' && (
                  <div className="relative w-full overflow-hidden rounded-full bg-azure-100/80 h-2">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-azure-400 to-azure-600 shadow-glow transition-all duration-300"
                      style={{ width: `${uploadingFile.progress}%` }}
                    />
                  </div>
                )}

                {/* 성공 표시 */}
                {uploadingFile.status === 'success' && (
                  <div className="relative w-full overflow-hidden rounded-full bg-azure-100/80 h-2">
                    <div className="h-2 rounded-full bg-gradient-to-r from-mint-400 to-mint-500 w-full" />
                  </div>
                )}

                {/* 오류 표시 */}
                {uploadingFile.status === 'error' && (
                  <div className="relative w-full overflow-hidden rounded-full bg-azure-100/80 h-2">
                    <div className="h-2 rounded-full bg-gradient-to-r from-coral-400 to-coral-500 w-full" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}