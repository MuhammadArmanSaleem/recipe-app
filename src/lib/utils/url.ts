/**
 * Shared utility to normalize YouTube URLs to a standard format.
 * Supports youtu.be, shorts, and standard watch URLs.
 */
export const normalizeYoutubeUrl = (url: string): string => {
  try {
    const parsed = new URL(url);
    if (!['youtube.com', 'www.youtube.com', 'youtu.be'].includes(parsed.hostname)) {
      return url;
    }

    let videoId: string | null = null;
    if (parsed.hostname === 'youtu.be') {
      videoId = parsed.pathname.slice(1).split('?')[0];
    } else if (parsed.pathname.includes('/shorts/')) {
      videoId = parsed.pathname.split('/shorts/')[1].split('?')[0];
    } else {
      videoId = parsed.searchParams.get('v');
    }

    if (videoId && /^[A-Za-z0-9_-]{11}$/.test(videoId)) {
      return `https://www.youtube.com/watch?v=${videoId}`;
    }
    return url;
  } catch {
    return url;
  }
};
