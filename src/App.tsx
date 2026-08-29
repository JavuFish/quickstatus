import React, { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ScreenType, CapturedMedia, PlatformId } from "./types";
import { SAMPLE_GALLERY, FILTERS } from "./data/presets";
import { SplashScreen } from "./components/screens/SplashScreen";
import { AppHeader } from "./components/AppHeader";
import { CameraScreen } from "./components/screens/CameraScreen";
import { FilterCaptionScreen } from "./components/screens/FilterCaptionScreen";
import { PlatformSelectScreen } from "./components/screens/PlatformSelectScreen";
import { SimultaneousShareScreen } from "./components/screens/SimultaneousShareScreen";
import { QuickClipScreen } from "./components/screens/QuickClipScreen";
import { AdMobInterstitial } from "./components/AdMobInterstitial";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>("splash");
  const [selectedPlatforms, setSelectedPlatforms] = useState<PlatformId[]>([
    "whatsapp",
    "instagram",
    "tiktok",
  ]);

  // Current captured media in pipeline
  const [capturedMedia, setCapturedMedia] = useState<CapturedMedia>({
    type: "photo",
    url: SAMPLE_GALLERY[0].url,
    thumbnailUrl: SAMPLE_GALLERY[0].url,
    category: "coffee",
    filterId: "coffee",
    caption: FILTERS[0].defaultCaption,
    captionFontId: "default",
    timestamp: Date.now(),
    intensity: 100,
    brightness: 100,
    contrast: 100,
  });

  // Interstitial Ad State
  const [isInterstitialOpen, setIsInterstitialOpen] = useState(false);
  const [pendingInterstitialCallback, setPendingInterstitialCallback] = useState<(() => void) | null>(null);

  // Platform Toggle Handler
  const handleTogglePlatform = (id: PlatformId) => {
    setSelectedPlatforms((prev) => {
      if (prev.includes(id)) {
        if (prev.length === 1) return prev; // Keep at least one
        return prev.filter((p) => p !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // Capture Photo Handler
  const handlePhotoCapture = (media: CapturedMedia) => {
    setCapturedMedia(media);
    setCurrentScreen("filter");
  };

  // Capture Video Handler
  const handleVideoCapture = (media: CapturedMedia) => {
    setCapturedMedia(media);
    setCurrentScreen("filter");
  };

  // Trigger Interstitial Ad with a callback on completion
  const triggerInterstitialAd = (onDone: () => void) => {
    setPendingInterstitialCallback(() => onDone);
    setIsInterstitialOpen(true);
  };

  // Called when user finishes viewing Interstitial Ad
  const handleInterstitialFinished = () => {
    setIsInterstitialOpen(false);
    if (pendingInterstitialCallback) {
      pendingInterstitialCallback();
      setPendingInterstitialCallback(null);
    }
  };

  // Share Now from Screen 4 (Platform Selection)
  const handleShareNowFromPlatform = () => {
    triggerInterstitialAd(() => {
      setCurrentScreen("share");
    });
  };

  return (
    <div className="w-full h-full min-h-[100dvh] bg-[#09090b] text-zinc-100 flex flex-col items-center justify-center relative sm:p-4 overflow-hidden select-none">
      {/* Background Subtle Ambient Glow for Desktop/Tablet */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-cyan-500/10 rounded-full blur-[140px]" />
        <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-[500px] h-[350px] bg-cyan-500/5 rounded-full blur-[120px]" />
      </div>

      {/* Main Application Container: 100dvh on mobile, elegant app card on larger screens */}
      <main className="w-full h-[100dvh] sm:h-[840px] sm:max-h-[92vh] sm:max-w-md bg-[#09090b] flex flex-col relative overflow-hidden sm:rounded-3xl sm:border sm:border-zinc-800/80 sm:shadow-2xl z-10">
        {/* App Header with Logo & Name Only */}
        {currentScreen !== "splash" && <AppHeader />}

        <div className="w-full h-full relative overflow-hidden bg-[#09090b] flex flex-col flex-1 min-h-0">
          <AnimatePresence mode="wait">
            {currentScreen === "splash" && (
              <motion.div
                key="splash"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.25 }}
                className="w-full h-full flex flex-col"
              >
                <SplashScreen
                  onComplete={() => setCurrentScreen("camera")}
                />
              </motion.div>
            )}

            {currentScreen === "camera" && (
              <motion.div
                key="camera"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.2 }}
                className="w-full h-full flex flex-col"
              >
                <CameraScreen
                  onCapture={handlePhotoCapture}
                  onNavigateToQuickClip={() => setCurrentScreen("quickclip")}
                />
              </motion.div>
            )}

            {currentScreen === "filter" && (
              <motion.div
                key="filter"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.2 }}
                className="w-full h-full flex flex-col"
              >
                <FilterCaptionScreen
                  media={capturedMedia}
                  onUpdateMedia={setCapturedMedia}
                  onBack={() => setCurrentScreen("camera")}
                  onNext={() => setCurrentScreen("platform")}
                />
              </motion.div>
            )}

            {currentScreen === "platform" && (
              <motion.div
                key="platform"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.2 }}
                className="w-full h-full flex flex-col"
              >
                <PlatformSelectScreen
                  media={capturedMedia}
                  selectedPlatforms={selectedPlatforms}
                  onTogglePlatform={handleTogglePlatform}
                  onBackToEdit={() => setCurrentScreen("filter")}
                  onShareNow={handleShareNowFromPlatform}
                />
              </motion.div>
            )}

            {currentScreen === "share" && (
              <motion.div
                key="share"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.2 }}
                className="w-full h-full flex flex-col"
              >
                <SimultaneousShareScreen
                  media={capturedMedia}
                  selectedPlatforms={selectedPlatforms}
                  onBack={() => setCurrentScreen("platform")}
                  onRestart={() => setCurrentScreen("camera")}
                  onTriggerInterstitialAd={triggerInterstitialAd}
                />
              </motion.div>
            )}

            {currentScreen === "quickclip" && (
              <motion.div
                key="quickclip"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.2 }}
                className="w-full h-full flex flex-col"
              >
                <QuickClipScreen
                  onCaptureVideo={handleVideoCapture}
                  onBackToCamera={() => setCurrentScreen("camera")}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Global Fullscreen AdMob Interstitial Modal */}
          <AdMobInterstitial
            isOpen={isInterstitialOpen}
            onClose={() => setIsInterstitialOpen(false)}
            onAdFinished={handleInterstitialFinished}
          />
        </div>
      </main>
    </div>
  );
}
