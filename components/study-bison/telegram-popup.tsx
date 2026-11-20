"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  BellRing,
  BookOpen,
  CheckCircle2,
  Send,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { TELEGRAM_CHANNEL_HANDLE, TELEGRAM_CHANNEL_URL } from "@/lib/telegram";

const JOINED_KEY = "elite-study:telegram-joined";
const DISMISSED_KEY = "elite-study:telegram-dismissed";

/** Premium Telegram invite, displayed five seconds after the page opens. */
export function TelegramPopup() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (
        window.localStorage.getItem(JOINED_KEY) ||
        window.sessionStorage.getItem(DISMISSED_KEY)
      ) {
        return;
      }
    } catch {
      // Storage may be unavailable in private browsing; the popup can still show.
    }

    const timer = window.setTimeout(() => setVisible(true), 5000);
    return () => window.clearTimeout(timer);
  }, []);

  const dismiss = () => {
    try {
      window.sessionStorage.setItem(DISMISSED_KEY, "1");
    } catch {
      // Ignore storage restrictions.
    }
    setVisible(false);
  };

  const join = () => {
    try {
      window.localStorage.setItem(JOINED_KEY, "1");
    } catch {
      // Opening the channel should still work without storage access.
    }
    window.open(TELEGRAM_CHANNEL_URL, "_blank", "noopener,noreferrer");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-[#06110e]/80 p-4 backdrop-blur-lg"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="telegram-title"
        aria-describedby="telegram-description"
        className="relative my-auto w-full max-w-[450px] overflow-hidden rounded-[2rem] border border-[#d8b66d]/35 bg-[#0b1916] text-white shadow-[0_32px_110px_rgba(0,0,0,.65)] sb-fade-up"
      >
        <div className="relative isolate overflow-hidden bg-gradient-to-br from-[#153e31] via-[#10503e] to-[#09271f] px-6 pb-7 pt-7 sm:px-8">
          <div className="pointer-events-none absolute -right-12 -top-16 h-56 w-56 rounded-full border border-[#f0d69b]/20" />
          <div className="pointer-events-none absolute -right-1 -top-7 h-40 w-40 rounded-full border border-[#f0d69b]/15" />
          <div className="pointer-events-none absolute -bottom-24 left-1/4 h-52 w-52 rounded-full bg-[#d8b66d]/20 blur-3xl" />
          <div className="pointer-events-none absolute -left-16 top-24 h-40 w-40 rounded-full bg-[#2cb58b]/15 blur-3xl" />

          <button
            type="button"
            onClick={dismiss}
            aria-label="Close Telegram invitation"
            className="absolute right-5 top-5 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/15 text-white/75 transition hover:border-white/35 hover:bg-white/10 hover:text-white"
          >
            <X size={18} />
          </button>

          <div className="relative flex items-center gap-3">
            <div className="relative flex h-[66px] w-[66px] shrink-0 items-center justify-center rounded-[1.35rem] border border-[#f0d69b]/35 bg-gradient-to-br from-[#f2d28e] to-[#b8863b] text-[#14382d] shadow-[0_12px_30px_rgba(0,0,0,.28)]">
              <Send size={30} fill="currentColor" strokeWidth={1.35} />
              <span className="absolute -bottom-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#124533] bg-white text-[#168b68]">
                <ShieldCheck size={14} />
              </span>
            </div>
            <div className="min-w-0 pr-9">
              <p className="text-[10px] font-black uppercase tracking-[.22em] text-[#f0d69b]">
                Elite Study Community
              </p>
              <p className="mt-1 truncate text-sm font-extrabold text-white">
                Official Telegram Channel
              </p>
              <p className="mt-0.5 text-xs font-semibold text-white/65">
                {TELEGRAM_CHANNEL_HANDLE}
              </p>
            </div>
          </div>

          <div className="relative mt-7 inline-flex items-center gap-2 rounded-full border border-[#f0d69b]/30 bg-[#f0d69b]/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[.16em] text-[#ffe7b1]">
            <Sparkles size={12} />
            Learn · Practice · Grow
          </div>

          <h2
            id="telegram-title"
            className="relative mt-4 max-w-sm text-[2rem] font-black leading-[1.08] tracking-tight sm:text-[2.2rem]"
          >
            Don&apos;t miss a
            <span className="block bg-gradient-to-r from-[#f5d995] to-[#fff0c9] bg-clip-text text-transparent">
              single update.
            </span>
          </h2>
          <p
            id="telegram-description"
            className="relative mt-3 max-w-sm text-sm leading-6 text-white/75"
          >
            Join our official Telegram channel for learning updates, new study
            material and important announcements.
          </p>
        </div>

        <div className="bg-gradient-to-b from-[#10231d] to-[#0b1916] px-6 pb-7 pt-5 sm:px-8">
          <div className="rounded-2xl border border-amber-400/35 bg-amber-400/[0.09] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,.04)]">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-300/15 text-amber-300">
                <AlertTriangle size={19} />
              </span>
              <div>
                <p className="text-[11px] font-black uppercase tracking-[.15em] text-amber-200">
                  Important notice
                </p>
                <p className="mt-1.5 text-sm font-extrabold leading-5 text-white">
                  Join our Telegram channel to receive every important update.
                </p>
                <p className="mt-1 text-[11px] leading-5 text-amber-100/65">
                  Get updates about new lectures, notes and announcements in one place.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
            <div className="flex items-center gap-2.5 rounded-xl border border-white/[0.08] bg-white/[0.035] px-3 py-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#229ed9]/15 text-[#69d0fa]">
                <BookOpen size={16} />
              </span>
              <span className="text-xs font-bold text-white/90">Lectures & notes</span>
              <CheckCircle2 size={15} className="ml-auto shrink-0 text-emerald-400" />
            </div>
            <div className="flex items-center gap-2.5 rounded-xl border border-white/[0.08] bg-white/[0.035] px-3 py-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#d8b66d]/15 text-[#f0d69b]">
                <BellRing size={16} />
              </span>
              <span className="text-xs font-bold text-white/90">Important alerts</span>
              <CheckCircle2 size={15} className="ml-auto shrink-0 text-emerald-400" />
            </div>
          </div>

          <button
            type="button"
            onClick={join}
            className="mt-5 flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#229ed9] to-[#147fba] px-5 py-4 text-sm font-black text-white shadow-[0_12px_30px_rgba(34,158,217,.28)] transition duration-200 hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0"
          >
            <Send size={17} fill="currentColor" />
            Join Telegram now
            <ArrowUpRight size={17} />
          </button>
          <button
            type="button"
            onClick={dismiss}
            className="mt-2.5 flex h-10 w-full items-center justify-center rounded-xl text-xs font-bold text-white/45 transition hover:bg-white/[0.04] hover:text-white/80"
          >
            Maybe later
          </button>
          <p className="mt-1 text-center text-[10px] text-white/35">
            You can continue browsing Elite Study anytime.
          </p>
        </div>
      </section>
    </div>
  );
}
