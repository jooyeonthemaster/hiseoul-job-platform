'use client';

import { useState, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ChevronLeftIcon, ChevronRightIcon, MagnifyingGlassMinusIcon, MagnifyingGlassPlusIcon } from '@heroicons/react/24/outline';

// PDF.js worker 설정
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface PDFViewerProps {
  pdfUrl: string;
  className?: string;
}

export default function PDFViewer({ pdfUrl, className = '' }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
    setError('');
  }, []);

  const onDocumentLoadError = useCallback((error: Error) => {
    console.error('PDF 로드 에러:', error);
    setError('PDF 파일을 불러올 수 없습니다.');
    setLoading(false);
  }, []);

  const goToPrevPage = () => {
    setPageNumber(prev => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setPageNumber(prev => Math.min(prev + 1, numPages));
  };

  const zoomIn = () => {
    setScale(prev => Math.min(prev + 0.2, 3.0));
  };

  const zoomOut = () => {
    setScale(prev => Math.max(prev - 0.2, 0.5));
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= numPages) {
      setPageNumber(page);
    }
  };

  if (error) {
    return (
      <div className={`flex items-center justify-center p-8 bg-gray-50 rounded-lg ${className}`}>
        <div className="text-center">
          <div className="text-red-500 text-lg font-medium mb-2">오류 발생</div>
          <div className="text-gray-600">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg ${className}`}>
      {/* 컨트롤 바 */}
      <div className="flex items-center justify-between p-4 border-b bg-gray-50 rounded-t-lg">
        <div className="flex items-center space-x-2">
          <button
            onClick={goToPrevPage}
            disabled={pageNumber <= 1}
            className="p-2 rounded-md bg-white border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          
          <span className="text-sm text-gray-600">
            <input
              type="number"
              value={pageNumber}
              onChange={(e) => goToPage(parseInt(e.target.value))}
              className="w-12 text-center border rounded px-1 py-1"
              min={1}
              max={numPages}
            />
            / {numPages}
          </span>
          
          <button
            onClick={goToNextPage}
            disabled={pageNumber >= numPages}
            className="p-2 rounded-md bg-white border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={zoomOut}
            className="p-2 rounded-md bg-white border hover:bg-gray-50"
          >
            <MagnifyingGlassMinusIcon className="w-5 h-5" />
          </button>
          
          <span className="text-sm text-gray-600 min-w-[60px] text-center">
            {Math.round(scale * 100)}%
          </span>
          
          <button
            onClick={zoomIn}
            className="p-2 rounded-md bg-white border hover:bg-gray-50"
          >
            <MagnifyingGlassPlusIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* PDF 뷰어 */}
      <div className="p-4">
        {loading && (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">PDF 로딩 중...</span>
          </div>
        )}
        
        <div className="flex justify-center overflow-auto">
          <Document
            file={pdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading=""
          >
            <Page
              pageNumber={pageNumber}
              scale={scale}
              renderTextLayer={false}
              renderAnnotationLayer={false}
              className="shadow-lg"
            />
          </Document>
        </div>
      </div>

      {/* 페이지 썸네일 네비게이션 (5페이지 이상일 때만 표시) */}
      {numPages > 4 && (
        <div className="p-4 border-t bg-gray-50 rounded-b-lg">
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {Array.from({ length: numPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => goToPage(page)}
                className={`flex-shrink-0 w-12 h-16 border-2 rounded text-xs font-medium transition-colors ${
                  page === pageNumber
                    ? 'border-blue-500 bg-blue-50 text-blue-600'
                    : 'border-gray-300 bg-white text-gray-600 hover:border-gray-400'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 