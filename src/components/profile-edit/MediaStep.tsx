'use client';

import { useState } from 'react';
import { PlusIcon, TrashIcon, VideoCameraIcon, DocumentIcon } from '@heroicons/react/24/outline';
import { MediaContent } from '@/types';
import PDFUpload from '@/components/PDFUpload';

interface MediaStepProps {
  data: {
    introVideo?: string;
    mediaContent?: MediaContent[];
    portfolioPdfs?: Array<{
      url: string;
      fileName: string;
      uploadedAt: Date;
    }>;
  };
  onChange: (data: any) => void;
}

export default function MediaStep({ data, onChange }: MediaStepProps) {
  const [showPreview, setShowPreview] = useState(false);

  const handleIntroVideoChange = (url: string) => {
    onChange({ ...data, introVideo: url });
  };

  const addMediaContent = () => {
    const newMedia: MediaContent = {
      type: 'youtube',
      url: '',
      title: '',
      description: '',
    };
    const updated = [...(data.mediaContent || []), newMedia];
    onChange({ ...data, mediaContent: updated });
  };

  const updateMediaContent = (index: number, field: keyof MediaContent, value: any) => {
    const updated = [...(data.mediaContent || [])];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ ...data, mediaContent: updated });
  };

  const removeMediaContent = (index: number) => {
    const updated = data.mediaContent?.filter((_, i) => i !== index) || [];
    onChange({ ...data, mediaContent: updated });
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
  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  return (
    <div className="space-y-8">
      {/* Intro Video Section */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">자기소개 영상</h3>
        <p className="text-sm text-gray-600 mb-4">
          YouTube에 업로드한 자기소개 영상 URL을 입력해주세요.
        </p>
        <div className="space-y-4">
          <input
            type="url"
            value={data.introVideo || ''}
            onChange={(e) => handleIntroVideoChange(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
          />
          
          {data.introVideo && getYouTubeId(data.introVideo) && (
            <div className="mt-4">
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
              >
                {showPreview ? '미리보기 숨기기' : '미리보기 보기'}
              </button>
              {showPreview && (
                <div className="mt-4 aspect-w-16 aspect-h-9">
                  <iframe
                    src={`https://www.youtube.com/embed/${getYouTubeId(data.introVideo)}`}
                    className="w-full h-64 rounded-lg"
                    allowFullScreen
                  />
                </div>
              )}
            </div>
          )}
        </div>
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
            <div className="space-y-3">
              {data.portfolioPdfs.map((pdf, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <DocumentIcon className="h-8 w-8 text-red-500" />
                    <div>
                      <div className="font-medium text-gray-900">{pdf.fileName}</div>
                      <div className="text-sm text-gray-500">
                        업로드: {pdf.uploadedAt.toLocaleDateString()}
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
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Additional Media Content */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">추가 미디어 콘텐츠</h3>
          <button
            type="button"
            onClick={addMediaContent}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            콘텐츠 추가
          </button>
        </div>
        
        {(!data.mediaContent || data.mediaContent.length === 0) ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <VideoCameraIcon className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p className="text-gray-500">추가 미디어 콘텐츠가 없습니다.</p>
            <p className="text-sm text-gray-400 mt-1">
              포트폴리오, 프로젝트 영상 등을 추가해보세요.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {data.mediaContent.map((media, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-medium text-gray-900">콘텐츠 {index + 1}</h4>
                  <button
                    type="button"
                    onClick={() => removeMediaContent(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={media.title}
                    onChange={(e) => updateMediaContent(index, 'title', e.target.value)}
                    placeholder="콘텐츠 제목"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="url"
                    value={media.url}
                    onChange={(e) => updateMediaContent(index, 'url', e.target.value)}
                    placeholder="YouTube URL"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <textarea
                    value={media.description || ''}
                    onChange={(e) => updateMediaContent(index, 'description', e.target.value)}
                    placeholder="콘텐츠 설명"
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}