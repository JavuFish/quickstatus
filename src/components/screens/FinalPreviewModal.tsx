import React, { useState } from "react";
import {
  X,
  Eye,
  Share2,
  Download,
  Copy,
  Check,
  Sparkles,
  Smartphone,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { CapturedMedia } from "../../types";
import { FILTERS, CAPTION_FONTS } from "../../data/presets";
import { downloadMediaFile } from "../../utils/mediaExport";

interface FinalPreviewModalProps {
  isOpen: boolean;
  media: CapturedMedia;
  onClose: () => void;
  onConfirmShare?: () => void;
}

export const FinalPreviewModal: React.FC<FinalPreviewModalProps> = ({
  isOpen,
  media,
  onClose,
  onConfirmShare,
}) => {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentFilter = FILTERS.find((f) => f.id === media.filterId) || FILTERS[0];
  const currentFont =
    CAPTION_FONTS.find((f) => f.id === media.captionFontId) || CAPTION_FONTS[0];

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  const handleCopyCaption = () => {
    if (media.caption) {
      navigator.clipboard.writeText(media.caption);
      setCopied(true);
      showToast("Caption tersalin ke clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const fileName = await downloadMediaFile(media);
      showToast(`Tersimpan ke Galeri: ${fileName}`);
    } catch (e: any) {
      showToast("Gagal mengunduh: " + (e?.message || "error"));
    } finally {
      setDownloading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/90 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-sm bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] relative"
        >
          {/* Toast Notification */}
          <AnimatePresence>
            {toastMsg && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-14 left-4 right-4 z-50 bg-cyan-400 text-zinc-950 text-xs font-bold py-2 px-3 rounded-2xl shadow-xl text-center"
              >
                {toastMsg}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Header */}
          <div className="p-3.5 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-950/90">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-cyan-400/10 text-cyan-400 border border-cyan-400/20">
                <Eye className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Pratinjau Hasil Akhir
                </h3>
                <span className="text-[10px] text-cyan-400 font-semibold">
                  Tepat seperti yang akan terkirim
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* 9:16 Visual Media Canvas Preview */}
          <div className="flex-1 min-h-0 p-3 flex flex-col items-center justify-center overflow-y-auto">
            <div className="relative w-full max-w-[280px] aspect-[9/16] rounded-2xl overflow-hidden shadow-2xl border border-zinc-800 bg-neutral-900">
              {/* Media Content */}
              {media.type === "video" ? (
                <video
                  src={media.url}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className={`w-full h-full object-cover ${currentFilter.cssClass}`}
                  style={{
                    filter: `brightness(${media.brightness || 100}%) contrast(${
                      media.contrast || 100
                    }%)`,
                  }}
                />
              ) : (
                <img
                  src={media.url}
                  alt="Final preview"
                  className={`w-full h-full object-cover ${currentFilter.cssClass}`}
                  style={{
                    filter: `brightness(${media.brightness || 100}%) contrast(${
                      media.contrast || 100
                    }%)`,
                  }}
                />
              )}

              {/* Status Aspect Indicator Tag */}
              <div className="absolute top-2.5 right-2.5 bg-black/70 backdrop-blur-sm px-2 py-0.5 rounded-full border border-white/10 text-[9px] font-bold text-zinc-300 flex items-center gap-1">
                <Smartphone className="w-2.5 h-2.5 text-cyan-400" />
                <span>9:16 Fullscreen</span>
              </div>

              {/* Overlay Caption Display */}
              {media.caption && (
                <div className="absolute inset-x-2.5 bottom-3">
                  <div className="p-3 rounded-2xl bg-black/60 backdrop-blur-md border border-white/15 text-white shadow-2xl">
                    <p
                      style={{ fontFamily: currentFont.fontFamily }}
                      className="text-xs font-semibold leading-relaxed drop-shadow-md break-words"
                    >
                      {media.caption}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Row & Confirm Button */}
          <div className="p-3.5 border-t border-zinc-800/80 bg-zinc-950 space-y-2.5">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="py-2.5 px-3 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors active:scale-95 shadow-sm"
              >
                {downloading ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                ) : (
                  <Download className="w-3.5 h-3.5 text-cyan-400" />
                )}
                <span>Simpan Media</span>
              </button>

              <button
                onClick={handleCopyCaption}
                className="py-2.5 px-3 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors active:scale-95 shadow-sm"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-cyan-400 stroke-[3]" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-cyan-400" />
                )}
                <span>Salin Teks</span>
              </button>
            </div>

            {onConfirmShare ? (
              <button
                onClick={() => {
                  onClose();
                  onConfirmShare();
                }}
                className="w-full py-3 rounded-2xl bg-cyan-400 hover:bg-cyan-300 text-zinc-950 text-xs font-extrabold flex items-center justify-center gap-2 transition-all shadow-xl active:scale-98 uppercase tracking-wider glow-cyan-sm"
              >
                <Share2 className="w-4 h-4 stroke-[2.5]" />
                <span>Kirim Status Sekarang</span>
              </button>
            ) : (
              <button
                onClick={onClose}
                className="w-full py-2.5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-bold transition-colors"
              >
                Tutup Pratinjau
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
