'use client';

import { useState, type ElementType, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowTopRightOnSquareIcon,
  DocumentArrowUpIcon,
  DocumentIcon,
  FilmIcon,
  FolderArrowDownIcon,
  LinkIcon,
  TrashIcon,
  VideoCameraIcon,
} from '@heroicons/react/24/outline';
import { PlusIcon, PlayIcon } from '@heroicons/react/24/solid';
import PDFUpload from '@/components/PDFUpload';
import PDFImageViewer from '@/components/PDFImageViewer';
import DocumentUpload, { DocumentList } from '@/components/DocumentUpload';
import { GlassButton } from '@/components/ui/GlassButton';
import { GlassInput, GlassSelect, GlassTextarea, Field } from '@/components/ui/GlassField';
import { Badge } from '@/components/ui/Badge';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import {
  EXTERNAL_PORTFOLIO_LINK_TYPES,
  type ExternalPortfolioLink,
  type ExternalPortfolioLinkType,
  getHostnameLabel,
  normalizeExternalPortfolioLinks,
  normalizeUrl,
} from '@/lib/externalPortfolioLinks';
import { formatKoreanDate } from '@/lib/dateUtils';
import { getYouTubeId } from '@/lib/youtube';

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
    portfolioVideos?: VideoLink[];
    externalLinks?: ExternalPortfolioLink[];
    portfolioPdfs?: Array<{
      url: string;
      fileName: string;
      uploadedAt: Date;
    }>;
    additionalDocuments?: UploadedDocument[];
  };
  onChange: (data: any) => void;
}

// ─────────────────────────────────────────────────────────────
//  재사용 영상 링크 섹션 — 자기소개 영상(1개 제한)과 포트폴리오·기타영상(여러 개)이
//  동일한 UI/동작을 공유하도록 추출. max 를 넘기면 그 개수까지만 추가할 수 있다.
// ─────────────────────────────────────────────────────────────
function VideoLinksSection({
  icon: Icon,
  title,
  description,
  videos,
  onChange,
  max,
  addFormTitle = '새 영상 추가',
  maxReachedNote,
  emptyText,
  delay = 0,
  className = 'space-y-4',
}: {
  icon: ElementType;
  title: string;
  description: string;
  videos: VideoLink[];
  onChange: (videos: VideoLink[]) => void;
  max?: number;
  addFormTitle?: string;
  maxReachedNote?: ReactNode;
  emptyText: string;
  delay?: number;
  className?: string;
}) {
  const [showPreview, setShowPreview] = useState<{ [key: number]: boolean }>({});
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [newVideoTitle, setNewVideoTitle] = useState('');

  const atMax = typeof max === 'number' && videos.length >= max;
  const formatDate = (dateValue: any): string =>
    formatKoreanDate(dateValue, { fallback: '날짜 정보 없음' });

  const handleAddVideo = () => {
    const url = normalizeUrl(newVideoUrl);
    if (!url || atMax) return;

    onChange([
      ...videos,
      { url, title: newVideoTitle.trim() || '영상', addedAt: new Date() },
    ]);
    setNewVideoUrl('');
    setNewVideoTitle('');
  };

  const handleRemoveVideo = (index: number) => {
    onChange(videos.filter((_, i) => i !== index));
  };

  const togglePreview = (index: number) => {
    setShowPreview((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <ScrollReveal as="section" delay={delay} className={className}>
      <div className="flex items-start gap-4">
        <span className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-azure-400 to-azure-600 text-white shadow-glow">
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <div className="flex items-center gap-3">
            <h3 className="font-display text-xl font-bold tracking-tight text-ink-900">{title}</h3>
            {videos.length > 0 && <Badge tone="azure">{videos.length}개</Badge>}
          </div>
          <p className="mt-1.5 text-sm leading-relaxed text-ink-500">{description}</p>
        </div>
      </div>

      {/* Add New Video Form — 최대 개수에 도달하면 폼 대신 안내 문구를 노출 */}
      {atMax ? (
        maxReachedNote ? (
          <div className="glass-faint rounded-3xl px-5 py-4 text-sm leading-relaxed text-ink-500">
            {maxReachedNote}
          </div>
        ) : null
      ) : (
        <div className="glass-card p-5">
          <h4 className="mb-4 text-base font-semibold text-ink-900">{addFormTitle}</h4>
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
            <GlassButton type="button" onClick={handleAddVideo} disabled={!newVideoUrl.trim()}>
              <PlusIcon className="h-4 w-4" />
              영상 추가
            </GlassButton>
          </div>
        </div>
      )}

      {/* Video List */}
      {videos.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-base font-semibold text-ink-700">추가된 영상 ({videos.length}개)</h4>
          <div className="space-y-4">
            {videos.map((video, index) => (
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
                      <div className="text-sm text-ink-500 truncate max-w-md">{video.url}</div>
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

      {videos.length === 0 && (
        <div className="glass-faint rounded-3xl text-center py-12 px-6">
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-azure-50 text-azure-500 border border-azure-100 mb-4">
            <Icon className="h-7 w-7" />
          </span>
          <p className="text-ink-500">{emptyText}</p>
        </div>
      )}
    </ScrollReveal>
  );
}

export default function MediaStep({ data, onChange }: MediaStepProps) {
  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newLinkType, setNewLinkType] = useState<ExternalPortfolioLinkType>('webapp');
  const [newLinkDescription, setNewLinkDescription] = useState('');
  // 임베드 지원이 안 되는 사이트가 더 많아 기본값은 '임베드 끔'. 사용자가 필요 시 켤 수 있다.
  const [newLinkEmbed, setNewLinkEmbed] = useState(false);

  const formatDate = (dateValue: any): string =>
    formatKoreanDate(dateValue, { fallback: '날짜 정보 없음' });

  // 자기소개 영상: 기존 단일 영상(introVideo)을 배열로 병합해 표시한다.
  const getIntroVideoList = (): VideoLink[] => {
    const videos = data.introVideos || [];
    if (data.introVideo && !videos.some((v) => v.url === data.introVideo)) {
      return [...videos, { url: data.introVideo, title: '자기소개 영상', addedAt: new Date() }];
    }
    return videos;
  };

  const externalLinks = normalizeExternalPortfolioLinks(data.externalLinks);

  const handleLinkTypeChange = (type: ExternalPortfolioLinkType) => {
    setNewLinkType(type);
    // GitHub 는 임베드 미지원 → 강제 끔. 그 외 유형은 사용자가 설정한 값(기본 끔)을 유지.
    if (type === 'github') setNewLinkEmbed(false);
  };

  // 이미 추가된 링크의 임베드 표시를 켜고 끄는 토글 (embed 필드를 명시적 boolean 으로 저장)
  const handleToggleExternalLinkEmbed = (index: number) => {
    onChange({
      ...data,
      externalLinks: externalLinks.map((link, itemIndex) =>
        itemIndex === index ? { ...link, embed: link.embed === false } : link,
      ),
    });
  };

  const handleAddExternalLink = () => {
    const url = normalizeUrl(newLinkUrl);
    if (!url) return;

    const nextLink: ExternalPortfolioLink = {
      url,
      title: newLinkTitle.trim() || getHostnameLabel(url),
      type: newLinkType,
      description: newLinkDescription.trim(),
      embed: newLinkType === 'github' ? false : newLinkEmbed,
      addedAt: new Date(),
    };

    onChange({
      ...data,
      externalLinks: normalizeExternalPortfolioLinks([...externalLinks, nextLink]),
    });

    setNewLinkTitle('');
    setNewLinkUrl('');
    setNewLinkType('webapp');
    setNewLinkDescription('');
    setNewLinkEmbed(false);
  };

  const handleRemoveExternalLink = (index: number) => {
    onChange({
      ...data,
      externalLinks: externalLinks.filter((_, itemIndex) => itemIndex !== index),
    });
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

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
      {/* 1. 자기소개 영상 — 대표 영상 1개만 등록 */}
      <VideoLinksSection
        icon={VideoCameraIcon}
        title="자기소개 영상"
        description="본인을 소개하는 대표 영상 1개를 등록하세요. YouTube에 업로드한 영상의 URL을 붙여넣으면 됩니다."
        videos={getIntroVideoList()}
        onChange={(videos) => onChange({ ...data, introVideos: videos, introVideo: undefined })}
        max={1}
        maxReachedNote={
          <>
            자기소개 영상은 <b className="font-semibold text-ink-700">1개만</b> 등록할 수 있습니다. 프로젝트·작업물 등 다른 영상은 아래{' '}
            <b className="font-semibold text-ink-700">포트폴리오 및 기타영상</b>에 등록해주세요.
          </>
        }
        emptyText="아직 등록된 자기소개 영상이 없습니다. 대표 영상 1개를 추가해보세요!"
      />

      {/* 2. 웹 작업물 링크 */}
      <ScrollReveal as="section" delay={0.04} className="space-y-4 xl:col-span-2">
        <div className="flex items-start gap-4">
          <span className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-azure-400 to-azure-600 text-white shadow-glow">
            <LinkIcon className="h-5 w-5" />
          </span>
          <div>
            <div className="flex items-center gap-3">
              <h3 className="font-display text-xl font-bold tracking-tight text-ink-900">웹 작업물 링크</h3>
              {externalLinks.length > 0 && <Badge tone="azure">{externalLinks.length}개</Badge>}
            </div>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-500">
              바이브코딩으로 만든 웹 프로그램, 노션 포트폴리오, GitHub 저장소 등 외부 산출물 링크를 추가하세요.
            </p>
          </div>
        </div>

        <div className="glass-card p-5">
          <div className="grid gap-4 lg:grid-cols-[1fr_1.25fr]">
            <Field label="작업물 제목">
              <GlassInput
                type="text"
                value={newLinkTitle}
                onChange={(event) => setNewLinkTitle(event.target.value)}
                placeholder="예: AI 학습 관리 웹앱"
              />
            </Field>
            <Field label="URL">
              <GlassInput
                type="url"
                value={newLinkUrl}
                onChange={(event) => setNewLinkUrl(event.target.value)}
                placeholder="https://example.vercel.app"
              />
            </Field>
            <Field label="링크 유형">
              <GlassSelect
                value={newLinkType}
                onChange={(event) => handleLinkTypeChange(event.target.value as ExternalPortfolioLinkType)}
              >
                {EXTERNAL_PORTFOLIO_LINK_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </GlassSelect>
            </Field>
            <Field label="간단 설명">
              <GlassTextarea
                value={newLinkDescription}
                onChange={(event) => setNewLinkDescription(event.target.value)}
                placeholder="무엇을 만들었고 어떤 역할을 했는지 짧게 적어주세요."
                className="min-h-[52px]"
              />
            </Field>
          </div>

          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-1">
              <label className="inline-flex items-center gap-3 text-sm font-semibold text-ink-700">
                <input
                  type="checkbox"
                  checked={newLinkEmbed}
                  onChange={(event) => setNewLinkEmbed(event.target.checked)}
                  disabled={newLinkType === 'github'}
                  className="h-5 w-5 rounded border-azure-200 text-azure-600 focus:ring-azure-400 disabled:opacity-40"
                />
                포트폴리오 상세에 임베드 표시
              </label>
              <span className="text-xs leading-relaxed text-ink-400">
                임베드를 허용하지 않는 사이트가 많아 기본은 <b className="font-semibold text-ink-500">꺼짐</b>입니다. 지원하는 사이트만 켜주세요. (추가 후에도 각 링크에서 켜고 끌 수 있어요)
              </span>
            </div>
            <GlassButton type="button" onClick={handleAddExternalLink} disabled={!newLinkUrl.trim()}>
              <PlusIcon className="h-4 w-4" />
              링크 추가
            </GlassButton>
          </div>
        </div>

        {externalLinks.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2">
            {externalLinks.map((link, index) => (
              <div key={`${link.url}-${index}`} className="glass rounded-3xl p-4 shadow-glass-sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-semibold text-ink-900 break-words">{link.title}</h4>
                      <Badge tone={link.type === 'webapp' ? 'azure' : link.type === 'notion' ? 'mint' : 'neutral'}>
                        {EXTERNAL_PORTFOLIO_LINK_TYPES.find((type) => type.value === link.type)?.label || '링크'}
                      </Badge>
                      {link.embed !== false && <Badge tone="mint">임베드</Badge>}
                    </div>
                    <p className="mt-1 break-all text-sm text-ink-500">{link.url}</p>
                    {link.description && (
                      <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed text-ink-600">
                        {link.description}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveExternalLink(index)}
                    className="flex-shrink-0 inline-flex h-9 w-9 items-center justify-center rounded-xl text-coral-500 hover:bg-coral-100 hover:text-coral-600 transition-colors duration-200"
                    aria-label="링크 삭제"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-azure-600 hover:text-azure-700"
                  >
                    <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                    새 창에서 확인
                  </a>
                  {/* GitHub 는 임베드 미지원이라 토글 숨김. 그 외 링크는 임베드 켜고 끄기 가능. */}
                  {link.type !== 'github' && (
                    <button
                      type="button"
                      onClick={() => handleToggleExternalLinkEmbed(index)}
                      className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-colors duration-200 ${
                        link.embed !== false
                          ? 'border-mint-400/50 bg-mint-100 text-mint-600 hover:bg-mint-100/70'
                          : 'border-azure-200 bg-white/60 text-ink-500 hover:bg-white'
                      }`}
                      aria-pressed={link.embed !== false}
                    >
                      {link.embed !== false ? '임베드 켜짐 · 끄기' : '임베드 꺼짐 · 켜기'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollReveal>

      {/* 3. 포트폴리오 PDF */}
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

      {/* 4. 포트폴리오 및 기타영상 — PDF 포트폴리오와 추가 자료 사이에 위치. 여러 개 등록 가능 */}
      <VideoLinksSection
        icon={FilmIcon}
        title="포트폴리오 및 기타영상"
        description="프로젝트 데모, 작업물 소개 등 자기소개 영상 외의 영상을 여러 개 등록할 수 있습니다. YouTube URL을 붙여넣으면 됩니다."
        videos={data.portfolioVideos || []}
        onChange={(videos) => onChange({ ...data, portfolioVideos: videos })}
        emptyText="아직 등록된 영상이 없습니다. 포트폴리오·기타 영상을 추가해보세요!"
        delay={0.07}
        className="space-y-4 xl:col-span-2"
      />

      {/* 5. 추가 문서 업로드 */}
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
