'use client';

import { useEffect, useMemo, useState, type SyntheticEvent } from 'react';
import {
  ArrowDownTrayIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DocumentTextIcon,
  MagnifyingGlassMinusIcon,
  MagnifyingGlassPlusIcon,
} from '@heroicons/react/24/outline';
import { GlassButton } from '@/components/ui/GlassButton';

interface PDFImageViewerProps {
  pdfUrl: string;
  fileName?: string;
  className?: string;
  large?: boolean;
}

interface PageImage {
  pageNumber: number;
  url: string;
  thumbnailUrl: string;
}

type ViewMode = 'grid' | 'focus';
type PageDimensions = Record<number, { width: number; height: number }>;

const iconButtonClass =
  'inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/70 bg-white/70 text-ink-600 shadow-glass-sm transition hover:bg-white hover:text-azure-700 disabled:cursor-not-allowed disabled:opacity-40';

const getFitScaleForAspectRatio = (aspectRatio: number) => {
  if (aspectRatio >= 1.55) return 0.58;
  if (aspectRatio >= 1.25) return 0.64;
  return 0.72;
};

export default function PDFImageViewer({ pdfUrl, fileName = 'PDF', className = '', large = false }: PDFImageViewerProps) {
  const [pages, setPages] = useState<PageImage[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(large ? 0.9 : 0.72);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('focus');
  const [failedImages, setFailedImages] = useState<Record<number, boolean>>({});
  const [focusLoadedImages, setFocusLoadedImages] = useState<Record<number, boolean>>({});
  const [pageDimensions, setPageDimensions] = useState<PageDimensions>({});
  const [hasUserAdjustedScale, setHasUserAdjustedScale] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    const convertPdfToImages = async () => {
      setLoading(true);
      setError('');
      setPages([]);
      setCurrentPage(1);
      setViewMode('focus');
      setScale(large ? 0.9 : 0.72);
      setFailedImages({});
      setFocusLoadedImages({});
      setPageDimensions({});
      setHasUserAdjustedScale(false);

      try {
        const response = await fetch('/api/convert-pdf-to-images', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ pdfUrl, fileName }),
          signal: controller.signal,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'PDF 변환에 실패했습니다.');
        }

        const data = await response.json();
        setPages(Array.isArray(data.pages) ? data.pages : []);
      } catch (err) {
        if (controller.signal.aborted) return;
        console.error('PDF 이미지 변환 에러:', err);
        setError(err instanceof Error ? err.message : 'PDF를 이미지로 변환하는 데 실패했습니다.');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    if (pdfUrl) {
      convertPdfToImages();
    }

    return () => controller.abort();
  }, [pdfUrl, fileName, large]);

  const currentImage = useMemo(
    () => pages.find((page) => page.pageNumber === currentPage) || pages[0],
    [pages, currentPage],
  );

  const currentDimensions = currentImage ? pageDimensions[currentImage.pageNumber] : undefined;
  const currentAspectRatio = currentDimensions ? currentDimensions.width / currentDimensions.height : 0;
  const isLandscapePage = currentAspectRatio >= 1.25;
  const isWideLandscapePage = currentAspectRatio >= 1.55;

  useEffect(() => {
    if (!currentDimensions || hasUserAdjustedScale) return;
    setScale(Math.min(large ? getFitScaleForAspectRatio(currentAspectRatio) + 0.18 : getFitScaleForAspectRatio(currentAspectRatio), 1.05));
  }, [currentAspectRatio, currentDimensions, hasUserAdjustedScale, large]);

  const rememberImageDimensions = (pageNumber: number, event: SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = event.currentTarget;
    if (!naturalWidth || !naturalHeight) return;

    setPageDimensions((prev) => {
      const existing = prev[pageNumber];
      if (existing?.width === naturalWidth && existing?.height === naturalHeight) {
        return prev;
      }

      return {
        ...prev,
        [pageNumber]: {
          width: naturalWidth,
          height: naturalHeight,
        },
      };
    });
  };

  const pageAspectClass = (pageNumber: number) => {
    const dimensions = pageDimensions[pageNumber];
    if (!dimensions) return 'aspect-[3/4]';
    return dimensions.width / dimensions.height >= 1.25 ? 'aspect-video' : 'aspect-[3/4]';
  };

  const goToPage = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= pages.length) {
      setCurrentPage(pageNumber);
    }
  };

  const openPage = (pageNumber: number) => {
    goToPage(pageNumber);
    setViewMode('focus');
  };

  const zoomIn = () => {
    setHasUserAdjustedScale(true);
    setScale((prev) => Math.min(prev + 0.08, 1.4));
  };
  const zoomOut = () => {
    setHasUserAdjustedScale(true);
    setScale((prev) => Math.max(prev - 0.08, 0.5));
  };

  const gridViewportClass = large ? 'max-h-[52rem] min-h-[24rem]' : 'max-h-[34rem] min-h-[18rem]';
  const portraitFocusClass = large
    ? 'grid h-[58rem] min-h-[36rem] max-h-[72rem] grid-cols-1 gap-3 overflow-hidden bg-gradient-to-b from-white/35 to-azure-50/30 p-3 lg:grid-cols-[minmax(0,1fr)_8rem]'
    : 'grid h-[34rem] min-h-[24rem] max-h-[34rem] grid-cols-1 gap-3 overflow-hidden bg-gradient-to-b from-white/35 to-azure-50/30 p-3 lg:grid-cols-[minmax(0,1fr)_7rem]';
  const landscapeFocusClass = large
    ? 'flex max-h-[58rem] min-h-[30rem] flex-col gap-3 overflow-hidden bg-gradient-to-b from-white/35 to-azure-50/30 p-3'
    : 'flex max-h-[34rem] min-h-[18rem] flex-col gap-3 overflow-hidden bg-gradient-to-b from-white/35 to-azure-50/30 p-3';
  const focusImageMaxClass = large
    ? isLandscapePage ? 'max-h-[42rem]' : 'max-h-[54rem]'
    : isLandscapePage ? 'max-h-[22rem]' : 'max-h-[31rem]';

  if (loading) {
    return (
      <div className={`flex min-h-[18rem] items-center justify-center rounded-3xl border border-white/60 bg-white/55 p-8 ${className}`}>
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-azure-100 border-t-azure-500" />
        <span className="ml-3 text-sm font-semibold text-ink-500">PDF를 준비하는 중...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex min-h-[18rem] items-center justify-center rounded-3xl border border-white/60 bg-white/55 p-8 ${className}`}>
        <div className="text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-coral-400/40 bg-coral-100 text-coral-600 shadow-glass-sm">
            <DocumentTextIcon className="h-7 w-7" />
          </div>
          <div className="mb-2 text-lg font-bold text-coral-600">변환 실패</div>
          <div className="mb-6 text-sm leading-relaxed text-ink-500">{error}</div>
          <GlassButton href={pdfUrl} target="_blank" rel="noopener noreferrer" size="md">
            <ArrowDownTrayIcon className="h-5 w-5" />
            PDF 다운로드
          </GlassButton>
        </div>
      </div>
    );
  }

  if (pages.length === 0) {
    return (
      <div className={`flex min-h-[18rem] items-center justify-center rounded-3xl border border-white/60 bg-white/55 p-8 ${className}`}>
        <div className="text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-azure-100 bg-azure-50 text-azure-500 shadow-glass-sm">
            <DocumentTextIcon className="h-7 w-7" />
          </div>
          <p className="font-medium text-ink-500">표시할 페이지가 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`overflow-hidden rounded-3xl border border-white/60 bg-white/55 shadow-glass ${className}`}>
      <div className="flex flex-col gap-3 border-b border-white/60 bg-azure-50/35 p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-azure-400 to-azure-600 text-white shadow-glow">
              <DocumentTextIcon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h3 className="truncate text-sm font-bold text-ink-900">{fileName}</h3>
              <p className="mt-0.5 text-xs font-semibold text-ink-400">{pages.length}페이지</p>
            </div>
          </div>

          <GlassButton href={pdfUrl} target="_blank" rel="noopener noreferrer" variant="secondary" size="sm">
            <ArrowDownTrayIcon className="h-4 w-4" />
            다운로드
          </GlassButton>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage <= 1}
              className={iconButtonClass}
              aria-label="이전 페이지"
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </button>
            <span className="min-w-[4.5rem] text-center text-xs font-bold tabular-nums text-ink-700">
              {currentPage} / {pages.length}
            </span>
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage >= pages.length}
              className={iconButtonClass}
              aria-label="다음 페이지"
            >
              <ChevronRightIcon className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex rounded-2xl border border-white/70 bg-white/65 p-1 shadow-glass-sm">
              <button
                onClick={() => setViewMode('grid')}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                  viewMode === 'grid' ? 'bg-azure-500 text-white shadow-glow' : 'text-ink-500 hover:text-azure-700'
                }`}
              >
                그리드
              </button>
              <button
                onClick={() => setViewMode('focus')}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                  viewMode === 'focus' ? 'bg-azure-500 text-white shadow-glow' : 'text-ink-500 hover:text-azure-700'
                }`}
              >
                확대
              </button>
            </div>

            {viewMode === 'focus' && (
              <div className="flex items-center gap-1 rounded-2xl border border-white/70 bg-white/65 px-1 py-1 shadow-glass-sm">
                <button onClick={zoomOut} className={iconButtonClass} aria-label="축소">
                  <MagnifyingGlassMinusIcon className="h-4 w-4" />
                </button>
                <span className="min-w-[3.25rem] text-center text-xs font-bold tabular-nums text-ink-700">
                  {Math.round(scale * 100)}%
                </span>
                <button onClick={zoomIn} className={iconButtonClass} aria-label="확대">
                  <MagnifyingGlassPlusIcon className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className={`${gridViewportClass} overflow-y-auto bg-gradient-to-b from-white/35 to-azure-50/30 p-3`}>
          <div className="grid grid-cols-2 gap-3">
            {pages.map((page) => (
              <button
                key={page.pageNumber}
                onClick={() => openPage(page.pageNumber)}
                className={`group overflow-hidden rounded-2xl border bg-white/75 text-left shadow-glass-sm transition hover:-translate-y-0.5 hover:shadow-glass ${
                  page.pageNumber === currentPage ? 'border-azure-400 ring-2 ring-azure-300/60' : 'border-white/70'
                }`}
              >
                <div className={`flex ${pageAspectClass(page.pageNumber)} items-center justify-center bg-white`}>
                  {failedImages[page.pageNumber] ? (
                    <div className="px-3 text-center text-xs font-semibold text-ink-400">미리보기 실패</div>
                  ) : (
                    <img
                      src={page.thumbnailUrl || page.url}
                      alt={`${fileName} ${page.pageNumber}페이지`}
                      className="h-full w-full object-contain"
                      loading={page.pageNumber <= 8 ? 'eager' : 'lazy'}
                      decoding="async"
                      onLoad={(event) => {
                        rememberImageDimensions(page.pageNumber, event);
                        if (page.pageNumber === 1) setCurrentPage(1);
                      }}
                      onError={() => setFailedImages((prev) => ({ ...prev, [page.pageNumber]: true }))}
                    />
                  )}
                </div>
                <div className="flex items-center justify-between gap-2 px-3 py-2">
                  <span className="text-xs font-bold text-ink-700">{page.pageNumber}쪽</span>
                  <span className="text-[11px] font-semibold text-azure-600 opacity-0 transition group-hover:opacity-100">
                    보기
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div
          className={
            isLandscapePage ? landscapeFocusClass : portraitFocusClass
          }
        >
          <div
            className={
              isLandscapePage
                ? 'min-h-0 flex-1 overflow-auto rounded-2xl border border-white/70 bg-white/70 p-3 shadow-inner sm:p-4'
                : 'min-h-0 overflow-auto rounded-2xl border border-white/70 bg-white/70 p-4 shadow-inner'
            }
          >
            <div className={isLandscapePage ? 'flex min-h-full items-center justify-center' : 'flex min-h-full items-start justify-center'}>
              <div
                className="relative mx-auto flex items-start justify-center"
                style={{
                  width: `${Math.round(scale * 100)}%`,
                  maxWidth: isLandscapePage ? (isWideLandscapePage ? '1120px' : '1040px') : '820px',
                }}
              >
                <img
                  src={currentImage.thumbnailUrl || currentImage.url}
                  alt={`${fileName} ${currentImage.pageNumber}페이지 미리보기`}
                  className={`block h-auto w-full rounded-xl border border-ink-100 bg-white object-contain shadow-glass transition-opacity duration-200 ${
                    focusImageMaxClass
                  } ${
                    focusLoadedImages[currentImage.pageNumber] ? 'opacity-0' : 'opacity-100'
                  }`}
                  loading="eager"
                  decoding="async"
                  onLoad={(event) => rememberImageDimensions(currentImage.pageNumber, event)}
                />
                <img
                  src={currentImage.url}
                  alt={`${fileName} ${currentImage.pageNumber}페이지`}
                  className={`absolute inset-0 h-auto w-full rounded-xl border border-ink-100 bg-white object-contain shadow-glass transition-opacity duration-200 ${
                    focusImageMaxClass
                  } ${
                    focusLoadedImages[currentImage.pageNumber] ? 'opacity-100' : 'opacity-0'
                  }`}
                  loading="eager"
                  decoding="async"
                  onLoad={(event) => {
                    rememberImageDimensions(currentImage.pageNumber, event);
                    setFocusLoadedImages((prev) => ({ ...prev, [currentImage.pageNumber]: true }));
                  }}
                  onError={() => setFocusLoadedImages((prev) => ({ ...prev, [currentImage.pageNumber]: false }))}
                />
              </div>
            </div>
          </div>

          <div
            className={
              isLandscapePage
                ? 'h-20 flex-none overflow-x-auto overscroll-contain pb-1'
                : 'hidden h-full min-h-0 overflow-y-auto overscroll-contain pr-1 lg:block'
            }
          >
            <div className={isLandscapePage ? 'flex gap-2 pb-2' : 'space-y-2 pb-2'}>
              {pages.map((page) => (
                <button
                  key={page.pageNumber}
                  onClick={() => goToPage(page.pageNumber)}
                  className={`overflow-hidden rounded-xl border bg-white/70 text-left shadow-glass-sm transition hover:border-azure-200 ${
                    page.pageNumber === currentPage ? 'border-azure-400 ring-2 ring-azure-300/50' : 'border-white/70'
                  } ${isLandscapePage ? 'w-24 flex-none sm:w-28' : 'w-full'}`}
                >
                  <img
                    src={page.thumbnailUrl || page.url}
                    alt={`${page.pageNumber}쪽 썸네일`}
                    className={`${isLandscapePage ? 'aspect-video' : pageAspectClass(page.pageNumber)} w-full object-contain`}
                    loading="lazy"
                    decoding="async"
                    onLoad={(event) => rememberImageDimensions(page.pageNumber, event)}
                  />
                  <div className="px-2 py-1 text-center text-xs font-bold text-ink-600">{page.pageNumber}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
