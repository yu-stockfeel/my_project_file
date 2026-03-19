"use client";

import { useState, useEffect } from "react";
import {
  BookOpen,
  Search,
  Library,
  Settings,
  ChevronLeft,
  ChevronRight,
  Headphones,
  GripVertical,
  LogOut,
  User,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useResizable } from "@/hooks/useResizable";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { icon: Headphones, label: "學習", href: "/" },
  { icon: Library, label: "筆記", href: "/notes" },
  { icon: Search, label: "搜尋", href: "/search" },
  { icon: BookOpen, label: "單字本", href: "/vocabulary" },
  { icon: Settings, label: "設定", href: "/settings" },
];

export default function Sidebar({ onOpenSearch }: { onOpenSearch?: () => void }) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut, loading } = useAuth();

  // Use resizable hook for sidebar width
  const { size: width, startResizing, isResizing } = useResizable({
    initialSize: 224, // Default w-56
    minSize: 150,
    maxSize: 450,
    direction: "horizontal",
    storageKey: "sidebar-width",
  });

  const activeWidth = collapsed ? 64 : width;

  return (
    <aside
      style={{ width: `${activeWidth}px` }}
      className={`relative hidden md:flex flex-col glass-strong h-full border-r border-[var(--color-border)] shrink-0 group/sidebar ${
        isResizing ? "" : "transition-[width] duration-300 ease-in-out"
      }`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-[var(--color-border)] overflow-hidden">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--color-accent-pink)] to-[var(--color-accent-blue)] flex items-center justify-center shrink-0">
          <span className="text-white text-sm font-bold">N</span>
        </div>
        {!collapsed && activeWidth > 120 && (
          <span className="font-bold text-lg tracking-tight text-[var(--color-text-primary)] animate-fade-in whitespace-nowrap">
            NihoNote
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-hidden">
        {navItems.map(({ icon: Icon, label, href }) => {
          const isActive = pathname === href;
          if (href === "/search") {
            return (
              <button
                key={href}
                onClick={onOpenSearch}
                className="w-full flex items-center justify-start gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group/nav text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-card-hover)] hover:text-[var(--color-text-primary)] text-left"
              >
                <Icon
                  size={20}
                  className="transition-colors shrink-0 group-hover/nav:text-[var(--color-text-primary)]"
                />
                {!collapsed && activeWidth > 120 && (
                  <span className="text-sm font-medium truncate animate-fade-in">
                    {label}
                  </span>
                )}
              </button>
            );
          }
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group/nav ${
                isActive
                  ? "bg-[var(--color-accent-blue-light)] text-[var(--color-accent-blue)]"
                  : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-card-hover)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              <Icon
                size={20}
                className={`transition-colors shrink-0 ${
                  isActive ? "text-[var(--color-accent-blue)]" : "group/nav-hover:text-[var(--color-text-primary)]"
                }`}
              />
              {!collapsed && activeWidth > 120 && (
                <span className="text-sm font-medium truncate animate-fade-in">
                  {label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Session Widget */}
      <div className="p-3 border-t border-[var(--color-border)]">
        {!loading && user ? (
          <div className="flex items-center gap-3 p-2 rounded-lg bg-[var(--color-bg-card)] border border-[var(--color-border)]">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[var(--color-accent-pink)] to-[var(--color-accent-blue)] flex items-center justify-center shrink-0">
              <User size={16} className="text-white" />
            </div>
            {!collapsed && activeWidth > 120 && (
              <div className="flex-1 min-w-0 animate-fade-in flex items-center justify-between">
                <span className="text-xs font-medium text-[var(--color-text-primary)] truncate">
                  {user.email?.split("@")[0]}
                </span>
                <button
                  onClick={async () => {
                    await signOut();
                    router.refresh();
                  }}
                  className="p-1.5 text-[var(--color-text-muted)] hover:text-red-400 transition-colors"
                  title="登出"
                >
                  <LogOut size={16} />
                </button>
              </div>
            )}
          </div>
        ) : !loading && !user ? (
          <Link
            href="/login"
            className={`flex items-center justify-center gap-2 p-2.5 rounded-lg bg-[var(--color-accent-blue)]/10 text-[var(--color-accent-blue)] hover:bg-[var(--color-accent-blue)] hover:text-white transition-all ${
              collapsed || activeWidth <= 120 ? "px-0" : ""
            }`}
          >
            <User size={18} />
            {!collapsed && activeWidth > 120 && (
              <span className="text-sm font-semibold animate-fade-in">登入 / 註冊</span>
            )}
          </Link>
        ) : null}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-center py-3 border-t border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
      >
        {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </button>

      {/* Resizer Handle */}
      {!collapsed && (
        <div
          onMouseDown={startResizing}
          onPointerDown={startResizing} // For touch support
          className={`absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-[var(--color-accent-blue)]/50 transition-colors z-50 flex items-center justify-center group/resizer ${
            isResizing ? "bg-[var(--color-accent-blue)] w-0.5" : ""
          }`}
        >
          <div className="opacity-0 group-hover/sidebar:opacity-100 transition-opacity">
             <GripVertical size={12} className="text-[var(--color-text-muted)] -mr-1" />
          </div>
        </div>
      )}
    </aside>
  );
}
