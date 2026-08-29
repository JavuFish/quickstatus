import React, { useEffect, useState } from "react";
import { Zap, Sparkles, ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { OSMode } from "../../types";

interface SplashScreenProps {
  onComplete: () => void;
  osMode?: OSMode;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const duration = 2400; // 2.4 detik

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(pct);

      if (elapsed >= duration) {
        clearInterval(interval);
        onComplete();
      }
    }, 30);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div
      id="screen-splash"
      className="relative w-full h-full bg-[#09090b] flex flex-col items-center justify-between p-6 overflow-hidden select-none"
    >
      {/* Background Ambient Glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute bottom-1/4 right-6 w-56 h-56 rounded-full bg-cyan-500/5 blur-2xl" />
      </div>

      {/* Top Bar with Skip */}
      <div className="w-full flex items-center justify-between z-10 pt-2">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-sm" />
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            QuickStatus
          </span>
        </div>
        <button
          onClick={onComplete}
          className="text-xs text-zinc-300 hover:text-white px-3 py-1.5 rounded-full bg-zinc-900/90 hover:bg-zinc-800 transition-all flex items-center gap-1.5 border border-zinc-700/80 font-medium active:scale-95 shadow-sm"
        >
          <span>Lewati</span>
          <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
        </button>
      </div>

      {/* Center Branding & Animated Logo */}
      <div className="flex flex-col items-center text-center z-10 space-y-6 my-auto">
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="relative"
        >
          {/* Glowing Center Logo Card */}
          <div className="w-28 h-28 rounded-3xl bg-zinc-900/90 p-1 shadow-2xl border border-zinc-800 flex items-center justify-center relative overflow-hidden glow-cyan-sm">
            <div className="absolute inset-0 bg-cyan-500/10 rounded-3xl" />
            
            {/* Shutter Blades graphic */}
            <div className="relative w-20 h-20 rounded-2xl bg-zinc-950 border border-zinc-700/70 flex items-center justify-center shadow-inner">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-400 to-teal-300 flex items-center justify-center shadow-lg transform rotate-2">
                <Zap className="w-7 h-7 text-zinc-950 fill-current" />
              </div>
            </div>

            {/* Sparkle Badge */}
            <div className="absolute -top-1 -right-1 p-1.5 rounded-full bg-zinc-900 border border-cyan-400 text-cyan-400 shadow-md">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.6 }}
          className="space-y-2 max-w-xs"
        >
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center justify-center gap-1.5">
            <span>QuickStatus</span>
            <span className="text-cyan-400">Pro</span>
          </h1>
          <p className="text-xs text-zinc-400 leading-relaxed font-normal">
            Buat foto & video status estetik, pilih font modern, dan bagikan serentak ke semua platform.
          </p>
        </motion.div>
      </div>

      {/* Bottom Progress Indicator */}
      <div className="w-full max-w-xs flex flex-col items-center space-y-3 z-10 pb-4">
        <div className="w-full bg-zinc-900/90 h-2 rounded-full overflow-hidden border border-zinc-800">
          <div
            className="h-full bg-gradient-to-r from-cyan-400 to-teal-300 rounded-full transition-all duration-75 glow-cyan-sm"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center justify-between w-full text-[11px] text-zinc-500 font-medium">
          <span>Menyiapkan Kamera & Filter...</span>
          <span className="text-cyan-400 font-semibold">{progress}%</span>
        </div>
      </div>
    </div>
  );
};

