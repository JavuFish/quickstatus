import React from "react";
import { Camera, Zap } from "lucide-react";

export const AppHeader: React.FC = () => {
  return (
    <header
      id="app-main-header"
      className="w-full bg-zinc-950/95 border-b border-zinc-800/80 px-4 py-2.5 flex items-center justify-start relative z-30 shrink-0 backdrop-blur-md select-none"
    >
      <div className="flex items-center gap-2">
        {/* App Logo */}
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-cyan-300 flex items-center justify-center shadow-md shadow-cyan-500/20">
          <div className="relative flex items-center justify-center">
            <Camera className="w-4 h-4 text-zinc-950 stroke-[2.5]" />
            <Zap className="w-2.5 h-2.5 text-zinc-950 fill-zinc-950 absolute -top-1 -right-1" />
          </div>
        </div>

        {/* App Name */}
        <div className="flex items-center">
          <span className="text-base font-extrabold tracking-tight text-white leading-none">
            Quick<span className="text-cyan-400">Status</span>
          </span>
        </div>
      </div>
    </header>
  );
};
