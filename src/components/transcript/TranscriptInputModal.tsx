"use client";

import { useState } from "react";
import { X, FileText, ClipboardPaste, Wand2 } from "lucide-react";

interface TranscriptInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (text: string, title: string) => void;
}

export default function TranscriptInputModal({
  isOpen,
  onClose,
  onSubmit,
}: TranscriptInputModalProps) {
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [activeTab, setActiveTab] = useState<"paste" | "pdf">("paste");

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!text.trim()) return;
    onSubmit(text.trim(), title.trim() || "未命名筆記");
    setTitle("");
    setText("");
    onClose();
  };

  const handlePaste = async () => {
    try {
      const clipText = await navigator.clipboard.readText();
      setText(clipText);
    } catch {
      // Clipboard API may not be available
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg glass-strong rounded-2xl shadow-[var(--shadow-popup)] animate-pop-in overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)]">
          <h3 className="text-lg font-bold text-[var(--color-text-primary)]">
            新增逐字稿
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-card)] transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[var(--color-border)]">
          <button
            onClick={() => setActiveTab("paste")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
              activeTab === "paste"
                ? "text-[var(--color-accent-blue)] border-b-2 border-[var(--color-accent-blue)]"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            <ClipboardPaste size={16} />
            貼上文字
          </button>
          <button
            onClick={() => setActiveTab("pdf")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
              activeTab === "pdf"
                ? "text-[var(--color-accent-blue)] border-b-2 border-[var(--color-accent-blue)]"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            <FileText size={16} />
            上傳 PDF
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
              標題
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例：日語 Podcast 第 10 集"
              className="w-full px-3 py-2 rounded-lg bg-[var(--color-bg-primary)] border border-[var(--color-border)] text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-border-active)] transition-colors"
            />
          </div>

          {activeTab === "paste" ? (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
                  逐字稿內容
                </label>
                <button
                  onClick={handlePaste}
                  className="flex items-center gap-1 text-xs text-[var(--color-accent-blue)] hover:underline"
                >
                  <ClipboardPaste size={12} />
                  從剪貼簿貼上
                </button>
              </div>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="在此貼上日文逐字稿...&#10;&#10;每個句子用句號（。）或換行分隔"
                rows={8}
                className="w-full px-3 py-2 rounded-lg bg-[var(--color-bg-primary)] border border-[var(--color-border)] text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-border-active)] transition-colors resize-none custom-scrollbar"
                style={{ fontFamily: "var(--font-jp)" }}
              />
              <p className="text-[11px] text-[var(--color-text-muted)]">
                提示：系統會自動按句號（。）或換行分段，並辨識漢字讀音
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div
                className="border-2 border-dashed border-[var(--color-border)] rounded-xl p-8 text-center hover:border-[var(--color-accent-blue)] transition-colors cursor-pointer"
                onClick={() => {
                  document.getElementById("pdf-upload-modal")?.click();
                }}
              >
                <FileText
                  size={32}
                  className="mx-auto text-[var(--color-text-muted)] mb-3"
                />
                <p className="text-sm text-[var(--color-text-primary)]">
                  點擊或拖放 PDF 檔案
                </p>
                <p className="text-xs text-[var(--color-text-muted)] mt-1">
                  支援 .pdf 格式
                </p>
                <input
                  id="pdf-upload-modal"
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      // TODO: Phase 3 - actual PDF parsing
                      setTitle(file.name.replace(".pdf", ""));
                      setText("[PDF 解析功能將在 Phase 3 實現]");
                    }
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-[var(--color-border)]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-card)] transition-all"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={!text.trim()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-[var(--color-accent-pink)] to-[var(--color-accent-blue)] text-white text-sm font-medium hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Wand2 size={14} />
            生成筆記
          </button>
        </div>
      </div>
    </div>
  );
}
