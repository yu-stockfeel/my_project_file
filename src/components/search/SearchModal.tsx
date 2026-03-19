"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X, Book, GraduationCap, Loader2, BookmarkPlus } from "lucide-react";
import grammarData from "@/data/grammar.json";

interface DictionaryResult {
  word: string;
  reading: string;
  jlpt: string[];
  isCommon: boolean;
  meanings: {
    partOfSpeech: string;
    definitions: string[];
    tags: string[];
    info: string[];
  }[];
}

interface GrammarPoint {
  id: string;
  title: string;
  level: string;
  meaning: string;
  formation: string;
  examples: { japanese: string; translation: string }[];
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

type TabType = "dictionary" | "grammar";

export default function SearchModal({ isOpen, onClose, initialQuery = "" }: SearchModalProps) {
  const [query, setQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState<TabType>("dictionary");

  // Dictionary state
  const [dictResults, setDictResults] = useState<DictionaryResult[]>([]);
  const [isDictLoading, setIsDictLoading] = useState(false);
  const [dictError, setDictError] = useState<string | null>(null);

  // Grammar state
  const [grammarResults, setGrammarResults] = useState<GrammarPoint[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialQuery) {
        setQuery(initialQuery);
        handleSearch(initialQuery);
      } else {
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    } else {
      // Reset state if not open
      // setQuery("");
      // setDictResults([]);
      // setGrammarResults([]);
    }
  }, [isOpen, initialQuery]);

  const handleSearch = async (searchQuery: string) => {
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      setDictResults([]);
      setGrammarResults([]);
      return;
    }

    // Search Grammar
    const filteredGrammar = (grammarData as GrammarPoint[]).filter(
      (g) =>
        g.title.includes(trimmed) ||
        g.meaning.includes(trimmed) ||
        g.formation.includes(trimmed)
    );
    setGrammarResults(filteredGrammar);

    // Search Dictionary
    setIsDictLoading(true);
    setDictError(null);
    try {
      const res = await fetch(`/api/dictionary?keyword=${encodeURIComponent(trimmed)}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setDictResults(data.results || []);
    } catch (err: any) {
      console.error(err);
      setDictError(err.message || "搜尋發生錯誤");
      setDictResults([]);
    } finally {
      setIsDictLoading(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch(query);
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 sm:pt-32">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={onClose}
      />
      
      {/* Search Container */}
      <div className="relative w-full max-w-2xl bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-2xl shadow-2xl overflow-hidden animate-pop-in flex flex-col max-h-[80vh]">
        
        {/* Search Header */}
        <div className="p-4 border-b border-[var(--color-border)] glass-strong flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative flex items-center">
              <Search className="absolute left-3 text-[var(--color-text-muted)]" size={20} />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="搜尋日文單字、假名或文法..."
                className="w-full pl-10 pr-4 py-3 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent-blue)] focus:ring-1 focus:ring-[var(--color-accent-blue)] transition-all text-lg"
                style={{ fontFamily: 'var(--font-jp)' }}
              />
            </div>
            <button
              onClick={onClose}
              className="p-2.5 rounded-xl text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-card)] transition-colors"
            >
              <X size={24} />
            </button>
          </div>
          
          {/* Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("dictionary")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium text-sm transition-all ${
                activeTab === "dictionary"
                  ? "bg-[var(--color-accent-blue)] text-white shadow-[var(--shadow-glow-blue)]"
                  : "bg-[var(--color-bg-card)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-border)]"
              }`}
            >
              <Book size={16} /> 字典 ({isDictLoading ? "..." : dictResults.length})
            </button>
            <button
              onClick={() => setActiveTab("grammar")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium text-sm transition-all ${
                activeTab === "grammar"
                  ? "bg-[var(--color-accent-pink)] text-white shadow-[var(--shadow-glow-pink)]"
                  : "bg-[var(--color-bg-card)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-border)]"
              }`}
            >
              <GraduationCap size={16} /> 文法 ({grammarResults.length})
            </button>
          </div>
        </div>

        {/* Results Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-0 bg-[var(--color-bg-secondary)]">
          {query.trim() === "" ? (
            <div className="h-48 flex items-center justify-center text-[var(--color-text-muted)]">
              輸入關鍵字開始搜尋
            </div>
          ) : (
            <div className="p-4 space-y-4">
              
              {/* Dictionary Tab */}
              {activeTab === "dictionary" && (
                <div className="space-y-4 animate-fade-in">
                  {isDictLoading ? (
                    <div className="flex flex-col items-center justify-center py-12 text-[var(--color-text-muted)] gap-3">
                      <Loader2 className="animate-spin" size={24} />
                      <p>搜尋中...</p>
                    </div>
                  ) : dictError ? (
                    <div className="py-8 text-center text-red-400 bg-red-400/10 rounded-xl border border-red-400/20">
                      {dictError}
                    </div>
                  ) : dictResults.length === 0 ? (
                    <div className="text-center py-12 text-[var(--color-text-muted)]">
                      找不到相關單字
                    </div>
                  ) : (
                    dictResults.map((result, idx) => (
                      <div key={idx} className="bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-xl p-4 shadow-sm hover:border-[var(--color-accent-blue)] transition-colors">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <div className="flex items-baseline gap-3 mb-1">
                              <h3 className="text-2xl font-bold text-[var(--color-text-primary)]" style={{ fontFamily: 'var(--font-jp)' }}>
                                {result.word}
                              </h3>
                              {result.word !== result.reading && (
                                <span className="text-[var(--color-text-secondary)] text-sm">{result.reading}</span>
                              )}
                            </div>
                            <div className="flex gap-2 text-xs">
                              {result.isCommon && (
                                <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">常見單字</span>
                              )}
                              {result.jlpt.map(level => (
                                <span key={level} className="px-2 py-0.5 rounded-full bg-[var(--color-accent-pink)]/10 text-[var(--color-accent-pink)] border border-[var(--color-accent-pink)]/20 uppercase">
                                  {level.replace('jlpt-', '')}
                                </span>
                              ))}
                            </div>
                          </div>
                          <button className="text-[var(--color-text-muted)] hover:text-[var(--color-accent-blue)] transition-colors" title="加入筆記">
                            <BookmarkPlus size={20} />
                          </button>
                        </div>
                        
                        <div className="space-y-3 mt-4">
                          {result.meanings.map((meaning, mIdx) => (
                            <div key={mIdx} className="text-sm">
                              {meaning.partOfSpeech && (
                                <span className="inline-block px-1.5 py-0.5 rounded bg-[var(--color-bg-card)] text-[var(--color-text-secondary)] text-xs mb-1 mr-2 italic">
                                  {meaning.partOfSpeech}
                                </span>
                              )}
                              <span className="text-[var(--color-text-primary)]">
                                {meaning.definitions.join("; ")}
                              </span>
                              {meaning.info.length > 0 && (
                                <div className="text-[var(--color-text-muted)] text-xs mt-1">
                                  註: {meaning.info.join(", ")}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Grammar Tab */}
              {activeTab === "grammar" && (
                <div className="space-y-4 animate-fade-in">
                  {grammarResults.length === 0 ? (
                    <div className="text-center py-12 text-[var(--color-text-muted)]">
                      找不到相關文法
                    </div>
                  ) : (
                    grammarResults.map((grammar) => (
                      <div key={grammar.id} className="bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-xl p-5 shadow-sm hover:border-[var(--color-accent-pink)] transition-colors">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-4">
                          <div className="flex items-center gap-3">
                            <span className="px-2 py-1 rounded bg-[var(--color-accent-pink)] text-white font-bold text-xs shadow-[var(--shadow-glow-pink)]">
                              {grammar.level}
                            </span>
                            <h3 className="text-xl font-bold text-[var(--color-text-primary)]" style={{ fontFamily: 'var(--font-jp)' }}>
                              {grammar.title}
                            </h3>
                          </div>
                          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-[var(--color-bg-card)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-border)] transition-colors w-fit">
                            <BookmarkPlus size={14} /> 筆記
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                          <div className="bg-[var(--color-bg-secondary)] rounded-lg p-3 border border-[var(--color-border)]">
                            <div className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-widest mb-1.5">意思 Meaning</div>
                            <div className="text-sm font-medium text-[var(--color-text-primary)]">{grammar.meaning}</div>
                          </div>
                          <div className="bg-[var(--color-bg-secondary)] rounded-lg p-3 border border-[var(--color-border)]">
                            <div className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-widest mb-1.5">接續規則 Formation</div>
                            <div className="text-sm font-medium text-[var(--color-accent-blue)]" style={{ fontFamily: 'var(--font-jp)' }}>{grammar.formation}</div>
                          </div>
                        </div>

                        <div>
                          <div className="text-xs font-medium text-[var(--color-text-secondary)] mb-2 flex items-center gap-1.5">
                            <Book size={14} /> 例句 Examples
                          </div>
                          <div className="space-y-3">
                            {grammar.examples.map((ex, idx) => (
                              <div key={idx} className="pl-3 border-l-2 border-[var(--color-border-active)]">
                                <p className="text-[var(--color-text-primary)] text-base mb-0.5" style={{ fontFamily: 'var(--font-jp)' }}>
                                  {ex.japanese}
                                </p>
                                <p className="text-sm text-[var(--color-text-muted)]">
                                  {ex.translation}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
