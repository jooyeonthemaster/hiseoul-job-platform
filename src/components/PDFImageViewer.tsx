'use client';

import { useEffect, useRef, useState } from 'react';
import {
  ArrowDownTrayIcon,
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
}: {
  pdf: any;
  pageNumber: number;
  maxWidth: number;
  large: boolean;
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
      <div
        className="relative w-full overflow-hidden rounded-xl border border-ink-100 bg-white shadow-glass-sm"
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
      </div>
      <div className="py-1.5 text-center text-xs font-bold text-ink-400">{pageNumber}쪽</div>
    </div>
  );
}

export default function PDFImageViewer({ pdfUrl, fileName = 'PDF', className = '', large = false }: PDFImageViewerProps) {
  const [pdf, setPdf] = useState<any>(null);
  const [numPages, setNumPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    let cancelled = false;
    let doc: any = null;
    setLoading(true);
    setError('');
    setPdf(null);
    setNumPages(0);
    setZoom(1);

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
              <PdfPage key={i + 1} pdf={pdf} pageNumber={i + 1} maxWidth={pageMaxWidth} large={large} />
            ))}
        </div>
      </div>
    </div>
  );
}
