import React, { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Edit3,
  Sliders,
  Check,
  RefreshCw,
  Hash,
  Download,
  Zap,
  Type,
  Palette,
  Undo2,
  Redo2,
  RotateCcw,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { CapturedMedia, FilterId, CaptionFontId, OSMode } from "../../types";
import { FILTERS, CAPTION_FONTS } from "../../data/presets";
import { AdMobBanner } from "../AdMobBanner";
import { CaptionEditModal } from "./CaptionEditModal";

interface EditorHistoryState {
  filterId: FilterId;
  captionFontId: CaptionFontId;
  caption: string;
  intensity: number;
  brightness: number;
}

interface FilterCaptionScreenProps {
  media: CapturedMedia;
  onUpdateMedia: (updated: CapturedMedia) => void;
  onBack: () => void;
  onNext: () => void;
  onOpenAdDetails?: () => void;
  osMode?: OSMode;
}

export const FilterCaptionScreen: React.FC<FilterCaptionScreenProps> = ({
  media,
  onUpdateMedia,
  onBack,
  onNext,
  onOpenAdDetails,
  osMode = "android",
}) => {
  const [activeTab, setActiveTab] = useState<"filter" | "font">("filter");
  const [activeFilter, setActiveFilter] = useState<FilterId>(media.filterId);
  const [activeFontId, setActiveFontId] = useState<CaptionFontId>(
    media.captionFontId || "default"
  );
  const [caption, setCaption] = useState(media.caption);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAdjusters, setShowAdjusters] = useState(false);
  const [intensity, setIntensity] = useState(media.intensity || 100);
  const [brightness, setBrightness] = useState(media.brightness || 100);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Undo / Redo History State System
  const [history, setHistory] = useState<EditorHistoryState[]>([
    {
      filterId: media.filterId || "coffee",
      captionFontId: media.captionFontId || "default",
      caption: media.caption || "",
      intensity: media.intensity || 100,
      brightness: media.brightness || 100,
    },
  ]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);
  const [actionNotification, setActionNotification] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setActionNotification(msg);
    setTimeout(() => setActionNotification(null), 1500);
  };

  const pushHistory = (newState: Partial<EditorHistoryState>) => {
    const currentState = history[historyIndex] || {
      filterId: activeFilter,
      captionFontId: activeFontId,
      caption,
      intensity,
      brightness,
    };

    const nextState: EditorHistoryState = {
      ...currentState,
      ...newState,
    };

    // Prevent duplicate push if values didn't change
    if (
      nextState.filterId === currentState.filterId &&
      nextState.captionFontId === currentState.captionFontId &&
      nextState.caption === currentState.caption &&
      nextState.intensity === currentState.intensity &&
      nextState.brightness === currentState.brightness
    ) {
      return;
    }

    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(nextState);
    if (newHistory.length > 35) {
      newHistory.shift();
    }
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const handleUndo = () => {
    if (!canUndo) return;
    const newIndex = historyIndex - 1;
    const prevState = history[newIndex];
    setHistoryIndex(newIndex);

    setActiveFilter(prevState.filterId);
    setActiveFontId(prevState.captionFontId);
    setCaption(prevState.caption);
    setIntensity(prevState.intensity);
    setBrightness(prevState.brightness);

    const filterObj = FILTERS.find((f) => f.id === prevState.filterId);
    onUpdateMedia({
      ...media,
      filterId: prevState.filterId,
      category: filterObj ? filterObj.category : media.category,
      captionFontId: prevState.captionFontId,
      caption: prevState.caption,
      intensity: prevState.intensity,
      brightness: prevState.brightness,
    });
    showToast("Undo diterapkan");
  };

  const handleRedo = () => {
    if (!canRedo) return;
    const newIndex = historyIndex + 1;
    const nextState = history[newIndex];
    setHistoryIndex(newIndex);

    setActiveFilter(nextState.filterId);
    setActiveFontId(nextState.captionFontId);
    setCaption(nextState.caption);
    setIntensity(nextState.intensity);
    setBrightness(nextState.brightness);

    const filterObj = FILTERS.find((f) => f.id === nextState.filterId);
    onUpdateMedia({
      ...media,
      filterId: nextState.filterId,
      category: filterObj ? filterObj.category : media.category,
      captionFontId: nextState.captionFontId,
      caption: nextState.caption,
      intensity: nextState.intensity,
      brightness: nextState.brightness,
    });
    showToast("Redo diterapkan");
  };

  const currentFilter = FILTERS.find((f) => f.id === activeFilter) || FILTERS[0];
  const currentFont =
    CAPTION_FONTS.find((f) => f.id === activeFontId) || CAPTION_FONTS[0];

  const handleFilterChange = (filterId: FilterId) => {
    setActiveFilter(filterId);
    const newFilterObj = FILTERS.find((f) => f.id === filterId);
    if (newFilterObj) {
      const updatedMedia: CapturedMedia = {
        ...media,
        filterId,
        category: newFilterObj.category,
        captionFontId: activeFontId,
        intensity,
        brightness,
      };
      onUpdateMedia(updatedMedia);
      pushHistory({ filterId });
    }
  };

  const handleFontChange = (fontId: CaptionFontId) => {
    setActiveFontId(fontId);
    const updatedMedia: CapturedMedia = {
      ...media,
      captionFontId: fontId,
      filterId: activeFilter,
      intensity,
      brightness,
    };
    onUpdateMedia(updatedMedia);
    pushHistory({ captionFontId: fontId });
  };

  const handleCaptionSave = (newCaption: string, newFontId?: CaptionFontId) => {
    const nextFontId = newFontId || activeFontId;
    setCaption(newCaption);
    if (newFontId) {
      setActiveFontId(newFontId);
    }
    onUpdateMedia({
      ...media,
      caption: newCaption,
      captionFontId: nextFontId,
      filterId: activeFilter,
      intensity,
      brightness,
    });
    pushHistory({ caption: newCaption, captionFontId: nextFontId });
  };

  const handleQuickAiCaption = async () => {
    setIsAiLoading(true);
    try {
      const res = await fetch("/api/generate-caption", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: currentFilter.category,
          filterName: currentFilter.name,
          mood: "Keren & Kekinian",
        }),
      });
      const data = await res.json();
      if (data.caption) {
        setCaption(data.caption);
        onUpdateMedia({
          ...media,
          caption: data.caption,
          captionFontId: activeFontId,
          filterId: activeFilter,
          intensity,
          brightness,
        });
        pushHistory({ caption: data.caption });
        showToast("Caption AI diperbarui");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleIntensityCommit = (val: number) => {
    setIntensity(val);
    onUpdateMedia({ ...media, intensity: val });
    pushHistory({ intensity: val });
  };

  const handleBrightnessCommit = (val: number) => {
    setBrightness(val);
    onUpdateMedia({ ...media, brightness: val });
    pushHistory({ brightness: val });
  };

  return (
    <div
      id="screen-filter-caption"
      className="relative w-full h-full bg-[#09090b] flex flex-col justify-between overflow-hidden select-none"
    >
      {/* Top Header Navigation with Undo & Redo */}
      <div className="relative z-20 pt-3 px-3.5 flex items-center justify-between border-b border-zinc-800/90 pb-2.5 bg-zinc-950/90 backdrop-blur-md">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-zinc-300 hover:text-white px-2.5 py-1.5 rounded-full bg-zinc-900 hover:bg-zinc-800 transition-colors border border-zinc-800 font-semibold active:scale-95 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4 text-cyan-400" />
          <span className="hidden xs:inline">Kembali</span>
        </button>

        {/* Center: Undo & Redo Action Pill */}
        <div className="flex items-center bg-zinc-900/90 p-1 rounded-full border border-zinc-800 shadow-inner">
          <button
            onClick={handleUndo}
            disabled={!canUndo}
            className={`px-2.5 py-1 rounded-full transition-all flex items-center gap-1 text-[11px] font-bold ${
              canUndo
                ? "text-zinc-200 hover:text-white hover:bg-zinc-800 active:scale-95 text-cyan-400"
                : "text-zinc-600 opacity-40 cursor-not-allowed"
            }`}
            title="Undo (Kembalikan Perubahan)"
            aria-label="Undo Perubahan"
          >
            <Undo2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Undo</span>
          </button>

          <div className="w-[1px] h-3.5 bg-zinc-800 mx-0.5" />

          <button
            onClick={handleRedo}
            disabled={!canRedo}
            className={`px-2.5 py-1 rounded-full transition-all flex items-center gap-1 text-[11px] font-bold ${
              canRedo
                ? "text-zinc-200 hover:text-white hover:bg-zinc-800 active:scale-95 text-cyan-400"
                : "text-zinc-600 opacity-40 cursor-not-allowed"
            }`}
            title="Redo (Ulangi Perubahan)"
            aria-label="Redo Perubahan"
          >
            <span>Redo</span>
            <Redo2 className="w-3.5 h-3.5 text-cyan-400" />
          </button>
        </div>

        {/* Adjusters Button */}
        <button
          onClick={() => setShowAdjusters(!showAdjusters)}
          className={`p-2 rounded-full transition-all border ${
            showAdjusters
              ? "bg-cyan-400 text-zinc-950 border-cyan-400 shadow-md glow-cyan-sm"
              : "bg-zinc-900 text-zinc-300 border-zinc-800 hover:text-white hover:bg-zinc-800"
          }`}
          title="Sesuaikan Pencahayaan"
          aria-label="Sesuaikan Filter"
        >
          <Sliders className="w-4 h-4" />
        </button>
      </div>

      {/* Floating Action Toast */}
      <AnimatePresence>
        {actionNotification && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="absolute top-14 left-1/2 -translate-x-1/2 z-40 px-3 py-1 rounded-full bg-cyan-400 text-zinc-950 text-[10px] font-extrabold shadow-lg uppercase tracking-wider"
          >
            {actionNotification}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area: Preview + Overlay Caption */}
      <div className="relative flex-1 p-3 flex flex-col items-center justify-center min-h-0 overflow-hidden">
        {/* Media Card Preview */}
        <div className="relative w-full max-w-sm h-full max-h-[380px] rounded-3xl overflow-hidden shadow-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
          {media.type === "video" ? (
            <video
              src={media.url}
              playsInline
              autoPlay
              loop
              muted
              className={`w-full h-full object-cover transition-all ${currentFilter.cssClass}`}
              style={{
                filter: `brightness(${brightness}%)`,
                opacity: intensity / 100,
              }}
            />
          ) : (
            <img
              src={media.url}
              alt="Preview"
              className={`w-full h-full object-cover transition-all ${currentFilter.cssClass}`}
              style={{
                filter: `brightness(${brightness}%)`,
              }}
            />
          )}

          {/* Fine Tuning Sliders Floating Panel */}
          {showAdjusters && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-12 left-3 right-3 bg-zinc-950/95 backdrop-blur-md rounded-2xl p-3.5 border border-zinc-700 space-y-2.5 z-30 shadow-2xl"
            >
              <div className="flex items-center justify-between text-xs text-zinc-300 font-medium">
                <span>Intensitas Warna ({intensity}%)</span>
                <input
                  type="range"
                  min={20}
                  max={100}
                  value={intensity}
                  onChange={(e) => setIntensity(Number(e.target.value))}
                  onMouseUp={(e) => handleIntensityCommit(Number((e.target as HTMLInputElement).value))}
                  onTouchEnd={(e) => handleIntensityCommit(Number((e.target as HTMLInputElement).value))}
                  className="w-28 accent-cyan-400"
                />
              </div>
              <div className="flex items-center justify-between text-xs text-zinc-300 font-medium">
                <span>Pencahayaan ({brightness}%)</span>
                <input
                  type="range"
                  min={70}
                  max={130}
                  value={brightness}
                  onChange={(e) => setBrightness(Number(e.target.value))}
                  onMouseUp={(e) => handleBrightnessCommit(Number((e.target as HTMLInputElement).value))}
                  onTouchEnd={(e) => handleBrightnessCommit(Number((e.target as HTMLInputElement).value))}
                  className="w-28 accent-cyan-400"
                />
              </div>
            </motion.div>
          )}

          {/* Caption Overlay Card on Bottom of Preview */}
          <div className="absolute inset-x-3 bottom-3 bg-zinc-950/90 backdrop-blur-md border border-zinc-800/90 rounded-2xl p-3 flex flex-col space-y-2 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">
                  Keterangan Status
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleQuickAiCaption}
                  disabled={isAiLoading}
                  className="text-[10px] bg-zinc-900 hover:bg-zinc-800 text-zinc-300 px-2.5 py-1 rounded-lg border border-zinc-700 font-semibold flex items-center gap-1 transition-colors active:scale-95"
                  title="Regenerasi dengan AI"
                >
                  <RefreshCw
                    className={`w-3 h-3 text-cyan-400 ${
                      isAiLoading ? "animate-spin" : ""
                    }`}
                  />
                  <span>AI</span>
                </button>
                <button
                  onClick={() => setShowEditModal(true)}
                  className="text-[10px] bg-cyan-400 hover:bg-cyan-300 text-zinc-950 font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors shadow-sm active:scale-95"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Ubah</span>
                </button>
              </div>
            </div>

            {/* Dynamic Real-time Font Caption Rendering */}
            <p
              style={{ fontFamily: currentFont.fontFamily }}
              className="text-xs text-zinc-100 font-semibold leading-relaxed line-clamp-3 select-text transition-all"
            >
              "{caption}"
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Controls: Mode Tabs + Preset/Font Carousel + Actions */}
      <div className="relative z-20 flex flex-col space-y-2.5 pb-1 bg-zinc-950/95 border-t border-zinc-800/90 pt-3">
        {/* Mode Selector Tab (Filter vs Font Sans-Serif) */}
        <div className="px-4 flex items-center justify-center">
          <div className="bg-zinc-900 p-1 rounded-2xl border border-zinc-800 flex items-center gap-1 w-full max-w-xs shadow-inner">
            <button
              onClick={() => setActiveTab("filter")}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "filter"
                  ? "bg-cyan-400 text-zinc-950 shadow-md glow-cyan-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Palette className="w-4 h-4" />
              <span>Filter Warna (6)</span>
            </button>
            <button
              onClick={() => setActiveTab("font")}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "font"
                  ? "bg-cyan-400 text-zinc-950 shadow-md glow-cyan-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Type className="w-4 h-4" />
              <span>Font Sans (6)</span>
            </button>
          </div>
        </div>

        {/* Dynamic Carousel based on Active Tab */}
        <div className="w-full overflow-x-auto no-scrollbar px-4 py-1">
          {activeTab === "filter" ? (
            <div className="flex items-center gap-2.5">
              {FILTERS.map((f) => {
                const isSelected = activeFilter === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => handleFilterChange(f.id)}
                    className={`flex flex-col items-center gap-1 shrink-0 p-1.5 rounded-2xl transition-all ${
                      isSelected
                        ? "bg-zinc-900 border-2 border-cyan-400 scale-105 glow-cyan-sm"
                        : "bg-zinc-900/60 border border-zinc-800/80 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <div className="w-12 h-12 rounded-xl overflow-hidden relative border border-zinc-700/60 shadow-md">
                      <img
                        src={f.sampleImg}
                        alt={f.name}
                        className={`w-full h-full object-cover ${f.cssClass}`}
                      />
                      {isSelected && (
                        <div className="absolute inset-0 bg-cyan-400/20 flex items-center justify-center">
                          <Check className="w-4 h-4 text-white stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <span
                      className={`text-[10px] font-bold tracking-tight uppercase whitespace-nowrap ${
                        isSelected ? "text-cyan-400" : "text-zinc-400"
                      }`}
                    >
                      {f.name}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center gap-2 py-0.5">
              {CAPTION_FONTS.map((font) => {
                const isSelected = activeFontId === font.id;
                return (
                  <button
                    key={font.id}
                    onClick={() => handleFontChange(font.id)}
                    style={{ fontFamily: font.fontFamily }}
                    className={`shrink-0 px-3.5 py-2 rounded-2xl border text-center transition-all flex flex-col items-center justify-center min-w-[84px] ${
                      isSelected
                        ? "bg-zinc-900 border-2 border-cyan-400 text-white shadow-md glow-cyan-sm"
                        : "bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-white"
                    }`}
                  >
                    <span className="text-xs font-bold truncate">{font.name}</span>
                    <span className="text-[9px] text-zinc-500 font-sans">{font.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Action Row: Tombol Ubah Caption & Tombol Berikutnya */}
        <div className="px-4 flex items-center gap-2.5">
          <button
            onClick={() => setShowEditModal(true)}
            className="w-1/3 py-3 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-zinc-700 active:scale-98 shadow-sm"
          >
            <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Ubah Teks</span>
          </button>

          <button
            onClick={onNext}
            className="w-2/3 py-3 rounded-2xl bg-cyan-400 hover:bg-cyan-300 text-zinc-950 text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-lg active:scale-98 glow-cyan-sm"
          >
            <span>Pilih Platform</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        </div>

        {/* Banner AdMob bawah */}
        <AdMobBanner
          screenName="filter"
          osMode={osMode}
          onOpenAdDetails={onOpenAdDetails}
        />
      </div>

      {/* Caption Edit Modal */}
      <CaptionEditModal
        isOpen={showEditModal}
        initialCaption={caption}
        initialFontId={activeFontId}
        category={currentFilter.category}
        filterName={currentFilter.name}
        onSave={handleCaptionSave}
        onClose={() => setShowEditModal(false)}
      />
    </div>
  );
};

