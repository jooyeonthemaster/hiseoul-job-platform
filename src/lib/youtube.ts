// YouTube URL 파싱 공용 헬퍼

/** 유효한 YouTube 영상 ID: [A-Za-z0-9_-] 11자리 */
const YOUTUBE_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;

/**
 * YouTube URL에서 11자리 영상 ID를 추출한다.
 *
 * 지원 형식:
 * - `https://www.youtube.com/watch?v=VIDEO_ID`
 * - `https://youtu.be/VIDEO_ID`
 * - `https://www.youtube.com/embed/VIDEO_ID`
 * - `https://www.youtube.com/shorts/VIDEO_ID`
 * - `https://www.youtube.com/live/VIDEO_ID`
 * - `https://www.youtube.com/v/VIDEO_ID`
 * - 위 형식에 추가 쿼리스트링/타임스탬프(`?t=10s`, `&feature=share` 등)가 붙은 경우
 *
 * 프로토콜(http/https)이 없는 URL도 허용하며, ID는 [A-Za-z0-9_-] 11자리로 검증한다.
 *
 * @param url - 파싱할 YouTube URL 문자열
 * @returns 11자리 영상 ID, 유효하지 않으면 `null`
 *
 * @example
 * getYouTubeId('https://youtu.be/abc123def45'); // 'abc123def45'
 * getYouTubeId('https://www.youtube.com/watch?v=abc123def45&t=10s'); // 'abc123def45'
 * getYouTubeId('https://youtube.com/shorts/abc123def45'); // 'abc123def45'
 * getYouTubeId('https://www.youtube.com/live/abc123def45?feature=share'); // 'abc123def45'
 */
export function getYouTubeId(url: string): string | null {
  if (!url || typeof url !== 'string') return null;

  const trimmed = url.trim();
  if (!trimmed) return null;

  // 1) URL 파싱 기반 (가장 견고) — 프로토콜이 없으면 보완한다.
  try {
    const normalized = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    const parsed = new URL(normalized);
    const host = parsed.hostname.replace(/^www\./i, '').toLowerCase();

    // youtu.be/VIDEO_ID
    if (host === 'youtu.be') {
      const id = parsed.pathname.split('/').filter(Boolean)[0];
      if (id && YOUTUBE_ID_PATTERN.test(id)) return id;
    }

    // youtube.com 계열 (www / m / music / 기타 서브도메인 포함)
    if (host === 'youtube.com' || host.endsWith('.youtube.com')) {
      // watch?v=VIDEO_ID
      const vParam = parsed.searchParams.get('v');
      if (vParam && YOUTUBE_ID_PATTERN.test(vParam)) return vParam;

      // /embed/ID, /shorts/ID, /live/ID, /v/ID
      const segments = parsed.pathname.split('/').filter(Boolean);
      const marker = segments[0]?.toLowerCase();
      if (marker && ['embed', 'shorts', 'live', 'v'].includes(marker)) {
        const id = segments[1];
        if (id && YOUTUBE_ID_PATTERN.test(id)) return id;
      }
    }
  } catch {
    // URL 파싱 실패 시 아래 정규식 폴백으로 진행한다.
  }

  // 2) 정규식 폴백 — 다양한 형식을 한 번에 커버한다.
  const fallback = trimmed.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:[^#]*&)?v=|embed\/|shorts\/|live\/|v\/))([A-Za-z0-9_-]{11})/i
  );
  if (fallback && fallback[1]) return fallback[1];

  return null;
}
