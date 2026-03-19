"use client";

import {
  Headphones,
  Library,
  Search,
  BookOpen,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { icon: Headphones, label: "學習", href: "/" },
  { icon: Library, label: "筆記", href: "/notes" },
  { icon: Search, label: "搜尋", href: "/search" },
  { icon: BookOpen, label: "單字本", href: "/vocabulary" },
  { icon: Settings, label: "設定", href: "/settings" },
];

export default function MobileNav({ onOpenSearch }: { onOpenSearch?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass-strong border-t border-[var(--color-border)]">
      <div className="flex items-center justify-around py-2 px-1">
        {navItems.map(({ icon: Icon, label, href }) => {
          if (href === "/search") {
            return (
              <button
                key={href}
                onClick={onOpenSearch}
                className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-all text-[var(--color-text-muted)]"
              >
                <Icon size={20} />
                <span className="text-[10px] font-medium">{label}</span>
              </button>
            );
          }
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-all ${
                isActive
                  ? "text-[var(--color-accent-blue)]"
                  : "text-[var(--color-text-muted)]"
              }`}
            >
              <Icon size={20} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
