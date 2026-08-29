import React, { useState } from "react";
import { Info, ExternalLink, X, Zap } from "lucide-react";
import { OSMode } from "../types";

interface AdMobBannerProps {
  screenName: string;
  osMode?: OSMode;
  onOpenAdDetails?: () => void;
}

export const AdMobBanner: React.FC<AdMobBannerProps> = ({
  screenName,
  osMode = "android",
  onOpenAdDetails,
}) => {
  const [closed, setClosed] = useState(false);

  if (closed) {
    return (
      <div className="w-full bg-[#0d0d0d] border-t border-zinc-800/90 py-1 px-3 text-[10px] text-zinc-500 flex items-center justify-between">
        <span>AdMob Banner disembunyikan</span>
        <button
          onClick={() => setClosed(false)}
          className="text-[#22D3EE] underline text-[10px] font-bold"
        >
          Muat Ulang Iklan
        </button>
      </div>
    );
  }

  return (
    <div
      id={`admob-banner-${screenName}`}
      className="w-full bg-[#0c0c0c] border-t border-zinc-800/90 select-none z-30 transition-all shrink-0"
    >
      <div className="max-w-md mx-auto h-[48px] px-3 flex items-center justify-between gap-2 overflow-hidden relative">
        {/* Sponsor Icon / Creative */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-700 flex items-center justify-center text-[#22D3EE] font-black text-xs shrink-0 shadow-sm">
            <Zap className="w-4 h-4 text-[#22D3EE] fill-current" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="bg-[#22D3EE] text-black text-[8px] px-1 py-0.2 rounded font-black uppercase">
                Ad
              </span>
              <p className="text-xs font-bold text-zinc-200 truncate tracking-tight">
                QuickStatus Pro · 4K Sync
              </p>
            </div>
            <p className="text-[9px] text-zinc-400 truncate">
              Filter estetik & Ekspor instan tanpa watermark
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => setClosed(true)}
            className="text-zinc-500 hover:text-zinc-300 p-1 rounded-full hover:bg-zinc-800 transition-colors"
            title="Tutup iklan"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

