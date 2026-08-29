import React, { useState } from "react";
import {
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  MessageCircle,
  Instagram,
  Play,
  X,
  Download,
  Copy,
  Check,
  Share2,
  Send,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { CapturedMedia, PlatformId } from "../../types";
import { downloadMediaFile, shareMediaWithFile } from "../../utils/mediaExport";

interface SuccessShareModalProps {
  isOpen: boolean;
  media: CapturedMedia;
  selectedPlatforms: PlatformId[];
  onClose: () => void;
  onRestart: () => void;
}

export const SuccessShareModal: React.FC<SuccessShareModalProps> = ({
  isOpen,
  media,
  selectedPlatforms,
  onClose,
  onRestart,
}) => {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCopyCaption = () => {
    navigator.clipboard.writeText(media.caption);
    setCopied(true);
    showToast("Caption berhasil disalin ke clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMedia = async () => {
    setDownloading(true);
    try {
      const fileName = await downloadMediaFile(media);
      showToast(`File ${fileName} berhasil disimpan ke Galeri!`);
    } catch (e: any) {
      showToast("Gagal menyimpan file: " + (e?.message || "error"));
    } finally {
      setDownloading(false);
    }
  };

  const handleOpenApp = async (platformId: PlatformId) => {
    // 1. Copy caption
    try {
      await navigator.clipboard.writeText(media.caption);
    } catch {
      // ignore
    }

    const encodedCaption = encodeURIComponent(media.caption);
    switch (platformId) {
      case "whatsapp":
        // Try native share first if available
        if (navigator.share && navigator.canShare) {
          const res = await shareMediaWithFile(media);
          if (res.success && res.method === "native_file") {
            return;
          }
        }
        // Fallback: download file & open WhatsApp
        await handleDownloadMedia();
        window.open(`https://api.whatsapp.com/send?text=${encodedCaption}`, "_blank");
        break;
      case "instagram":
        await handleDownloadMedia();
        showToast("Foto tersimpan! Buka Instagram untuk Story/Reels.");
        window.open("https://www.instagram.com", "_blank");
        break;
      case "tiktok":
        await handleDownloadMedia();
        showToast("Video/Foto tersimpan! Buka TikTok untuk upload.");
        window.open("https://www.tiktok.com/upload", "_blank");
        break;
      case "telegram":
        window.open(
          `https://t.me/share/url?url=${encodeURIComponent(media.url)}&text=${encodedCaption}`,
          "_blank"
        );
        break;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-sm bg-[#0c0c0c] border border-zinc-800 rounded-3xl p-5 shadow-2xl text-center space-y-3.5 relative"
      >
        {/* Toast Alert */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute -top-12 left-2 right-2 bg-cyan-400 text-zinc-950 text-xs font-extrabold py-2 px-3 rounded-2xl shadow-xl z-50"
            >
              {toastMessage}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success Icon Badge */}
        <div className="w-14 h-14 rounded-full bg-cyan-400/10 border border-cyan-400/30 text-cyan-400 mx-auto flex items-center justify-center shadow-lg glow-cyan-sm">
          <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
        </div>

        {/* Text Title */}
        <div className="space-y-1">
          <h3 className="text-base font-extrabold text-white uppercase tracking-tight">
            Status Siap Dipublikasikan!
          </h3>
          <p className="text-[11px] text-zinc-400 leading-relaxed">
            Foto/video dengan filter dan caption telah diproses & disalin.
          </p>
        </div>

        {/* Quick Action Pills: Download Media & Copy Caption */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={handleDownloadMedia}
            disabled={downloading}
            className="py-2 px-3 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors active:scale-95 shadow-sm"
          >
            {downloading ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
            ) : (
              <Download className="w-3.5 h-3.5 text-cyan-400" />
            )}
            <span>{downloading ? "Menyimpan..." : "Unduh Media"}</span>
          </button>

          <button
            onClick={handleCopyCaption}
            className="py-2 px-3 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors active:scale-95 shadow-sm"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-cyan-400 stroke-[3]" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-cyan-400" />
            )}
            <span>{copied ? "Tersalin!" : "Salin Teks"}</span>
          </button>
        </div>

        {/* Direct App Launch Shortcuts */}
        <div className="space-y-2 pt-2 border-t border-zinc-800/80 text-left">
          <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider block text-center">
            Buka & Pasang di Aplikasi:
          </span>

          <div className="grid grid-cols-3 gap-2">
            {selectedPlatforms.includes("whatsapp") && (
              <button
                onClick={() => handleOpenApp("whatsapp")}
                className="p-2.5 rounded-2xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 flex flex-col items-center gap-1 transition-colors text-emerald-400 text-[10px] font-bold uppercase active:scale-95"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp</span>
              </button>
            )}
            {selectedPlatforms.includes("instagram") && (
              <button
                onClick={() => handleOpenApp("instagram")}
                className="p-2.5 rounded-2xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 flex flex-col items-center gap-1 transition-colors text-rose-400 text-[10px] font-bold uppercase active:scale-95"
              >
                <Instagram className="w-4 h-4" />
                <span>Instagram</span>
              </button>
            )}
            {selectedPlatforms.includes("tiktok") && (
              <button
                onClick={() => handleOpenApp("tiktok")}
                className="p-2.5 rounded-2xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 flex flex-col items-center gap-1 transition-colors text-cyan-400 text-[10px] font-bold uppercase active:scale-95"
              >
                <Play className="w-4 h-4 fill-cyan-400" />
                <span>TikTok</span>
              </button>
            )}
            {selectedPlatforms.includes("telegram") && (
              <button
                onClick={() => handleOpenApp("telegram")}
                className="p-2.5 rounded-2xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 flex flex-col items-center gap-1 transition-colors text-sky-400 text-[10px] font-bold uppercase active:scale-95"
              >
                <Send className="w-4 h-4" />
                <span>Telegram</span>
              </button>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col space-y-2">
          <button
            onClick={() => {
              onClose();
              onRestart();
            }}
            className="w-full py-3 rounded-2xl bg-cyan-400 hover:bg-cyan-300 text-zinc-950 text-xs font-bold transition-all shadow-lg flex items-center justify-center gap-1.5 uppercase tracking-wider glow-cyan-sm active:scale-98"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Buat Status Baru</span>
          </button>
          <button
            onClick={onClose}
            className="text-xs text-zinc-400 hover:text-white py-1 transition-colors font-semibold uppercase"
          >
            Tutup
          </button>
        </div>
      </motion.div>
    </div>
  );
};

