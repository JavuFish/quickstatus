import React, { useState } from "react";
import {
  ArrowLeft,
  Share2,
  Check,
  Edit3,
  Sparkles,
  Zap,
  MessageCircle,
  Instagram,
  Play,
  Send,
  ShieldCheck,
  Eye,
} from "lucide-react";
import { motion } from "motion/react";
import { CapturedMedia, PlatformId, OSMode } from "../../types";
import { PLATFORMS, FILTERS, CAPTION_FONTS } from "../../data/presets";
import { AdMobBanner } from "../AdMobBanner";
import { FinalPreviewModal } from "./FinalPreviewModal";

interface PlatformSelectScreenProps {
  media: CapturedMedia;
  selectedPlatforms: PlatformId[];
  onTogglePlatform: (id: PlatformId) => void;
  onBackToEdit: () => void;
  onShareNow: () => void; // Will trigger AdMob Interstitial first
  onOpenAdDetails?: () => void;
  osMode?: OSMode;
}

export const PlatformSelectScreen: React.FC<PlatformSelectScreenProps> = ({
  media,
  selectedPlatforms,
  onTogglePlatform,
  onBackToEdit,
  onShareNow,
  onOpenAdDetails,
  osMode = "android",
}) => {
  const [showFinalPreviewModal, setShowFinalPreviewModal] = useState(false);
  const currentFilter = FILTERS.find((f) => f.id === media.filterId) || FILTERS[0];
  const currentFont =
    CAPTION_FONTS.find((f) => f.id === media.captionFontId) || CAPTION_FONTS[0];

  const getPlatformIcon = (id: PlatformId) => {
    switch (id) {
      case "whatsapp":
        return <MessageCircle className="w-5 h-5 text-white" />;
      case "instagram":
        return <Instagram className="w-5 h-5 text-white" />;
      case "tiktok":
        return <Play className="w-5 h-5 text-white fill-white" />;
      case "telegram":
        return <Send className="w-5 h-5 text-white" />;
    }
  };

  return (
    <div
      id="screen-platform-select"
      className="relative w-full h-full bg-[#09090b] flex flex-col justify-between overflow-hidden select-none"
    >
      {/* Top Header */}
      <div className="relative z-20 pt-3 px-4 flex items-center justify-between border-b border-zinc-800/90 pb-2.5 bg-zinc-950/90 backdrop-blur-md">
        <button
          onClick={onBackToEdit}
          className="flex items-center gap-1.5 text-xs text-zinc-300 hover:text-white px-3 py-1.5 rounded-full bg-zinc-900 hover:bg-zinc-800 transition-colors border border-zinc-800 font-semibold active:scale-95 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4 text-cyan-400" />
          <span>Kembali</span>
        </button>

        <div className="text-center">
          <h2 className="text-sm font-bold text-white tracking-tight">Pilih Platform</h2>
          <span className="text-[10px] text-cyan-400 font-semibold tracking-wider">LANGKAH 3 DARI 4</span>
        </div>

        <div className="w-16" /> {/* Placeholder balance */}
      </div>

      {/* Main Content Area: Preview Summary + Platform Selection List */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {/* Compact Media + Caption Summary Card */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-3.5 flex items-center gap-3.5 shadow-xl">
          <button
            onClick={() => setShowFinalPreviewModal(true)}
            className="w-16 h-20 rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-700/80 shrink-0 relative shadow-inner group active:scale-95 transition-transform"
            title="Ketuk untuk Pratinjau Layar Penuh"
          >
            <img
              src={media.thumbnailUrl || media.url}
              alt="Thumbnail"
              className={`w-full h-full object-cover ${currentFilter.cssClass}`}
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity">
              <Eye className="w-5 h-5 text-cyan-400" />
            </div>
          </button>

          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Siap Dibagikan</span>
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowFinalPreviewModal(true)}
                  className="text-[10px] text-cyan-400 hover:text-cyan-300 font-bold uppercase tracking-wider bg-cyan-400/10 px-2.5 py-1 rounded-full border border-cyan-400/20 active:scale-95 flex items-center gap-1"
                >
                  <Eye className="w-3 h-3" />
                  <span>Pratinjau</span>
                </button>
                <button
                  onClick={onBackToEdit}
                  className="text-[10px] text-zinc-400 hover:text-white font-semibold uppercase tracking-wider active:scale-95"
                >
                  Ubah
                </button>
              </div>
            </div>
            <p
              style={{ fontFamily: currentFont.fontFamily }}
              className="text-xs text-zinc-200 line-clamp-2 font-medium leading-relaxed"
            >
              "{media.caption}"
            </p>
          </div>
        </div>

        {/* Platform Selection Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
              Pilih Tujuan Publikasi:
            </span>
            <span className="text-xs text-cyan-400 font-bold">
              {selectedPlatforms.length} Terpilih
            </span>
          </div>

          {/* Platform Choice Cards */}
          <div className="space-y-2.5">
            {PLATFORMS.map((platform) => {
              const isChecked = selectedPlatforms.includes(platform.id);
              return (
                <button
                  key={platform.id}
                  onClick={() => onTogglePlatform(platform.id)}
                  className={`w-full p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3.5 text-left active:scale-99 ${
                    isChecked
                      ? "bg-zinc-900 border-2 border-cyan-400 shadow-lg glow-cyan-sm"
                      : "bg-zinc-950/80 border-zinc-800/90 opacity-70 hover:opacity-100"
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-md shrink-0 ${platform.iconBg}`}
                    >
                      {getPlatformIcon(platform.id)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-white tracking-tight">{platform.name}</h4>
                        <span className="text-[9px] bg-zinc-800 text-cyan-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                          {platform.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-0.5 line-clamp-1">
                        {platform.description}
                      </p>
                    </div>
                  </div>

                  {/* Checkbox indicator */}
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center transition-all shrink-0 ${
                      isChecked
                        ? "bg-cyan-400 text-zinc-950 font-bold shadow-md"
                        : "border border-zinc-700 bg-zinc-900"
                    }`}
                  >
                    {isChecked && <Check className="w-3.5 h-3.5 stroke-[3] text-zinc-950" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Ad Notice Note */}
        <div className="p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800 text-zinc-400 text-xs flex items-center gap-2.5">
          <ShieldCheck className="w-4 h-4 shrink-0 text-cyan-400" />
          <span>Iklan Interstitial akan ditampilkan sebelum proses serentak dimulai.</span>
        </div>
      </div>

      {/* Bottom Action Footer */}
      <div className="relative z-20 flex flex-col space-y-2.5 pb-1 bg-zinc-950/95 border-t border-zinc-800/90 pt-3">
        <div className="px-4 flex items-center justify-between gap-3">
          {/* Tombol Ubah Kecil Kiri-Bawah */}
          <button
            onClick={onBackToEdit}
            className="py-3 px-4 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-zinc-700 shrink-0 active:scale-98 shadow-sm"
          >
            <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Ubah</span>
          </button>

          {/* Tombol Bagikan Sekarang (Primary) */}
          <button
            onClick={onShareNow}
            disabled={selectedPlatforms.length === 0}
            className="flex-1 py-3.5 rounded-2xl bg-cyan-400 hover:bg-cyan-300 text-zinc-950 text-xs font-extrabold flex items-center justify-center gap-2 transition-all shadow-xl active:scale-98 disabled:opacity-40 disabled:cursor-not-allowed uppercase tracking-wider glow-cyan-sm"
          >
            <Zap className="w-4 h-4 fill-current text-zinc-950" />
            <span>Bagikan ke {selectedPlatforms.length} Platform</span>
          </button>
        </div>

        {/* Bottom AdMob Banner */}
        <AdMobBanner screenName="share" osMode={osMode} onOpenAdDetails={onOpenAdDetails} />
      </div>

      {/* Fullscreen Final Preview Modal */}
      <FinalPreviewModal
        isOpen={showFinalPreviewModal}
        media={media}
        onClose={() => setShowFinalPreviewModal(false)}
        onConfirmShare={() => {
          setShowFinalPreviewModal(false);
          onShareNow();
        }}
      />
    </div>
  );
};

