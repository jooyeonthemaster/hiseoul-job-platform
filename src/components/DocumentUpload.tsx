'use client';

import { useState, useRef, useCallback } from 'react';
import { DocumentIcon, CloudArrowUpIcon, XMarkIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';

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

      {!selectedFile && !isUploading && (
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
            문서 파일을 업로드하세요
          </div>
          <div className="text-sm text-gray-500 mb-4">
            파일을 드래그하여 놓거나 클릭하여 선택하세요
          </div>
          <div className="text-xs text-gray-400">
            최대 {maxSize}MB<br />
            지원 형식: {allowedTypes.join(', ')}
          </div>
        </div>
      )}

      {selectedFile && !isUploading && (
        <div className="border border-gray-300 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{getFileIcon(selectedFile.name)}</span>
              <div>
                <div className="font-medium text-gray-900">{selectedFile.name}</div>
                <div className="text-sm text-gray-500">{formatFileSize(selectedFile.size)}</div>
              </div>
            </div>
            <button
              onClick={handleRemoveFile}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
          
          <button
            onClick={handleUpload}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            업로드
          </button>
        </div>
      )}

      {isUploading && (
        <div className="border border-gray-300 rounded-lg p-4">
          <div className="flex items-center space-x-3 mb-4">
            <span className="text-2xl">{selectedFile ? getFileIcon(selectedFile.name) : '📄'}</span>
            <div>
              <div className="font-medium text-gray-900">
                {selectedFile?.name || '업로드 중...'}
              </div>
              <div className="text-sm text-gray-500">업로드 중...</div>
            </div>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}
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
      <div className="text-center py-8 text-gray-500">
        업로드된 문서가 없습니다.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {documents.map((document, index) => (
        <div key={index} className="border border-gray-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{getFileIcon(document.fileName)}</span>
            <div>
              <div className="font-medium text-gray-900">{document.fileName}</div>
              <div className="text-sm text-gray-500">{formatFileSize(document.fileSize)}</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleDownload(document)}
              className="flex items-center space-x-1 bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition-colors text-sm"
            >
              <ArrowDownTrayIcon className="h-4 w-4" />
              <span>다운로드</span>
            </button>
            
            {onRemove && (
              <button
                onClick={() => onRemove(document.publicId)}
                className="text-gray-400 hover:text-red-600 transition-colors"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
} 