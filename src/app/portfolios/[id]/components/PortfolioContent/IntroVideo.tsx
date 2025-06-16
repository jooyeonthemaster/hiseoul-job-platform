'use client';
import { PlayIcon } from '@heroicons/react/24/outline';
import { getYouTubeId } from '../../utils/portfolio.utils';
import { VideoLink } from '../../types/portfolio.types';

interface IntroVideoProps {
  introVideo?: string;
  introVideos?: VideoLink[];
}

export default function IntroVideo({ introVideo, introVideos }: IntroVideoProps) {
  // 영상 목록 생성 (새로운 다중 영상 우선, 기존 단일 영상은 호환성 위해 유지)
  const getVideoList = (): VideoLink[] => {
    const videos = introVideos || [];
    
    // 기존 단일 영상이 있고 배열에 없다면 추가
    if (introVideo && !videos.some(v => v.url === introVideo)) {
      return [...videos, {
        url: introVideo,
        title: '자기소개 영상',
        addedAt: new Date()
      }];
    }
    
    return videos;
  };

  const videoList = getVideoList();

  // 영상이 없으면 렌더링하지 않음
  if (videoList.length === 0) return null;

  return (
    <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/20">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {videoList.length === 1 ? '자기소개 영상' : `자기소개 영상 (${videoList.length}개)`}
      </h2>
      
      <div className="space-y-6">
        {videoList.map((video, index) => {
          const youtubeId = getYouTubeId(video.url);
          
          return (
            <div key={index} className={videoList.length > 1 ? 'border-b border-gray-200 pb-6 last:border-b-0 last:pb-0' : ''}>
              {/* 영상 제목 (다중 영상인 경우에만 표시) */}
              {videoList.length > 1 && (
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {video.title || `영상 ${index + 1}`}
                </h3>
              )}
              
              {youtubeId ? (
                <div className="relative aspect-video rounded-lg overflow-hidden shadow-lg">
                  <iframe
                    src={`https://www.youtube.com/embed/${youtubeId}`}
                    title={video.title || '자기소개 영상'}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <div className="relative aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <PlayIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">영상을 재생할 수 없습니다</p>
                    <a 
                      href={video.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-2 inline-block"
                    >
                      원본 링크로 보기 →
                    </a>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}