'use client';

import { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, MagnifyingGlassMinusIcon, MagnifyingGlassPlusIcon, DocumentIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { GlassButton } from '@/components/ui/GlassButton';
import { Badge } from '@/components/ui/Badge';

interface PageImage {
  pageNumber: number;
  url: string;
  thumbnailUrl: string;
}

interface PortfolioImageGalleryProps {
  fileName: string;
  images: PageImage[];
  pdfUrl?: string; // 원본 PDF 다운로드용
  className?: string;
}

export default function PortfolioImageGallery({
  fileName,
  images,
  pdfUrl,
  className = ''
}: PortfolioImageGalleryProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [viewMode, setViewMode] = useState<'single' | 'scroll'>('single');

  if (!images || images.length === 0) {
    return (
      <div className={`relative overflow-hidden glass-strong rounded-4xl shadow-glass-lg p-12 ${className}`}>
        <div className="pointer-events-none absolute -top-24 -right-16 w-72 h-72 rounded-full bg-azure-200/40 blur-3xl" />
        <div className="relative flex flex-col items-center justify-center text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-azure-400 to-azure-600 shadow-glow">
            <DocumentIcon className="w-10 h-10 text-white" />
          </div>
          <div className="font-display text-xl md:text-2xl font-semibold text-ink-900 tracking-tight mb-2">{fileName}</div>
          <div className="text-ink-500 leading-relaxed mb-7">이미지를 표시할 수 없습니다.</div>
          {pdfUrl && (
            <GlassButton
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              variant="primary"
              size="md"
            >
              <ArrowDownTrayIcon className="w-5 h-5" />
              PDF 다운로드
            </GlassButton>
          )}
        </div>
      </div>
    );
  }

  const goToPage = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= images.length) {
      setCurrentPage(pageNumber);
    }
  };

  const zoomIn = () => setScale(prev => Math.min(prev + 0.2, 3.0));
  const zoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.5));

  const currentImage = images.find(img => img.pageNumber === currentPage) || images[0];

  const toggleBtnClass =
    'px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-azure-400/60';
  const iconBtnClass =
    'flex h-10 w-10 items-center justify-center rounded-xl bg-white/70 backdrop-blur-md border border-white/70 text-ink-600 shadow-glass-sm transition-all duration-300 hover:bg-white/90 hover:text-azure-700 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-azure-400/60 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0';

  return (
    <div className={`relative overflow-hidden glass-strong rounded-4xl shadow-glass-lg ${className}`}>
      {/* 은은한 오로라 글로우 */}
      <div className="pointer-events-none absolute -top-32 -left-20 w-80 h-80 rounded-full bg-azure-200/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-20 w-80 h-80 rounded-full bg-sky-cool-300/20 blur-3xl" />

      {/* 컨트롤 바 */}
      <div className="relative flex items-center justify-between gap-4 px-5 sm:px-7 py-5 border-b border-white/50">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-azure-400 to-azure-600 shadow-glow">
            <DocumentIcon className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <span className="block truncate font-semibold text-ink-900">{fileName}</span>
            <Badge tone="azure" className="mt-1">{images.length}페이지</Badge>
          </div>
        </div>

        {pdfUrl && (
          <GlassButton
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            variant="secondary"
            size="sm"
            className="flex-shrink-0"
          >
            <ArrowDownTrayIcon className="w-4 h-4" />
            PDF 다운로드
          </GlassButton>
        )}
      </div>

      <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 px-5 sm:px-7 py-5 border-b border-white/50">
        <div className="flex items-center gap-3">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage <= 1}
            className={iconBtnClass}
            aria-label="이전 페이지"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>

          <span className="min-w-[64px] text-center font-display text-sm font-semibold text-ink-700 tabular-nums">
            {currentPage} / {images.length}
          </span>

          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage >= images.length}
            className={iconBtnClass}
            aria-label="다음 페이지"
          >
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {/* 보기 모드 토글 */}
          <div className="relative flex items-center gap-1 rounded-2xl bg-white/55 backdrop-blur-md border border-white/60 p-1 shadow-glass-sm">
            <button
              onClick={() => setViewMode('single')}
              className={`${toggleBtnClass} relative ${viewMode === 'single' ? 'text-white' : 'text-ink-600 hover:text-azure-700'}`}
            >
              {viewMode === 'single' && (
                <motion.span
                  layoutId="gallery-viewmode-active"
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-azure-500 to-azure-600 shadow-glow"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <span className="relative z-10">단일 페이지</span>
            </button>
            <button
              onClick={() => setViewMode('scroll')}
              className={`${toggleBtnClass} relative ${viewMode === 'scroll' ? 'text-white' : 'text-ink-600 hover:text-azure-700'}`}
            >
              {viewMode === 'scroll' && (
                <motion.span
                  layoutId="gallery-viewmode-active"
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-azure-500 to-azure-600 shadow-glow"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <span className="relative z-10">스크롤 보기</span>
            </button>
          </div>

          {/* 줌 컨트롤 */}
          <div className="flex items-center gap-2 rounded-2xl bg-white/55 backdrop-blur-md border border-white/60 px-2 py-1.5 shadow-glass-sm">
            <button
              onClick={zoomOut}
              className={iconBtnClass}
              aria-label="축소"
            >
              <MagnifyingGlassMinusIcon className="w-5 h-5" />
            </button>

            <span className="min-w-[60px] text-center font-display text-sm font-semibold text-ink-700 tabular-nums">
              {Math.round(scale * 100)}%
            </span>

            <button
              onClick={zoomIn}
              className={iconBtnClass}
              aria-label="확대"
            >
              <MagnifyingGlassPlusIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* 이미지 뷰어 */}
      <div className="relative p-5 sm:p-7">
        <AnimatePresence mode="wait">
          {viewMode === 'single' ? (
            // 단일 페이지 보기
            <motion.div
              key="single"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="flex justify-center overflow-auto"
            >
              <motion.div
                key={currentImage.pageNumber}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="relative overflow-hidden rounded-3xl border border-white/60 shadow-glass-lg bg-white/40"
                style={{ transform: `scale(${scale})`, transformOrigin: 'center top' }}
              >
                <Image
                  src={currentImage.url}
                  alt={`${fileName} - 페이지 ${currentImage.pageNumber}`}
                  width={1200}
                  height={1600}
                  className="block rounded-3xl"
                  style={{ maxWidth: '100%', height: 'auto' }}
                />
              </motion.div>
            </motion.div>
          ) : (
            // 스크롤 보기
            <motion.div
              key="scroll"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-6 max-h-[800px] overflow-y-auto pr-1"
            >
              {images.map((image) => (
                <div key={image.pageNumber} className="flex justify-center">
                  <div
                    className="relative overflow-hidden rounded-3xl border border-white/60 shadow-glass-lg bg-white/40"
                    style={{ transform: `scale(${scale})`, transformOrigin: 'center top' }}
                  >
                    <Image
                      src={image.url}
                      alt={`${fileName} - 페이지 ${image.pageNumber}`}
                      width={1200}
                      height={1600}
                      className="block rounded-3xl"
                      style={{ maxWidth: '100%', height: 'auto' }}
                    />
                    <div className="absolute top-4 right-4 rounded-full bg-ink-900/45 backdrop-blur-md border border-white/20 text-white px-3 py-1 text-xs font-semibold">
                      페이지 {image.pageNumber}
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 썸네일 네비게이션 (5페이지 이상일 때만 표시) */}
      {images.length > 4 && viewMode === 'single' && (
        <div className="relative px-5 sm:px-7 py-5 border-t border-white/50">
          <div className="flex gap-3 overflow-x-auto pb-2">
            {images.map((image) => (
              <motion.button
                key={image.pageNumber}
                onClick={() => goToPage(image.pageNumber)}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.96 }}
                transition={{ type: 'spring', stiffness: 360, damping: 26 }}
                className={`group relative flex-shrink-0 overflow-hidden rounded-2xl border transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-azure-400/60 ${
                  image.pageNumber === currentPage
                    ? 'border-azure-400 shadow-glow ring-2 ring-azure-400/50'
                    : 'border-white/60 shadow-glass-sm hover:border-azure-200 opacity-80 hover:opacity-100'
                }`}
              >
                <Image
                  src={image.thumbnailUrl}
                  alt={`썸네일 ${image.pageNumber}`}
                  width={100}
                  height={140}
                  className="block rounded-2xl"
                />
                <div className={`absolute bottom-1.5 right-1.5 rounded-full px-2 py-0.5 text-xs font-semibold backdrop-blur-md border ${
                  image.pageNumber === currentPage
                    ? 'bg-gradient-to-r from-azure-500 to-azure-600 text-white border-white/30'
                    : 'bg-ink-900/45 text-white border-white/20'
                }`}>
                  {image.pageNumber}
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
