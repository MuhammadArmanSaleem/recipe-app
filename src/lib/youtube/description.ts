// src/lib/youtube/description.ts

export type DescriptionResult =
  | { status: "SUCCESS"; content: string; videoTitle: string }
  | { status: "DESCRIPTION_EMPTY" }
  | { status: "FETCH_ERROR"; reason: string };

export async function fetchVideoDescription(youtubeUrl: string): Promise<DescriptionResult> {
  const videoIdMatch = youtubeUrl.match(/(?<=watch\?v=|youtu\.be\/|shorts\/)([\w-]+)/);
  const videoId = videoIdMatch ? videoIdMatch[1] : null;

  if (!videoId) return { status: "FETCH_ERROR", reason: "Invalid YouTube URL" };

  if (!process.env.YOUTUBE_DATA_API_KEY) {
    throw new Error("YOUTUBE_DATA_API_KEY is not set. Add it to .env.local");
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${process.env.YOUTUBE_DATA_API_KEY}`
    );
    
    if (!response.ok) {
      return { status: "FETCH_ERROR", reason: `API returned ${response.status}` };
    }

    const data = await response.json() as { items?: { snippet?: { description?: string, title?: string } }[] };
    if (!data.items || data.items.length === 0) {
      return { status: "DESCRIPTION_EMPTY" };
    }

    const snippet = data.items[0].snippet;
    const rawDescription = snippet?.description || "";
    const videoTitle = snippet?.title || "Untitled Video";

    // Cleaning logic
    const cleaned = rawDescription
      .replace(/http[s]?:\/\/\S+/g, "") // Remove URLs
      .replace(/#\w+/g, "")             // Remove hashtags
      .replace(/[^\p{L}\p{N}\p{P}\s]/gu, "") // Remove emojis
      .replace(/\s+/g, " ")             // Collapse whitespace
      .trim();

    if (cleaned.length < 50) return { status: "DESCRIPTION_EMPTY" };
    
    return { 
      status: "SUCCESS", 
      content: cleaned.substring(0, 4000), 
      videoTitle 
    };
  } catch (error: unknown) {
    const err = error as Error;
    return { status: "FETCH_ERROR", reason: err.message };
  }
}
