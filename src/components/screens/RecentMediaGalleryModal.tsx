import React, { useState, useRef } from "react";
import {
  X,
  Clock,
  Film,
  Camera,
  Play,
  Upload,
  Trash2,
  Check,
  Sparkles,
  ArrowRight,
  FolderOpen,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  RecentMediaItem,
  getRecentMediaList,
  deleteRecentMediaItem,
  clearAllRecentMedia,
  saveRecentMediaItem,
} from "../../utils/recentMedia";
import { FILTERS } from "../../data/presets";

interface RecentMediaGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMedia: (item: RecentMediaItem) => void;
}

export const RecentMediaGalleryModal: React.FC<RecentMediaGalleryModalProps> = ({
  isOpen,
  onClose,
  onSelectMedia,
}) => {
  const [activeTab, setActiveTab] = useState<"all" | "photo" | "video">("all");
  const [mediaList, setMediaList] = useState<RecentMediaItem[]>(() => getRecentMediaList());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  // Refresh list from localStorage
  const refreshList = () => {
    setMediaList(getRecentMediaList());
  };

  const filteredItems = mediaList.filter((item) => {
    if (activeTab === "photo") return item.type === "photo";
    if (activeTab === "video") return item.type === "video";
    return true;
  });

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const updated = deleteRecentMediaItem(id);
    setMediaList(updated);
    if (selectedId === id) setSelectedId(null);
  };

  const handleClearAll = () => {
    if (window.confirm("Hapus semua riwayat galeri media terbaru?")) {
      clearAllRecentMedia();
      setMediaList([]);
      setSelectedId(null);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const isVideo = file.type.startsWith("video");
      const url = URL.createObjectURL(file);
      const newItem = saveRecentMediaItem({
        type: isVideo ? "video" : "photo",
        url,
        thumbnailUrl: isVideo
          ? "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80"
          : url,
        category: isVideo ? "quickclip" : "coffee",
        filterId: isVideo ? "nightlife" : "none",
        caption: isVideo
          ? "30 detik video status penuh energi ⚡✨"
          : "Momen terbaru yang siap diedit & dibagikan ✨",
        captionFontId: "default",
        timestamp: Date.now(),
        durationSec: isVideo ? 30 : undefined,
        title: file.name.slice(0, 18),
      });
      refreshList();
      onSelectMedia(newItem);
    }
  };

  const formatRelativeTime = (timestamp: number) => {
    const diffSec = Math.floor((Date.now() - timestamp) / 1000);
    if (diffSec < 60) return "Baru Saja";
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)} mnt lalu`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} jam lalu`;
    return `${Math.floor(diffSec / 86400)} hari lalu`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm select-none">
      {/* Hidden Media Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.96 }}
        className="w-full max-w-md bg-[#0c0c0e] border border-zinc-800 rounded-t-3xl sm:rounded-3xl flex flex-col max-h-[85vh] h-[640px] shadow-2xl overflow-hidden"
      >
        {/* Modal Header */}
        <div className="p-4 border-b border-zinc-800/90 flex items-center justify-between bg-zinc-950/90 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-400/15 border border-cyan-400/40 flex items-center justify-center text-cyan-400">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                <span>Galeri Media Terbaru</span>
                <span className="text-[10px] bg-cyan-400/20 text-cyan-300 px-2 py-0.5 rounded-full font-mono font-bold">
                  {mediaList.length}
                </span>
              </h3>
              <p className="text-[10px] text-zinc-400">
                Pilih foto atau klip video dari memori untuk diedit
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-zinc-900 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Filter & Upload Bar */}
        <div className="px-4 pt-3 pb-2 flex items-center justify-between gap-2 border-b border-zinc-800/60 bg-zinc-950/50">
          {/* Tabs */}
          <div className="flex items-center bg-zinc-900/90 p-1 rounded-xl border border-zinc-800">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "all"
                  ? "bg-cyan-400 text-zinc-950 font-bold shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Semua ({mediaList.length})
            </button>
            <button
              onClick={() => setActiveTab("photo")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                activeTab === "photo"
                  ? "bg-cyan-400 text-zinc-950 font-bold shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Camera className="w-3 h-3" />
              <span>Foto</span>
            </button>
            <button
              onClick={() => setActiveTab("video")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                activeTab === "video"
                  ? "bg-cyan-400 text-zinc-950 font-bold shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Film className="w-3 h-3" />
              <span>Clip 30s</span>
            </button>
          </div>

          {/* Upload Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 text-xs font-semibold transition-colors active:scale-95 shadow-sm"
            title="Impor dari Perangkat"
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Impor</span>
          </button>
        </div>

        {/* Media Grid */}
        <div className="flex-1 p-4 overflow-y-auto">
          {filteredItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-600">
                <FolderOpen className="w-7 h-7" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-zinc-300">Belum Ada Media</h4>
                <p className="text-xs text-zinc-500 max-w-xs mt-1">
                  Ambil foto/video baru atau impor file foto dan video dari penyimpanan perangkat Anda.
                </p>
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="mt-2 py-2 px-4 rounded-xl bg-cyan-400 text-zinc-950 font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95"
              >
                <Upload className="w-4 h-4" />
                <span>Pilih dari Perangkat</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2.5">
              {filteredItems.map((item) => {
                const isSelected = selectedId === item.id;
                const filterObj = FILTERS.find((f) => f.id === item.filterId);

                return (
                  <div
                    key={item.id}
                    onClick={() => onSelectMedia(item)}
                    className={`relative rounded-2xl overflow-hidden aspect-square border-2 transition-all cursor-pointer group bg-zinc-900 ${
                      isSelected
                        ? "border-cyan-400 ring-2 ring-cyan-400/40 scale-[1.02]"
                        : "border-zinc-800 hover:border-zinc-600"
                    }`}
                  >
                    {/* Media Thumbnail */}
                    {item.type === "video" ? (
                      <div className="w-full h-full relative">
                        <img
                          src={item.thumbnailUrl || item.url}
                          alt={item.title || "Video Clip"}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
                          <div className="w-8 h-8 rounded-full bg-cyan-400/90 text-zinc-950 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <Play className="w-4 h-4 fill-zinc-950 ml-0.5" />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <img
                        src={item.thumbnailUrl || item.url}
                        alt={item.title || "Photo"}
                        className={`w-full h-full object-cover group-hover:scale-105 transition-transform ${
                          filterObj ? filterObj.cssClass : ""
                        }`}
                      />
                    )}

                    {/* Top Type Badge */}
                    <div className="absolute top-1.5 left-1.5 flex items-center gap-1">
                      <span className="text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-white border border-white/10 flex items-center gap-0.5">
                        {item.type === "video" ? (
                          <>
                            <Film className="w-2.5 h-2.5 text-cyan-400" />
                            <span>30s</span>
                          </>
                        ) : (
                          <>
                            <Camera className="w-2.5 h-2.5 text-emerald-400" />
                            <span>Foto</span>
                          </>
                        )}
                      </span>
                    </div>

                    {/* Delete Item Button */}
                    <button
                      onClick={(e) => handleDelete(e, item.id)}
                      className="absolute top-1.5 right-1.5 p-1 rounded-md bg-black/70 hover:bg-rose-600/90 text-zinc-400 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                      title="Hapus Media"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>

                    {/* Bottom Metadata Overlay */}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-1.5 flex flex-col justify-end">
                      <span className="text-[9px] font-bold text-white truncate leading-tight">
                        {item.title || (item.type === "video" ? "Video Clip 30s" : "Foto Status")}
                      </span>
                      <span className="text-[8px] text-zinc-400 font-mono">
                        {formatRelativeTime(item.timestamp)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 border-t border-zinc-800 bg-zinc-950 flex items-center justify-between">
          {mediaList.length > 0 ? (
            <button
              onClick={handleClearAll}
              className="text-[11px] text-zinc-500 hover:text-rose-400 transition-colors font-medium flex items-center gap-1 px-2 py-1 rounded-lg"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Bersihkan Riwayat</span>
            </button>
          ) : (
            <div />
          )}

          <button
            onClick={() => fileInputRef.current?.click()}
            className="py-2 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs text-white font-semibold flex items-center gap-1.5 transition-colors active:scale-95 shadow-sm"
          >
            <Upload className="w-3.5 h-3.5 text-cyan-400" />
            <span>Upload File Baru</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
