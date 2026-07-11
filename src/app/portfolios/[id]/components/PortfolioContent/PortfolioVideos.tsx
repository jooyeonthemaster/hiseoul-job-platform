'use client';

import { FilmIcon, PlayIcon } from '@heroicons/react/24/outline';
import { getYouTubeId } from '../../utils/portfolio.utils';
import type { VideoLink } from '../../types/portfolio.types';

interface PortfolioVideosProps {
  videos?: VideoLink[];
}

// 포트폴리오 및 기타영상 — 자기소개 영상과 분리된 별도 섹션.
// 상세 페이지에서 'PDF 포트폴리오'와 '추가 자료' 사이에 위치한다.
export default function PortfolioVideos({ videos }: PortfolioVideosProps) {
  const videoList = videos || [];
  if (videoList.length === 0) return null;

  const layoutClassName =
    videoList.length === 1
      ? 'mx-auto w-full max-w-3xl'
      : 'grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2';

  return (
    <div className="glass-card p-6 md:p-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-azure-400 to-azure-600 text-white shadow-glow">
            <FilmIcon className="h-6 w-6" />
          </div>
          <h2 className="truncate font-display text-xl md:text-2xl font-bold tracking-tight text-ink-900">
            포트폴리오 및 기타영상
          </h2>
        </div>
        <span className="flex-shrink-0 rounded-full border border-azure-100 bg-azure-50 px-3 py-1 text-sm font-semibold text-azure-700">
          {videoList.length}개
        </span>
      </div>

      <div className={layoutClassName}>
        {videoList.map((video, index) => {
          const youtubeId = getYouTubeId(video.url);
          const title = video.title || `영상 ${index + 1}`;

          return (
            <div
              key={`${video.url}-${index}`}
              className="flex flex-col overflow-hidden rounded-2xl border border-ink-100 bg-white/65 shadow-glass-sm"
            >
              {youtubeId ? (
                <div className="relative aspect-video overflow-hidden bg-ink-900">
                  <iframe
                    src={`https://www.youtube.com/embed/${youtubeId}`}
                    title={title}
                    className="absolute inset-0 h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <div className="relative flex aspect-video items-center justify-center overflow-hidden bg-azure-50">
                  <div className="px-4 text-center">
                    <PlayIcon className="mx-auto mb-3 h-10 w-10 text-azure-300" />
                    <p className="text-sm text-ink-500">영상을 재생할 수 없습니다</p>
                    <a
                      href={video.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-block text-sm font-semibold text-azure-600 hover:text-azure-700"
                    >
                      원본 링크로 보기
                    </a>
                  </div>
                </div>
              )}

              <div className="px-3 py-2">
                <h3 className="truncate text-sm font-semibold text-ink-900">{title}</h3>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
