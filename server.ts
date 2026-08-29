import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "25mb" }));

// Server-side Gemini AI Client
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// In-memory cache & rate limit circuit breaker to handle rate limits & 429 quota smoothly
interface CachedCaption {
  caption: string;
  suggestions: string[];
  hashtags: string[];
  source: string;
  timestamp: number;
}

const captionCache = new Map<string, CachedCaption>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache

let rateLimitCooldownUntil = 0; // Timestamp when Gemini API can be retried after 429

// Comprehensive contextual fallback captions repository
const FALLBACK_CAPTIONS_BY_CATEGORY: Record<string, { captions: string[]; suggestions: string[]; hashtags: string[] }> = {
  coffee: {
    captions: [
      "Coffee break time ☕ Savoring every warm sip before the hustle continues ✨",
      "Espresso yourself! ☕ Cozy vibes and fresh roast aroma 🤎",
      "But first, coffee. ☕ Mood booster in a cup 💫",
      "Sipping warmth & chasing dreams ☕✨ #CoffeeBreak #DailyVibe",
      "Awakening the soul one cup at a time ☕🌿",
    ],
    suggestions: [
      "Coffee break time ☕ Savoring every warm sip ✨",
      "Life happens, coffee helps 🤎☕",
      "Fueling good energy with fresh brew ☕⚡",
      "Caffeine & clarity for today's journey 🌿☕",
    ],
    hashtags: ["#CoffeeBreak", "#CoffeeVibes", "#DailyMood", "#AestheticStatus", "#QuickStatus"],
  },
  nightlife: {
    captions: [
      "Neon nights & city lights ✨ Living for the after-hours energy 🌙",
      "Lost in the music, found in the vibe 🎶🌃 #NightOut #CyberGlow",
      "Midnight moments with golden memories 🍸✨",
      "When the city goes dark, we shine bright ⚡🌙 #NightlifeVibes",
      "Chasing twilight stories under neon skies 🌌💫",
    ],
    suggestions: [
      "Neon nights & city lights ✨ Living for the energy 🌙",
      "Midnight vibes & endless memories 🍸🌃",
      "Glow through the dark, sparkle till dawn ✨⚡",
      "City heartbeat after dark 🌆🎶",
    ],
    hashtags: ["#Nightlife", "#NeonVibes", "#CityLights", "#NightOut", "#QuickStatus"],
  },
  foodie: {
    captions: [
      "Good food, great mood! 🍕 Delicious bites that make the day complete ✨",
      "Feast for the eyes and the soul 🍝😋 #FoodieGram #CulinaryDelight",
      "Happiness is homemade and freshly plated 🥑✨",
      "Taste perfection in every single bite! 🍔🔥 #FoodLovers",
      "Flavors that speak directly to the heart 🍜💖",
    ],
    suggestions: [
      "Good food, great mood! 🍕 Delicious bites ✨",
      "Cravings satisfied with perfection 😋🍰",
      "Plated with love & good taste 🥗✨",
      "The best stories are shared around food 🍷🍝",
    ],
    hashtags: ["#Foodie", "#FoodLovers", "#GoodFoodMood", "#CulinaryDelight", "#QuickStatus"],
  },
  selfie: {
    captions: [
      "Golden hour glow & authentic vibes ✨ Living in my own soft aesthetic 💖",
      "Confidence is my best accessory today 💫 #SelfLove #SoftGlow",
      "Just being real in an unfiltered world 🌿✨",
      "Catching the light and feeling alright 🌸✨ #DailySelfie",
      "Embracing every small moment with gratitude 🕊️💫",
    ],
    suggestions: [
      "Golden hour glow & authentic vibes ✨💖",
      "Unapologetically me in my element 💫🌿",
      "Soft light, calm mind, happy heart 🌸✨",
      "Radiating positive energy today ☀️💛",
    ],
    hashtags: ["#SelfLove", "#GoldenHour", "#SoftGlow", "#DailyAesthetic", "#QuickStatus"],
  },
  retro: {
    captions: [
      "Nostalgic film frames & timeless memories 🎞️ Vintage souls never fade 🕰️",
      "Captured in 35mm warmth 📼✨ #RetroVibes #ThrowbackSoul",
      "Classic aesthetic for modern times 📻🤎",
      "Grain, light, and golden yesterdays 📷✨ #VintageVibe",
      "Old school warmth in a fast-paced world 🎞️🌿",
    ],
    suggestions: [
      "Nostalgic film frames & timeless memories 🎞️✨",
      "Vintage aesthetic & golden soul 📻🤎",
      "35mm memories that stay forever 📷🕰️",
      "Retro vibes in modern days 📼💫",
    ],
    hashtags: ["#RetroVibes", "#VintageAesthetic", "#FilmPhotography", "#35mmVibe", "#QuickStatus"],
  },
  sky: {
    captions: [
      "Chasing golden horizons and clear blue skies 🌤️ Nature never disappoints ✨",
      "Breathe in the serenity, breathe out the noise ☁️💙 #SkyBright #Wanderlust",
      "Where the sky touches the earth, magic happens 🌅✨",
      "Sun-kissed mornings and limitless blue ☀️🌊 #PureVibes",
      "Painted by nature, admired by the soul 🌤️🌈",
    ],
    suggestions: [
      "Chasing golden horizons and clear skies 🌤️✨",
      "Serene blue skies & peaceful minds ☁️💙",
      "Sunsets are proof that endings can be beautiful 🌅✨",
      "Limitless sky, boundless dreams ☀️🕊️",
    ],
    hashtags: ["#SkyLovers", "#GoldenHour", "#NatureVibes", "#SunsetMagic", "#QuickStatus"],
  },
  quickclip: {
    captions: [
      "30 detik cerita penuh energi & gaya! ⚡🔥 #QuickClip #StoryVibe",
      "Catch the moment, feel the beat 🎬✨ #ShortVideo #StatusKeren",
      "Flash of life in high dynamic motion 🌪️💫 #QuickStatus",
      "Blink and you'll miss the magic ⚡🎥 #CinematicMoments",
      "Dynamic 30-second vibes for the soul 🌟✨ #StoryStatus",
    ],
    suggestions: [
      "30 detik cerita penuh energi & gaya! ⚡🔥",
      "Catch the motion, feel the beat 🎬✨",
      "High energy status clip in 30 seconds ⚡💫",
      "Quick cinematic frame of the day 🎥🌟",
    ],
    hashtags: ["#QuickClip", "#ReelsVibe", "#StoryStatus", "#ShortVideo", "#QuickStatus"],
  },
};

function getContextualFallback(category?: string, mood?: string, filterName?: string) {
  const catKey = (category || "coffee").toLowerCase();
  const pool = FALLBACK_CAPTIONS_BY_CATEGORY[catKey] || FALLBACK_CAPTIONS_BY_CATEGORY.coffee;
  const randomIndex = Math.floor(Math.random() * pool.captions.length);
  let mainCaption = pool.captions[randomIndex];

  if (mood && mood.toLowerCase().includes("chill")) {
    mainCaption = `${mainCaption.split("#")[0].trim()} 🌿☕ #ChillVibe`;
  } else if (mood && mood.toLowerCase().includes("energi")) {
    mainCaption = `${mainCaption.split("#")[0].trim()} ⚡🔥 #HighEnergy`;
  }

  return {
    caption: mainCaption,
    suggestions: pool.suggestions,
    hashtags: pool.hashtags,
    source: "smart-preset",
  };
}

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", app: "QuickStatus", timestamp: new Date().toISOString() });
});

// Smart AI Auto-Caption & Status Generator with Rate-Limit Protection & Fallback
app.post("/api/generate-caption", async (req, res) => {
  const { category, filterName, mood, customPrompt, imageBase64 } = req.body;
  const now = Date.now();

  // Create unique cache key based on inputs (excluding huge image payload)
  const cacheKey = `${category || "all"}_${filterName || "none"}_${mood || "default"}_${customPrompt || ""}`;
  const cached = captionCache.get(cacheKey);
  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    return res.json({
      caption: cached.caption,
      suggestions: cached.suggestions,
      hashtags: cached.hashtags,
      source: "cache",
    });
  }

  // Circuit breaker: If we hit a rate limit recently, return instant contextual fallback
  if (now < rateLimitCooldownUntil) {
    const fallback = getContextualFallback(category, mood, filterName);
    return res.json(fallback);
  }

  try {
    const ai = getGeminiClient();

    if (!ai) {
      const fallback = getContextualFallback(category, mood, filterName);
      return res.json(fallback);
    }

    // Build Prompt for Gemini
    const promptText = `Anda adalah asisten kreatif pembuat caption status media sosial (WhatsApp Status, Instagram Story, TikTok).
Buat 1 caption utama yang sangat menarik, estetik, singkat-padat (1-2 kalimat) dan 3 variasi alternatif (Santai, Estetik, Energik).
Kategori/Tema: ${category || "Umum"}
Nama Filter: ${filterName || "Standard"}
Mood: ${mood || "Seru & Positif"}
Instruksi tambahan: ${customPrompt || "Gunakan emoji yang pas, gaya bahasa anak muda zaman now Indonesia/Inggris kekinian"}.
Tolong kembalikan respons dalam format JSON valid:
{
  "caption": "caption utama singkat dan ngena dengan emoji",
  "suggestions": ["variasi 1", "variasi 2", "variasi 3"],
  "hashtags": ["#tag1", "#tag2", "#tag3", "#tag4"]
}`;

    let contentsPayload: any = promptText;
    if (imageBase64 && typeof imageBase64 === "string" && imageBase64.includes("base64,")) {
      const mimeType = imageBase64.split(";")[0].replace("data:", "") || "image/jpeg";
      const base64Data = imageBase64.split("base64,")[1];
      contentsPayload = {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
            },
          },
          {
            text: `${promptText}\n\nAnalisis juga objek utama dalam foto untuk menghasilkan caption yang sangat relevan dan presisi!`,
          },
        ],
      };
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: contentsPayload,
      config: {
        responseMimeType: "application/json",
      },
    });

    const textOutput = response.text?.trim() || "";
    try {
      const parsed = JSON.parse(textOutput);
      const result = {
        caption: parsed.caption || getContextualFallback(category, mood, filterName).caption,
        suggestions: Array.isArray(parsed.suggestions) && parsed.suggestions.length > 0
          ? parsed.suggestions
          : getContextualFallback(category, mood, filterName).suggestions,
        hashtags: Array.isArray(parsed.hashtags) && parsed.hashtags.length > 0
          ? parsed.hashtags
          : ["#QuickStatus", "#DailyVibe", "#StoryShare"],
        source: "gemini",
      };

      // Store in memory cache
      captionCache.set(cacheKey, { ...result, timestamp: now });
      return res.json(result);
    } catch {
      const result = {
        caption: textOutput || getContextualFallback(category, mood, filterName).caption,
        suggestions: getContextualFallback(category, mood, filterName).suggestions,
        hashtags: ["#QuickStatus", "#DailyVibe", "#StoryShare"],
        source: "gemini-raw",
      };
      captionCache.set(cacheKey, { ...result, timestamp: now });
      return res.json(result);
    }
  } catch (error: any) {
    // If rate limit (429 / RESOURCE_EXHAUSTED), activate circuit breaker for 30 seconds
    const errorMessage = String(error?.message || error || "");
    const isRateLimit = errorMessage.includes("429") || errorMessage.includes("RESOURCE_EXHAUSTED") || error?.status === 429;

    if (isRateLimit) {
      rateLimitCooldownUntil = Date.now() + 35 * 1000; // 35 seconds cooldown
      console.warn("Gemini API rate limit reached. Activating smart preset generator cooldown (35s).");
    } else {
      console.warn("Gemini generation notice:", errorMessage.slice(0, 120));
    }

    const fallback = getContextualFallback(category, mood, filterName);
    return res.json(fallback);
  }
});

// AdMob Configuration & Metadata API for Flutter integration
app.get("/api/admob-config", (_req, res) => {
  res.json({
    appId: {
      android: "ca-app-pub-3940256099942544~3347511713", // Test AdMob App ID (Android)
      ios: "ca-app-pub-3940256099942544~1458002511", // Test AdMob App ID (iOS)
    },
    units: {
      banner: {
        android: "ca-app-pub-3940256099942544/6300978111",
        ios: "ca-app-pub-3940256099942544/2934735716",
        placementScreens: ["camera", "filter", "share", "quickclip"],
      },
      interstitial: {
        android: "ca-app-pub-3940256099942544/1033173712",
        ios: "ca-app-pub-3940256099942544/4411468910",
        trigger: "before_share_and_export",
      },
    },
    note: "Ganti ID pengujian (test ad unit ID) di atas dengan Ad Unit ID produksi milik Anda sendiri di Google AdMob Console.",
  });
});

async function start() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`QuickStatus Mobile Server running on http://localhost:${PORT}`);
  });
}

start();
