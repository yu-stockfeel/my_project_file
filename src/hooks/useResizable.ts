"use client";

import { useState, useCallback, useEffect, useRef } from "react";

interface ResizableOptions {
  initialSize: number;
  minSize: number;
  maxSize: number;
  direction: "horizontal" | "vertical";
  storageKey?: string;
}

export function useResizable({
  initialSize,
  minSize,
  maxSize,
  direction,
  storageKey,
}: ResizableOptions) {
  const [size, setSize] = useState(initialSize);
  const [isResizing, setIsResizing] = useState(false);
  const resizerRef = useRef<HTMLDivElement>(null);

  // Load from local storage if key is provided
  useEffect(() => {
    if (storageKey) {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed)) setSize(parsed);
      }
    }
  }, [storageKey]);

  const startResizing = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
    if (storageKey) {
      localStorage.setItem(storageKey, size.toString());
    }
  }, [size, storageKey]);

  const resize = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!isResizing) return;

      let newSize: number;
      if (direction === "horizontal") {
        const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
        newSize = clientX;
      } else {
        const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
        newSize = clientY;
      }

      if (newSize >= minSize && newSize <= maxSize) {
        setSize(newSize);
      }
    },
    [isResizing, direction, minSize, maxSize]
  );

  useEffect(() => {
    if (isResizing) {
      window.addEventListener("mousemove", resize);
      window.addEventListener("mouseup", stopResizing);
      window.addEventListener("touchmove", resize);
      window.addEventListener("touchend", stopResizing);
    } else {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
      window.removeEventListener("touchmove", resize);
      window.removeEventListener("touchend", stopResizing);
    }

    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
      window.removeEventListener("touchmove", resize);
      window.removeEventListener("touchend", stopResizing);
    };
  }, [isResizing, resize, stopResizing]);

  return { size, isResizing, startResizing };
}
