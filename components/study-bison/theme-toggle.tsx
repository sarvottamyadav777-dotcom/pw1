"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

/** A shared, persisted light/dark switch for the study app. */
export function ThemeToggle({ variant = "icon" }: { variant?: "icon" | "row" }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = mounted && theme === "dark";
  const toggle = () => setTheme(isDark ? "light" : "dark");

  if (variant === "row") {
    return (
      <button
        type="button"
        onClick={toggle}
        aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
        aria-pressed={isDark}
        className="flex min-h-14 w-full items-center justify-between gap-3 rounded-2xl px-3 text-left text-sm font-bold text-current transition hover:bg-black/[.04] dark:hover:bg-white/[.06]"
      >
        <span className="flex items-center gap-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-black/[.05] text-current dark:bg-white/[.07]">
            {isDark ? <Sun size={19} /> : <Moon size={19} />}
          </span>
          {isDark ? "Light Mode" : "Dark Mode"}
        </span>
        <span className={cn("relative h-7 w-12 rounded-full p-1 transition-colors", isDark ? "bg-[#7655db]" : "bg-[#aeb8c8]")}>
          <span className={cn("theme-toggle-thumb block h-5 w-5 rounded-full bg-white shadow-sm transition-transform", isDark ? "translate-x-5" : "translate-x-0")} />
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      aria-pressed={isDark}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#e1e7f0] bg-white text-[#263a5c] shadow-sm transition hover:-translate-y-0.5 hover:border-[#c5d1e5] hover:bg-[#f6f8fc] dark:border-[#2a3954] dark:bg-[#172238] dark:text-[#e8eef9] dark:hover:bg-[#202d45]"
    >
      {isDark ? <Sun size={17} /> : <Moon size={17} />}
    </button>
  );
}
