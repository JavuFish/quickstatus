import React, { useState } from "react";
import { X, Sparkles, RefreshCw, Check, Hash, Smile, Send, Type } from "lucide-react";
import { motion } from "motion/react";
import { CaptionFontId } from "../../types";
import { CAPTION_FONTS } from "../../data/presets";

interface CaptionEditModalProps {
  isOpen: boolean;
  initialCaption: string;
  initialFontId?: CaptionFontId;
  category: string;
  filterName: string;
  onSave: (newCaption: string, newFontId?: CaptionFontId) => void;
  onClose: () => void;
}

const EMOJI_LIST = ["☕", "✨", "🌙", "🍕", "📸", "💖", "🔥", "🎧", "🌴", "⚡", "🕶️", "🥂", "🥑", "🌅"];
const MOOD_TAGS = [
  { id: "chill", name: "Santai & Chill", emoji: "☕" },
  { id: "aesthetic", name: "Estetik & Kalem", emoji: "✨" },
  { id: "energetic", name: "Semangat & Seru", emoji: "⚡" },
  { id: "short", name: "Singkat & Padat", emoji: "📌" },
  { id: "funny", name: "Lucu & Santai", emoji: "😄" },
];

export const CaptionEditModal: React.FC<CaptionEditModalProps> = ({
  isOpen,
  initialCaption,
  initialFontId = "default",
  category,
  filterName,
  onSave,
  onClose,
}) => {
  const [caption, setCaption] = useState(initialCaption);
  const [selectedFontId, setSelectedFontId] = useState<CaptionFontId>(initialFontId);
  const [selectedMood, setSelectedMood] = useState("chill");
  const [customPrompt, setCustomPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  if (!isOpen) return null;

  const currentFont = CAPTION_FONTS.find((f) => f.id === selectedFontId) || CAPTION_FONTS[0];

  const handleGenerateAI = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch("/api/generate-caption", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          filterName,
          mood: selectedMood,
          customPrompt,
        }),
      });
      const data = await res.json();
      if (data.caption) {
        setCaption(data.caption);
      }
      if (data.suggestions && Array.isArray(data.suggestions)) {
        setSuggestions(data.suggestions);
      }
    } catch (err) {
      console.error("AI Caption error:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleInsertEmoji = (emoji: string) => {
    setCaption((prev) => `${prev} ${emoji}`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 select-none">
      <motion.div
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        className="w-full max-w-md bg-[#0c0c0c] border-t sm:border border-zinc-800 rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl flex flex-col space-y-4 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-[#22D3EE] text-black">
              <Sparkles className="w-4 h-4 fill-current" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-tight">Ubah Keterangan & Font</h3>
              <p className="text-[10px] text-zinc-400 font-mono">
                Tema: <span className="text-[#22D3EE] font-bold uppercase">{category}</span> ({filterName})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Text Area with Live Font Preview */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between px-0.5">
            <label className="text-[10px] font-mono text-zinc-400 uppercase font-bold">
              Teks Caption ({currentFont.name}):
            </label>
            <span className="text-[10px] font-mono text-zinc-500">
              {caption.length}/150
            </span>
          </div>
          <div className="relative">
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={3}
              style={{ fontFamily: currentFont.fontFamily }}
              placeholder="Tulis caption status menarik Anda di sini..."
              className="w-full bg-[#141414] border border-zinc-700 rounded-2xl p-3.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#22D3EE] transition-colors resize-none leading-relaxed font-medium"
            />
          </div>
        </div>

        {/* Modern Sans-Serif Font Selection */}
        <div className="p-3 bg-[#111111] border border-zinc-800 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5 text-[#22D3EE]" />
              <span className="text-xs font-black text-white uppercase font-mono tracking-tight">
                Pilih Font Sans-Serif Modern
              </span>
            </div>
            <span className="text-[9px] text-[#22D3EE] font-mono font-bold bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded-full uppercase">
              {currentFont.label}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-1.5 pt-1">
            {CAPTION_FONTS.map((font) => {
              const isSelected = selectedFontId === font.id;
              return (
                <button
                  key={font.id}
                  onClick={() => setSelectedFontId(font.id)}
                  style={{ fontFamily: font.fontFamily }}
                  className={`p-2 rounded-xl border text-left transition-all flex flex-col justify-between ${
                    isSelected
                      ? "bg-zinc-900 border-[#22D3EE] text-white shadow-md glow-cyan-sm"
                      : "bg-zinc-950 border-zinc-800/90 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[11px] font-bold truncate">{font.name}</span>
                    {isSelected && <Check className="w-3 h-3 text-[#22D3EE] stroke-[3] shrink-0" />}
                  </div>
                  <span className="text-[8px] opacity-75 font-mono truncate">{font.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick Emoji Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          <span className="text-xs text-zinc-400 flex items-center gap-1 shrink-0 mr-1">
            <Smile className="w-3.5 h-3.5 text-[#22D3EE]" />
          </span>
          {EMOJI_LIST.map((emoji, i) => (
            <button
              key={i}
              onClick={() => handleInsertEmoji(emoji)}
              className="px-2 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-sm transition-transform active:scale-90 shrink-0"
            >
              {emoji}
            </button>
          ))}
        </div>

        {/* AI Generator & Mood Presets */}
        <div className="p-3 bg-[#111111] border border-zinc-800 rounded-2xl space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#22D3EE]" />
              <span className="text-xs font-black text-white uppercase font-mono tracking-tight">AI Smart Caption</span>
            </div>
            <button
              onClick={handleGenerateAI}
              disabled={isGenerating}
              className="px-3 py-1 bg-[#22D3EE] hover:bg-[#22D3EE]/90 text-black text-xs font-black rounded-lg transition-all flex items-center gap-1.5 shadow-md active:scale-95 disabled:opacity-50 uppercase font-mono glow-cyan-sm"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  <span>Meracik...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-3 h-3" />
                  <span>Generate Baru</span>
                </>
              )}
            </button>
          </div>

          {/* Mood Chips */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {MOOD_TAGS.map((m) => (
              <button
                key={m.id}
                onClick={() => setSelectedMood(m.id)}
                className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition-all flex items-center gap-1 font-mono ${
                  selectedMood === m.id
                    ? "bg-[#22D3EE] text-black font-black shadow-sm glow-cyan-sm"
                    : "bg-zinc-900 text-zinc-300 border border-zinc-800 hover:bg-zinc-800"
                }`}
              >
                <span>{m.emoji}</span>
                <span>{m.name}</span>
              </button>
            ))}
          </div>

          {/* Suggestions Dropdown if available */}
          {suggestions.length > 0 && (
            <div className="space-y-1.5 pt-2 border-t border-zinc-800">
              <span className="text-[9px] text-[#22D3EE] font-black uppercase tracking-wider block font-mono">
                Pilih Alternatif Rekomendasi:
              </span>
              <div className="space-y-1 max-h-28 overflow-y-auto pr-1">
                {suggestions.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCaption(s)}
                    style={{ fontFamily: currentFont.fontFamily }}
                    className="w-full text-left p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[11px] text-zinc-200 transition-colors line-clamp-2 font-medium"
                  >
                    "{s}"
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-2 border-t border-zinc-800">
          <button
            onClick={onClose}
            className="w-1/3 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-bold transition-colors border border-zinc-800 uppercase"
          >
            Batal
          </button>
          <button
            onClick={() => {
              onSave(caption, selectedFontId);
              onClose();
            }}
            className="w-2/3 py-2.5 rounded-xl bg-[#22D3EE] hover:bg-[#22D3EE]/90 text-black text-xs font-black transition-all shadow-lg flex items-center justify-center gap-1.5 active:scale-98 uppercase tracking-wider glow-cyan-sm"
          >
            <Check className="w-4 h-4 text-black stroke-[3]" />
            <span>Terapkan Caption</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

