import type { PostMediaItem } from "@/types/post";

/** Demo-Medien für Seed & Fallback wenn DB-Spalten fehlen */
export const DEMO_POST_MEDIA: Record<string, PostMediaItem[]> = {
  "clip-week": [
    {
      type: "video",
      url: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80",
      thumbnailUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80",
      alt: "Rocket League Clip",
      durationSec: 42,
    },
  ],
  "gallery-scrims": [
    {
      type: "image",
      url: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&q=80",
      alt: "Scrims Lobby",
    },
    {
      type: "image",
      url: "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=800&q=80",
      alt: "Turnier Setup",
    },
    {
      type: "image",
      url: "https://images.unsplash.com/photo-1552820728-8b831bb1ebd2?w=800&q=80",
      alt: "Team Highlight",
    },
  ],
  "highlight-creator": [
    {
      type: "image",
      url: "https://images.unsplash.com/photo-1611162617474-5b21e939e113?w=800&q=80",
      alt: "Creator Highlight",
    },
  ],
  "event-mastermind": [
    {
      type: "image",
      url: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&q=80",
      alt: "Mastermind Session",
    },
  ],
};

export function getDemoPostMedia(key: string): PostMediaItem[] {
  return DEMO_POST_MEDIA[key] ?? [];
}
