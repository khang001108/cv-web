import type { MediaItem } from "@/lib/types";

export function getMediaItems(
  media: MediaItem[] | null | undefined,
  legacyImage?: string | null,
  legacyVideo?: string | null
): MediaItem[] {
  if (Array.isArray(media) && media.length > 0) return media;

  const legacy: MediaItem[] = [];
  if (legacyImage) {
    legacy.push({ id: `legacy-image-${legacyImage}`, type: "image", url: legacyImage });
  }
  if (legacyVideo) {
    legacy.push({ id: `legacy-video-${legacyVideo}`, type: "video", url: legacyVideo });
  }
  return legacy;
}
