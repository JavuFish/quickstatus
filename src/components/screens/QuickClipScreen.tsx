import React, { useState, useRef, useEffect } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Video,
  RefreshCw,
  Sparkles,
  EyeOff,
  Gauge,
  Palette,
  Play,
  RotateCcw,
  Check,
  Zap,
  FolderOpen,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { CapturedMedia, VideoEffectId, OSMode } from "../../types";
import { VIDEO_EFFECTS } from "../../data/presets";
import { AdMobBanner } from "../AdMobBanner";
import { saveRecentMediaItem } from "../../utils/recentMedia";

interface QuickClipScreenProps {
  onCaptureVideo: (media: CapturedMedia) => void;
  onBackToCamera: () => void;
  onOpenAdDetails?: () => void;
  osMode?: OSMode;
}

export const QuickClipScreen: React.FC<QuickClipScreenProps> = ({
  onCaptureVideo,
  onBackToCamera,
  onOpenAdDetails,
  osMode = "android",
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedDuration, setRecordedDuration] = useState(0);
  const [hasRecordedClip, setHasRecordedClip] = useState(false);
  const [selectedEffect, setSelectedEffect] = useState<VideoEffectId>("colorpop");
  const [isAiCaptionLoading, setIsAiCaptionLoading] = useState(false);
  const [clipCaption, setClipCaption] = useState("QuickClip vibes ⚡ Catching dynamic moments in 30 seconds ✨");
  const [isFrontCamera, setIsFrontCamera] = useState(false);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [recordedThumbnailUrl, setRecordedThumbnailUrl] = useState<string | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playbackVideoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sample video clip URL for fallback or preview
  const sampleVideoUrl = "https://assets.mixkit.co/videos/preview/mixkit-friends-walking-together-in-the-city-at-night-42861-large.mp4";

  // Initialize live webcam if available
  useEffect(() => {
    let active = true;
    async function initCam() {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: isFrontCamera ? "user" : "environment",
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
            audio: true,
          }).catch(async () => {
            // If audio fails (e.g. no mic permission), try video only
            return await navigator.mediaDevices.getUserMedia({
              video: {
                facingMode: isFrontCamera ? "user" : "environment",
                width: { ideal: 1280 },
                height: { ideal: 720 },
              },
              audio: false,
            });
          });

          if (active && videoRef.current && stream) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(() => {});
            streamRef.current = stream;
          }
        }
      } catch (e) {
        console.log("Cam fallback for QuickClip:", e);
      }
    }
    initCam();

    return () => {
      active = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [isFrontCamera]);

  // Capture video frame as thumbnail
  const captureThumbnail = () => {
    try {
      if (videoRef.current) {
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
          const thumb = canvas.toDataURL("image/jpeg", 0.85);
          setRecordedThumbnailUrl(thumb);
          return thumb;
        }
      }
    } catch (e) {
      console.warn("Thumbnail capture error:", e);
    }
    return null;
  };

  // Handle Press & Hold to Record (Max 30 Seconds)
  const startRecording = () => {
    if (hasRecordedClip) return;

    setIsRecording(true);
    setRecordedDuration(0);
    startTimeRef.current = Date.now();
    recordedChunksRef.current = [];

    // Start real MediaRecorder if live stream is present
    if (streamRef.current && typeof MediaRecorder !== "undefined") {
      try {
        let mimeType = "video/webm";
        if (MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")) {
          mimeType = "video/webm;codecs=vp9,opus";
        } else if (MediaRecorder.isTypeSupported("video/mp4")) {
          mimeType = "video/mp4";
        }

        const recorder = new MediaRecorder(streamRef.current, { mimeType });
        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            recordedChunksRef.current.push(e.data);
          }
        };
        recorder.onstop = () => {
          if (recordedChunksRef.current.length > 0) {
            const blob = new Blob(recordedChunksRef.current, { type: mimeType });
            const url = URL.createObjectURL(blob);
            setRecordedVideoUrl(url);
          }
        };
        recorder.start(200);
        mediaRecorderRef.current = recorder;
      } catch (err) {
        console.warn("MediaRecorder start error:", err);
      }
    }

    timerRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      if (elapsed >= 30.0) {
        stopRecording();
      } else {
        setRecordedDuration(elapsed);
      }
    }, 50);
  };

  const stopRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Capture thumbnail right at moment of stopping
    captureThumbnail();

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {
        console.warn("MediaRecorder stop error:", e);
      }
    }

    setIsRecording(false);
    setHasRecordedClip(true);
    generateVideoCaption();
  };

  const resetRecording = () => {
    if (recordedVideoUrl && recordedVideoUrl.startsWith("blob:")) {
      URL.revokeObjectURL(recordedVideoUrl);
    }
    setRecordedVideoUrl(null);
    setRecordedThumbnailUrl(null);
    setHasRecordedClip(false);
    setRecordedDuration(0);
    recordedChunksRef.current = [];
  };

  const handleVideoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setRecordedVideoUrl(url);
      setHasRecordedClip(true);
      setRecordedDuration(15);
      generateVideoCaption();
    }
  };

  const generateVideoCaption = async () => {
    setIsAiCaptionLoading(true);
    try {
      const res = await fetch("/api/generate-caption", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: "quickclip",
          filterName: selectedEffect,
          mood: "Seru, Cepat & Sinematik",
          customPrompt: "Buat caption video status 30 detik yang energik, keren dan kekinian",
        }),
      });
      const data = await res.json();
      if (data.caption) {
        setClipCaption(data.caption);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsAiCaptionLoading(false);
    }
  };

  const currentEffectObj = VIDEO_EFFECTS.find((e) => e.id === selectedEffect) || VIDEO_EFFECTS[0];

  const handleProceedNext = () => {
    const finalMedia: CapturedMedia = {
      type: "video",
      url: recordedVideoUrl || sampleVideoUrl,
      thumbnailUrl: recordedThumbnailUrl || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80",
      category: "quickclip",
      filterId: "nightlife",
      videoEffectId: selectedEffect,
      caption: clipCaption,
      captionFontId: "default",
      durationSec: Math.max(1, Math.round(recordedDuration)),
      timestamp: Date.now(),
      intensity: 100,
      brightness: 100,
      contrast: 100,
    };

    saveRecentMediaItem({
      type: "video",
      url: finalMedia.url,
      thumbnailUrl: finalMedia.thumbnailUrl,
      category: "quickclip",
      filterId: "nightlife",
      videoEffectId: selectedEffect,
      caption: clipCaption,
      captionFontId: "default",
      durationSec: finalMedia.durationSec,
      timestamp: Date.now(),
      title: `QuickClip ${finalMedia.durationSec}s`,
    });

    onCaptureVideo(finalMedia);
  };

  const getEffectIcon = (id: VideoEffectId) => {
    switch (id) {
      case "blur":
        return <EyeOff className="w-4 h-4" />;
      case "slowmo":
        return <Gauge className="w-4 h-4" />;
      case "colorpop":
        return <Palette className="w-4 h-4" />;
      default:
        return <Zap className="w-4 h-4" />;
    }
  };

  return (
    <div
      id="screen-quickclip"
      className="relative w-full h-full bg-[#09090b] flex flex-col justify-between overflow-hidden select-none"
    >
      {/* Hidden File Input for Video Gallery Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={handleVideoFileUpload}
      />

      {/* Background Video Viewfinder */}
      <div className="absolute inset-0 z-0 bg-[#09090b] overflow-hidden">
        {hasRecordedClip ? (
          <video
            ref={playbackVideoRef}
            src={recordedVideoUrl || sampleVideoUrl}
            playsInline
            autoPlay
            loop
            muted
            className={`w-full h-full object-cover ${currentEffectObj.cssClass}`}
          />
        ) : (
          <video
            ref={videoRef}
            playsInline
            muted
            autoPlay
            className={`w-full h-full object-cover ${isFrontCamera ? "scale-x-[-1]" : ""} ${currentEffectObj.cssClass}`}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/90 pointer-events-none" />
      </div>

      {/* Top Header with 30s Duration Progress Bar & Indicators */}
      <div className="relative z-20 pt-3 px-4 flex flex-col space-y-2">
        <div className="flex items-center justify-between">
          <button
            onClick={onBackToCamera}
            className="flex items-center gap-1.5 text-xs text-zinc-300 hover:text-white px-3 py-1.5 rounded-full bg-zinc-950/80 backdrop-blur-md border border-zinc-800 font-semibold active:scale-95 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4 text-cyan-400" />
            <span>Kembali</span>
          </button>

          <div className="flex items-center gap-2 bg-zinc-950/80 backdrop-blur-md px-3.5 py-1 rounded-full border border-zinc-700/80 shadow-md">
            <div className={`w-2 h-2 rounded-full ${isRecording ? "bg-rose-500 animate-ping" : "bg-cyan-400"}`} />
            <span className="text-xs font-bold text-white tracking-wider font-mono">
              {recordedDuration.toFixed(1)}s / 30.0s
            </span>
          </div>

          <button
            onClick={() => setIsFrontCamera(!isFrontCamera)}
            className="w-9 h-9 rounded-full bg-zinc-950/80 backdrop-blur-md text-zinc-300 border border-zinc-800 hover:text-white hover:bg-zinc-900 flex items-center justify-center transition-all active:rotate-180 shadow-sm"
            title="Putar Kamera"
          >
            <RefreshCw className="w-4 h-4 text-cyan-400" />
          </button>
        </div>

        {/* 30-Second Top Timeline Duration Indicator */}
        <div className="w-full bg-zinc-900/80 h-2 rounded-full overflow-hidden border border-zinc-800 shadow-inner">
          <div
            className="h-full bg-cyan-400 rounded-full transition-all duration-75 shadow-md"
            style={{ width: `${Math.min(100, (recordedDuration / 30.0) * 100)}%` }}
          />
        </div>
      </div>

      {/* Center Notice / Recorded Badge */}
      <div className="relative z-20 px-4 text-center">
        {hasRecordedClip ? (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-zinc-950/90 backdrop-blur-md border border-zinc-700/80 rounded-3xl p-3.5 max-w-xs mx-auto space-y-1.5 shadow-2xl"
          >
            <div className="flex items-center justify-center gap-1.5 text-xs text-cyan-400 font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Klip 30 Detik Berhasil Direkam!</span>
            </div>
            <p className="text-xs text-white line-clamp-2 italic font-medium">
              "{clipCaption}"
            </p>
          </motion.div>
        ) : (
          !isRecording && (
            <div className="inline-block bg-zinc-950/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-zinc-800 text-xs text-zinc-300 shadow-md">
              Tekan & tahan tombol bulat merah (maks 30 detik)
            </div>
          )
        )}
      </div>

      {/* Bottom Controls Area: Video Effects + Hold-to-Record Shutter + Next Action */}
      <div className="relative z-20 flex flex-col space-y-3 pb-1 bg-gradient-to-t from-black via-black/90 to-transparent pt-3">
        {/* Video Effects Row: Blur Lembut, Slow-Mo, Warna Pop */}
        <div className="flex items-center justify-center gap-2 px-4">
          {VIDEO_EFFECTS.map((eff) => {
            const isSelected = selectedEffect === eff.id;
            return (
              <button
                key={eff.id}
                onClick={() => setSelectedEffect(eff.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all ${
                  isSelected
                    ? "bg-cyan-400 text-zinc-950 shadow-lg scale-105 glow-cyan-sm"
                    : "bg-zinc-900/90 text-zinc-300 border border-zinc-800 hover:bg-zinc-800"
                }`}
              >
                {getEffectIcon(eff.id)}
                <span>{eff.name}</span>
              </button>
            );
          })}
        </div>

        {/* Primary Controls Row */}
        <div className="px-6 flex items-center justify-between">
          {/* Reset / Retake button OR Gallery Video Upload */}
          <div className="flex flex-col items-center gap-1">
            {hasRecordedClip ? (
              <button
                onClick={resetRecording}
                className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white flex items-center justify-center transition-all active:scale-95 shadow-md"
                title="Rekam Ulang"
              >
                <RotateCcw className="w-5 h-5 text-cyan-400" />
              </button>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white flex items-center justify-center transition-all active:scale-95 shadow-md hover:border-cyan-500/50"
                title="Pilih Video dari Galeri"
              >
                <FolderOpen className="w-5 h-5 text-cyan-400" />
              </button>
            )}
            <span className="text-[10px] text-zinc-400 font-semibold uppercase">
              {hasRecordedClip ? "Ulang" : "Galeri"}
            </span>
          </div>

          {/* Hold-to-Record Button (Center) */}
          <div className="relative flex flex-col items-center">
            <button
              onMouseDown={startRecording}
              onMouseUp={stopRecording}
              onTouchStart={startRecording}
              onTouchEnd={stopRecording}
              disabled={hasRecordedClip}
              className={`w-20 h-20 rounded-full border-4 flex items-center justify-center transition-all relative ${
                isRecording
                  ? "border-rose-400 scale-110 shadow-2xl shadow-rose-500/50"
                  : "border-zinc-400 hover:border-white shadow-xl"
              } ${hasRecordedClip ? "opacity-40" : ""}`}
            >
              <div
                className={`rounded-full transition-all ${
                  isRecording
                    ? "w-10 h-10 bg-rose-500 rounded-lg animate-pulse"
                    : "w-16 h-16 bg-rose-600 hover:bg-rose-500"
                }`}
              />
              {isRecording && (
                <div className="absolute -inset-2 rounded-full border-2 border-rose-500 animate-ping opacity-30" />
              )}
            </button>
            <span className="text-[10px] text-zinc-400 mt-1 font-semibold uppercase tracking-wider">
              {isRecording ? "Merekam..." : hasRecordedClip ? "Terekam" : "Tahan Rekam"}
            </span>
          </div>

          {/* Next / Proceed Button */}
          <div className="flex flex-col items-center gap-1">
            <button
              onClick={handleProceedNext}
              disabled={!hasRecordedClip}
              className="w-12 h-12 rounded-2xl bg-cyan-400 hover:bg-cyan-300 text-zinc-950 flex items-center justify-center shadow-xl transition-all disabled:opacity-30 active:scale-95 glow-cyan-sm"
              title="Lanjut ke Filter & Bagikan"
            >
              <ArrowRight className="w-5 h-5 stroke-[2.5]" />
            </button>
            <span className="text-[10px] text-cyan-400 font-semibold uppercase">Lanjut</span>
          </div>
        </div>

        {/* Banner AdMob bawah */}
        <AdMobBanner screenName="quickclip" osMode={osMode} onOpenAdDetails={onOpenAdDetails} />
      </div>
    </div>
  );
};

