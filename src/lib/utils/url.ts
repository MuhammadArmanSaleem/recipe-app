/**
 * Shared utility to normalize YouTube URLs to a standard format.
 * Supports youtu.be, shorts, and standard watch URLs.
 */
export const normalizeYoutubeUrl = (url: string): string => {
  try {
    const parsed = new URL(url);
    
    // Handle youtu.be/VIDEO_ID
    if (parsed.hostname === 'youtu.be') {
      const videoId = parsed.pathname.slice(1).split('?')[0];
      return `https://www.youtube.com/watch?v=${videoId}`;
    }
    
    // Handle youtube.com/shorts/VIDEO_ID
    if (parsed.pathname.includes('/shorts/')) {
      const videoId = parsed.pathname.split('/shorts/')[1].split('?')[0];
      return `https://www.youtube.com/watch?v=${videoId}`;
    }
    
    // Handle standard youtube.com/watch?v=VIDEO_ID
    const vParam = parsed.searchParams.get('v');
    if (vParam) {
      return `https://www.youtube.com/watch?v=${vParam}`;
    }
    
    return url;
  } catch {
    return url;
  }
};
