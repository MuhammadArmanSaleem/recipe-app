import { Innertube } from "youtubei.js";

export type TranscriptResult =
  | { status: "SUCCESS"; transcript: string; source: "transcript"; thumbnailUrl: string }
  | { status: "TRANSCRIPT_MISSING" }
  | { status: "INVALID_URL" }
  | { status: "FETCH_ERROR"; reason: string };

/**
 * Extracts a YouTube Video ID from various YouTube URL formats.
 */
export function extractYoutubeVideoId(url: string): string | null {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
  return match ? match[1] : null;
}

/**
 * Cleans the transcript by removing common filler words, intros, and sponsor segments.
 */
function cleanTranscript(rawText: string): string {
  const cleaned = rawText
    .split("\n")
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .filter(line => {
      const lower = line.toLowerCase();
      if (lower.includes("subscribe to my channel") || 
          lower.includes("smash that like button") ||
          lower.includes("link in the description") ||
          lower.includes("sponsor of today's video")) {
        return false;
      }
      return true;
    })
    .join(" ");

  return cleaned.replace(/\s+/g, ' ').trim();
}

/**
 * Fetches and cleans a YouTube transcript using youtubei.js (Innertube).
 */
export async function fetchAndCleanTranscript(youtubeUrl: string): Promise<TranscriptResult> {
  try {
    const videoId = extractYoutubeVideoId(youtubeUrl);
    if (!videoId) return { status: "INVALID_URL" };

    const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

    const youtube = await Innertube.create({ 
      generate_session_locally: true 
    });
    
    const info = await youtube.getInfo(videoId);
    const transcriptData = await info.getTranscript();
    
    const rawTranscript = transcriptData?.transcript
      ?.content?.body?.initial_segments
      ?.map((seg: any) => seg.snippet?.text ?? '')
      .filter(Boolean)
      .join(' ')
      .trim();

    if (!rawTranscript || rawTranscript.length < 50) {
      return { status: "TRANSCRIPT_MISSING" };
    }

    const cleanedText = cleanTranscript(rawTranscript);
    if (cleanedText.length < 50) {
      return { status: "TRANSCRIPT_MISSING" };
    }

    return { 
      status: "SUCCESS", 
      transcript: cleanedText, 
      source: "transcript",
      thumbnailUrl
    };
  } catch (err) {
    return { 
      status: "FETCH_ERROR", 
      reason: err instanceof Error ? err.message : "Unknown error" 
    };
  }
}
