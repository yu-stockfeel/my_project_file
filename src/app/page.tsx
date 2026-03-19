"use client";

import { useState } from "react";

import Sidebar from "@/components/layout/Sidebar";
import MobileNav from "@/components/layout/MobileNav";
import PlayerPanel from "@/components/player/PlayerPanel";
import NotebookPanel from "@/components/notebook/NotebookPanel";
import { useResizable } from "@/hooks/useResizable";
import { GripVertical } from "lucide-react";
import { PlayerProvider } from "@/contexts/PlayerContext";
import SearchModal from "@/components/search/SearchModal";

export default function Home() {
  // Resizable panel divider (Player vs Notebook)
  // We use a percentage or fixed width. Let's use fixed width for the left panel.
  const { size: playerWidth, startResizing, isResizing } = useResizable({
    initialSize: 400,
    minSize: 300,
    maxSize: 800,
    direction: "horizontal",
    storageKey: "player-panel-width",
  });

  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <PlayerProvider>
      <div className="flex h-screen overflow-hidden bg-[var(--color-bg-primary)]">
        {/* Sidebar - Desktop */}
        <Sidebar onOpenSearch={() => setIsSearchOpen(true)} />

        {/* Main Content */}
        <main className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
          {/* Left Panel - Player */}
          <div 
            style={{ width: `${playerWidth}px` }}
            className={`hidden md:block shrink-0 border-r border-[var(--color-border)] glass overflow-hidden flex flex-col ${
              isResizing ? "" : "transition-[width] duration-300 ease-in-out"
            }`}
          >
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <PlayerPanel />
            </div>
          </div>

          {/* Resizer Divider */}
          <div
            onMouseDown={startResizing}
            onPointerDown={startResizing}
            className={`hidden md:flex absolute top-0 w-1.5 h-full cursor-col-resize hover:bg-[var(--color-accent-blue)]/30 transition-colors z-40 items-center justify-center group ${
              isResizing ? "bg-[var(--color-accent-blue)]/50" : ""
            }`}
            style={{ left: `${playerWidth - 3}px` }}
          >
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <GripVertical size={14} className="text-[var(--color-text-muted)]" />
            </div>
          </div>

          {/* Right Panel - Notebook */}
          <div className="flex-1 overflow-hidden bg-[var(--color-bg-notebook)]">
            <NotebookPanel />
          </div>
        </main>

        {/* Mobile Nav */}
        <MobileNav onOpenSearch={() => setIsSearchOpen(true)} />
        
        {/* Global Search Modal */}
        <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      </div>
    </PlayerProvider>
  );
}
