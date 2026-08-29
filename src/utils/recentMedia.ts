import { FilterId, VideoEffectId, CaptionFontId, CapturedMedia } from "../types";
import { SAMPLE_GALLERY } from "../data/presets";

export interface RecentMediaItem {
  id: string;
  type: "photo" | "video";
  url: string;
  thumbnailUrl: string;
  category: string;
  filterId: FilterId;
  videoEffectId?: VideoEffectId;
  caption: string;
  captionFontId?: CaptionFontId;
  timestamp: number;
  durationSec?: number;
  title?: string;
}

const STORAGE_KEY = "quickstatus_recent_media_v1";

// Initial seed media items so users have immediate rich media in the gallery
const INITIAL_SEEDS: RecentMediaItem[] = [
  {
    id: "seed-clip-1",
    type: "video",
    url: "https://assets.mixkit.co/videos/preview/mixkit-friends-walking-together-in-the-city-at-night-42861-large.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80",
    category: "quickclip",
    filterId: "nightlife",
    videoEffectId: "colorpop",
    caption: "30 detik cerita penuh energi & gaya! ⚡🔥 #QuickClip #StoryVibe",
    captionFontId: "outfit",
    timestamp: Date.now() - 1000 * 60 * 15, // 15 mins ago
    durationSec: 30,
    title: "City Nightlife 30s",
  },
  {
    id: "seed-photo-1",
    type: "photo",
    url: SAMPLE_GALLERY[0].url,
    thumbnailUrl: SAMPLE_GALLERY[0].url,
    category: SAMPLE_GALLERY[0].category,
    filterId: SAMPLE_GALLERY[0].filterId,
    caption: "Coffee break time ☕ Savoring every warm sip before the hustle continues ✨",
    captionFontId: "default",
    timestamp: Date.now() - 1000 * 60 * 45, // 45 mins ago
    title: "Morning Roast",
  },
  {
    id: "seed-photo-2",
    type: "photo",
    url: SAMPLE_GALLERY[1].url,
    thumbnailUrl: SAMPLE_GALLERY[1].url,
    category: SAMPLE_GALLERY[1].category,
    filterId: SAMPLE_GALLERY[1].filterId,
    caption: "Neon nights & city lights ✨ Living for the after-hours energy 🌙",
    captionFontId: "spacegrotesk",
    timestamp: Date.now() - 1000 * 60 * 120, // 2 hours ago
    title: "Cyber Glow",
  },
  {
    id: "seed-photo-3",
    type: "photo",
    url: SAMPLE_GALLERY[3].url,
    thumbnailUrl: SAMPLE_GALLERY[3].url,
    category: SAMPLE_GALLERY[3].category,
    filterId: SAMPLE_GALLERY[3].filterId,
    caption: "Golden hour glow & authentic vibes ✨ Living in my own soft aesthetic 💖",
    captionFontId: "montserrat",
    timestamp: Date.now() - 1000 * 60 * 360, // 6 hours ago
    title: "Soft Golden Hour",
  },
  {
    id: "seed-photo-4",
    type: "photo",
    url: SAMPLE_GALLERY[4].url,
    thumbnailUrl: SAMPLE_GALLERY[4].url,
    category: SAMPLE_GALLERY[4].category,
    filterId: SAMPLE_GALLERY[4].filterId,
    caption: "Good food, great mood! 🍕 Delicious bites that make the day complete ✨",
    captionFontId: "dmsans",
    timestamp: Date.now() - 1000 * 60 * 720, // 12 hours ago
    title: "Artisan Pizza",
  },
];

export function getRecentMediaList(): RecentMediaItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SEEDS));
      return INITIAL_SEEDS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_SEEDS;
  } catch (e) {
    console.warn("Error reading recent media storage:", e);
    return INITIAL_SEEDS;
  }
}

export function saveRecentMediaItem(item: Omit<RecentMediaItem, "id">): RecentMediaItem {
  const newItem: RecentMediaItem = {
    ...item,
    id: `media-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
  };

  try {
    const current = getRecentMediaList();
    // Prepend and limit to 24 items
    const updated = [newItem, ...current.filter((m) => m.url !== item.url)].slice(0, 24);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn("Error saving recent media:", e);
  }

  return newItem;
}

export function deleteRecentMediaItem(id: string): RecentMediaItem[] {
  try {
    const current = getRecentMediaList();
    const updated = current.filter((m) => m.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.warn("Error deleting recent media item:", e);
    return [];
  }
}

export function clearAllRecentMedia(): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  } catch (e) {
    console.warn("Error clearing recent media:", e);
  }
}

export function convertRecentToCapturedMedia(item: RecentMediaItem): CapturedMedia {
  return {
    type: item.type,
    url: item.url,
    thumbnailUrl: item.thumbnailUrl || item.url,
    category: item.category || "coffee",
    filterId: item.filterId || "none",
    videoEffectId: item.videoEffectId,
    caption: item.caption,
    captionFontId: item.captionFontId || "default",
    durationSec: item.durationSec,
    timestamp: item.timestamp,
    intensity: 100,
    brightness: 100,
    contrast: 100,
  };
}
