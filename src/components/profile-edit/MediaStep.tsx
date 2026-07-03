'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { DocumentIcon, TrashIcon, VideoCameraIcon, DocumentArrowUpIcon, FolderArrowDownIcon } from '@heroicons/react/24/outline';
import { PlusIcon, PlayIcon } from '@heroicons/react/24/solid';
import PDFUpload from '@/components/PDFUpload';
import PDFImageViewer from '@/components/PDFImageViewer';
import DocumentUpload, { DocumentList } from '@/components/DocumentUpload';
import { GlassButton } from '@/components/ui/GlassButton';
import { GlassInput, Field } from '@/components/ui/GlassField';
import { Badge } from '@/components/ui/Badge';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

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
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
      {/* Multiple Video Links Section */}
      <ScrollReveal as="section" className="space-y-4">
        <div className="flex items-start gap-4">
          <span className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-azure-400 to-azure-600 text-white shadow-glow">
            <VideoCameraIcon className="h-5 w-5" />
          </span>
          <div>
            <div className="flex items-center gap-3">
              <h3 className="font-display text-xl font-bold tracking-tight text-ink-900">자기소개 영상</h3>
              {videoList.length > 0 && (
                <Badge tone="azure">{videoList.length}개</Badge>
              )}
            </div>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-500">
              YouTube에 업로드한 영상들의 URL을 추가해주세요. 여러 개의 영상을 추가할 수 있습니다.
            </p>
          </div>
        </div>

        {/* Add New Video Form */}
        <div className="glass-card p-5">
          <h4 className="mb-4 text-base font-semibold text-ink-900">새 영상 추가</h4>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="영상 제목">
              <GlassInput
                type="text"
                value={newVideoTitle}
                onChange={(e) => setNewVideoTitle(e.target.value)}
                placeholder="예: 포트폴리오 소개, 프로젝트 데모 등"
              />
            </Field>
            <Field label="YouTube URL">
              <GlassInput
                type="url"
                value={newVideoUrl}
                onChange={(e) => setNewVideoUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
              />
            </Field>
          </div>
          <div className="mt-4">
            <GlassButton
              type="button"
              onClick={handleAddVideo}
              disabled={!newVideoUrl.trim()}
            >
              <PlusIcon className="h-4 w-4" />
              영상 추가
            </GlassButton>
          </div>
        </div>

        {/* Video List */}
        {videoList.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-base font-semibold text-ink-700">추가된 영상 ({videoList.length}개)</h4>
            <div className="space-y-4">
              {videoList.map((video, index) => (
                <div
                  key={index}
                  className="glass rounded-3xl p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-glass-lg"
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <span className="flex-shrink-0 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-azure-50 text-azure-600 border border-azure-100">
                        <PlayIcon className="h-5 w-5" />
                      </span>
                      <div className="min-w-0">
                        <div className="font-semibold text-ink-900 truncate">{video.title}</div>
                        <div className="text-sm text-ink-500 truncate max-w-md">
                          {video.url}
                        </div>
                        <div className="text-xs text-ink-400 mt-0.5">
                          추가일: {formatDate(video.addedAt)}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveVideo(index)}
                      className="flex-shrink-0 inline-flex h-9 w-9 items-center justify-center rounded-xl text-coral-500 hover:bg-coral-100 hover:text-coral-600 transition-colors duration-200"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>

                  {getYouTubeId(video.url) && (
                    <div className="mt-3 border-t border-ink-100 pt-3">
                      <button
                        type="button"
                        onClick={() => togglePreview(index)}
                        className="text-azure-600 hover:text-azure-700 text-sm font-semibold transition-colors duration-200"
                      >
                        {showPreview[index] ? '미리보기 숨기기' : '미리보기 보기'}
                      </button>
                      <AnimatePresence initial={false}>
                        {showPreview[index] && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                            className="overflow-hidden"
                          >
                            <div className="mt-3 overflow-hidden rounded-2xl border border-white/60 shadow-glass">
                              <iframe
                                src={`https://www.youtube.com/embed/${getYouTubeId(video.url)}`}
                                className="w-full h-64"
                                allowFullScreen
                              />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {videoList.length === 0 && (
          <div className="glass-faint rounded-3xl text-center py-12 px-6">
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-azure-50 text-azure-500 border border-azure-100 mb-4">
              <VideoCameraIcon className="h-7 w-7" />
            </span>
            <p className="text-ink-500">
              아직 추가된 영상이 없습니다. 첫 번째 영상을 추가해보세요!
            </p>
          </div>
        )}
      </ScrollReveal>

      {/* Portfolio PDF Upload Section */}
      <ScrollReveal as="section" delay={0.05} className="space-y-4">
        <div className="flex items-start gap-4">
          <span className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-azure-400 to-azure-600 text-white shadow-glow">
            <DocumentArrowUpIcon className="h-5 w-5" />
          </span>
          <div>
            <h3 className="font-display text-xl font-bold tracking-tight text-ink-900">포트폴리오 PDF</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-500">
              자소서, 포트폴리오, 작품집 등의 PDF 파일을 업로드하세요. 업로드된 PDF는 포트폴리오 페이지에서 페이지별로 확인할 수 있습니다.
            </p>
          </div>
        </div>

        <PDFUpload
          onUploadSuccess={handlePDFUploadSuccess}
          onUploadError={handlePDFUploadError}
          className="mb-4"
        />

        {/* Uploaded PDFs List */}
        {data.portfolioPdfs && data.portfolioPdfs.length > 0 && (
          <div className="mt-6">
            <h4 className="text-base font-semibold text-ink-700 mb-4">업로드된 PDF 파일</h4>
            <div className="space-y-6">
              {data.portfolioPdfs.map((pdf, index) => (
                <div
                  key={index}
                  className="glass rounded-3xl p-4 transition-all duration-300 hover:shadow-glass-lg"
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-start gap-3 min-w-0">
                      <span className="flex-shrink-0 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-azure-50 text-azure-600 border border-azure-100">
                        <DocumentIcon className="h-6 w-6" />
                      </span>
                      <div className="min-w-0">
                        <div className="font-semibold text-ink-900 truncate">{pdf.fileName}</div>
                        <div className="text-sm text-ink-500 mt-0.5">
                          업로드: {formatDate(pdf.uploadedAt)}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removePDF(index)}
                      className="flex-shrink-0 inline-flex h-9 w-9 items-center justify-center rounded-xl text-coral-500 hover:bg-coral-100 hover:text-coral-600 transition-colors duration-200"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>

                  {/* PDF 미리보기 */}
                  <div className="mt-4 border-t border-ink-100 pt-4">
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
      </ScrollReveal>

      {/* Additional Documents Upload Section */}
      <ScrollReveal as="section" delay={0.1} className="space-y-4 xl:col-span-2">
        <div className="flex items-start gap-4">
          <span className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-azure-400 to-azure-600 text-white shadow-glow">
            <FolderArrowDownIcon className="h-5 w-5" />
          </span>
          <div>
            <h3 className="font-display text-xl font-bold tracking-tight text-ink-900">추가 문서 업로드</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-500">
              자소서, 포트폴리오, 작품집 등의 다양한 문서 파일을 업로드하세요. 업로드된 문서는 포트폴리오 페이지에서 페이지별로 확인할 수 있습니다.
            </p>
          </div>
        </div>

        <DocumentUpload
          onUploadSuccess={handleDocumentUploadSuccess}
          onUploadError={handleDocumentUploadError}
          className="mb-4"
        />

        {/* Uploaded Documents List */}
        {data.additionalDocuments && data.additionalDocuments.length > 0 && (
          <div className="mt-6">
            <h4 className="text-base font-semibold text-ink-700 mb-4">업로드된 문서</h4>
            <DocumentList
              documents={data.additionalDocuments}
              onRemove={removeDocument}
            />
          </div>
        )}
      </ScrollReveal>
    </div>
  );
}
