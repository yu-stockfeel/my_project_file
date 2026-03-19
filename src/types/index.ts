/* =============================================
   TypeScript Type Definitions
   ============================================= */

// Transcript sentence with timing info
export interface TranscriptSentence {
  id: string;
  text: string;
  startTime?: number; // seconds
  endTime?: number;   // seconds
  furigana?: FuriganaToken[];
  annotations?: Annotation[];
}

// Furigana token for display
export interface FuriganaToken {
  surface: string;   // the displayed text (e.g. kanji)
  reading?: string;  // hiragana reading (if kanji)
  isKanji: boolean;
}

// User annotation on a sentence
export interface Annotation {
  id: string;
  type: 'highlight' | 'pencil';
  color: HighlightColor;
  startOffset: number;
  endOffset: number;
  note?: string;      // for pencil annotations
}

export type HighlightColor = 'yellow' | 'pink' | 'green' | 'blue';

// A complete transcript document
export interface TranscriptDocument {
  id: string;
  title: string;
  sourceType: 'youtube' | 'spotify' | 'pdf' | 'manual' | 'whisper';
  sourceUrl?: string;
  sentences: TranscriptSentence[];
  createdAt: string;
  updatedAt: string;
}

// Media player source
export interface MediaSource {
  id: string;
  type: 'youtube' | 'spotify';
  url: string;
  title?: string;
  thumbnailUrl?: string;
}

// Dictionary result
export interface DictionaryResult {
  word: string;
  reading: string;
  meanings: {
    partOfSpeech: string;
    definitions: string[];
    examples?: string[];
  }[];
}

// Grammar result
export interface GrammarResult {
  pattern: string;
  meaning: string;
  formation: string;
  level?: string; // JLPT level
  examples: {
    japanese: string;
    reading?: string;
    translation: string;
  }[];
}

// Annotation tool state
export type ToolType = 'cursor' | 'highlighter' | 'pencil' | 'eraser';

export interface ToolState {
  activeTool: ToolType;
  activeColor: HighlightColor;
}

// Saved note
export interface Note {
  id: string;
  transcriptId?: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}
