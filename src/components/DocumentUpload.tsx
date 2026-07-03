'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { DocumentIcon, CloudArrowUpIcon, XMarkIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { GlassButton } from '@/components/ui/GlassButton';
import { Badge } from '@/components/ui/Badge';

interface UploadedDocument {
  url: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  downloadUrl: string;
  publicId: string;
}

interface DocumentUploadProps {
  onUploadSuccess: (document: UploadedDocument) => void;
  onUploadError: (error: string) => void;
  className?: string;
  maxSize?: number; // MB 단위
  allowedTypes?: string[];
}

export default function DocumentUpload({
  onUploadSuccess,
  onUploadError,
  className = '',
  maxSize = 20,
  allowedTypes = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.hwp', '.txt', '.rtf', '.zip', '.rar']
}: DocumentUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const reduce = useReducedMotion();

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.toLowerCase().split('.').pop();
    switch (extension) {
      case 'pdf':
        return '📄';
      case 'doc':
      case 'docx':
        return '📝';
      case 'xls':
      case 'xlsx':
        return '📊';
      case 'ppt':
      case 'pptx':
        return '📈';
      case 'hwp':
        return '📋';
      case 'txt':
        return '📃';
      case 'zip':
      case 'rar':
        return '🗜️';
      default:
        return '📄';
    }
  };

  const validateFile = (file: File): string | null => {
    // 파일 크기 검증
    if (file.size > maxSize * 1024 * 1024) {
      return `파일 크기는 ${maxSize}MB를 초과할 수 없습니다.`;
    }

    // 파일 확장자 검증
    const fileName = file.name.toLowerCase();
    const hasValidExtension = allowedTypes.some(type => fileName.endsWith(type));

    if (!hasValidExtension) {
      return `지원되지 않는 파일 형식입니다. 지원 형식: ${allowedTypes.join(', ')}`;
    }

    return null;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const error = validateFile(file);
      if (error) {
        onUploadError(error);
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      console.error('selectedFile이 없습니다');
      onUploadError('파일이 선택되지 않았습니다.');
      return;
    }

    // 파일 정보 검증
    if (!selectedFile.name) {
      console.error('파일 이름이 없습니다:', {
        name: selectedFile.name,
        type: selectedFile.type,
        size: selectedFile.size
      });
      onUploadError('파일 이름이 올바르지 않습니다.');
      return;
    }

    // 파일 타입이 없는 경우 확장자로 추정
    let fileType = selectedFile.type;
    if (!fileType) {
      const extension = selectedFile.name.toLowerCase().split('.').pop();
      switch (extension) {
        case 'hwp':
          fileType = 'application/x-hwp';
          break;
        case 'pdf':
          fileType = 'application/pdf';
          break;
        case 'doc':
          fileType = 'application/msword';
          break;
        case 'docx':
          fileType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
          break;
        case 'xls':
          fileType = 'application/vnd.ms-excel';
          break;
        case 'xlsx':
          fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
          break;
        case 'ppt':
          fileType = 'application/vnd.ms-powerpoint';
          break;
        case 'pptx':
          fileType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
          break;
        case 'txt':
          fileType = 'text/plain';
          break;
        case 'zip':
          fileType = 'application/zip';
          break;
        case 'rar':
          fileType = 'application/x-rar-compressed';
          break;
        default:
          fileType = 'application/octet-stream';
      }
      console.log(`파일 타입 추정: ${extension} -> ${fileType}`);
    }

    console.log('업로드 시작:', {
      fileName: selectedFile.name,
      fileType: fileType,
      originalType: selectedFile.type,
      fileSize: selectedFile.size
    });

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // 🚀 방법 1: Unsigned Upload 시도 (preset 사용)
      console.log('🚀 Unsigned Upload 시도 중 (preset: document_uploads)...');

      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'djhocuyhp';
      const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`;

      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('upload_preset', 'document_uploads');
      formData.append('resource_type', 'raw');

      console.log('Unsigned 업로드 파라미터:');
      console.log('- upload_preset: document_uploads');
      console.log('- resource_type: raw');
      console.log('- cloud_name:', cloudName);
      console.log('- upload_url:', uploadUrl);

      // XMLHttpRequest를 사용하여 업로드 진행률 추적
      const uploadPromise = new Promise<any>((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            setUploadProgress(progress);
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status === 200) {
            try {
              const result = JSON.parse(xhr.responseText);
              console.log('✅ Unsigned Upload 성공:', result);
              resolve(result);
            } catch (error) {
              console.error('❌ 응답 파싱 오류:', error);
              reject(new Error('응답 파싱 오류'));
            }
          } else {
            console.error(`❌ Unsigned Upload 실패: ${xhr.status}`, xhr.responseText);
            // 실패하면 서명 방식으로 fallback
            reject(new Error('unsigned_failed'));
          }
        });

        xhr.addEventListener('error', () => {
          console.error('❌ Unsigned Upload 네트워크 오류');
          reject(new Error('네트워크 오류'));
        });

        xhr.open('POST', uploadUrl);
        xhr.send(formData);
      });

      let result;
      try {
        result = await uploadPromise;
      } catch (error: any) {
        if (error.message === 'unsigned_failed') {
          console.log('🔄 Unsigned 실패, 서명 방식으로 재시도...');

          // 🔐 방법 2: 서명된 업로드 (fallback)
          const signatureResponse = await fetch('/api/upload-signature', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              fileName: selectedFile.name,
              fileType: fileType,
            }),
          });

          if (!signatureResponse.ok) {
            const errorData = await signatureResponse.json();
            throw new Error(errorData.error || '업로드 준비에 실패했습니다.');
          }

          const { uploadData, publicId, originalFileName } = await signatureResponse.json();

          // 수정된 서명 업로드
          const signedFormData = new FormData();
          signedFormData.append('file', selectedFile);
          signedFormData.append('public_id', uploadData.public_id);
          signedFormData.append('timestamp', uploadData.timestamp.toString());
          signedFormData.append('signature', uploadData.signature);
          signedFormData.append('api_key', uploadData.api_key);
          signedFormData.append('resource_type', uploadData.resource_type);

          console.log('서명된 업로드 파라미터:');
          console.log('- signature:', uploadData.signature);
          console.log('- timestamp:', uploadData.timestamp);
          console.log('- api_key:', uploadData.api_key);
          console.log('- public_id:', uploadData.public_id);
          console.log('- resource_type:', uploadData.resource_type);

          const signedUploadPromise = new Promise<any>((resolve, reject) => {
            const xhr = new XMLHttpRequest();

            xhr.upload.addEventListener('progress', (event) => {
              if (event.lengthComputable) {
                const progress = Math.round((event.loaded / event.total) * 100);
                setUploadProgress(progress);
              }
            });

            xhr.addEventListener('load', () => {
              if (xhr.status === 200) {
                try {
                  const result = JSON.parse(xhr.responseText);
                  console.log('✅ 서명된 업로드 성공:', result);
                  resolve(result);
                } catch (error) {
                  reject(new Error('응답 파싱 오류'));
                }
              } else {
                console.error(`❌ 서명된 업로드 실패: ${xhr.status}`, xhr.responseText);
                reject(new Error(`업로드 실패: ${xhr.status}`));
              }
            });

            xhr.addEventListener('error', () => {
              reject(new Error('네트워크 오류'));
            });

            xhr.open('POST', uploadData.upload_url);
            xhr.send(signedFormData);
          });

          result = await signedUploadPromise;
        } else {
          throw error;
        }
      }

      // 3. 업로드 완료 후 문서 정보 생성
      onUploadSuccess({
        url: result.secure_url,
        fileName: selectedFile.name, // 원본 파일명 사용
        fileSize: selectedFile.size,
        fileType: fileType,
        downloadUrl: result.secure_url, // 클라우디너리 URL이 다운로드 URL
        publicId: result.public_id,
      });

      setSelectedFile(null);
      setUploadProgress(100);

    } catch (error) {
      console.error('업로드 오류:', error);
      onUploadError(error instanceof Error ? error.message : '업로드 중 오류가 발생했습니다.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
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
      const file = files[0];
      const error = validateFile(file);
      if (error) {
        onUploadError(error);
        return;
      }
      setSelectedFile(file);
    }
  }, [maxSize, allowedTypes, onUploadError]);

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        type="file"
        accept={allowedTypes.join(',')}
        onChange={handleFileSelect}
        className="hidden"
      />

      <AnimatePresence mode="wait">
        {!selectedFile && !isUploading && (
          <motion.div
            key="dropzone"
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={reduce ? {} : { opacity: 1, y: 0 }}
            exit={reduce ? {} : { opacity: 0, y: -12 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            onClick={handleClick}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            whileHover={reduce ? undefined : { y: -4 }}
            whileTap={reduce ? undefined : { scale: 0.99 }}
            className={`
              group relative overflow-hidden rounded-4xl p-10 sm:p-14 text-center cursor-pointer
              backdrop-blur-xl border shadow-glass transition-all duration-300 ease-out
              ${isDragging
                ? 'border-azure-400 bg-azure-50/70 shadow-glass-lg ring-2 ring-azure-400/40'
                : 'border-white/60 bg-white/55 hover:bg-white/70 hover:shadow-glass-lg'
              }
            `}
          >
            {/* soft azure aura */}
            <div
              className={`pointer-events-none absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-gradient-to-br from-azure-300/40 via-sky-cool-300/30 to-transparent blur-3xl transition-opacity duration-500 ${
                isDragging ? 'opacity-100' : 'opacity-60 group-hover:opacity-90'
              }`}
            />

            <div className="relative">
              <div
                className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border border-white/70 bg-gradient-to-br from-azure-500 to-azure-600 shadow-glow transition-transform duration-300 ${
                  isDragging ? 'scale-110' : 'group-hover:scale-105'
                }`}
              >
                <CloudArrowUpIcon className="h-10 w-10 text-white" />
              </div>

              <div className="mb-2 font-display text-xl sm:text-2xl font-semibold tracking-tight text-ink-900">
                문서 파일을 업로드하세요
              </div>
              <div className="mb-6 text-sm sm:text-base text-ink-500">
                파일을 드래그하여 놓거나 클릭하여 선택하세요
              </div>

              <div className="mx-auto inline-flex flex-col items-center gap-2 rounded-2xl border border-white/60 bg-white/50 px-5 py-3 text-xs text-ink-400 backdrop-blur-sm">
                <span className="font-medium text-ink-500">최대 {maxSize}MB</span>
                <span className="leading-relaxed">지원 형식: {allowedTypes.join(', ')}</span>
              </div>
            </div>
          </motion.div>
        )}

        {selectedFile && !isUploading && (
          <motion.div
            key="selected"
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={reduce ? {} : { opacity: 1, y: 0 }}
            exit={reduce ? {} : { opacity: 0, y: -12 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="relative rounded-4xl border border-white/60 bg-white/75 p-6 shadow-glass backdrop-blur-xl"
          >
            <div className="mb-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/70 bg-azure-50/80 text-2xl shadow-glass-sm">
                  {getFileIcon(selectedFile.name)}
                </span>
                <div className="min-w-0">
                  <div className="truncate font-semibold text-ink-900">{selectedFile.name}</div>
                  <div className="text-sm text-ink-500">{formatFileSize(selectedFile.size)}</div>
                </div>
              </div>
              <button
                onClick={handleRemoveFile}
                aria-label="파일 제거"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/60 bg-white/60 text-ink-400 transition-all duration-200 hover:bg-coral-100/70 hover:text-coral-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-azure-400/50"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <GlassButton onClick={handleUpload} variant="primary" className="w-full">
              <CloudArrowUpIcon className="h-5 w-5" />
              업로드
            </GlassButton>
          </motion.div>
        )}

        {isUploading && (
          <motion.div
            key="uploading"
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={reduce ? {} : { opacity: 1, y: 0 }}
            exit={reduce ? {} : { opacity: 0, y: -12 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="relative rounded-4xl border border-white/60 bg-white/75 p-6 shadow-glass backdrop-blur-xl"
          >
            <div className="mb-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/70 bg-azure-50/80 text-2xl shadow-glass-sm">
                  {selectedFile ? getFileIcon(selectedFile.name) : '📄'}
                </span>
                <div className="min-w-0">
                  <div className="truncate font-semibold text-ink-900">
                    {selectedFile?.name || '업로드 중...'}
                  </div>
                  <div className="text-sm text-ink-500">업로드 중...</div>
                </div>
              </div>
              <Badge tone="azure">{uploadProgress}%</Badge>
            </div>

            <div className="h-2.5 w-full overflow-hidden rounded-full bg-ink-100/80">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-azure-400 via-sky-cool-400 to-azure-600 shadow-glow"
                initial={false}
                animate={{ width: `${uploadProgress}%` }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// 업로드된 문서 목록을 표시하는 컴포넌트
interface DocumentListProps {
  documents: UploadedDocument[];
  onRemove?: (publicId: string) => void;
}

export function DocumentList({ documents, onRemove }: DocumentListProps) {
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.toLowerCase().split('.').pop();
    switch (extension) {
      case 'pdf':
        return '📄';
      case 'doc':
      case 'docx':
        return '📝';
      case 'xls':
      case 'xlsx':
        return '📊';
      case 'ppt':
      case 'pptx':
        return '📈';
      case 'hwp':
        return '📋';
      case 'txt':
        return '📃';
      case 'zip':
      case 'rar':
        return '🗜️';
      default:
        return '📄';
    }
  };

  const handleDownload = (document: UploadedDocument) => {
    // 새 창에서 다운로드 URL 열기
    window.open(document.downloadUrl, '_blank');
  };

  if (documents.length === 0) {
    return (
      <div className="rounded-4xl border border-white/60 bg-white/50 px-6 py-12 text-center shadow-glass backdrop-blur-xl">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/70 bg-azure-50/80 shadow-glass-sm">
          <DocumentIcon className="h-7 w-7 text-azure-500" />
        </div>
        <p className="text-ink-500">업로드된 문서가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {documents.map((document, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: index * 0.05 }}
          whileHover={{ y: -4 }}
          className="flex items-center justify-between gap-4 rounded-3xl border border-white/60 bg-white/65 p-5 shadow-glass backdrop-blur-xl transition-shadow duration-300 hover:shadow-glass-lg"
        >
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/70 bg-azure-50/80 text-2xl shadow-glass-sm">
              {getFileIcon(document.fileName)}
            </span>
            <div className="min-w-0">
              <div className="truncate font-semibold text-ink-900">{document.fileName}</div>
              <div className="text-sm text-ink-500">{formatFileSize(document.fileSize)}</div>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <GlassButton onClick={() => handleDownload(document)} variant="primary" size="sm">
              <ArrowDownTrayIcon className="h-4 w-4" />
              <span>다운로드</span>
            </GlassButton>

            {onRemove && (
              <button
                onClick={() => onRemove(document.publicId)}
                aria-label="문서 삭제"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/60 bg-white/60 text-ink-400 transition-all duration-200 hover:bg-coral-100/70 hover:text-coral-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-azure-400/50"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
