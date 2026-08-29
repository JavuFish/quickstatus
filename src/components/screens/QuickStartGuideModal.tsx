import React, { useState, useEffect } from "react";
import { Camera, Sparkles, Share2, HelpCircle, X, ArrowRight, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface QuickStartGuideModalProps {
  forceOpen?: boolean;
  onClose?: () => void;
}

export const QuickStartGuideModal: React.FC<QuickStartGuideModalProps> = ({
  forceOpen = false,
  onClose,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    if (forceOpen) {
      setIsOpen(true);
      return;
    }
    const hasSeenGuide = localStorage.getItem("quickstatus_seen_guide");
    if (!hasSeenGuide) {
      // Small delay for smooth entry after splash
      const timer = setTimeout(() => setIsOpen(true), 800);
      return () => clearTimeout(timer);
    }
  }, [forceOpen]);

  const handleDismiss = () => {
    localStorage.setItem("quickstatus_seen_guide", "true");
    setIsOpen(false);
    if (onClose) onClose();
  };

  const steps = [
    {
      icon: Camera,
      badge: "Langkah 1",
      title: "Ambil Foto / Video Singkat",
      desc: "Tekan tombol Shutter atau QuickClip. Foto otomatis di-crop presisi rasio 9:16 agar pas di layar Story & Status HP.",
      color: "text-cyan-400",
      bg: "bg-cyan-400/10",
      border: "border-cyan-400/30",
    },
    {
      icon: Sparkles,
      badge: "Langkah 2",
      title: "Filter & Tipografi Sans",
      desc: "Pilih 6 preset filter tone warna, gaya font tipografi, dan generate ide caption instan dengan asisten cerdas.",
      color: "text-amber-400",
      bg: "bg-amber-400/10",
      border: "border-amber-400/30",
    },
    {
      icon: Share2,
      badge: "Langkah 3",
      title: "Pratinjau & Bagi Serentak",
      desc: "Lihat 'Pratinjau Hasil Akhir' sebelum dikirim. Bagikan foto/video dan caption langsung ke WhatsApp, IG, & TikTok!",
      color: "text-emerald-400",
      bg: "bg-emerald-400/10",
      border: "border-emerald-400/30",
    },
  ];

  if (!isOpen) return null;

  const current = steps[activeStep];
  const StepIcon = current.icon;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 10 }}
          className="w-full max-w-sm bg-zinc-950 border border-zinc-800 rounded-3xl p-5 shadow-2xl space-y-4 relative overflow-hidden"
        >
          {/* Subtle Ambient Light */}
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

          {/* Header Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-cyan-400/10 text-cyan-400 border border-cyan-400/20">
                <HelpCircle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Panduan Cepat
                </h3>
                <span className="text-[10px] text-zinc-400 font-medium">
                  {activeStep + 1} dari {steps.length} Langkah
                </span>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="p-1.5 rounded-full text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition-colors"
              aria-label="Tutup Panduan"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Current Step Card */}
          <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-2.5 relative">
            <div className="flex items-center justify-between">
              <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${current.bg} ${current.color} ${current.border} border`}>
                {current.badge}
              </span>
              <div className={`p-2 rounded-xl ${current.bg} ${current.color}`}>
                <StepIcon className="w-5 h-5" />
              </div>
            </div>
            <h4 className="text-sm font-bold text-white tracking-tight">
              {current.title}
            </h4>
            <p className="text-xs text-zinc-300 leading-relaxed">
              {current.desc}
            </p>
          </div>

          {/* Step Indicator Dots */}
          <div className="flex items-center justify-center gap-1.5 py-1">
            {steps.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveStep(idx)}
                className={`h-1.5 rounded-full transition-all ${
                  activeStep === idx
                    ? "w-6 bg-cyan-400"
                    : "w-2 bg-zinc-700 hover:bg-zinc-600"
                }`}
                aria-label={`Ke langkah ${idx + 1}`}
              />
            ))}
          </div>

          {/* Footer Controls */}
          <div className="flex items-center gap-2 pt-1">
            {activeStep < steps.length - 1 ? (
              <>
                <button
                  onClick={handleDismiss}
                  className="w-1/3 py-2.5 rounded-2xl text-xs font-semibold text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 transition-colors"
                >
                  Lewati
                </button>
                <button
                  onClick={() => setActiveStep((prev) => prev + 1)}
                  className="w-2/3 py-2.5 rounded-2xl text-xs font-bold text-zinc-950 bg-cyan-400 hover:bg-cyan-300 transition-all flex items-center justify-center gap-1.5 shadow-lg active:scale-98 glow-cyan-sm"
                >
                  <span>Lanjut</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </>
            ) : (
              <button
                onClick={handleDismiss}
                className="w-full py-2.5 rounded-2xl text-xs font-extrabold text-zinc-950 bg-cyan-400 hover:bg-cyan-300 transition-all flex items-center justify-center gap-1.5 shadow-lg active:scale-98 glow-cyan-sm"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Mulai Buat Status Sekarang</span>
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
