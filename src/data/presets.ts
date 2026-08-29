import {
  FilterItem,
  PlatformItem,
  VideoEffectItem,
  CaptionFontItem,
  AdMobConfig,
} from "../types";

export const CAPTION_FONTS: CaptionFontItem[] = [
  {
    id: "default",
    name: "Jakarta Sans",
    label: "Default Bersih",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    category: "Clean Modern",
    sampleText: "Clean & Modern",
  },
  {
    id: "inter",
    name: "Inter",
    label: "Netral Presisi",
    fontFamily: "'Inter', sans-serif",
    category: "Precision",
    sampleText: "Crisp Precision",
  },
  {
    id: "outfit",
    name: "Outfit",
    label: "Geometris Halus",
    fontFamily: "'Outfit', sans-serif",
    category: "Geometric",
    sampleText: "Geometric Smooth",
  },
  {
    id: "montserrat",
    name: "Montserrat",
    label: "Tegas & Solid",
    fontFamily: "'Montserrat', sans-serif",
    category: "Bold Editorial",
    sampleText: "Editorial Bold",
  },
  {
    id: "dmsans",
    name: "DM Sans",
    label: "Minimalis Tajam",
    fontFamily: "'DM Sans', sans-serif",
    category: "Minimalist",
    sampleText: "Minimalist Sharp",
  },
  {
    id: "spacegrotesk",
    name: "Space Grotesk",
    label: "Cyber Modern",
    fontFamily: "'Space Grotesk', sans-serif",
    category: "Cyber Tech",
    sampleText: "Modern Tech Sans",
  },
];

export const FILTERS: FilterItem[] = [
  {
    id: "coffee",
    name: "Coffee Glow",
    category: "coffee",
    cssClass: "filter-coffee-glow",
    color: "#d4a373",
    description: "Hangat & keemasan untuk suasana santai ngopi",
    defaultCaption: "Coffee break time ☕ Savoring every warm sip before the hustle continues ✨",
    iconName: "Coffee",
    sampleImg: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: "nightlife",
    name: "Nightlife Neon",
    category: "nightlife",
    cssClass: "filter-nightlife-neon",
    color: "#b5179e",
    description: "Vibrant neon cyberpunk untuk suasana malam & pesta",
    defaultCaption: "Neon nights & city lights ✨ Living for the after-hours energy 🌙",
    iconName: "Moon",
    sampleImg: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: "selfie",
    name: "Selfie Soft",
    category: "selfie",
    cssClass: "filter-selfie-soft",
    color: "#ffb703",
    description: "Skin glow lembut & pencahayaan halus mempesona",
    defaultCaption: "Golden hour glow & authentic vibes ✨ Living in my own soft aesthetic 💖",
    iconName: "Sparkles",
    sampleImg: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: "foodie",
    name: "Foodie Pop",
    category: "foodie",
    cssClass: "filter-foodie-pop",
    color: "#f77f00",
    description: "Saturasi menggugah selera untuk foto kuliner",
    defaultCaption: "Good food, great mood! 🍕 Delicious bites that make the day complete ✨",
    iconName: "Utensils",
    sampleImg: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: "retro",
    name: "Moment Retro",
    category: "retro",
    cssClass: "filter-moment-retro",
    color: "#c68b59",
    description: "Nuansa film 35mm klasik & nostalgia hangat",
    defaultCaption: "Nostalgic film frames & timeless memories 🎞️ Vintage souls never fade 🕰️",
    iconName: "Camera",
    sampleImg: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: "sky",
    name: "SkyBright",
    category: "sky",
    cssClass: "filter-sky-bright",
    color: "#00b4d8",
    description: "Langit biru cerah & panorama lanskap memukau",
    defaultCaption: "Chasing golden horizons and clear blue skies 🌤️ Nature never disappoints ✨",
    iconName: "Sun",
    sampleImg: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80",
  },
];

export const VIDEO_EFFECTS: VideoEffectItem[] = [
  {
    id: "blur",
    name: "Kabur Lembut",
    icon: "EyeOff",
    description: "Soft blur sinematik dengan fokus lembut di subjek",
    cssClass: "effect-soft-blur",
  },
  {
    id: "slowmo",
    name: "Gerak Lambat",
    icon: "Gauge",
    description: "Pacing slow motion dramatis 0.5x kecepatan",
    cssClass: "effect-slow-mo",
  },
  {
    id: "colorpop",
    name: "Warna Menonjol",
    icon: "Palette",
    description: "Vibrance warna tinggi menonjolkan momen penting",
    cssClass: "effect-color-pop",
  },
];

export const PLATFORMS: PlatformItem[] = [
  {
    id: "whatsapp",
    name: "WhatsApp Status",
    shortName: "WA Status",
    iconBg: "bg-emerald-600",
    badge: "24 Jam",
    statusUrlScheme: "whatsapp://send?text=",
    description: "Bagikan langsung ke pembaruan status WhatsApp kontak Anda",
    defaultChecked: true,
  },
  {
    id: "instagram",
    name: "Instagram Story & Reels",
    shortName: "IG Story",
    iconBg: "bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600",
    badge: "Story / Reels",
    statusUrlScheme: "instagram://story",
    description: "Kirim langsung ke IG Stories & template Reels",
    defaultChecked: true,
  },
  {
    id: "tiktok",
    name: "TikTok Post & Stories",
    shortName: "TikTok Post",
    iconBg: "bg-neutral-900 border border-neutral-700",
    badge: "FYP Ready",
    statusUrlScheme: "https://www.tiktok.com/upload",
    description: "Upload instan ke feed TikTok & konten kreasi kilat",
    defaultChecked: true,
  },
];

export const DEFAULT_ADMOB_CONFIG: AdMobConfig = {
  appIdAndroid: "ca-app-pub-3940256099942544~3347511713",
  appIdIos: "ca-app-pub-3940256099942544~1458002511",
  bannerUnitIdAndroid: "ca-app-pub-3940256099942544/6300978111",
  bannerUnitIdIos: "ca-app-pub-3940256099942544/2934735716",
  interstitialUnitIdAndroid: "ca-app-pub-3940256099942544/1033173712",
  interstitialUnitIdIos: "ca-app-pub-3940256099942544/4411468910",
  testMode: true,
};

export const SAMPLE_GALLERY = [
  {
    category: "coffee",
    filterId: "coffee" as const,
    url: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=1000&auto=format&fit=crop&q=80",
    title: "Morning Roast",
  },
  {
    category: "nightlife",
    filterId: "nightlife" as const,
    url: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1000&auto=format&fit=crop&q=80",
    title: "Cyber City Vibe",
  },
  {
    category: "foodie",
    filterId: "foodie" as const,
    url: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1000&auto=format&fit=crop&q=80",
    title: "Gourmet Brunch",
  },
  {
    category: "selfie",
    filterId: "selfie" as const,
    url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1000&auto=format&fit=crop&q=80",
    title: "Golden Hour Glow",
  },
  {
    category: "retro",
    filterId: "retro" as const,
    url: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=1000&auto=format&fit=crop&q=80",
    title: "Analog Memories",
  },
  {
    category: "sky",
    filterId: "sky" as const,
    url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1000&auto=format&fit=crop&q=80",
    title: "Azure Horizon",
  },
];

export const FLUTTER_CODE_SNIPPET = `// ==========================================
// QuickStatus - Flutter Mobile App Architecture
// File: lib/main.dart
// ==========================================

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_mobile_ads/google_mobile_ads.dart';
import 'services/admob_service.dart';
import 'screens/splash_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // 1. Inisialisasi Google Mobile Ads SDK
  await MobileAds.instance.initialize();
  
  // 2. Kunci orientasi ke Portrait & sesuaikan status bar dark mode
  SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);
  
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.light,
      systemNavigationBarColor: Color(0xFF0C0D10),
    ),
  );

  runApp(const QuickStatusApp());
}

class QuickStatusApp extends StatelessWidget {
  const QuickStatusApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'QuickStatus',
      debugShowCheckedModeBanner: false,
      themeMode: ThemeMode.dark,
      theme: ThemeData.dark().copyWith(
        scaffoldBackgroundColor: const Color(0xFF0C0D10),
        primaryColor: const Color(0xFFE6E9F0),
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFFE6E9F0),
          secondary: Color(0xFF6366F1),
          surface: Color(0xFF13151B),
        ),
      ),
      home: const SplashScreen(),
    );
  }
}

// ==========================================
// File: lib/services/admob_service.dart
// ==========================================
class AdMobService {
  // GANTI DENGAN AD UNIT ID ANDA SENDIRI DARI GOOGLE ADMOB CONSOLE
  static String get bannerAdUnitId {
    if (Platform.isAndroid) {
      return 'ca-app-pub-3940256099942544/6300978111'; // Ganti ID Android
    } else if (Platform.isIOS) {
      return 'ca-app-pub-3940256099942544/2934735716'; // Ganti ID iOS
    }
    throw UnsupportedError("Platform tidak didukung");
  }

  static String get interstitialAdUnitId {
    if (Platform.isAndroid) {
      return 'ca-app-pub-3940256099942544/1033173712'; // Interstitial Android
    } else if (Platform.isIOS) {
      return 'ca-app-pub-3940256099942544/4411468910'; // Interstitial iOS
    }
    throw UnsupportedError("Platform tidak didukung");
  }
}`;
