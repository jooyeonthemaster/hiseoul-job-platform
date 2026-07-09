'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  ArrowDownTrayIcon,
  ArrowsPointingOutIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DocumentTextIcon,
  MagnifyingGlassMinusIcon,
  MagnifyingGlassPlusIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { GlassButton } from '@/components/ui/GlassButton';

interface PDFImageViewerProps {
  pdfUrl: string;
  fileName?: string;
  className?: string;
  large?: boolean;
}

const iconButtonClass =
  'inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/70 bg-white/70 text-ink-600 shadow-glass-sm transition hover:bg-white hover:text-azure-700 disabled:cursor-not-allowed disabled:opacity-40';

// pdf.js 는 클라이언트 전용. 워커는 public 의 고정 경로(라이브러리와 동일 버전 4.10.38)를 사용한다.
// (기존 Cloudinary 이미지 변환 의존을 제거 → Firebase Storage 등 어떤 URL 의 PDF 도 브라우저에서 렌더링)
const WORKER_SRC = '/pdf.worker.min.mjs';

// 단일 페이지를 캔버스에 렌더 (뷰포트 진입 시 지연 렌더 — 대용량/다페이지 PDF 성능)
function PdfPage({
  pdf,
  pageNumber,
  maxWidth,
  large,
  onOpen,
}: {
  pdf: any;
  pageNumber: number;
  maxWidth: number;
  large: boolean;
  onOpen: (pageNumber: number) => void;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [inView, setInView] = useState(pageNumber <= 2); // 처음 두 페이지는 즉시 렌더
  const [rendered, setRendered] = useState(false);
  const [aspect, setAspect] = useState(1.414); // 기본 A4 세로 비율(placeholder 높이 유지)

  useEffect(() => {
    if (inView) return;
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { rootMargin: '800px 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [inView]);

  useEffect(() => {
    if (!inView || !pdf) return;
    let cancelled = false;
    let task: any = null;
    (async () => {
      try {
        const page = await pdf.getPage(pageNumber);
        if (cancelled) return;
        const base = page.getViewport({ scale: 1 });
        setAspect(base.height / base.width);
        // 고정 고해상도로 렌더(폭 ~1600px) → 확대해도 선명. 표시는 CSS 폭 100%.
        const dpr = Math.min(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1, 2);
        const renderPx = (large ? 1600 : 1400) * dpr;
        const scale = renderPx / base.width;
        const viewport = page.getViewport({ scale });
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        task = page.render({ canvasContext: ctx, viewport });
        await task.promise;
        if (!cancelled) setRendered(true);
      } catch {
        // 개별 페이지 렌더 실패는 무시(placeholder 유지)
      }
    })();
    return () => {
      cancelled = true;
      if (task) {
        try {
          task.cancel();
        } catch {
          /* noop */
        }
      }
    };
  }, [inView, pdf, pageNumber, large]);

  return (
    <div ref={wrapRef} className="mx-auto w-full" style={{ maxWidth }}>
      <button
        type="button"
        onClick={() => onOpen(pageNumber)}
        aria-label={`${pageNumber}페이지 크게 보기`}
        className="group relative block w-full cursor-zoom-in overflow-hidden rounded-xl border border-ink-100 bg-white shadow-glass-sm transition hover:border-azure-200 hover:shadow-glass focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-azure-400/60"
        style={rendered ? undefined : { aspectRatio: `1 / ${aspect}` }}
      >
        {!rendered && (
          <div className="absolute inset-0 flex items-center justify-center bg-white">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-azure-100 border-t-azure-500" />
          </div>
        )}
        <canvas
          ref={canvasRef}
          className={`block h-auto w-full ${rendered ? 'opacity-100' : 'opacity-0'}`}
          aria-label={`${pageNumber}페이지`}
        />
        {/* 클릭 가능 힌트 */}
        <span className="pointer-events-none absolute right-2.5 top-2.5 flex items-center gap-1 rounded-lg bg-ink-900/70 px-2 py-1 text-[11px] font-semibold text-white opacity-0 shadow-lg backdrop-blur-sm transition duration-200 group-hover:opacity-100">
          <ArrowsPointingOutIcon className="h-3.5 w-3.5" />
          크게 보기
        </span>
      </button>
      <div className="py-1.5 text-center text-xs font-bold text-ink-400">{pageNumber}쪽</div>
    </div>
  );
}

const fsIconButtonClass =
  'inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white/90 transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-30';
const fsNavButtonClass =
  'inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white shadow-lg backdrop-blur-md transition hover:bg-white/25 disabled:cursor-not-allowed disabled:opacity-20';

// 전체화면 라이트박스 — 페이지 단위로 넘겨보며 화면 크기에 맞춰(fit) 크게 보기
function PdfFullscreen({
  pdf,
  numPages,
  fileName,
  pdfUrl,
  initialPage,
  onClose,
}: {
  pdf: any;
  numPages: number;
  fileName: string;
  pdfUrl: string;
  initialPage: number;
  onClose: () => void;
}) {
  const areaRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [page, setPage] = useState(initialPage);
  const [zoom, setZoom] = useState(1); // fit(=1) 기준 배율
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [rendering, setRendering] = useState(true);

  const goPrev = useCallback(() => {
    setZoom(1);
    setPage((p) => Math.max(p - 1, 1));
  }, []);
  const goNext = useCallback(() => {
    setZoom(1);
    setPage((p) => Math.min(p + 1, numPages));
  }, [numPages]);

  // 바디 스크롤 잠금
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // 페이지 영역 크기 측정 (리사이즈/회전 대응)
  useEffect(() => {
    const el = areaRef.current;
    if (!el) return;
    const update = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // 키보드 조작
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // 좌/우만 페이지 넘김 — 상/하·스페이스는 확대된 페이지의 네이티브 스크롤용으로 남겨둔다
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') goNext();
      else if (e.key === 'ArrowLeft') goPrev();
      else if (e.key === '+' || e.key === '=') setZoom((z) => Math.min(z + 0.25, 3));
      else if (e.key === '-' || e.key === '_') setZoom((z) => Math.max(z - 0.25, 1));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [goNext, goPrev, onClose]);

  // 페이지 전환 시 스크롤 원위치
  useEffect(() => {
    areaRef.current?.scrollTo({ top: 0, left: 0 });
  }, [page]);

  // 현재 페이지 렌더 (fit × zoom, dpr 반영해 선명하게)
  useEffect(() => {
    if (!pdf || size.w === 0 || size.h === 0) return;
    let cancelled = false;
    let task: any = null;
    setRendering(true);
    (async () => {
      try {
        const p = await pdf.getPage(page);
        if (cancelled) return;
        const base = p.getViewport({ scale: 1 });
        const PAD = 24; // 가장자리 여백
        const fit = Math.min((size.w - PAD * 2) / base.width, (size.h - PAD * 2) / base.height);
        const cssScale = Math.max(fit, 0.1) * zoom;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const viewport = p.getViewport({ scale: cssScale * dpr });
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        canvas.style.width = `${Math.floor(base.width * cssScale)}px`;
        canvas.style.height = `${Math.floor(base.height * cssScale)}px`;
        task = p.render({ canvasContext: ctx, viewport });
        await task.promise;
        if (!cancelled) setRendering(false);
      } catch {
        if (!cancelled) setRendering(false);
      }
    })();
    return () => {
      cancelled = true;
      if (task) {
        try {
          task.cancel();
        } catch {
          /* noop */
        }
      }
    };
  }, [pdf, page, zoom, size.w, size.h]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[120] flex flex-col bg-ink-900/95 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={`${fileName} 전체화면 보기`}
    >
      {/* 상단 바 */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-2 text-white/90">
          <DocumentTextIcon className="h-5 w-5 flex-shrink-0 text-white/60" />
          <span className="truncate text-sm font-semibold">{fileName}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-1 rounded-2xl border border-white/15 bg-white/10 px-1 py-1 sm:flex">
            <button onClick={() => setZoom((z) => Math.max(z - 0.25, 1))} className={fsIconButtonClass} aria-label="축소" disabled={zoom <= 1}>
              <MagnifyingGlassMinusIcon className="h-5 w-5" />
            </button>
            <span className="min-w-[3.5rem] text-center text-xs font-bold tabular-nums text-white/90">{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom((z) => Math.min(z + 0.25, 3))} className={fsIconButtonClass} aria-label="확대" disabled={zoom >= 3}>
              <MagnifyingGlassPlusIcon className="h-5 w-5" />
            </button>
          </div>
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={fsIconButtonClass}
            aria-label="다운로드"
            title="다운로드"
          >
            <ArrowDownTrayIcon className="h-5 w-5" />
          </a>
          <button onClick={onClose} className={fsIconButtonClass} aria-label="닫기 (Esc)" title="닫기 (Esc)">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* 페이지 영역 */}
      <div className="relative min-h-0 flex-1">
        <div ref={areaRef} className="absolute inset-0 overflow-auto overscroll-contain">
          {/* 페이지 바깥(여백) 클릭 시 닫기 — 캔버스 클릭은 target 비교로 제외 */}
          <div
            className="grid min-h-full min-w-full cursor-zoom-out place-items-center p-4 sm:p-6"
            onClick={(e) => {
              if (e.target === e.currentTarget) onClose();
            }}
          >
            <canvas ref={canvasRef} className="cursor-default rounded-lg bg-white shadow-2xl" aria-label={`${page}페이지`} />
          </div>
        </div>

        {rendering && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="h-9 w-9 animate-spin rounded-full border-2 border-white/25 border-t-white/80" />
          </div>
        )}

        {/* 데스크톱: 양옆 화살표 */}
        <button
          onClick={goPrev}
          disabled={page <= 1}
          aria-label="이전 페이지"
          className={`absolute left-3 top-1/2 hidden -translate-y-1/2 sm:inline-flex ${fsNavButtonClass}`}
        >
          <ChevronLeftIcon className="h-6 w-6" />
        </button>
        <button
          onClick={goNext}
          disabled={page >= numPages}
          aria-label="다음 페이지"
          className={`absolute right-3 top-1/2 hidden -translate-y-1/2 sm:inline-flex ${fsNavButtonClass}`}
        >
          <ChevronRightIcon className="h-6 w-6" />
        </button>
      </div>

      {/* 하단 바: 페이지 이동 (모바일 터치 친화) */}
      <div className="flex items-center justify-center gap-3 px-4 py-3 sm:py-4">
        <button onClick={goPrev} disabled={page <= 1} aria-label="이전 페이지" className={`sm:hidden ${fsNavButtonClass}`}>
          <ChevronLeftIcon className="h-6 w-6" />
        </button>
        <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-bold tabular-nums text-white">
          {page} <span className="text-white/50">/</span> {numPages}
        </span>
        <button onClick={goNext} disabled={page >= numPages} aria-label="다음 페이지" className={`sm:hidden ${fsNavButtonClass}`}>
          <ChevronRightIcon className="h-6 w-6" />
        </button>
      </div>
    </div>,
    document.body,
  );
}

export default function PDFImageViewer({ pdfUrl, fileName = 'PDF', className = '', large = false }: PDFImageViewerProps) {
  const [pdf, setPdf] = useState<any>(null);
  const [numPages, setNumPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [zoom, setZoom] = useState(1);
  const [fullscreenPage, setFullscreenPage] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    let doc: any = null;
    setLoading(true);
    setError('');
    setPdf(null);
    setNumPages(0);
    setZoom(1);
    setFullscreenPage(null);

    (async () => {
      try {
        const pdfjs = await import('pdfjs-dist');
        pdfjs.GlobalWorkerOptions.workerSrc = WORKER_SRC;
        const task = pdfjs.getDocument({ url: pdfUrl });
        doc = await task.promise;
        if (cancelled) {
          doc.destroy();
          return;
        }
        setPdf(doc);
        setNumPages(doc.numPages);
      } catch (err) {
        if (!cancelled) {
          console.error('PDF 렌더링 에러:', err);
          setError('PDF를 표시할 수 없습니다. 아래에서 새 탭으로 열거나 다운로드해 주세요.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      if (doc) {
        try {
          doc.destroy();
        } catch {
          /* noop */
        }
      }
    };
  }, [pdfUrl]);

  const baseWidth = large ? 900 : 780;
  const pageMaxWidth = Math.round(baseWidth * zoom);
  const zoomIn = () => setZoom((z) => Math.min(z + 0.15, 2.2));
  const zoomOut = () => setZoom((z) => Math.max(z - 0.15, 0.6));

  const viewportClass = large ? 'max-h-[62rem] min-h-[26rem]' : 'max-h-[38rem] min-h-[20rem]';

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
          <div className="mb-2 text-lg font-bold text-coral-600">PDF를 표시할 수 없습니다</div>
          <div className="mb-6 text-sm leading-relaxed text-ink-500">{error}</div>
          <GlassButton href={pdfUrl} target="_blank" rel="noopener noreferrer" size="md">
            <ArrowDownTrayIcon className="h-5 w-5" />
            새 탭에서 열기 / 다운로드
          </GlassButton>
        </div>
      </div>
    );
  }

  return (
    <div className={`overflow-hidden rounded-3xl border border-white/60 bg-white/55 shadow-glass ${className}`}>
      {/* 툴바 */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/60 bg-azure-50/35 p-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-azure-400 to-azure-600 text-white shadow-glow">
            <DocumentTextIcon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-bold text-ink-900">{fileName}</h3>
            <p className="mt-0.5 text-xs font-semibold text-ink-400">{numPages}페이지</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-2xl border border-white/70 bg-white/65 px-1 py-1 shadow-glass-sm">
            <button onClick={zoomOut} className={iconButtonClass} aria-label="축소" disabled={zoom <= 0.6}>
              <MagnifyingGlassMinusIcon className="h-4 w-4" />
            </button>
            <span className="min-w-[3.25rem] text-center text-xs font-bold tabular-nums text-ink-700">
              {Math.round(zoom * 100)}%
            </span>
            <button onClick={zoomIn} className={iconButtonClass} aria-label="확대" disabled={zoom >= 2.2}>
              <MagnifyingGlassPlusIcon className="h-4 w-4" />
            </button>
          </div>
          <GlassButton
            onClick={() => setFullscreenPage(1)}
            variant="secondary"
            size="sm"
            aria-label="전체화면으로 크게 보기"
            title="전체화면으로 페이지를 넘겨가며 크게 보기"
          >
            <ArrowsPointingOutIcon className="h-4 w-4" />
            전체화면
          </GlassButton>
          <GlassButton href={pdfUrl} target="_blank" rel="noopener noreferrer" variant="secondary" size="sm">
            <ArrowDownTrayIcon className="h-4 w-4" />
            다운로드
          </GlassButton>
        </div>
      </div>

      {/* 페이지 스크롤 뷰 */}
      <div className={`${viewportClass} overflow-y-auto overscroll-contain bg-gradient-to-b from-white/35 to-azure-50/30 p-4`}>
        <div className="flex flex-col gap-4">
          {pdf &&
            Array.from({ length: numPages }, (_, i) => (
              <PdfPage
                key={i + 1}
                pdf={pdf}
                pageNumber={i + 1}
                maxWidth={pageMaxWidth}
                large={large}
                onOpen={setFullscreenPage}
              />
            ))}
        </div>
      </div>

      {pdf && fullscreenPage !== null && (
        <PdfFullscreen
          pdf={pdf}
          numPages={numPages}
          fileName={fileName}
          pdfUrl={pdfUrl}
          initialPage={fullscreenPage}
          onClose={() => setFullscreenPage(null)}
        />
      )}
    </div>
  );
}
