import React, { useState, useRef, useEffect } from "react";
import {
  Camera,
  RefreshCw,
  Zap,
  Grid,
  Sparkles,
  Image as ImageIcon,
  Video,
  Check,
  ChevronRight,
  Sliders,
  X,
  Upload,
  Clock,
  Film,
  HelpCircle,
  Crop,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { FilterId, FilterItem, CapturedMedia, OSMode } from "../../types";
import { FILTERS, SAMPLE_GALLERY } from "../../data/presets";
import { AdMobBanner } from "../AdMobBanner";
import { RecentMediaGalleryModal } from "./RecentMediaGalleryModal";
import { QuickStartGuideModal } from "./QuickStartGuideModal";
import { cropImageTo9x16 } from "../../utils/cropUtils";
import {
  getRecentMediaList,
  saveRecentMediaItem,
  convertRecentToCapturedMedia,
  RecentMediaItem,
} from "../../utils/recentMedia";

interface CameraScreenProps {
  onCapture: (media: CapturedMedia) => void;
  onNavigateToQuickClip: () => void;
  onOpenAdDetails?: () => void;
  osMode?: OSMode;
}

export const CameraScreen: React.FC<CameraScreenProps> = ({
  onCapture,
  onNavigateToQuickClip,
  onOpenAdDetails,
  osMode = "android",
}) => {
  const [selectedFilter, setSelectedFilter] = useState<FilterId>("coffee");
  const [flashMode, setFlashMode] = useState<"off" | "on" | "auto">("off");
  const [showGrid, setShowGrid] = useState(false);
  const [isFrontCamera, setIsFrontCamera] = useState(false);
  const [isLiveCameraActive, setIsLiveCameraActive] = useState(false);
  const [activeSampleIndex, setActiveSampleIndex] = useState(0);
  const [showRecentMediaModal, setShowRecentMediaModal] = useState(false);
  const [showQuickStartModal, setShowQuickStartModal] = useState(false);
  const [isCroppingProgress, setIsCroppingProgress] = useState(false);
  const [recentMediaItems, setRecentMediaItems] = useState<RecentMediaItem[]>(() =>
    getRecentMediaList()
  );
  const [isAutoStatusGenerating, setIsAutoStatusGenerating] = useState(false);
  const [autoStatusPreview, setAutoStatusPreview] = useState<string | null>(null);
  const [flashEffect, setFlashEffect] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Refresh recent media on focus / mount
  useEffect(() => {
    setRecentMediaItems(getRecentMediaList());
  }, [showRecentMediaModal]);

  // Initialize live webcam if user allows, else smoothly fallback to high-res dynamic presets
  useEffect(() => {
    let active = true;

    async function initCamera() {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: isFrontCamera ? "user" : "environment",
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
            audio: false,
          });

          if (active && videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(() => {});
            streamRef.current = stream;
            setIsLiveCameraActive(true);
          }
        }
      } catch (err) {
        console.log("Webcam optional fallback to preset scenes:", err);
        setIsLiveCameraActive(false);
      }
    }

    initCamera();

    return () => {
      active = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [isFrontCamera]);

  const currentFilterObj = FILTERS.find((f) => f.id === selectedFilter) || FILTERS[0];
  const currentSample = SAMPLE_GALLERY[activeSampleIndex];

  // Capture Photo Action with Automatic 9:16 Aspect Ratio Cropping
  const handleShutterCapture = async () => {
    // Flash Animation trigger
    setFlashEffect(true);
    setTimeout(() => setFlashEffect(false), 200);

    let rawUrl = currentSample.url;

    // If live video active, grab frame from canvas
    if (isLiveCameraActive && videoRef.current) {
      try {
        const video = videoRef.current;
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth || 720;
        canvas.height = video.videoHeight || 1280;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          if (isFrontCamera) {
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);
          }
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          rawUrl = canvas.toDataURL("image/jpeg", 0.92);
        }
      } catch (e) {
        console.error("Canvas capture error, using preset:", e);
      }
    }

    // Apply auto 9:16 crop for mobile status compatibility
    setIsCroppingProgress(true);
    const croppedUrl = await cropImageTo9x16(rawUrl);
    setIsCroppingProgress(false);

    const defaultCaption = autoStatusPreview || currentFilterObj.defaultCaption;

    // Save to local device Recent Media storage
    saveRecentMediaItem({
      type: "photo",
      url: croppedUrl,
      thumbnailUrl: croppedUrl,
      category: currentFilterObj.category,
      filterId: selectedFilter,
      caption: defaultCaption,
      captionFontId: "default",
      timestamp: Date.now(),
      title: `${currentFilterObj.name} Status`,
    });

    onCapture({
      type: "photo",
      url: croppedUrl,
      thumbnailUrl: croppedUrl,
      category: currentFilterObj.category,
      filterId: selectedFilter,
      caption: defaultCaption,
      captionFontId: "default",
      timestamp: Date.now(),
      intensity: 100,
      brightness: 100,
      contrast: 100,
    });
  };

  // Auto Status AI Generator Quick Trigger
  const handleGenerateAutoStatus = async () => {
    setIsAutoStatusGenerating(true);
    try {
      const res = await fetch("/api/generate-caption", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: currentFilterObj.category,
          filterName: currentFilterObj.name,
          mood: "Keren & Kekinian",
        }),
      });
      const data = await res.json();
      setAutoStatusPreview(data.caption || currentFilterObj.defaultCaption);
    } catch (e) {
      setAutoStatusPreview(currentFilterObj.defaultCaption);
    } finally {
      setIsAutoStatusGenerating(false);
    }
  };

  // Upload Custom Photo from Device with Auto 9:16 Crop
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const rawResult = event.target?.result as string;
        if (rawResult) {
          setIsCroppingProgress(true);
          const croppedResult = await cropImageTo9x16(rawResult);
          setIsCroppingProgress(false);

          saveRecentMediaItem({
            type: "photo",
            url: croppedResult,
            thumbnailUrl: croppedResult,
            category: currentFilterObj.category,
            filterId: selectedFilter,
            caption: currentFilterObj.defaultCaption,
            captionFontId: "default",
            timestamp: Date.now(),
            title: file.name.slice(0, 18),
          });

          onCapture({
            type: "photo",
            url: croppedResult,
            thumbnailUrl: croppedResult,
            category: currentFilterObj.category,
            filterId: selectedFilter,
            caption: currentFilterObj.defaultCaption,
            timestamp: Date.now(),
            intensity: 100,
            brightness: 100,
            contrast: 100,
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div id="screen-camera" className="relative w-full h-full bg-black flex flex-col justify-between overflow-hidden select-none">
      {/* Hidden File Input for Custom Media Upload */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Camera Viewfinder Background */}
      <div className="absolute inset-0 z-0 bg-neutral-950 overflow-hidden">
        {isLiveCameraActive ? (
          <video
            ref={videoRef}
            playsInline
            muted
            autoPlay
            className={`w-full h-full object-cover transition-all duration-300 ${
              isFrontCamera ? "scale-x-[-1]" : ""
            } ${currentFilterObj.cssClass}`}
          />
        ) : (
          <img
            src={currentSample.url}
            alt="Camera Viewfinder"
            className={`w-full h-full object-cover transition-all duration-500 ${currentFilterObj.cssClass}`}
          />
        )}

        {/* 3x3 Grid Overlay */}
        {showGrid && (
          <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none z-10 opacity-30">
            <div className="border-r border-b border-white" />
            <div className="border-r border-b border-white" />
            <div className="border-b border-white" />
            <div className="border-r border-b border-white" />
            <div className="border-r border-b border-white" />
            <div className="border-b border-white" />
            <div className="border-r border-white" />
            <div className="border-r border-white" />
            <div />
          </div>
        )}

        {/* Viewfinder Vignette & Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/85 pointer-events-none z-10" />

        {/* Flash Effect screen whiteout */}
        {flashEffect && (
          <div className="absolute inset-0 bg-white z-40 transition-opacity duration-200 pointer-events-none" />
        )}
      </div>

      {/* Top Header Controls (Photo/Video Switcher, Flash, Grid, Flip Camera) */}
      <div className="relative z-20 pt-3.5 px-4 flex items-center justify-between">
        {/* Left Side: Mode Pill Switcher */}
        <div className="flex items-center bg-zinc-950/80 backdrop-blur-md rounded-full p-1 border border-zinc-800/90 shadow-lg">
          <button className="px-3 py-1 rounded-full text-[11px] font-bold bg-cyan-400 text-zinc-950 uppercase tracking-wider shadow-sm">
            Foto
          </button>
          <button
            onClick={onNavigateToQuickClip}
            className="px-3 py-1 rounded-full text-[11px] font-semibold text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5 uppercase tracking-wider"
          >
            <Video className="w-3.5 h-3.5 text-cyan-400" />
            <span>Clip 30s</span>
          </button>
        </div>

        {/* Right Side: Quick Action Toggles */}
        <div className="flex items-center gap-2">
          {/* Quick Start Guide Help Button */}
          <button
            onClick={() => setShowQuickStartModal(true)}
            className="w-9 h-9 rounded-full bg-zinc-950/80 backdrop-blur-md text-cyan-400 border border-zinc-800 hover:text-white hover:bg-zinc-900 flex items-center justify-center transition-all shadow-sm active:scale-95"
            title="Panduan Cepat & Cara Pakai"
            aria-label="Panduan Cepat"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Flash Toggle */}
          <button
            onClick={() => setFlashMode(flashMode === "off" ? "on" : "off")}
            className={`w-9 h-9 rounded-full backdrop-blur-md border flex items-center justify-center transition-all ${
              flashMode === "on"
                ? "bg-cyan-400 text-zinc-950 border-cyan-400 shadow-md glow-cyan-sm"
                : "bg-zinc-950/80 text-zinc-300 border-zinc-800 hover:text-white"
            }`}
            title="Flash"
            aria-label="Flash"
          >
            <Zap className="w-4 h-4" />
          </button>

          {/* Grid Toggle */}
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`w-9 h-9 rounded-full backdrop-blur-md border flex items-center justify-center transition-all ${
              showGrid
                ? "bg-white text-zinc-950 border-white shadow-md"
                : "bg-zinc-950/80 text-zinc-300 border-zinc-800 hover:text-white"
            }`}
            title="Grid Komposisi"
            aria-label="Grid Komposisi"
          >
            <Grid className="w-4 h-4" />
          </button>

          {/* Flip Camera */}
          <button
            onClick={() => setIsFrontCamera(!isFrontCamera)}
            className="w-9 h-9 rounded-full bg-zinc-950/80 backdrop-blur-md text-zinc-300 border border-zinc-800 hover:text-white hover:bg-zinc-900 flex items-center justify-center transition-all active:rotate-180"
            title="Putar Kamera Depan/Belakang"
            aria-label="Putar Kamera"
          >
            <RefreshCw className="w-4 h-4 text-cyan-400" />
          </button>
        </div>
      </div>

      {/* Auto Status Real-Time Floating Banner */}
      <div className="relative z-20 px-4 mt-2">
        <AnimatePresence>
          {autoStatusPreview && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-zinc-950/90 backdrop-blur-md border border-zinc-800 rounded-2xl p-3 flex items-center justify-between gap-3 shadow-xl"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-2 rounded-xl bg-cyan-400 text-zinc-950 font-bold shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider block">
                    Caption Otomatis AI
                  </span>
                  <p className="text-xs text-white truncate font-medium">
                    {autoStatusPreview}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAutoStatusPreview(null)}
                className="text-zinc-500 hover:text-zinc-300 p-1.5 rounded-full hover:bg-zinc-900 transition-colors"
                title="Tutup Preview Caption"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Controls Area (Filter Scroll Carousel + Big Shutter + Gallery + Auto Status) */}
      <div className="relative z-20 pb-1 flex flex-col space-y-3 bg-gradient-to-t from-black via-black/90 to-transparent pt-4">
        {/* Filter Scroll Carousel */}
        <div className="w-full overflow-x-auto no-scrollbar px-4">
          <div className="flex items-center gap-2.5 py-1">
            {FILTERS.map((filter) => {
              const isSelected = selectedFilter === filter.id;
              return (
                <button
                  key={filter.id}
                  onClick={() => setSelectedFilter(filter.id)}
                  className={`flex flex-col items-center gap-1.5 shrink-0 p-1.5 rounded-2xl transition-all ${
                    isSelected
                      ? "bg-zinc-900 border-2 border-cyan-400 scale-105 glow-cyan-sm"
                      : "bg-zinc-950/70 backdrop-blur-sm border border-zinc-800/80 opacity-70 hover:opacity-100"
                  }`}
                >
                  <div className="w-12 h-12 rounded-xl overflow-hidden relative border border-zinc-700/60 shadow-md">
                    <img
                      src={filter.sampleImg}
                      alt={filter.name}
                      className={`w-full h-full object-cover ${filter.cssClass}`}
                    />
                    {isSelected && (
                      <div className="absolute inset-0 bg-cyan-400/20 flex items-center justify-center">
                        <Check className="w-4 h-4 text-white stroke-[3]" />
                      </div>
                    )}
                  </div>
                  <span
                    className={`text-[10px] font-bold tracking-tight uppercase whitespace-nowrap ${
                      isSelected ? "text-cyan-400" : "text-zinc-400"
                    }`}
                  >
                    {filter.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Primary Bottom Action Row */}
        <div className="px-6 flex items-center justify-between gap-4">
          {/* Pratinjau Galeri Media Terbaru (Kiri-Bawah) */}
          <div className="flex flex-col items-center gap-1">
            <button
              onClick={() => setShowRecentMediaModal(true)}
              className="w-13 h-13 rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-700 hover:border-cyan-400 shadow-xl flex items-center justify-center relative active:scale-95 transition-all group"
              title="Buka Galeri Media Terbaru"
            >
              <img
                src={recentMediaItems[0]?.thumbnailUrl || currentSample.url}
                alt="Galeri Media"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform opacity-80"
              />
              <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
                <ImageIcon className="w-5 h-5 text-white" />
              </div>
              {recentMediaItems.length > 0 && (
                <div className="absolute top-1 right-1 px-1.5 py-0.5 rounded-full bg-cyan-400 text-zinc-950 font-extrabold text-[9px] font-mono leading-none shadow-md">
                  {recentMediaItems.length}
                </div>
              )}
            </button>
            <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">
              Media
            </span>
          </div>

          {/* Tombol Shutter Besar (Tengah-Bawah) */}
          <div className="relative">
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={handleShutterCapture}
              className="w-20 h-20 rounded-full border-4 border-white p-1 flex items-center justify-center shadow-2xl hover:border-zinc-200 transition-all relative group"
              title="Ambil Foto Status"
              aria-label="Ambil Foto"
            >
              <div className="w-full h-full rounded-full bg-white group-hover:bg-zinc-100 transition-colors shadow-inner flex items-center justify-center">
                <div className="w-4 h-4 rounded-full bg-zinc-900 group-active:scale-125 transition-transform" />
              </div>
              <div className="absolute -inset-1 rounded-full border-2 border-cyan-400 animate-ping opacity-30 pointer-events-none" />
            </motion.button>
          </div>

          {/* Auto Status AI (Kanan-Bawah) */}
          <div className="flex flex-col items-center gap-1">
            <button
              onClick={handleGenerateAutoStatus}
              disabled={isAutoStatusGenerating}
              className={`w-13 h-13 rounded-2xl bg-cyan-500/15 border-2 border-cyan-400/50 hover:bg-cyan-500/25 shadow-xl flex flex-col items-center justify-center active:scale-95 transition-transform text-cyan-400 ${
                isAutoStatusGenerating ? "animate-pulse" : ""
              }`}
              title="Buat Caption AI Otomatis"
            >
              {isAutoStatusGenerating ? (
                <RefreshCw className="w-5 h-5 animate-spin text-cyan-400" />
              ) : (
                <div className="flex flex-col items-center">
                  <Sparkles className="w-4 h-4 mb-0.5" />
                  <span className="text-[9px] font-black uppercase tracking-tight">AI</span>
                </div>
              )}
            </button>
            <span className="text-[10px] text-cyan-400 font-semibold uppercase tracking-wider">Caption AI</span>
          </div>
        </div>

        {/* Recent Media Gallery Modal */}
        <RecentMediaGalleryModal
          isOpen={showRecentMediaModal}
          onClose={() => {
            setShowRecentMediaModal(false);
            setRecentMediaItems(getRecentMediaList());
          }}
          onSelectMedia={(item) => {
            setShowRecentMediaModal(false);
            onCapture(convertRecentToCapturedMedia(item));
          }}
        />

        {/* First-time / On-demand Quick Start Guide Overlay Modal */}
        <QuickStartGuideModal
          forceOpen={showQuickStartModal}
          onClose={() => setShowQuickStartModal(false)}
        />

        {/* AdMob Banner at bottom of Camera screen */}
        <AdMobBanner screenName="camera" osMode={osMode} onOpenAdDetails={onOpenAdDetails} />
      </div>
    </div>
  );
};
