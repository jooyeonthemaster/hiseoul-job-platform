'use client';
import { PlayIcon } from '@heroicons/react/24/outline';
import { getYouTubeId } from '../../utils/portfolio.utils';

interface IntroVideoProps {
  introVideo?: string;
}

export default function IntroVideo({ introVideo }: IntroVideoProps) {
  if (!introVideo) return null;

  const youtubeId = getYouTubeId(introVideo);

  return (
    <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/20">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">자기소개 영상</h2>
      
      {youtubeId ? (
        <div className="relative aspect-video rounded-lg overflow-hidden shadow-lg">
          <iframe
            src={`https://www.youtube.com/embed/${youtubeId}`}
            title="자기소개 영상"
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
              href={introVideo} 
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
}