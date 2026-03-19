"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { MediaSource } from "@/types";

interface PlayerState {
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  videoId: string | null;
  platform: "youtube" | "spotify" | "pdf" | null;
  playlist: MediaSource[];
  activeMedia: MediaSource | null;
}

interface PlayerContextType extends PlayerState {
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setVideoId: (id: string | null) => void;
  setPlatform: (platform: "youtube" | "spotify" | "pdf" | null) => void;
  seekTo?: (time: number) => void;
  setSeekToFn?: (fn: (time: number) => void) => void;
  
  // Playlist actions
  addToPlaylist: (media: MediaSource) => void;
  removeFromPlaylist: (id: string) => void;
  updateMediaTitle: (id: string, newTitle: string) => void;
  setActiveMedia: (media: MediaSource | null) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const [playlist, setPlaylist] = useState<MediaSource[]>([]);
  const [activeMedia, setActiveMediaState] = useState<MediaSource | null>(null);

  const [videoId, setVideoId] = useState<string | null>(null);
  const [platform, setPlatform] = useState<"youtube" | "spotify" | "pdf" | null>(null);
  
  const [seekToFn, setSeekToFnState] = useState<{ fn: (time: number) => void } | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("nihonote_playlist");
      if (saved) {
        setPlaylist(JSON.parse(saved));
      }
      const savedActive = localStorage.getItem("nihonote_active_media");
      if (savedActive) {
        const media = JSON.parse(savedActive);
        setActiveMediaState(media);
        setPlatform(media.type);
        setVideoId(media.type === "youtube" ? extractYouTubeId(media.url) : media.url);
      }
    } catch (e) {
      console.error("Failed to load playlist from localStorage", e);
    }
  }, []);

  // Save to localStorage whenever playlist changes
  useEffect(() => {
    localStorage.setItem("nihonote_playlist", JSON.stringify(playlist));
  }, [playlist]);

  useEffect(() => {
    if (activeMedia) {
      localStorage.setItem("nihonote_active_media", JSON.stringify(activeMedia));
    } else {
      localStorage.removeItem("nihonote_active_media");
    }
  }, [activeMedia]);

  const extractYouTubeId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
  };

  const setActiveMedia = (media: MediaSource | null) => {
    setActiveMediaState(media);
    if (media) {
      setPlatform(media.type);
      if (media.type === "youtube") {
        setVideoId(extractYouTubeId(media.url));
      } else if (media.type === "spotify") {
        setVideoId(media.url);
      } else if (media.type === "pdf") {
        setVideoId(media.id);
      }
    } else {
      setPlatform(null);
      setVideoId(null);
    }
  };

  const addToPlaylist = (media: MediaSource) => {
    setPlaylist(prev => {
      // Don't add duplicate by URL if it exists (except for PDFs which might share same generic title)
      const exists = prev.find(item => item.url === media.url && media.type !== 'pdf');
      if (exists) return prev;
      return [...prev, media];
    });
    if (!activeMedia) {
      setActiveMedia(media);
    }
  };

  const removeFromPlaylist = (id: string) => {
    setPlaylist(prev => prev.filter(item => item.id !== id));
    if (activeMedia?.id === id) {
      setActiveMedia(null);
    }
  };

  const updateMediaTitle = (id: string, newTitle: string) => {
    setPlaylist(prev => prev.map(item => 
      item.id === id ? { ...item, title: newTitle } : item
    ));
    if (activeMedia?.id === id) {
      setActiveMediaState(prev => prev ? { ...prev, title: newTitle } : null);
    }
  };

  const seekTo = (time: number) => {
    if (seekToFn?.fn) {
      seekToFn.fn(time);
    }
  };

  const setSeekToFn = (fn: (time: number) => void) => {
    setSeekToFnState({ fn });
  };

  return (
    <PlayerContext.Provider
      value={{
        currentTime,
        setCurrentTime,
        duration,
        setDuration,
        isPlaying,
        setIsPlaying,
        videoId,
        setVideoId,
        platform,
        setPlatform,
        seekTo,
        setSeekToFn,
        playlist,
        activeMedia,
        addToPlaylist,
        removeFromPlaylist,
        updateMediaTitle,
        setActiveMedia
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error("usePlayer must be used within a PlayerProvider");
  }
  return context;
}
