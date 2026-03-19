"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface PlayerState {
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  videoId: string | null;
  platform: "youtube" | "spotify" | null;
}

interface PlayerContextType extends PlayerState {
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setVideoId: (id: string | null) => void;
  setPlatform: (platform: "youtube" | "spotify" | null) => void;
  // Methods to control player from elsewhere if needed
  seekTo?: (time: number) => void;
  setSeekToFn?: (fn: (time: number) => void) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoId, setVideoId] = useState<string | null>(null);
  const [platform, setPlatform] = useState<"youtube" | "spotify" | null>(null);
  
  const [seekToFn, setSeekToFnState] = useState<{ fn: (time: number) => void } | null>(null);

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
