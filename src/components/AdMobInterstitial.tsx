import React, { useState, useEffect } from "react";
import { X, Volume2, VolumeX, ShieldCheck, Sparkles, ExternalLink, Zap } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { OSMode } from "../types";

interface AdMobInterstitialProps {
  isOpen: boolean;
  onClose: () => void;
  onAdFinished: () => void;
  osMode?: OSMode;
}

export const AdMobInterstitial: React.FC<AdMobInterstitialProps> = ({
  isOpen,
  onClose,
  onAdFinished,
  osMode = "android",
}) => {
  const [countdown, setCountdown] = useState(5);
  const [canClose, setCanClose] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    if (!isOpen) {
      setCountdown(5);
      setCanClose(false);
      return;
    }

    setCountdown(5);
    setCanClose(false);

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanClose(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  const handleFinish = () => {
    onClose();
    onAdFinished();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        id="admob-interstitial-overlay"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.25 }}
        className="fixed inset-0 z-50 bg-[#080808] flex flex-col justify-between p-4 text-[#F5F5F5] select-none"
      >
        {/* Top Header Bar with AdMob Badge & Countdown */}
        <div className="flex items-center justify-between pt-2 pb-2 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <span className="bg-[#22D3EE] text-black text-[10px] font-black font-mono px-2 py-0.5 rounded tracking-wide uppercase">
              Iklan Bersponsor
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-1.5 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-300 transition-colors border border-zinc-700"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {canClose ? (
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                onClick={handleFinish}
                className="flex items-center gap-1.5 bg-[#22D3EE] hover:bg-[#22D3EE]/90 text-black text-xs font-black px-3 py-1 rounded-full transition-transform active:scale-95 glow-cyan-sm"
              >
                <span>Lanjut Berbagi</span>
                <X className="w-3.5 h-3.5" />
              </motion.button>
            ) : (
              <div className="flex items-center gap-1.5 bg-zinc-900 px-2.5 py-1 rounded-full border border-zinc-700 text-xs font-mono text-zinc-300">
                <div className="w-2 h-2 rounded-full bg-[#22D3EE] animate-pulse" />
                <span>Lewati dalam {countdown}s</span>
              </div>
            )}
          </div>
        </div>

        {/* Ad Video / Rich Creative Display */}
        <div className="my-auto max-w-sm mx-auto w-full flex flex-col items-center text-center space-y-4">
          <div className="relative w-full aspect-video rounded-3xl overflow-hidden bg-zinc-900 border border-zinc-800 shadow-2xl group">
            <img
              src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1000&auto=format&fit=crop&q=80"
              alt="Ad Creative Sponsor"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent flex flex-col justify-end p-4 text-left">
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-[#22D3EE] text-black text-[9px] font-black px-2 py-0.5 rounded uppercase">
                  SPONSOR RESMI
                </span>
                <span className="text-[11px] text-zinc-400 font-bold uppercase tracking-wider">QuickStatus PRO</span>
              </div>
              <h3 className="text-lg font-black text-white leading-tight uppercase tracking-tight">
                Kafe & Resto Hits Diskon Hingga 50%
              </h3>
              <p className="text-xs text-zinc-300 line-clamp-2 mt-0.5">
                Abadikan momen kuliner & nikmati promo eksklusif setiap hari di aplikasi partner QuickStatus.
              </p>
            </div>
          </div>

          {/* App Info Card */}
          <div className="w-full bg-[#111111] border border-zinc-800 rounded-2xl p-3.5 flex items-center justify-between text-left shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-zinc-900 border border-zinc-700 flex items-center justify-center text-[#22D3EE] font-black text-lg shadow-md">
                <Zap className="w-6 h-6 fill-current text-[#22D3EE]" />
              </div>
              <div>
                <h4 className="text-sm font-black text-white uppercase tracking-tight">FoodieClub Rewards</h4>
                <div className="flex items-center gap-1 text-[11px] text-[#22D3EE]">
                  <span>★★★★★</span>
                  <span className="text-zinc-500 font-mono">(4.9 · 100K+ Unduhan)</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => window.open("https://google.com", "_blank")}
              className="bg-white hover:bg-zinc-200 text-black text-xs font-black px-4 py-2 rounded-xl transition-all active:scale-95 flex items-center gap-1 shrink-0 uppercase tracking-wider"
            >
              <span>Install</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Bottom Bar: Auto-advance countdown bar & Skip button */}
        <div className="space-y-3 pb-2">
          <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden border border-zinc-800">
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 5, ease: "linear" }}
              className="h-full bg-gradient-to-r from-[#22D3EE] via-cyan-400 to-white rounded-full glow-cyan-sm"
            />
          </div>

          <div className="flex items-center justify-between text-xs text-zinc-400">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#22D3EE]" />
              <span className="font-mono text-[10px]">Google AdMob Verified Feed</span>
            </div>

            <button
              onClick={handleFinish}
              className="text-zinc-300 hover:text-white font-bold underline text-xs font-mono"
            >
              {canClose ? "Lanjutkan Sekarang →" : "Lewati Preview"}
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

