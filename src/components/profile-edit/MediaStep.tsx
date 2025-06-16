'use client';

import { useState } from 'react';
import { DocumentIcon, TrashIcon } from '@heroicons/react/24/outline';
import { PlusIcon, PlayIcon } from '@heroicons/react/24/solid';
import PDFUpload from '@/components/PDFUpload';
import PDFImageViewer from '@/components/PDFImageViewer';
import DocumentUpload, { DocumentList } from '@/components/DocumentUpload';

interface UploadedDocument {
  url: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  downloadUrl: string;
  publicId: string;
}

interface VideoLink {
  url: string;
  title?: string;
  addedAt: Date;
}

interface MediaStepProps {
  data: {
    introVideo?: string;
    introVideos?: VideoLink[];
    portfolioPdfs?: Array<{
      url: string;
      fileName: string;
      uploadedAt: Date;
    }>;
    additionalDocuments?: UploadedDocument[];
  };
  onChange: (data: any) => void;
}

export default function MediaStep({ data, onChange }: MediaStepProps) {
  const [showPreview, setShowPreview] = useState<{ [key: number]: boolean }>({});
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [newVideoTitle, setNewVideoTitle] = useState('');

  const formatDate = (dateValue: any): string => {
    try {
      let date: Date;
      
      // Date 객체인 경우
      if (dateValue instanceof Date) {
        date = dateValue;
      }
      // Firebase Timestamp 객체인 경우
      else if (dateValue && typeof dateValue === 'object' && 'toDate' in dateValue) {
        try {
          date = dateValue.toDate();
        } catch (error) {
          console.warn('Failed to convert Timestamp to Date:', error);
          return '날짜 정보 없음';
        }
      }
      // 문자열인 경우
      else if (typeof dateValue === 'string') {
        if (dateValue.trim() === '') return '날짜 정보 없음';
        date = new Date(dateValue);
      }
      // 숫자(timestamp)인 경우
      else if (typeof dateValue === 'number') {
        date = new Date(dateValue);
      }
      // 기타 객체인 경우 (빈 객체 등)
      else if (typeof dateValue === 'object') {
        // Date 객체가 아닌 일반 객체는 현재 시간으로 처리하지 않고 에러로 처리
        console.warn('Invalid date object:', dateValue);
        return '날짜 정보 없음';
      }
      else {
        console.warn('Unknown date format:', dateValue);
        return '날짜 정보 없음';
      }
      
      if (isNaN(date.getTime())) {
        console.warn('Invalid date:', dateValue);
        return '날짜 정보 없음';
      }
      
      return date.toLocaleDateString('ko-KR');
    } catch (error) {
      console.error('Date formatting error:', error, 'Value:', dateValue);
      return '날짜 정보 없음';
    }
  };

  // 기존 단일 영상을 배열로 마이그레이션
  const getVideoList = (): VideoLink[] => {
    const videos = data.introVideos || [];
    
    // 기존 단일 영상이 있고 배열에 없다면 추가
    if (data.introVideo && !videos.some(v => v.url === data.introVideo)) {
      return [...videos, {
        url: data.introVideo,
        title: '자기소개 영상',
        addedAt: new Date()
      }];
    }
    
    return videos;
  };

  const handleAddVideo = () => {
    if (!newVideoUrl.trim()) return;
    
    const videoList = getVideoList();
    const newVideo: VideoLink = {
      url: newVideoUrl.trim(),
      title: newVideoTitle.trim() || '영상',
      addedAt: new Date()
    };
    
    const updatedVideos = [...videoList, newVideo];
    onChange({ 
      ...data, 
      introVideos: updatedVideos,
      introVideo: undefined // 기존 단일 영상 필드 제거
    });
    
    setNewVideoUrl('');
    setNewVideoTitle('');
  };

  const handleRemoveVideo = (index: number) => {
    const videoList = getVideoList();
    const updatedVideos = videoList.filter((_, i) => i !== index);
    onChange({ 
      ...data, 
      introVideos: updatedVideos,
      introVideo: undefined // 기존 단일 영상 필드 제거
    });
  };

  const togglePreview = (index: number) => {
    setShowPreview(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handlePDFUploadSuccess = (url: string, fileName: string) => {
    const newPdf = {
      url,
      fileName,
      uploadedAt: new Date()
    };
    const updated = [...(data.portfolioPdfs || []), newPdf];
    onChange({ ...data, portfolioPdfs: updated });
  };

  const handlePDFUploadError = (error: string) => {
    alert(`PDF 업로드 오류: ${error}`);
  };

  const removePDF = (index: number) => {
    const updated = data.portfolioPdfs?.filter((_, i) => i !== index) || [];
    onChange({ ...data, portfolioPdfs: updated });
  };

  const handleDocumentUploadSuccess = (document: UploadedDocument) => {
    const updated = [...(data.additionalDocuments || []), document];
    onChange({ ...data, additionalDocuments: updated });
  };

  const handleDocumentUploadError = (error: string) => {
    alert(`문서 업로드 오류: ${error}`);
  };

  const removeDocument = (publicId: string) => {
    const updated = data.additionalDocuments?.filter(doc => doc.publicId !== publicId) || [];
    onChange({ ...data, additionalDocuments: updated });
  };

  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const videoList = getVideoList();

  return (
    <div className="space-y-8">
      {/* Multiple Video Links Section */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">자기소개 영상</h3>
        <p className="text-sm text-gray-600 mb-4">
          YouTube에 업로드한 영상들의 URL을 추가해주세요. 여러 개의 영상을 추가할 수 있습니다.
        </p>

        {/* Add New Video Form */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h4 className="text-md font-medium text-gray-900 mb-3">새 영상 추가</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                영상 제목
              </label>
              <input
                type="text"
                value={newVideoTitle}
                onChange={(e) => setNewVideoTitle(e.target.value)}
                placeholder="예: 포트폴리오 소개, 프로젝트 데모 등"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                YouTube URL
              </label>
              <input
                type="url"
                value={newVideoUrl}
                onChange={(e) => setNewVideoUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <button
              type="button"
              onClick={handleAddVideo}
              disabled={!newVideoUrl.trim()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              영상 추가
            </button>
          </div>
        </div>

        {/* Video List */}
        {videoList.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-md font-medium text-gray-900">추가된 영상 ({videoList.length}개)</h4>
            {videoList.map((video, index) => (
              <div key={index} className="border border-gray-300 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <PlayIcon className="h-6 w-6 text-red-500" />
                    <div>
                      <div className="font-medium text-gray-900">{video.title}</div>
                      <div className="text-sm text-gray-500 truncate max-w-md">
                        {video.url}
                      </div>
                      <div className="text-xs text-gray-400">
                        추가일: {formatDate(video.addedAt)}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveVideo(index)}
                    className="text-red-600 hover:text-red-700 p-1"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>

                {getYouTubeId(video.url) && (
                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={() => togglePreview(index)}
                      className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                    >
                      {showPreview[index] ? '미리보기 숨기기' : '미리보기 보기'}
                    </button>
                    {showPreview[index] && (
                      <div className="mt-3">
                        <iframe
                          src={`https://www.youtube.com/embed/${getYouTubeId(video.url)}`}
                          className="w-full h-64 rounded-lg"
                          allowFullScreen
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {videoList.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            아직 추가된 영상이 없습니다. 첫 번째 영상을 추가해보세요!
          </div>
        )}
      </div>

      {/* Portfolio PDF Upload Section */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">포트폴리오 PDF</h3>
        <p className="text-sm text-gray-600 mb-4">
          자소서, 포트폴리오, 작품집 등의 PDF 파일을 업로드하세요. 업로드된 PDF는 포트폴리오 페이지에서 페이지별로 확인할 수 있습니다.
        </p>
        
        <PDFUpload
          onUploadSuccess={handlePDFUploadSuccess}
          onUploadError={handlePDFUploadError}
          className="mb-4"
        />

        {/* Uploaded PDFs List */}
        {data.portfolioPdfs && data.portfolioPdfs.length > 0 && (
          <div className="mt-6">
            <h4 className="text-md font-medium text-gray-900 mb-3">업로드된 PDF 파일</h4>
            <div className="space-y-6">
              {data.portfolioPdfs.map((pdf, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <DocumentIcon className="h-8 w-8 text-red-500" />
                      <div>
                        <div className="font-medium text-gray-900">{pdf.fileName}</div>
                        <div className="text-sm text-gray-500">
                          업로드: {formatDate(pdf.uploadedAt)}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removePDF(index)}
                      className="text-red-600 hover:text-red-700 p-1"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                  
                  {/* PDF 미리보기 */}
                  <div className="mt-4">
                    <PDFImageViewer
                      pdfUrl={pdf.url}
                      fileName={pdf.fileName}
                      className="max-w-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Additional Documents Upload Section */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">추가 문서 업로드</h3>
        <p className="text-sm text-gray-600 mb-4">
          자소서, 포트폴리오, 작품집 등의 다양한 문서 파일을 업로드하세요. 업로드된 문서는 포트폴리오 페이지에서 페이지별로 확인할 수 있습니다.
        </p>
        
        <DocumentUpload
          onUploadSuccess={handleDocumentUploadSuccess}
          onUploadError={handleDocumentUploadError}
          className="mb-4"
        />

        {/* Uploaded Documents List */}
        {data.additionalDocuments && data.additionalDocuments.length > 0 && (
          <div className="mt-6">
            <h4 className="text-md font-medium text-gray-900 mb-3">업로드된 문서</h4>
            <DocumentList 
              documents={data.additionalDocuments} 
              onRemove={removeDocument}
            />
          </div>
        )}
      </div>
    </div>
  );
}