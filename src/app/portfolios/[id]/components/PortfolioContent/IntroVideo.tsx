'use client';

import { PlayIcon } from '@heroicons/react/24/outline';
import { getYouTubeId } from '../../utils/portfolio.utils';
import type { VideoLink } from '../../types/portfolio.types';

interface IntroVideoProps {
  introVideo?: string;
  introVideos?: VideoLink[];
}

export default function IntroVideo({ introVideo, introVideos }: IntroVideoProps) {
  const videos = introVideos || [];
  const videoList: VideoLink[] = introVideo && !videos.some((video) => video.url === introVideo)
    ? [
        ...videos,
        {
          url: introVideo,
          title: '자기소개 영상',
          addedAt: new Date(),
        },
      ]
    : videos;

  if (videoList.length === 0) return null;

  const gridClassName =
    videoList.length === 1
      ? 'grid grid-cols-1 gap-4 flex-1 min-h-0'
      : videoList.length === 2
        ? 'grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 min-h-0'
        : videoList.length === 3
          ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 xl:grid-rows-2 gap-4 flex-1 min-h-0'
          : 'grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4 flex-1 min-h-0 auto-rows-fr';

  const getTileClassName = (index: number) =>
    videoList.length === 3 && index === 0
      ? 'md:col-span-2 xl:col-span-1 xl:row-span-2'
      : '';

  return (
    <div className="glass-card h-full min-h-[18rem] lg:min-h-0 p-6 md:p-7 flex flex-col">
      <div className="flex items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-azure-400 to-azure-600 text-white shadow-glow">
            <PlayIcon className="h-5 w-5" />
          </div>
          <h2 className="font-display text-xl md:text-2xl font-bold tracking-tight text-ink-900">
            자기소개 영상
          </h2>
        </div>
        <span className="flex-shrink-0 rounded-full border border-azure-100 bg-azure-50 px-3 py-1 text-sm font-semibold text-azure-700">
          {videoList.length}개
        </span>
      </div>

      <div className={gridClassName}>
        {videoList.map((video, index) => {
          const youtubeId = getYouTubeId(video.url);
          const title = video.title || `영상 ${index + 1}`;

          return (
            <div
              key={`${video.url}-${index}`}
              className={`flex min-h-0 flex-col overflow-hidden rounded-2xl border border-ink-100 bg-white/65 shadow-glass-sm ${getTileClassName(index)}`}
            >
              {youtubeId ? (
                <div className="relative aspect-video lg:aspect-auto lg:flex-1 min-h-0 overflow-hidden bg-ink-900">
                  <iframe
                    src={`https://www.youtube.com/embed/${youtubeId}`}
                    title={title}
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <div className="relative aspect-video lg:aspect-auto lg:flex-1 min-h-0 flex items-center justify-center overflow-hidden bg-azure-50">
                  <div className="px-4 text-center">
                    <PlayIcon className="h-10 w-10 text-azure-300 mx-auto mb-3" />
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
