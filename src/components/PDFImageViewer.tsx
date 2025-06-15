'use client';

import { useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, MagnifyingGlassMinusIcon, MagnifyingGlassPlusIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

interface PDFImageViewerProps {
  pdfUrl: string;
  fileName?: string;
  className?: string;
}

interface PageImage {
  pageNumber: number;
  url: string;
  thumbnailUrl: string;
}

export default function PDFImageViewer({ pdfUrl, fileName = 'PDF', className = '' }: PDFImageViewerProps) {
  const [pages, setPages] = useState<PageImage[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState<'single' | 'scroll'>('single');

  useEffect(() => {
    const convertPdfToImages = async () => {
      setLoading(true);
      setError('');

      try {        const response = await fetch('/api/convert-pdf-to-images', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ pdfUrl, fileName }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'PDF 변환에 실패했습니다.');
        }

        const data = await response.json();
        setPages(data.pages);
      } catch (err) {
        console.error('PDF 이미지 변환 에러:', err);
        setError(err instanceof Error ? err.message : 'PDF를 이미지로 변환하는 데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    if (pdfUrl) {
      convertPdfToImages();
    }
  }, [pdfUrl, fileName]);

  const goToPage = (pageNumber: number) => {    if (pageNumber >= 1 && pageNumber <= pages.length) {
      setCurrentPage(pageNumber);
    }
  };

  const zoomIn = () => setScale(prev => Math.min(prev + 0.2, 3.0));
  const zoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.5));

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 bg-gray-50 rounded-lg ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">PDF를 변환하는 중...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center p-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 ${className}`}>
        <div className="text-center">
          <div className="text-red-500 text-lg font-medium mb-2">변환 실패</div>
          <div className="text-gray-600 mb-4">{error}</div>
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            PDF 다운로드
          </a>        </div>
      </div>
    );
  }

  if (pages.length === 0) {
    return (
      <div className={`text-center p-8 bg-gray-50 rounded-lg ${className}`}>
        <p className="text-gray-600">표시할 페이지가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className={`bg-white sm:rounded-lg sm:shadow-lg ${className}`}>
      {/* 컨트롤 바 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-2 sm:p-4 border-b bg-gray-50 sm:rounded-t-lg space-y-2 sm:space-y-0">
        {/* 상단: 페이지 네비게이션 */}
        <div className="flex items-center justify-center sm:justify-start space-x-2">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage <= 1}
            className="p-2 rounded-md bg-white border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          
          <span className="text-sm text-gray-600 min-w-[50px] text-center">
            {currentPage} / {pages.length}
          </span>
          
          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage >= pages.length}
            className="p-2 rounded-md bg-white border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        </div>

        {/* 하단: 컨트롤들 */}
        <div className="flex items-center justify-center space-x-2 sm:space-x-4">
          {/* 보기 모드 토글 */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            <button
              onClick={() => setViewMode('single')}
              className={`px-2 py-1 text-xs sm:text-sm rounded ${viewMode === 'single' ? 'bg-blue-600 text-white' : 'bg-white border'}`}
            >
              단일
            </button>
            <button
              onClick={() => setViewMode('scroll')}
              className={`px-2 py-1 text-xs sm:text-sm rounded ${viewMode === 'scroll' ? 'bg-blue-600 text-white' : 'bg-white border'}`}
            >
              스크롤
            </button>
          </div>

          {/* 줌 컨트롤 */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            <button
              onClick={zoomOut}
              className="p-1.5 sm:p-2 rounded-md bg-white border hover:bg-gray-50"
            >
              <MagnifyingGlassMinusIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            
            <span className="text-xs sm:text-sm text-gray-600 min-w-[45px] sm:min-w-[60px] text-center">
              {Math.round(scale * 100)}%
            </span>
            
            <button
              onClick={zoomIn}
              className="p-1.5 sm:p-2 rounded-md bg-white border hover:bg-gray-50"
            >
              <MagnifyingGlassPlusIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* 이미지 뷰어 */}
      <div className="p-0 sm:p-4">
        {viewMode === 'single' ? (
          // 단일 페이지 보기
          <div className="flex justify-center overflow-auto">
            <div 
              className="relative w-full"
              style={{ transform: `scale(${scale})`, transformOrigin: 'center top' }}
            >
              <Image
                src={pages[currentPage - 1].url}
                alt={`${fileName} - 페이지 ${currentPage}`}
                width={1200}
                height={1600}
                className="sm:shadow-lg w-full h-auto"
                style={{ maxWidth: '100%', height: 'auto' }}
                priority
              />
            </div>
          </div>
        ) : (
          // 스크롤 보기
          <div className="space-y-2 sm:space-y-4 max-h-[70vh] sm:max-h-[800px] overflow-y-auto">
            {pages.map((page) => (
              <div key={page.pageNumber} className="flex justify-center">
                <div 
                  className="relative w-full"
                  style={{ transform: `scale(${scale})`, transformOrigin: 'center top' }}
                >
                  <Image
                    src={page.url}
                    alt={`${fileName} - 페이지 ${page.pageNumber}`}
                    width={1200}
                    height={1600}
                    className="sm:shadow-lg w-full h-auto"
                    style={{ maxWidth: '100%', height: 'auto' }}
                  />
                  <div className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs sm:text-sm">
                    페이지 {page.pageNumber}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 썸네일 네비게이션 (5페이지 이상일 때만 표시) */}
      {pages.length > 4 && viewMode === 'single' && (
        <div className="p-2 sm:p-4 border-t bg-gray-50 sm:rounded-b-lg">
          <div className="flex space-x-1 sm:space-x-2 overflow-x-auto pb-2 scrollbar-hide">
            {pages.map((page) => (
              <button
                key={page.pageNumber}
                onClick={() => goToPage(page.pageNumber)}
                className={`flex-shrink-0 relative ${
                  page.pageNumber === currentPage
                    ? 'ring-2 ring-blue-500'
                    : 'hover:opacity-80'
                }`}
              >
                <Image
                  src={page.thumbnailUrl}
                  alt={`썸네일 ${page.pageNumber}`}
                  width={80}
                  height={112}
                  className="rounded border w-16 h-20 sm:w-20 sm:h-28 object-cover"
                />
                <div className={`absolute bottom-0.5 right-0.5 sm:bottom-1 sm:right-1 px-1 py-0.5 text-xs rounded ${
                  page.pageNumber === currentPage
                    ? 'bg-blue-600 text-white'
                    : 'bg-black bg-opacity-50 text-white'
                }`}>
                  {page.pageNumber}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}