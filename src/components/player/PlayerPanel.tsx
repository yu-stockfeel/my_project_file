// @ts-nocheck
"use client";

import { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Plus,
  ListMusic,
  Trash2,
  Youtube as YoutubeIcon,
  Music,
  ChevronDown,
  ChevronUp,
  Edit2,
  Check,
  X,
} from "lucide-react";
import YouTube, { YouTubePlayer } from "react-youtube";
import type { MediaSource } from "@/types";
import { usePlayer } from "@/contexts/PlayerContext";

// Helper to detect source type from URL
function detectSourceType(url: string): "youtube" | "spotify" | null {
  if (url.includes("youtube.com") || url.includes("youtu.be")) return "youtube";
  if (url.includes("spotify.com")) return "spotify";
  return null;
}

// Extract YouTube video ID from URL
function getYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
}

// Extract Spotify embed URL
function getSpotifyEmbedUrl(url: string): string | null {
  const match = url.match(
    /spotify\.com\/(track|episode|show|playlist)\/([a-zA-Z0-9]+)/
  );
  if (match) {
    return `https://open.spotify.com/embed/${match[1]}/${match[2]}?theme=0`;
  }
  return null;
}

export default function PlayerPanel() {
  const [urlInput, setUrlInput] = useState("");
  const [mobileCollapsed, setMobileCollapsed] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [isFetchingTitle, setIsFetchingTitle] = useState(false);
  
  // YouTube player instance
  const [ytPlayer, setYtPlayer] = useState<YouTubePlayer | null>(null);

  // Player Context
  const { 
    isPlaying, setIsPlaying, 
    currentTime, setCurrentTime,
    duration, setDuration,
    setVideoId, setPlatform,
    setSeekToFn,
    playlist, activeMedia,
    addToPlaylist, removeFromPlaylist,
    updateMediaTitle, setActiveMedia
  } = usePlayer();

  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];

  const fetchTitle = async (url: string, type: "youtube" | "spotify") => {
    try {
      const res = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(url)}`);
      const data = await res.json();
      return data.title || (type === "youtube" ? "YouTube 影片" : "Spotify 音訊");
    } catch {
      return type === "youtube" ? "YouTube 影片" : "Spotify 音訊";
    }
  };

  const handleAddUrl = async () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;

    const type = detectSourceType(trimmed);
    if (!type) return;

    // Check if duplicate
    if (playlist.find(s => s.url === trimmed && s.type !== "pdf")) {
      setUrlInput("");
      return;
    }

    setIsFetchingTitle(true);
    const title = await fetchTitle(trimmed, type);
    setIsFetchingTitle(false);

    const newSource: MediaSource = {
      id: Date.now().toString(),
      type,
      url: trimmed,
      title,
    };

    addToPlaylist(newSource);
    setUrlInput("");
  };

  const handleSourceSelect = (source: MediaSource) => {
    if (editingId === source.id) return; // Prevent selection while editing
    setActiveMedia(source);
  };

  const handleRemoveSource = (id: string) => {
    removeFromPlaylist(id);
  };
  
  const startEditing = (e: React.MouseEvent, source: MediaSource) => {
    e.stopPropagation();
    setEditingId(source.id);
    setEditingTitle(source.title || "");
  };

  const saveEditing = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (editingId && editingTitle.trim()) {
      updateMediaTitle(editingId, editingTitle.trim());
    }
    setEditingId(null);
  };

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") saveEditing();
    if (e.key === "Escape") setEditingId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleAddUrl();
  };

  // Setup seek function for Context
  useEffect(() => {
    if (ytPlayer) {
      setSeekToFn((time: number) => {
        ytPlayer.seekTo(time, true);
        setCurrentTime(time);
      });
    }
  }, [ytPlayer, setSeekToFn, setCurrentTime]);

  // Sync playback speed
  useEffect(() => {
    if (ytPlayer) {
      ytPlayer.setPlaybackRate(playbackSpeed);
    }
  }, [playbackSpeed, ytPlayer]);

  // Handle Play/Pause from context
  const togglePlay = () => {
    if (!activeMedia) return;
    
    if (activeMedia.type === "youtube" && ytPlayer) {
      if (isPlaying) {
        ytPlayer.pauseVideo();
      } else {
        ytPlayer.playVideo();
      }
    } else if (activeMedia.type === "pdf") {
      setIsPlaying(!isPlaying);
    }
  };

  // Poll current time when playing
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && ytPlayer) {
      interval = setInterval(async () => {
        const time = await ytPlayer.getCurrentTime();
        if (time !== undefined) {
          setCurrentTime(time);
        }
      }, 500); // Poll every 500ms
    }
    return () => clearInterval(interval);
  }, [isPlaying, ytPlayer, setCurrentTime]);

  const onPlayerReady = (event: { target: YouTubePlayer }) => {
    setYtPlayer(event.target);
    setDuration(event.target.getDuration());
    event.target.setPlaybackRate(playbackSpeed);
  };

  const onPlayerStateChange = (event: { data: number }) => {
    // 1 = playing, 2 = paused
    if (event.data === 1) {
      setIsPlaying(true);
    } else if (event.data === 2 || event.data === 0) {
      setIsPlaying(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Mobile collapse toggle */}
      <button
        onClick={() => setMobileCollapsed(!mobileCollapsed)}
        className="md:hidden flex items-center justify-between px-4 py-3 glass-strong border-b border-[var(--color-border)]"
      >
        <span className="text-sm font-medium text-[var(--color-text-primary)]">
          🎧 播放器
        </span>
        {mobileCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
      </button>

      <div
        className={`flex flex-col gap-4 p-4 transition-all duration-300 ${
          mobileCollapsed ? "hidden md:flex" : "flex"
        }`}
      >
        {/* URL Input */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
            貼上連結
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="YouTube 或 Spotify 連結..."
              className="flex-1 px-3 py-2 rounded-lg bg-[var(--color-bg-primary)] border border-[var(--color-border)] text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-border-active)] transition-colors"
            />
            <button
              onClick={handleAddUrl}
              className="px-3 py-2 rounded-lg bg-[var(--color-accent-blue)] text-white hover:opacity-90 transition-opacity"
            >
              <Plus size={18} />
            </button>
          </div>
        </div>

        {/* Player */}
        {activeMedia && (
          <div className="rounded-xl overflow-hidden animate-fade-in bg-black flex items-center justify-center shadow-inner relative group h-40 shrink-0">
            {activeMedia.type === "youtube" && getYouTubeId(activeMedia.url) && (
              <YouTube
                videoId={getYouTubeId(activeMedia.url)!}
                opts={{
                  width: "100%",
                  height: "100%",
                  playerVars: {
                    autoplay: 0,
                    // controls: 1, // Keep youtube controls
                    modestbranding: 1,
                    rel: 0,
                  },
                }}
                className="w-full h-full"
                iframeClassName="w-full h-full"
                onReady={onPlayerReady}
                onStateChange={onPlayerStateChange}
              />
            )}
            {activeMedia.type === "spotify" && getSpotifyEmbedUrl(activeMedia.url) && (
              <iframe
                src={getSpotifyEmbedUrl(activeMedia.url)!}
                className="w-full h-full"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              />
            )}
            {activeMedia.type === "pdf" && (
              <div className="w-full h-full flex flex-col items-center justify-center bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-accent-pink)]/5 to-[var(--color-accent-blue)]/5" />
                <BookOpen size={48} className="text-[var(--color-text-muted)] mb-2 opacity-50" />
                <span className="text-sm font-medium text-[var(--color-text-secondary)] z-10 px-4 text-center line-clamp-2">
                  {activeMedia.title || "PDF 閱讀模式"}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Playback Controls */}
        <div className={`flex items-center justify-center gap-3 py-2 ${!activeMedia || activeMedia.type === 'pdf' ? 'opacity-50 pointer-events-none' : ''}`}>
          <button className="p-2 rounded-full text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-card)] transition-all">
            <SkipBack size={18} />
          </button>
          <button
            onClick={togglePlay}
            disabled={!ytPlayer && activeMedia?.type === 'youtube'}
            className="p-3 rounded-full bg-gradient-to-r from-[var(--color-accent-pink)] to-[var(--color-accent-blue)] text-white shadow-[var(--shadow-glow-blue)] hover:opacity-90 transition-all active:scale-95 disabled:opacity-50"
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </button>
          <button className="p-2 rounded-full text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-card)] transition-all">
            <SkipForward size={18} />
          </button>
          <button className="p-2 rounded-full text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-card)] transition-all">
            <Volume2 size={18} />
          </button>
          {/* Speed control */}
          <select
            value={playbackSpeed}
            onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
            className="text-xs px-2 py-1 rounded-md bg-[var(--color-bg-primary)] border border-[var(--color-border)] text-[var(--color-text-secondary)] focus:outline-none cursor-pointer"
          >
            {speeds.map((s) => (
              <option key={s} value={s}>
                {s}x
              </option>
            ))}
          </select>
        </div>

        {/* Playlist */}
        {playlist.length > 0 && (
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider mb-2">
              <ListMusic size={14} />
              <span>播放清單</span>
            </div>
            <div className="space-y-1 flex-1 overflow-y-auto custom-scrollbar min-h-0">
              {playlist.map((source) => (
                <div
                  key={source.id}
                  onClick={() => handleSourceSelect(source)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all group ${
                    activeMedia?.id === source.id
                      ? "bg-[var(--color-accent-blue-light)] border border-[var(--color-border-active)]"
                      : "hover:bg-[var(--color-bg-card)]"
                  }`}
                >
                  {source.type === "youtube" ? (
                    <YoutubeIcon size={14} className="shrink-0 text-red-400" />
                  ) : source.type === "spotify" ? (
                    <Music size={14} className="shrink-0 text-emerald-400" />
                  ) : (
                    <BookOpen size={14} className="shrink-0 text-amber-400" />
                  )}
                  
                  {editingId === source.id ? (
                    <div className="flex-1 flex items-center gap-1" onClick={e => e.stopPropagation()}>
                      <input
                        type="text"
                        autoFocus
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onKeyDown={handleEditKeyDown}
                        className="flex-1 min-w-0 bg-[var(--color-bg-primary)] border border-[var(--color-accent-blue)] rounded px-1.5 py-0.5 text-xs text-[var(--color-text-primary)] focus:outline-none"
                      />
                      <button onClick={saveEditing} className="p-1 text-green-500 hover:bg-green-500/10 rounded">
                        <Check size={12} />
                      </button>
                      <button onClick={() => setEditingId(null)} className="p-1 text-red-500 hover:bg-red-500/10 rounded">
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <span className={`text-xs truncate flex-1 select-none ${
                      activeMedia?.id === source.id ? "text-[var(--color-accent-blue)] font-medium" : "text-[var(--color-text-primary)]"
                    }`}>
                      {source.title || source.url}
                    </span>
                  )}

                  {editingId !== source.id && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-auto shrink-0">
                      <button
                        onClick={(e) => startEditing(e, source)}
                        className="p-1 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-all rounded"
                        title="編輯標題"
                      >
                        <Edit2 size={12} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveSource(source.id);
                        }}
                        className="p-1 text-[var(--color-text-muted)] hover:text-red-400 transition-all rounded"
                        title="移除"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
