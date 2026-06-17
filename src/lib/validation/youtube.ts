import { z } from "zod";

export const youtubeUrlSchema = z
  .string()
  .trim()
  .url({ message: "Please enter a valid URL" })
  .refine(
    (url) => {
      try {
        const { hostname } = new URL(url);
        return (
          hostname === "youtube.com" ||
          hostname.endsWith(".youtube.com") ||
          hostname === "youtu.be"
        );
      } catch {
        return false;
      }
    },
    { message: "Please enter a valid YouTube URL (youtube.com or youtu.be)" }
  );

