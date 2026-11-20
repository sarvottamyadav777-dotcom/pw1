"use client";

import { useEffect, useState } from "react";
import { BookOpen, Building2, GraduationCap, Home, Info, Menu, Send, X } from "lucide-react";
import { useApp } from "@/lib/store";
import { TELEGRAM_CHANNEL_URL } from "@/lib/telegram";
import { ThemeToggle } from "./theme-toggle";

export function SiteHeader() {
  const { navigate, view, institutionId, institutionName } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);

  const goStudy = () => {
    navigate({
      view: "home",
      institutionId: institutionId || "physics-wallah",
      institutionName: institutionName || "Physics Wallah",
    });
    setMenuOpen(false);
  };

  const goBatches = () => {
    navigate({
      view: "dashboard",
      institutionId: institutionId || "physics-wallah",
      institutionName: institutionName || "Physics Wallah",
    });
    setMenuOpen(false);
  };

  const goInstitutions = () => {
    navigate({ view: "institutions" });
    setMenuOpen(false);
  };

  const goAbout = () => {
    navigate({ view: "about" });
    setMenuOpen(false);
  };

  useEffect(() => {
    if (!menuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  useEffect(() => setMenuOpen(false), [view]);

  return (
    <>
      <header className="sb-nav-static border-b border-[#e7edf5] bg-white/95 px-3 py-2.5 backdrop-blur-xl dark:border-[#293750] dark:bg-[#10192b]/95 sm:px-5">
        <div className="mx-auto flex min-h-[60px] w-full max-w-7xl items-center gap-3 rounded-2xl border border-[#edf1f7] bg-white px-3 shadow-[0_5px_22px_rgba(28,51,88,.06)] dark:border-[#293750] dark:bg-[#121c30] sm:min-h-[66px] sm:px-4">
          <button type="button" onClick={goStudy} className="group flex min-w-0 shrink-0 items-center gap-2.5 text-left" aria-label="Open Elite Study">
            <span className="h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-[#e8e0ca] bg-[#f6f1e5] sm:h-11 sm:w-11">
              <img src="/elite-study-mark.png" alt="Elite Study emblem" className="h-full w-full object-cover" />
            </span>
            <span className="flex min-w-0 flex-col leading-none">
              <span className="truncate text-[12px] font-black tracking-[0.08em] text-[#183052] dark:text-[#e8eef9] sm:text-sm">ELITE STUDY</span>
              <span className="mt-1 text-[8px] font-extrabold tracking-[.12em] text-[#8b96a9] sm:text-[9px]">WITH SACHINCODERX</span>
            </span>
          </button>

          <div className="min-w-0 flex-1" />

          <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
            <button type="button" onClick={goStudy} aria-current={view === "home" ? "page" : undefined} className={`inline-flex h-10 items-center gap-2 rounded-xl px-3 text-xs font-bold transition hover:bg-[#f4f6fb] hover:text-[#315fce] dark:text-[#a8b6cc] dark:hover:bg-[#1a2740] dark:hover:text-[#a9c5ff] ${view === "home" ? "bg-[#eef2ff] text-[#315fce] dark:bg-[#1d2a48] dark:text-[#a9c5ff]" : "text-[#52627c]"}`}><BookOpen size={15} /> Study</button>
            <button type="button" onClick={goBatches} aria-current={view === "dashboard" ? "page" : undefined} className={`inline-flex h-10 items-center gap-2 rounded-xl px-3 text-xs font-bold transition hover:bg-[#f4f6fb] hover:text-[#315fce] dark:text-[#a8b6cc] dark:hover:bg-[#1a2740] dark:hover:text-[#a9c5ff] ${view === "dashboard" ? "bg-[#eef2ff] text-[#315fce] dark:bg-[#1d2a48] dark:text-[#a9c5ff]" : "text-[#52627c]"}`}><GraduationCap size={15} /> Batches</button>
            <button type="button" onClick={goInstitutions} aria-current={view === "institutions" ? "page" : undefined} className="inline-flex h-10 items-center gap-2 rounded-xl px-3 text-xs font-bold text-[#52627c] transition hover:bg-[#f4f6fb] hover:text-[#315fce] dark:text-[#a8b6cc] dark:hover:bg-[#1a2740] dark:hover:text-[#a9c5ff]"><Building2 size={15} /> Institution</button>
            <button type="button" onClick={goAbout} aria-current={view === "about" ? "page" : undefined} className="inline-flex h-10 items-center gap-2 rounded-xl px-3 text-xs font-bold text-[#52627c] transition hover:bg-[#f4f6fb] hover:text-[#315fce] dark:text-[#a8b6cc] dark:hover:bg-[#1a2740] dark:hover:text-[#a9c5ff]"><Info size={15} /> About</button>
          </nav>

          <a href={TELEGRAM_CHANNEL_URL} target="_blank" rel="noreferrer" aria-label="Join Telegram community" title="Telegram community" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#eaf7fd] text-[#1689c7] shadow-sm transition hover:-translate-y-0.5 hover:bg-[#dff2fc] dark:bg-[#17334a] dark:text-[#8ed5ff] dark:hover:bg-[#1b405b]">
            <Send size={16} />
          </a>
          <span className="hidden md:inline-flex"><ThemeToggle /></span>
          <button type="button" onClick={() => setMenuOpen(true)} aria-label="Open navigation menu" aria-expanded={menuOpen} aria-controls="mobile-navigation" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#e3e9f2] bg-white text-[#233a60] transition hover:bg-[#f5f7fb] dark:border-[#293750] dark:bg-[#172238] dark:text-[#e8eef9] md:hidden">
            <Menu size={19} />
          </button>
        </div>
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-[90] bg-[#060c18]/70 backdrop-blur-sm md:hidden" onClick={() => setMenuOpen(false)}>
          <aside id="mobile-navigation" role="dialog" aria-modal="true" aria-label="Main menu" onClick={(event) => event.stopPropagation()} className="flex h-[100dvh] w-[min(88vw,380px)] flex-col overflow-y-auto bg-[#0d1324] px-5 pb-8 pt-5 text-white shadow-[20px_0_60px_rgba(0,0,0,.3)] sb-fade-up">
            <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-6">
              <div className="flex min-w-0 items-center gap-3">
                <span className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-[#f6f1e5]"><img src="/elite-study-mark.png" alt="Elite Study" className="h-full w-full object-cover" /></span>
                <span className="min-w-0"><strong className="block text-lg font-black tracking-tight">Elite Study</strong><small className="mt-1 block text-[9px] font-extrabold tracking-[.14em] text-[#9da9c2]">WITH SACHINCODERX</small></span>
              </div>
              <button type="button" onClick={() => setMenuOpen(false)} aria-label="Close navigation menu" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[.05] text-white/75 transition hover:bg-white/10"><X size={19} /></button>
            </div>

            <div className="mt-9">
              <p className="px-2 text-[10px] font-black uppercase tracking-[.2em] text-[#8290ad]">Learn online</p>
              <button type="button" onClick={goStudy} className={`mt-3 flex min-h-16 w-full items-center gap-4 rounded-2xl px-3 text-left text-[17px] font-extrabold transition hover:bg-white/[.06] ${view === "home" ? "bg-[#1c2d4d] text-[#75adff]" : "text-[#e6ebf7]"}`}><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/[.06] text-[#b9c9f2]"><Home size={21} /></span> Study</button>
            </div>

            <div className="mt-8">
              <p className="px-2 text-[10px] font-black uppercase tracking-[.2em] text-[#8290ad]">Study packs</p>
              <button type="button" onClick={goBatches} className={`mt-3 flex min-h-16 w-full items-center gap-4 rounded-2xl px-3 text-left text-[17px] font-extrabold transition hover:bg-[#243a61] ${view === "dashboard" ? "bg-[#1c2d4d] text-[#75adff]" : "text-[#d4dced]"}`}><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/[.06] text-[#82b7ff]"><GraduationCap size={22} /></span> Batches</button>
              <button type="button" onClick={goInstitutions} className="mt-2 flex min-h-14 w-full items-center gap-4 rounded-2xl px-3 text-left text-[15px] font-bold text-[#d4dced] transition hover:bg-white/[.06]"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[.05] text-[#9eabc5]"><Building2 size={19} /></span> Change institution</button>
            </div>

            <div className="mt-8">
              <p className="px-2 text-[10px] font-black uppercase tracking-[.2em] text-[#8290ad]">Community</p>
              <a href={TELEGRAM_CHANNEL_URL} target="_blank" rel="noreferrer" onClick={() => setMenuOpen(false)} className="mt-3 flex min-h-14 items-center gap-4 rounded-2xl px-3 text-[15px] font-bold text-[#d4dced] transition hover:bg-white/[.06]"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[.05] text-[#9eabc5]"><Send size={19} /></span> Community</a>
              <button type="button" onClick={goAbout} className="mt-1 flex min-h-14 w-full items-center gap-4 rounded-2xl px-3 text-left text-[15px] font-bold text-[#d4dced] transition hover:bg-white/[.06]"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[.05] text-[#9eabc5]"><Info size={19} /></span> About</button>
            </div>

            <div className="mt-8 border-t border-white/10 pt-5">
              <p className="px-2 text-[10px] font-black uppercase tracking-[.2em] text-[#8290ad]">Settings</p>
              <ThemeToggle variant="row" />
            </div>

            <div className="mt-auto border-t border-white/10 pt-6">
              <p className="text-center text-[10px] font-bold tracking-[.16em] text-[#7785a1]">LEARN · PRACTICE · GROW</p>
              <p className="mt-2 text-center text-[10px] text-[#65738f]">© {new Date().getFullYear()} Elite Study</p>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
