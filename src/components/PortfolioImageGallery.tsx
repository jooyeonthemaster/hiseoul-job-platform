'use client';

import { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, MagnifyingGlassMinusIcon, MagnifyingGlassPlusIcon, DocumentIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

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
      <div className={`flex items-center justify-center p-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 ${className}`}>
        <div className="text-center">
          <DocumentIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <div className="text-lg font-medium text-gray-900 mb-2">{fileName}</div>
          <div className="text-gray-600 mb-4">이미지를 표시할 수 없습니다.</div>
          {pdfUrl && (
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              PDF 다운로드
            </a>
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

  return (
    <div className={`bg-white rounded-lg shadow-lg ${className}`}>
      {/* 컨트롤 바 */}
      <div className="flex items-center justify-between p-4 border-b bg-gray-50 rounded-t-lg">
        <div className="flex items-center space-x-2">
          <DocumentIcon className="w-5 h-5 text-gray-600" />
          <span className="text-sm font-medium text-gray-900">{fileName}</span>
          <span className="text-xs text-gray-500">({images.length}페이지)</span>
        </div>
        
        {pdfUrl && (
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            PDF 다운로드
          </a>
        )}
      </div>

      <div className="flex items-center justify-between p-4 border-b bg-gray-50">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage <= 1}
            className="p-2 rounded-md bg-white border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          
          <span className="text-sm text-gray-600">
            {currentPage} / {images.length}
          </span>
          
          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage >= images.length}
            className="p-2 rounded-md bg-white border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center space-x-4">
          {/* 보기 모드 토글 */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('single')}
              className={`px-3 py-1 rounded ${viewMode === 'single' ? 'bg-blue-600 text-white' : 'bg-white border'}`}
            >
              단일 페이지
            </button>
            <button
              onClick={() => setViewMode('scroll')}
              className={`px-3 py-1 rounded ${viewMode === 'scroll' ? 'bg-blue-600 text-white' : 'bg-white border'}`}
            >
              스크롤 보기
            </button>
          </div>

          {/* 줌 컨트롤 */}
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
      </div>

      {/* 이미지 뷰어 */}
      <div className="p-4">
        {viewMode === 'single' ? (
          // 단일 페이지 보기
          <div className="flex justify-center overflow-auto">
            <div 
              className="relative"
              style={{ transform: `scale(${scale})`, transformOrigin: 'center top' }}
            >
              <Image
                src={currentImage.url}
                alt={`${fileName} - 페이지 ${currentImage.pageNumber}`}
                width={1200}
                height={1600}
                className="shadow-lg"
                style={{ maxWidth: '100%', height: 'auto' }}
              />
            </div>
          </div>
        ) : (
          // 스크롤 보기
          <div className="space-y-4 max-h-[800px] overflow-y-auto">
            {images.map((image) => (
              <div key={image.pageNumber} className="flex justify-center">
                <div 
                  className="relative"
                  style={{ transform: `scale(${scale})`, transformOrigin: 'center top' }}
                >
                  <Image
                    src={image.url}
                    alt={`${fileName} - 페이지 ${image.pageNumber}`}
                    width={1200}
                    height={1600}
                    className="shadow-lg"
                    style={{ maxWidth: '100%', height: 'auto' }}
                  />
                  <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded">
                    페이지 {image.pageNumber}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 썸네일 네비게이션 (5페이지 이상일 때만 표시) */}
      {images.length > 4 && viewMode === 'single' && (
        <div className="p-4 border-t bg-gray-50 rounded-b-lg">
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {images.map((image) => (
              <button
                key={image.pageNumber}
                onClick={() => goToPage(image.pageNumber)}
                className={`flex-shrink-0 relative ${
                  image.pageNumber === currentPage
                    ? 'ring-2 ring-blue-500'
                    : 'hover:opacity-80'
                }`}
              >
                <Image
                  src={image.thumbnailUrl}
                  alt={`썸네일 ${image.pageNumber}`}
                  width={100}
                  height={140}
                  className="rounded border"
                />
                <div className={`absolute bottom-1 right-1 px-1 py-0.5 text-xs rounded ${
                  image.pageNumber === currentPage
                    ? 'bg-blue-600 text-white'
                    : 'bg-black bg-opacity-50 text-white'
                }`}>
                  {image.pageNumber}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}