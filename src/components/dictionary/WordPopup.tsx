"use client";

import { useState, useEffect, useRef } from "react";
import {
  X,
  BookPlus,
  Volume2,
  Loader2,
  ExternalLink,
} from "lucide-react";

interface DictionaryMeaning {
  partOfSpeech: string;
  definitions: string[];
  tags: string[];
  info: string[];
}

interface DictionaryEntry {
  word: string;
  reading: string;
  jlpt: string[];
  isCommon: boolean;
  meanings: DictionaryMeaning[];
}

interface WordPopupProps {
  word: string;
  position: { x: number; y: number };
  onClose: () => void;
  onAddToVocabulary?: (entry: DictionaryEntry) => void;
}

export default function WordPopup({
  word,
  position,
  onClose,
  onAddToVocabulary,
}: WordPopupProps) {
  const [results, setResults] = useState<DictionaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchDictionary = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/dictionary?keyword=${encodeURIComponent(word)}`
        );
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        setResults(data.results || []);
      } catch (err) {
        setError("查詢失敗，請稍後再試");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (word) fetchDictionary();
  }, [word]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Adjust popup position to stay in viewport
  const adjustedStyle: React.CSSProperties = {
    position: "fixed",
    left: Math.min(position.x, window.innerWidth - 360),
    top: Math.min(position.y + 10, window.innerHeight - 400),
    zIndex: 100,
  };

  const entry = results[0];

  return (
    <div
      ref={popupRef}
      style={adjustedStyle}
      className="w-[340px] max-h-[380px] rounded-xl glass-strong shadow-[var(--shadow-popup)] animate-pop-in overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-2">
          <span
            className="text-xl font-bold text-[var(--color-text-primary)]"
            style={{ fontFamily: "var(--font-jp)" }}
          >
            {word}
          </span>
          {entry?.isCommon && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--color-accent-green)] text-[var(--color-bg-primary)] font-bold">
              常用
            </span>
          )}
          {entry?.jlpt?.length > 0 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--color-accent-purple)] text-white font-bold">
              {entry.jlpt[0].replace("jlpt-", "").toUpperCase()}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-card)] transition-all"
        >
          <X size={16} />
        </button>
      </div>

      {/* Content */}
      <div className="overflow-y-auto max-h-[260px] custom-scrollbar">
        {loading && (
          <div className="flex items-center justify-center py-8 gap-2 text-[var(--color-text-muted)]">
            <Loader2 size={18} className="animate-spin" />
            <span className="text-sm">查詢中...</span>
          </div>
        )}

        {error && (
          <div className="px-4 py-6 text-center text-sm text-red-400">
            {error}
          </div>
        )}

        {!loading && !error && entry && (
          <div className="px-4 py-3 space-y-3">
            {/* Reading */}
            <div className="flex items-center gap-2">
              <span
                className="text-base text-[var(--color-accent-pink)]"
                style={{ fontFamily: "var(--font-jp)" }}
              >
                {entry.reading}
              </span>
              <button
                onClick={() => {
                  const utterance = new SpeechSynthesisUtterance(entry.word || word);
                  utterance.lang = "ja-JP";
                  speechSynthesis.speak(utterance);
                }}
                className="p-1 rounded text-[var(--color-text-muted)] hover:text-[var(--color-accent-blue)] transition-colors"
                title="發音"
              >
                <Volume2 size={14} />
              </button>
            </div>

            {/* Meanings */}
            <div className="space-y-2">
              {entry.meanings.slice(0, 4).map((meaning, i) => (
                <div key={i} className="space-y-0.5">
                  {meaning.partOfSpeech && (
                    <span className="text-[10px] text-[var(--color-accent-blue)] font-medium uppercase">
                      {meaning.partOfSpeech}
                    </span>
                  )}
                  <p className="text-sm text-[var(--color-text-primary)]">
                    {i + 1}. {meaning.definitions.join("; ")}
                  </p>
                  {meaning.info.length > 0 && (
                    <p className="text-xs text-[var(--color-text-muted)] italic">
                      💡 {meaning.info.join(", ")}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && !error && results.length === 0 && (
          <div className="px-4 py-6 text-center text-sm text-[var(--color-text-muted)]">
            找不到「{word}」的釋義
          </div>
        )}
      </div>

      {/* Footer actions */}
      {!loading && entry && (
        <div className="flex items-center gap-2 px-4 py-2.5 border-t border-[var(--color-border)]">
          <button
            onClick={() => onAddToVocabulary?.(entry)}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-[var(--color-accent-pink-light)] text-[var(--color-accent-pink)] text-xs font-medium hover:bg-[var(--color-accent-pink)] hover:text-white transition-all"
          >
            <BookPlus size={13} />
            加入單字本
          </button>
          <a
            href={`https://jisho.org/search/${encodeURIComponent(word)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1 py-1.5 px-3 rounded-lg text-[var(--color-text-muted)] text-xs hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-card)] transition-all"
          >
            <ExternalLink size={12} />
            Jisho
          </a>
        </div>
      )}
    </div>
  );
}
