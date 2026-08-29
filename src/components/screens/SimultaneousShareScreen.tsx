import React, { useState } from "react";
import {
  ArrowLeft,
  Share2,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  Zap,
  MessageCircle,
  Instagram,
  Play,
  Copy,
  Check,
  RefreshCw,
  Send,
  Download,
  FileCheck,
  Eye,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { CapturedMedia, PlatformId, OSMode } from "../../types";
import { PLATFORMS, FILTERS, CAPTION_FONTS } from "../../data/presets";
import { AdMobBanner } from "../AdMobBanner";
import { SuccessShareModal } from "./SuccessShareModal";
import { FinalPreviewModal } from "./FinalPreviewModal";
import { shareMediaWithFile, downloadMediaFile } from "../../utils/mediaExport";

interface SimultaneousShareScreenProps {
  media: CapturedMedia;
  selectedPlatforms: PlatformId[];
  onBack: () => void;
  onRestart: () => void;
  onTriggerInterstitialAd: (callback: () => void) => void;
  onOpenAdDetails?: () => void;
  osMode?: OSMode;
}

export const SimultaneousShareScreen: React.FC<SimultaneousShareScreenProps> = ({
  media,
  selectedPlatforms,
  onBack,
  onRestart,
  onTriggerInterstitialAd,
  onOpenAdDetails,
  osMode = "android",
}) => {
  const [isSharingProgress, setIsSharingProgress] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);
  const [sharingStatus, setSharingStatus] = useState<Record<PlatformId, "waiting" | "uploading" | "done">>(
    {
      whatsapp: "waiting",
      instagram: "waiting",
      tiktok: "waiting",
      telegram: "waiting",
    }
  );
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showFinalPreviewModal, setShowFinalPreviewModal] = useState(false);
  const [copiedCaption, setCopiedCaption] = useState(false);

  const currentFilter = FILTERS.find((f) => f.id === media.filterId) || FILTERS[0];
  const currentFont =
    CAPTION_FONTS.find((f) => f.id === media.captionFontId) || CAPTION_FONTS[0];

  const handleCopyCaption = () => {
    navigator.clipboard.writeText(media.caption);
    setCopiedCaption(true);
    setTimeout(() => setCopiedCaption(false), 2000);
  };

  const handleDownloadDirect = async () => {
    setIsDownloading(true);
    try {
      const fileName = await downloadMediaFile(media);
      setShareFeedback(`Berhasil mengunduh: ${fileName}`);
      setTimeout(() => setShareFeedback(null), 3000);
    } catch (e: any) {
      setShareFeedback("Gagal mengunduh file: " + (e?.message || "error"));
      setTimeout(() => setShareFeedback(null), 3000);
    } finally {
      setIsDownloading(false);
    }
  };

  // Perform Simultaneous Multi-Platform Dispatch with BOTH file and caption
  const executeSimultaneousShare = async () => {
    setIsSharingProgress(true);

    // Sequence through platforms status animation
    for (const platformId of selectedPlatforms) {
      setSharingStatus((prev) => ({ ...prev, [platformId]: "uploading" }));
      await new Promise((r) => setTimeout(r, 400));
      setSharingStatus((prev) => ({ ...prev, [platformId]: "done" }));
    }

    // Call native file + caption sharing
    const res = await shareMediaWithFile(media);
    if (res.message) {
      setShareFeedback(res.message);
      setTimeout(() => setShareFeedback(null), 4000);
    }

    setIsSharingProgress(false);
    setShowSuccessModal(true);
  };

  const handleShareToAll = () => {
    // Show Fullscreen Interstitial Ad first before simultaneous dispatch
    onTriggerInterstitialAd(() => {
      executeSimultaneousShare();
    });
  };

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
      id="screen-simultaneous-share"
      className="relative w-full h-full bg-[#09090b] flex flex-col justify-between overflow-hidden select-none"
    >
      {/* Top Header */}
      <div className="relative z-20 pt-3 px-4 flex items-center justify-between border-b border-zinc-800/90 pb-2.5 bg-zinc-950/90 backdrop-blur-md">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-zinc-300 hover:text-white px-3 py-1.5 rounded-full bg-zinc-900 hover:bg-zinc-800 transition-colors border border-zinc-800 font-semibold active:scale-95 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4 text-cyan-400" />
          <span>Pilih Ulang</span>
        </button>

        <div className="text-center">
          <h2 className="text-sm font-bold text-white tracking-tight">Berbagi Serentak</h2>
          <span className="text-[10px] text-cyan-400 font-semibold tracking-wider">LANGKAH 4 DARI 4</span>
        </div>

        <div className="w-16" />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {/* Banner Hero: "Siap Dibagikan!" */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-4.5 text-center space-y-2.5 shadow-xl relative overflow-hidden">
          <div className="absolute -top-6 -right-6 w-24 h-24 bg-cyan-400/10 rounded-full blur-xl pointer-events-none" />
          
          <div className="w-12 h-12 rounded-2xl bg-zinc-950 border border-zinc-700/80 mx-auto flex items-center justify-center shadow-lg">
            <Sparkles className="w-6 h-6 text-cyan-400" />
          </div>

          <h3 className="text-base font-bold text-white tracking-tight">
            Siap untuk Dipublikasikan
          </h3>
          <p className="text-xs text-zinc-400 max-w-xs mx-auto leading-relaxed">
            Status Anda akan dikirimkan secara serentak ke platform yang telah Anda pilih.
          </p>

          {/* Quick Copy Caption pill & Text Preview */}
          <div className="pt-1.5 space-y-2.5">
            <div className="bg-zinc-950/70 rounded-2xl p-3 border border-zinc-800/80">
              <p
                style={{ fontFamily: currentFont.fontFamily }}
                className="text-xs text-zinc-200 font-medium leading-relaxed"
              >
                "{media.caption}"
              </p>
            </div>
            
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={handleCopyCaption}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded-full text-xs text-zinc-300 transition-colors active:scale-95 shadow-sm"
              >
                {copiedCaption ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-cyan-400 stroke-[2.5]" />
                    <span className="text-cyan-400 font-bold">Caption Disalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Salin Teks</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setShowFinalPreviewModal(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-cyan-400/10 hover:bg-cyan-400/20 border border-cyan-400/30 rounded-full text-xs text-cyan-400 font-semibold transition-colors active:scale-95 shadow-sm"
              >
                <Eye className="w-3.5 h-3.5 text-cyan-400" />
                <span>Pratinjau Hasil Akhir</span>
              </button>
            </div>
          </div>
        </div>

        {/* Selected Platform Checklist with status */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
              Platform Tujuan ({selectedPlatforms.length}):
            </span>
          </div>

          <div className="space-y-2.5">
            {PLATFORMS.filter((p) => selectedPlatforms.includes(p.id)).map((platform) => {
              const status = sharingStatus[platform.id];
              return (
                <div
                  key={platform.id}
                  className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-3.5 flex items-center justify-between shadow-md"
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-md ${platform.iconBg}`}
                    >
                      {getPlatformIcon(platform.id)}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white tracking-tight">{platform.name}</h4>
                      <p className="text-[11px] text-zinc-400">
                        {platform.shortName} · Terhubung
                      </p>
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <div className="flex items-center gap-2">
                    {status === "waiting" && (
                      <span className="text-xs font-bold text-cyan-400 bg-cyan-400/10 px-2.5 py-1 rounded-full border border-cyan-400/20">
                        ✓ Siap
                      </span>
                    )}
                    {status === "uploading" && (
                      <span className="text-xs font-semibold text-white bg-zinc-800 px-2.5 py-1 rounded-full border border-zinc-700 flex items-center gap-1.5">
                        <RefreshCw className="w-3 h-3 animate-spin text-cyan-400" />
                        <span>Mengirim...</span>
                      </span>
                    )}
                    {status === "done" && (
                      <span className="text-xs font-bold text-cyan-400 bg-cyan-400/15 px-2.5 py-1 rounded-full border border-cyan-400/30 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Terkirim</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        {/* Ad Notice Note */}
        <div className="p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800 text-zinc-400 text-xs flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 shrink-0 text-cyan-400" />
            <span className="text-[11px]">Media & filter siap dibagikan langsung ke aplikasi tujuan.</span>
          </div>
          <button
            onClick={handleDownloadDirect}
            disabled={isDownloading}
            className="shrink-0 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-cyan-400 text-[11px] font-bold flex items-center gap-1.5 transition-colors border border-zinc-700 active:scale-95 shadow-sm"
            title="Simpan foto/video hasil edit ke memori HP"
          >
            {isDownloading ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            <span>Unduh File</span>
          </button>
        </div>
      </div>

      {/* Floating Action Feedback Toast */}
      <AnimatePresence>
        {shareFeedback && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="absolute bottom-24 left-4 right-4 z-40 p-3 rounded-2xl bg-cyan-400 text-zinc-950 text-xs font-bold shadow-2xl text-center"
          >
            {shareFeedback}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Action Footer: "Bagikan ke Semua!" & AdMob Banner */}
      <div className="relative z-20 flex flex-col space-y-2.5 pb-1 bg-zinc-950/95 border-t border-zinc-800/90 pt-3">
        <div className="px-4 flex items-center gap-2.5">
          <button
            onClick={handleDownloadDirect}
            disabled={isDownloading}
            className="py-3.5 px-3.5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shrink-0 active:scale-98 shadow-sm"
            title="Simpan File Media"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">Simpan</span>
          </button>

          <button
            onClick={handleShareToAll}
            disabled={isSharingProgress}
            className="flex-1 py-3.5 rounded-2xl bg-cyan-400 hover:bg-cyan-300 text-zinc-950 text-xs font-extrabold flex items-center justify-center gap-2 transition-all shadow-2xl active:scale-98 disabled:opacity-50 uppercase tracking-wider glow-cyan-sm"
          >
            {isSharingProgress ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin text-zinc-950" />
                <span>Sedang Memproses Publikasi...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 fill-current text-zinc-950" />
                <span>Bagikan Serentak Sekarang</span>
              </>
            )}
          </button>
        </div>

        {/* Banner AdMob bawah */}
        <AdMobBanner screenName="simultaneous" osMode={osMode} onOpenAdDetails={onOpenAdDetails} />
      </div>

      {/* Success Completion Dialog Modal */}
      <SuccessShareModal
        isOpen={showSuccessModal}
        media={media}
        selectedPlatforms={selectedPlatforms}
        onClose={() => setShowSuccessModal(false)}
        onRestart={onRestart}
      />

      {/* Fullscreen Final Preview Modal */}
      <FinalPreviewModal
        isOpen={showFinalPreviewModal}
        media={media}
        onClose={() => setShowFinalPreviewModal(false)}
        onConfirmShare={() => {
          setShowFinalPreviewModal(false);
          handleShareToAll();
        }}
      />
    </div>
  );
};

