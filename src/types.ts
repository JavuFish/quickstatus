export type ScreenType =
  | "splash"
  | "camera"
  | "filter"
  | "platform"
  | "share"
  | "quickclip";

export type OSMode = "android" | "ios";

export type FilterId =
  | "none"
  | "coffee"
  | "nightlife"
  | "selfie"
  | "foodie"
  | "retro"
  | "sky";

export interface FilterItem {
  id: FilterId;
  name: string;
  category: string;
  cssClass: string;
  color: string;
  description: string;
  defaultCaption: string;
  iconName: string;
  sampleImg: string;
}

export type VideoEffectId = "none" | "blur" | "slowmo" | "colorpop";

export interface VideoEffectItem {
  id: VideoEffectId;
  name: string;
  icon: string;
  description: string;
  cssClass: string;
}

export type CaptionFontId =
  | "default"
  | "inter"
  | "outfit"
  | "montserrat"
  | "dmsans"
  | "spacegrotesk";

export interface CaptionFontItem {
  id: CaptionFontId;
  name: string;
  label: string;
  fontFamily: string;
  category: string;
  sampleText: string;
}

export type PlatformId = "whatsapp" | "instagram" | "tiktok" | "telegram";

export interface PlatformItem {
  id: PlatformId;
  name: string;
  shortName: string;
  iconBg: string;
  badge: string;
  statusUrlScheme: string;
  description: string;
  defaultChecked: boolean;
}

export interface CapturedMedia {
  type: "photo" | "video";
  url: string;
  thumbnailUrl: string;
  category: string;
  filterId: FilterId;
  videoEffectId?: VideoEffectId;
  caption: string;
  captionFontId?: CaptionFontId;
  suggestions?: string[];
  hashtags?: string[];
  durationSec?: number;
  timestamp: number;
  intensity?: number;
  brightness?: number;
  contrast?: number;
}

export interface AdMobConfig {
  appIdAndroid: string;
  appIdIos: string;
  bannerUnitIdAndroid: string;
  bannerUnitIdIos: string;
  interstitialUnitIdAndroid: string;
  interstitialUnitIdIos: string;
  testMode: boolean;
}
