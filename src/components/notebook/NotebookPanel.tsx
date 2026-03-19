"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Upload,
  Highlighter,
  Pencil,
  Eraser,
  MousePointer2,
  Palette,
  BookOpen,
  Plus,
  Save,
} from "lucide-react";
import type {
  TranscriptSentence,
  ToolType,
  HighlightColor,
  Annotation,
  FuriganaToken,
} from "@/types";
import WordPopup from "@/components/dictionary/WordPopup";
import TranscriptInputModal from "@/components/transcript/TranscriptInputModal";
import { usePlayer } from "@/contexts/PlayerContext";

// =============================================
// Furigana Text Component
// =============================================
function FuriganaText({
  tokens,
  onWordClick,
}: {
  tokens: FuriganaToken[];
  onWordClick: (word: string, e: React.MouseEvent) => void;
}) {
  return (
    <span style={{ fontFamily: "var(--font-jp)" }}>
      {tokens.map((token, i) =>
        token.isKanji && token.reading ? (
          <ruby
            key={i}
            className="cursor-pointer hover:bg-[var(--color-accent-blue-light)] rounded px-0.5 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onWordClick(token.surface, e);
            }}
          >
            {token.surface}
            <rt>{token.reading}</rt>
          </ruby>
        ) : (
          <span
            key={i}
            className="cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              // Try to extract a meaningful word from the text
              const text = token.surface.replace(/[、。！？\s]/g, "");
              if (text.length > 0) {
                onWordClick(text, e);
              }
            }}
          >
            {token.surface}
          </span>
        )
      )}
    </span>
  );
}

// =============================================
// Sentence Block Component
// =============================================
function SentenceBlock({
  sentence,
  isActive,
  activeTool,
  activeColor,
  onAnnotate,
  onRemoveAnnotations,
  onClick,
  onWordClick,
  onSeek,
}: {
  sentence: TranscriptSentence;
  isActive: boolean;
  activeTool: ToolType;
  activeColor: HighlightColor;
  onAnnotate: (id: string, annotation: Annotation) => void;
  onRemoveAnnotations: (id: string) => void;
  onClick: () => void;
  onWordClick: (word: string, e: React.MouseEvent) => void;
  onSeek?: (time: number) => void;
}) {
  const [pencilNote, setPencilNote] = useState("");
  const [showPencilInput, setShowPencilInput] = useState(false);

  const handleClick = () => {
    onClick();
    if (activeTool === "pencil") {
      setShowPencilInput(true);
    } else if (activeTool === "highlighter") {
      // Highlight entire sentence on click
      onAnnotate(sentence.id, {
        id: Date.now().toString(),
        type: "highlight",
        color: activeColor,
        startOffset: 0,
        endOffset: sentence.text.length,
      });
    } else if (activeTool === "eraser") {
      onRemoveAnnotations(sentence.id);
    }
  };

  const savePencilNote = () => {
    if (pencilNote.trim()) {
      onAnnotate(sentence.id, {
        id: Date.now().toString(),
        type: "pencil",
        color: activeColor,
        startOffset: 0,
        endOffset: 0,
        note: pencilNote,
      });
      setPencilNote("");
      setShowPencilInput(false);
    }
  };

  const highlights = sentence.annotations?.filter((a) => a.type === "highlight");
  const pencilNotes = sentence.annotations?.filter((a) => a.type === "pencil");

  const highlightStyle =
    highlights && highlights.length > 0
      ? `highlight-${highlights[0].color}`
      : "";

  // Cursor style based on active tool
  const cursorClass =
    activeTool === "highlighter"
      ? "cursor-cell"
      : activeTool === "pencil"
      ? "cursor-text"
      : activeTool === "eraser"
      ? "cursor-pointer"
      : "cursor-default";

  return (
    <div
      className={`group relative py-4 px-4 border-l-[3px] transition-all duration-200 ${cursorClass} ${
        isActive
          ? "border-l-[var(--color-accent-blue)] bg-[var(--color-accent-blue-light)]"
          : "border-l-transparent hover:border-l-[var(--color-accent-pink)] hover:bg-[rgba(244,114,182,0.05)]"
      }`}
      onClick={handleClick}
    >
      {/* Time stamp */}
      {sentence.startTime !== undefined && (
        <span 
          onClick={(e) => {
            e.stopPropagation();
            if (onSeek && sentence.startTime !== undefined) {
              onSeek(sentence.startTime);
            }
          }}
          className="absolute left-[-3.8rem] top-4 text-[10px] text-[var(--color-text-muted)] font-mono opacity-0 group-hover:opacity-100 transition-all hidden lg:block hover:text-[var(--color-accent-blue)] cursor-pointer bg-[var(--color-bg-primary)] px-1 rounded"
        >
          {formatTime(sentence.startTime)}
        </span>
      )}

      {/* Sentence text */}
      <div
        className={`text-lg leading-[2.2] tracking-wide ${highlightStyle}`}
        style={{ fontFamily: "var(--font-jp)" }}
      >
        {sentence.furigana ? (
          <FuriganaText tokens={sentence.furigana} onWordClick={onWordClick} />
        ) : (
          <span
            className="cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              // Allow clicking individual words in plain text
              const selection = window.getSelection();
              const text = selection?.toString().trim();
              if (text && text.length > 0 && activeTool === "cursor") {
                onWordClick(text, e);
              }
            }}
          >
            {sentence.text}
          </span>
        )}
      </div>

      {/* Pencil notes */}
      {pencilNotes && pencilNotes.length > 0 && (
        <div className="mt-2 space-y-1">
          {pencilNotes.map((note) => (
            <div
              key={note.id}
              className={`text-sm pl-3 border-l-2 transition-all ${
                note.color === "pink"
                  ? "text-[var(--color-accent-pink)] border-[var(--color-accent-pink)]"
                  : note.color === "blue"
                  ? "text-[var(--color-accent-blue)] border-[var(--color-accent-blue)]"
                  : note.color === "green"
                  ? "text-[var(--color-accent-green)] border-[var(--color-accent-green)]"
                  : "text-[var(--color-accent-yellow)] border-[var(--color-accent-yellow)]"
              }`}
              style={{ fontStyle: "italic" }}
            >
              ✏️ {note.note}
            </div>
          ))}
        </div>
      )}

      {/* Pencil input */}
      {showPencilInput && activeTool === "pencil" && (
        <div className="mt-2 animate-fade-in flex gap-2">
          <input
            type="text"
            value={pencilNote}
            onChange={(e) => setPencilNote(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") savePencilNote();
              if (e.key === "Escape") setShowPencilInput(false);
            }}
            placeholder="寫下你的筆記..."
            className="flex-1 px-3 py-1.5 rounded-md bg-[var(--color-bg-primary)] border border-[var(--color-border)] text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent-pink)]"
            autoFocus
          />
          <button
            onClick={savePencilNote}
            className="px-3 py-1.5 rounded-md bg-[var(--color-accent-pink)] text-white text-sm hover:opacity-90"
          >
            存
          </button>
        </div>
      )}
    </div>
  );
}

// =============================================
// Toolbar Component
// =============================================
function Toolbar({
  activeTool,
  activeColor,
  onToolChange,
  onColorChange,
  onUploadPDF,
  onAddTranscript,
}: {
  activeTool: ToolType;
  activeColor: HighlightColor;
  onToolChange: (tool: ToolType) => void;
  onColorChange: (color: HighlightColor) => void;
  onUploadPDF: () => void;
  onAddTranscript: () => void;
}) {
  const [showColorPicker, setShowColorPicker] = useState(false);

  const colors: { color: HighlightColor; label: string; bg: string }[] = [
    { color: "yellow", label: "黃色", bg: "bg-yellow-400" },
    { color: "pink", label: "粉色", bg: "bg-pink-400" },
    { color: "green", label: "綠色", bg: "bg-green-400" },
    { color: "blue", label: "藍色", bg: "bg-sky-400" },
  ];

  const tools: { type: ToolType; icon: typeof MousePointer2; label: string }[] = [
    { type: "cursor", icon: MousePointer2, label: "游標（點擊查詢單字）" },
    { type: "highlighter", icon: Highlighter, label: "螢光筆" },
    { type: "pencil", icon: Pencil, label: "鉛筆（加筆記）" },
    { type: "eraser", icon: Eraser, label: "橡皮擦（清除標註）" },
  ];

  return (
    <div className="flex items-center gap-1 sm:gap-2 p-2 sm:p-3 glass rounded-xl flex-wrap">
      {/* Upload PDF */}
      <button
        onClick={onUploadPDF}
        className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-lg bg-gradient-to-r from-[var(--color-accent-pink)] to-[var(--color-accent-blue)] text-white text-xs sm:text-sm font-medium hover:opacity-90 transition-all active:scale-95 whitespace-nowrap"
      >
        <Upload size={14} />
        <span className="hidden sm:inline">上傳 PDF</span>
      </button>

      {/* Add transcript */}
      <button
        onClick={onAddTranscript}
        className="flex items-center gap-1 px-2.5 py-2 rounded-lg border border-[var(--color-border)] text-[var(--color-text-secondary)] text-xs hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-card)] transition-all"
        title="新增逐字稿"
      >
        <Plus size={14} />
        <span className="hidden sm:inline">新增</span>
      </button>

      <div className="w-px h-6 bg-[var(--color-border)] mx-1" />

      {/* Tools */}
      {tools.map(({ type, icon: Icon, label }) => (
        <button
          key={type}
          onClick={() => onToolChange(type)}
          title={label}
          className={`p-2 rounded-lg transition-all ${
            activeTool === type
              ? "bg-[var(--color-accent-blue-light)] text-[var(--color-accent-blue)] shadow-[var(--shadow-glow-blue)]"
              : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-card)]"
          }`}
        >
          <Icon size={18} />
        </button>
      ))}

      <div className="w-px h-6 bg-[var(--color-border)] mx-1" />

      {/* Color picker */}
      <div className="relative">
        <button
          onClick={() => setShowColorPicker(!showColorPicker)}
          className="p-2 rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-card)] transition-all"
          title="選擇顏色"
        >
          <Palette size={18} />
        </button>
        {showColorPicker && (
          <div className="absolute top-full mt-2 left-0 flex gap-1.5 p-2 glass rounded-lg animate-pop-in z-10">
            {colors.map(({ color, label, bg }) => (
              <button
                key={color}
                title={label}
                onClick={() => {
                  onColorChange(color);
                  setShowColorPicker(false);
                }}
                className={`w-6 h-6 rounded-full ${bg} transition-all ${
                  activeColor === color
                    ? "ring-2 ring-white scale-110"
                    : "opacity-70 hover:opacity-100"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Active tool indicator */}
      <div className="hidden sm:flex items-center ml-auto text-[11px] text-[var(--color-text-muted)] gap-1">
        {activeTool === "cursor" && "🖱️ 點擊單字查詢"}
        {activeTool === "highlighter" && "🖍️ 點擊句子高亮"}
        {activeTool === "pencil" && "✏️ 點擊句子寫筆記"}
        {activeTool === "eraser" && "🧹 點擊句子清除標註"}
      </div>
    </div>
  );
}

// =============================================
// Parse text into sentences with basic furigana
// =============================================
function parseTextToSentences(text: string): TranscriptSentence[] {
  // Split by Japanese period, exclamation, question mark, or newlines
  const rawSentences = text
    .split(/(?<=[。！？\n])/g)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  return rawSentences.map((sentenceText, i) => ({
    id: `custom-${Date.now()}-${i}`,
    text: sentenceText,
    annotations: [],
    // No furigana for manually entered text (would need kuromoji for this)
  }));
}

// =============================================
// Sample data
// =============================================
const SAMPLE_SENTENCES: TranscriptSentence[] = [
  {
    id: "1",
    text: "皆さん、こんにちは。今日のポッドキャストへようこそ。",
    startTime: 0,
    endTime: 5,
    furigana: [
      { surface: "皆", reading: "みな", isKanji: true },
      { surface: "さん、こんにちは。", isKanji: false },
      { surface: "今日", reading: "きょう", isKanji: true },
      { surface: "のポッドキャストへようこそ。", isKanji: false },
    ],
    annotations: [],
  },
  {
    id: "2",
    text: "今日は日本語の勉強方法について話したいと思います。",
    startTime: 5,
    endTime: 10,
    furigana: [
      { surface: "今日", reading: "きょう", isKanji: true },
      { surface: "は", isKanji: false },
      { surface: "日本語", reading: "にほんご", isKanji: true },
      { surface: "の", isKanji: false },
      { surface: "勉強", reading: "べんきょう", isKanji: true },
      { surface: "方法", reading: "ほうほう", isKanji: true },
      { surface: "について", isKanji: false },
      { surface: "話", reading: "はな", isKanji: true },
      { surface: "したいと", isKanji: false },
      { surface: "思", reading: "おも", isKanji: true },
      { surface: "います。", isKanji: false },
    ],
    annotations: [],
  },
  {
    id: "3",
    text: "まず、毎日少しずつ練習することが大切です。",
    startTime: 10,
    endTime: 15,
    furigana: [
      { surface: "まず、", isKanji: false },
      { surface: "毎日", reading: "まいにち", isKanji: true },
      { surface: "少", reading: "すこ", isKanji: true },
      { surface: "しずつ", isKanji: false },
      { surface: "練習", reading: "れんしゅう", isKanji: true },
      { surface: "することが", isKanji: false },
      { surface: "大切", reading: "たいせつ", isKanji: true },
      { surface: "です。", isKanji: false },
    ],
    annotations: [],
  },
  {
    id: "4",
    text: "例えば、ポッドキャストを聞いたり、本を読んだりすることがおすすめです。",
    startTime: 15,
    endTime: 22,
    furigana: [
      { surface: "例", reading: "たと", isKanji: true },
      { surface: "えば、ポッドキャストを", isKanji: false },
      { surface: "聞", reading: "き", isKanji: true },
      { surface: "いたり、", isKanji: false },
      { surface: "本", reading: "ほん", isKanji: true },
      { surface: "を", isKanji: false },
      { surface: "読", reading: "よ", isKanji: true },
      { surface: "んだりすることがおすすめです。", isKanji: false },
    ],
    annotations: [],
  },
  {
    id: "5",
    text: "新しい言葉を覚えるために、単語帳を作るのも良い方法です。",
    startTime: 22,
    endTime: 28,
    furigana: [
      { surface: "新", reading: "あたら", isKanji: true },
      { surface: "しい", isKanji: false },
      { surface: "言葉", reading: "ことば", isKanji: true },
      { surface: "を", isKanji: false },
      { surface: "覚", reading: "おぼ", isKanji: true },
      { surface: "えるために、", isKanji: false },
      { surface: "単語帳", reading: "たんごちょう", isKanji: true },
      { surface: "を", isKanji: false },
      { surface: "作", reading: "つく", isKanji: true },
      { surface: "るのも", isKanji: false },
      { surface: "良", reading: "よ", isKanji: true },
      { surface: "い", isKanji: false },
      { surface: "方法", reading: "ほうほう", isKanji: true },
      { surface: "です。", isKanji: false },
    ],
    annotations: [],
  },
  {
    id: "6",
    text: "文法は少し難しいですが、繰り返し使うことで自然に身につきます。",
    startTime: 28,
    endTime: 35,
    furigana: [
      { surface: "文法", reading: "ぶんぽう", isKanji: true },
      { surface: "は", isKanji: false },
      { surface: "少", reading: "すこ", isKanji: true },
      { surface: "し", isKanji: false },
      { surface: "難", reading: "むずか", isKanji: true },
      { surface: "しいですが、", isKanji: false },
      { surface: "繰", reading: "く", isKanji: true },
      { surface: "り", isKanji: false },
      { surface: "返", reading: "かえ", isKanji: true },
      { surface: "し", isKanji: false },
      { surface: "使", reading: "つか", isKanji: true },
      { surface: "うことで", isKanji: false },
      { surface: "自然", reading: "しぜん", isKanji: true },
      { surface: "に", isKanji: false },
      { surface: "身", reading: "み", isKanji: true },
      { surface: "につきます。", isKanji: false },
    ],
    annotations: [],
  },
  {
    id: "7",
    text: "最後に、楽しむことが一番大事だと思います。",
    startTime: 35,
    endTime: 40,
    furigana: [
      { surface: "最後", reading: "さいご", isKanji: true },
      { surface: "に、", isKanji: false },
      { surface: "楽", reading: "たの", isKanji: true },
      { surface: "しむことが", isKanji: false },
      { surface: "一番", reading: "いちばん", isKanji: true },
      { surface: "大事", reading: "だいじ", isKanji: true },
      { surface: "だと", isKanji: false },
      { surface: "思", reading: "おも", isKanji: true },
      { surface: "います。", isKanji: false },
    ],
    annotations: [],
  },
  {
    id: "8",
    text: "それでは、また次回お会いしましょう。",
    startTime: 40,
    endTime: 45,
    furigana: [
      { surface: "それでは、また", isKanji: false },
      { surface: "次回", reading: "じかい", isKanji: true },
      { surface: "お", isKanji: false },
      { surface: "会", reading: "あ", isKanji: true },
      { surface: "いしましょう。", isKanji: false },
    ],
    annotations: [],
  },
];

// =============================================
// NotebookPanel (Main export)
// =============================================
export default function NotebookPanel() {
  const [sentences, setSentences] = useState<TranscriptSentence[]>(SAMPLE_SENTENCES);
  const [activeSentenceId, setActiveSentenceId] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<ToolType>("cursor");
  const [activeColor, setActiveColor] = useState<HighlightColor>("yellow");
  const [hasTranscript, setHasTranscript] = useState(true);
  const [showInputModal, setShowInputModal] = useState(false);
  const [transcriptTitle, setTranscriptTitle] = useState("日本語の勉強方法について");

  // Word popup state
  const [popupWord, setPopupWord] = useState<string | null>(null);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });

  // Player Context
  const { videoId, platform, currentTime, seekTo, activeMedia, addToPlaylist } = usePlayer();
  const [isLoadingTranscript, setIsLoadingTranscript] = useState(false);
  const [transcriptError, setTranscriptError] = useState<string | null>(null);

  // Sync when activeMedia changes
  useEffect(() => {
    if (activeMedia?.type === "pdf" && activeMedia.sentences) {
      setSentences(activeMedia.sentences);
      setTranscriptTitle(activeMedia.title || "PDF 學習筆記");
      setHasTranscript(true);
      setTranscriptError(null);
    }
  }, [activeMedia]);

  // Auto-fetch transcript when video changes
  useEffect(() => {
    if (platform === "youtube" && videoId) {
      const fetchTranscript = async () => {
        setIsLoadingTranscript(true);
        setTranscriptError(null);
        try {
          const res = await fetch(`/api/youtube?url=${videoId}`);
          const data = await res.json();
          if (data.error) {
            setTranscriptError(data.error);
            setSentences([]);
            setHasTranscript(false);
          } else if (data.transcript) {
            const fetchedSentences = data.transcript.map((item: any, i: number) => ({
              id: `yt-${videoId}-${i}`,
              text: item.text,
              startTime: item.startTime,
              endTime: item.endTime,
              annotations: [],
            }));
            setSentences(fetchedSentences);
            setTranscriptTitle("YouTube Transcript");
            setHasTranscript(true);
          }
        } catch (error) {
          console.error("Failed to fetch transcript", error);
          setTranscriptError("Failed to fetch transcript.");
        } finally {
          setIsLoadingTranscript(false);
        }
      };
      
      fetchTranscript();
    } else if (platform === "spotify") {
      setTranscriptError("Spotify transcripts are not supported yet.");
      setSentences([]);
      setHasTranscript(false);
    }
  }, [videoId, platform]);

  // Sync active sentence with video time
  useEffect(() => {
    if (currentTime > 0 && sentences.length > 0) {
      // Find the sentence that covers currentTime
      // If none exactly covers, maybe find the closest past one
      const active = sentences.find(
        (s) => s.startTime !== undefined && s.endTime !== undefined && 
               currentTime >= s.startTime && currentTime <= s.endTime
      );
      
      if (active && active.id !== activeSentenceId) {
        setActiveSentenceId(active.id);
        
        // Auto scroll into view might be too jarring if user is reading elsewhere,
        // but it's a standard feature. Let's do it gently if we had a ref. 
        // For now, just highlight.
      } else if (!active) {
        // As a fallback, find the latest sentence that has started
        let latestPast: TranscriptSentence | null = null;
        for (const s of sentences) {
          if (s.startTime !== undefined && s.startTime <= currentTime) {
            latestPast = s;
          } else {
            break; // Since it's chronologically ordered
          }
        }
        
        if (latestPast && latestPast.id !== activeSentenceId) {
           setActiveSentenceId(latestPast.id);
        }
      }
    }
  }, [currentTime, sentences, activeSentenceId]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAnnotate = useCallback(
    (sentenceId: string, annotation: Annotation) => {
      setSentences((prev) =>
        prev.map((s) =>
          s.id === sentenceId
            ? { ...s, annotations: [...(s.annotations || []), annotation] }
            : s
        )
      );
    },
    []
  );

  const handleRemoveAnnotations = useCallback((sentenceId: string) => {
    setSentences((prev) =>
      prev.map((s) =>
        s.id === sentenceId ? { ...s, annotations: [] } : s
      )
    );
  }, []);

  const handleWordClick = useCallback(
    (word: string, e: React.MouseEvent) => {
      if (activeTool !== "cursor") return;
      setPopupWord(word);
      setPopupPosition({ x: e.clientX, y: e.clientY });
    },
    [activeTool]
  );

  const handleUploadPDF = () => {
    fileInputRef.current?.click();
  };

  const [isUploadingPDF, setIsUploadingPDF] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setIsUploadingPDF(true);
      setTranscriptError(null);
      
      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch("/api/pdf", {
          method: "POST",
          body: formData,
        });
        
        const data = await res.json();
        
        if (data.error) {
          setTranscriptError(data.error);
        } else if (data.text) {
          handleTranscriptSubmit(data.text, data.title || file.name);
        }
      } catch (error) {
        console.error("PDF upload error:", error);
        setTranscriptError("Failed to parse PDF file.");
      } finally {
        setIsUploadingPDF(false);
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    }
  };

  const handleTranscriptSubmit = (text: string, title: string) => {
    const newSentences = parseTextToSentences(text);
    setSentences(newSentences);
    setTranscriptTitle(title);
    setHasTranscript(true);
    setTranscriptError(null);
    
    // Auto-save to global playlist so it survives refresh
    addToPlaylist({
      id: `pdf-${Date.now()}`,
      type: "pdf",
      url: title,     // using title as URL/identifier
      title: title,
      sentences: newSentences
    });
  };


  // Count annotations
  const highlightCount = sentences.reduce(
    (acc, s) => acc + (s.annotations?.filter((a) => a.type === "highlight").length || 0),
    0
  );
  const noteCount = sentences.reduce(
    (acc, s) => acc + (s.annotations?.filter((a) => a.type === "pencil").length || 0),
    0
  );

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Toolbar */}
      <div className="shrink-0 p-3 border-b border-[var(--color-border)]">
        <Toolbar
          activeTool={activeTool}
          activeColor={activeColor}
          onToolChange={setActiveTool}
          onColorChange={setActiveColor}
          onUploadPDF={handleUploadPDF}
          onAddTranscript={() => setShowInputModal(true)}
        />
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* Notebook area */}
      {hasTranscript ? (
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="notebook-lines min-h-full pb-32 md:pb-8">
            <div className="max-w-3xl mx-auto pl-6 sm:pl-12 pr-4 pt-4 notebook-margin">
              {/* Title */}
              <div className="pb-4 mb-2 border-b border-[var(--color-border)]">
                <h2
                  className="text-xl font-bold text-[var(--color-text-primary)]"
                  style={{ fontFamily: "var(--font-jp)" }}
                >
                  📓 {transcriptTitle}
                </h2>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="text-xs text-[var(--color-text-muted)]">
                    {sentences.length} 句
                  </span>
                  {highlightCount > 0 && (
                    <span className="text-xs text-[var(--color-accent-yellow)]">
                      🖍️ {highlightCount} 處標記
                    </span>
                  )}
                  {noteCount > 0 && (
                    <span className="text-xs text-[var(--color-accent-pink)]">
                      ✏️ {noteCount} 則筆記
                    </span>
                  )}
                </div>
              </div>

              {/* Sentences */}
              <div className="space-y-0">
                {sentences.map((sentence) => (
                  <SentenceBlock
                    key={sentence.id}
                    sentence={sentence}
                    isActive={activeSentenceId === sentence.id}
                    activeTool={activeTool}
                    activeColor={activeColor}
                    onAnnotate={handleAnnotate}
                    onRemoveAnnotations={handleRemoveAnnotations}
                    onClick={() => setActiveSentenceId(sentence.id)}
                    onWordClick={handleWordClick}
                    onSeek={seekTo}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Empty state */
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4 animate-fade-in">
            <div className="w-20 h-20 rounded-2xl bg-[var(--color-bg-card)] flex items-center justify-center mx-auto">
              <BookOpen size={32} className="text-[var(--color-text-muted)]" />
            </div>
            <div>
              <p className="text-[var(--color-text-primary)] font-medium bg-[var(--color-bg-primary)]/80 inline-block px-3 py-1 rounded-full text-sm">
                {isLoadingTranscript ? "載入字幕中..." : transcriptError || "還沒有逐字稿"}
              </p>
              <p className="text-sm text-[var(--color-text-muted)] mt-1">
                {isLoadingTranscript ? "請稍候" : "上傳 PDF 或貼上文字來開始學習"}
              </p>
            </div>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={handleUploadPDF}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-[var(--color-accent-pink)] to-[var(--color-accent-blue)] text-white text-sm font-medium hover:opacity-90 transition-all"
              >
                <Upload size={14} className="inline mr-1.5" />
                上傳 PDF
              </button>
              <button
                onClick={() => setShowInputModal(true)}
                className="px-4 py-2 rounded-lg border border-[var(--color-border)] text-[var(--color-text-secondary)] text-sm hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-card)] transition-all"
              >
                <Plus size={14} className="inline mr-1.5" />
                貼上文字
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Word Popup */}
      {popupWord && (
        <WordPopup
          word={popupWord}
          position={popupPosition}
          onClose={() => setPopupWord(null)}
          onAddToVocabulary={(entry) => {
            console.log("Added to vocabulary:", entry);
            setPopupWord(null);
          }}
        />
      )}

      {/* Transcript Input Modal */}
      <TranscriptInputModal
        isOpen={showInputModal}
        onClose={() => setShowInputModal(false)}
        onSubmit={handleTranscriptSubmit}
      />
    </div>
  );
}

// =============================================
// Helper
// =============================================
function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}
