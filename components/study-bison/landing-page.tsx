"use client";

import { useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  BookText,
  CalendarDays,
  CheckCircle2,
  Menu,
  X,
  MonitorPlay,
  PlayCircle,
  Send,
  Sparkles,
  Target,
  Trophy,
} from "lucide-react";
import { useApp } from "@/lib/store";
import { TELEGRAM_CHANNEL_HANDLE, TELEGRAM_CHANNEL_URL } from "@/lib/telegram";
import { TelegramPopup } from "./telegram-popup";
import { ThemeToggle } from "./theme-toggle";

const features = [
  { icon: MonitorPlay, title: "Live classes", description: "Quality lectures, organized in one place." },
  { icon: BookText, title: "Notes & PDFs", description: "Keep your study material close and easy to revisit." },
  { icon: Target, title: "Tests & practice", description: "Build confidence with focused practice." },
  { icon: Trophy, title: "Track your growth", description: "Stay consistent and keep moving forward." },
];

export function LandingPage() {
  const { navigate } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const openInstitutions = () => {
    setMobileMenuOpen(false);
    navigate({ view: "institutions" });
  };

  return (
    <main className="elite-landing min-h-screen overflow-hidden bg-[#f8fbff] text-[#14233f] dark:bg-[#0a1020] dark:text-[#e8eef9]">
      <header className="relative z-20 border-b border-[#e8edf6] bg-white/90 backdrop-blur-xl dark:border-[#293750] dark:bg-[#10192b]/95">
        <div className="mx-auto flex min-h-[76px] w-full max-w-7xl items-center justify-between gap-3 px-4 sm:px-7 lg:px-10">
          <a href="#top" className="flex min-w-0 items-center gap-2.5" aria-label="Elite Study home">
            <span className="h-12 w-12 shrink-0 overflow-hidden rounded-2xl border border-[#e8e0ca] bg-[#f6f1e5] shadow-sm sm:h-[54px] sm:w-[54px]">
              <img src="/elite-study-mark.png" alt="Elite Study emblem" className="h-full w-full object-cover" />
            </span>
            <span className="min-w-0 leading-tight">
              <span className="block truncate text-[15px] font-black tracking-[.08em] text-[#14294c] sm:text-lg">ELITE STUDY</span>
              <span className="mt-1 block text-[9px] font-bold tracking-[.16em] text-[#7c8aa3]">WITH SACHINCODERX</span>
            </span>
          </a>

          <nav className="hidden items-center gap-7 text-sm font-semibold text-[#687791] lg:flex" aria-label="Main navigation">
            <a href="#features" className="transition hover:text-[#315ee8]">Features</a>
            <a href="#institutions" className="transition hover:text-[#315ee8]">Institutions</a>
            <a href={TELEGRAM_CHANNEL_URL} target="_blank" rel="noreferrer" className="transition hover:text-[#315ee8]">Community</a>
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <ThemeToggle />
            <a href={TELEGRAM_CHANNEL_URL} target="_blank" rel="noreferrer" aria-label={`Join Telegram ${TELEGRAM_CHANNEL_HANDLE}`} className="hidden h-10 items-center justify-center gap-2 rounded-xl border border-[#d7e8fb] bg-[#eff7ff] px-3 text-xs font-extrabold text-[#1689c7] transition hover:-translate-y-0.5 hover:bg-[#e4f2ff] sm:inline-flex sm:px-4 sm:text-sm">
              <Send size={15} /> <span>Telegram</span>
            </a>
            <button type="button" onClick={openInstitutions} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#7652e8] to-[#4268e9] px-3.5 text-xs font-extrabold text-white shadow-[0_9px_22px_rgba(93,83,221,.2)] transition hover:-translate-y-0.5 sm:px-5 sm:text-sm">
              Get started <ArrowRight size={15} />
            </button>
            <button type="button" onClick={() => setMobileMenuOpen((open) => !open)} aria-label={mobileMenuOpen ? "Close menu" : "Open menu"} aria-expanded={mobileMenuOpen} className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#e1e7f0] bg-white text-[#20385e] lg:hidden">
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <nav className="border-t border-[#e8edf6] bg-white px-4 py-3 shadow-lg lg:hidden" aria-label="Mobile navigation">
            <div className="mx-auto flex max-w-7xl flex-col gap-1">
              <a href="#top" onClick={() => setMobileMenuOpen(false)} className="rounded-xl px-3 py-3 text-sm font-bold text-[#536681] hover:bg-[#f5f7fc]">Home</a>
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="rounded-xl px-3 py-3 text-sm font-bold text-[#536681] hover:bg-[#f5f7fc]">Features</a>
              <a href="#institutions" onClick={() => setMobileMenuOpen(false)} className="rounded-xl px-3 py-3 text-sm font-bold text-[#536681] hover:bg-[#f5f7fc]">Courses & institutions</a>
              <a href={TELEGRAM_CHANNEL_URL} target="_blank" rel="noreferrer" onClick={() => setMobileMenuOpen(false)} className="rounded-xl px-3 py-3 text-sm font-bold text-[#1689c7] hover:bg-[#f5f7fc]">Community</a>
              <div className="mt-2 border-t border-[#e8edf6] pt-2 dark:border-[#2a3954]"><ThemeToggle variant="row" /></div>
            </div>
          </nav>
        )}
      </header>

      <section id="top" className="relative isolate overflow-hidden bg-[radial-gradient(ellipse_at_20%_0%,#edf2ff_0%,#f8faff_48%,#ffffff_100%)] px-4 pb-12 pt-6 dark:bg-[#0a1020] sm:px-7 sm:pb-20 sm:pt-12">
        <div className="pointer-events-none absolute -left-28 top-24 h-72 w-72 rounded-full bg-[#cfe0ff]/45 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 top-40 h-80 w-80 rounded-full bg-[#e4dcff]/55 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[.92fr_1.08fr] lg:gap-14">
          <div className="relative z-10 order-2 text-center sb-fade-up lg:order-1 lg:text-left">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#dce7fb] bg-white/85 px-4 py-2 text-xs font-extrabold text-[#3264d8] shadow-sm sm:text-sm">
              <Sparkles size={15} className="fill-[#3264d8]/15" /> Learn · Practice · Grow
            </span>
            <p className="mt-4 text-[10px] font-black tracking-[.2em] text-[#8a96aa]">WITH SACHINCODERX</p>
            <h1 className="mx-auto mt-5 max-w-3xl text-[clamp(2.8rem,7vw,5.4rem)] font-black leading-[.98] tracking-[-.065em] text-[#14294c] dark:text-[#e8eef9] lg:mx-0">
              Your Study
              <span className="block elite-gradient-text">Companion,</span>
              <span className="block">Always.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-base leading-8 text-[#6c7b95] dark:text-[#a8b6cc] sm:text-lg sm:leading-8 lg:mx-0">
              Learn, practice and stay consistent. Explore courses, video lectures, study material and tests — all in one focused learning space.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
              <button type="button" onClick={openInstitutions} className="inline-flex h-14 items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-[#7652e8] to-[#4268e9] px-8 text-base font-extrabold text-white shadow-[0_14px_30px_rgba(91,85,220,.23)] transition hover:-translate-y-1 hover:brightness-105">
                Start Learning <ArrowRight size={19} />
              </button>
              <a href="#features" className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl border border-[#d8e2f1] bg-white px-8 text-sm font-extrabold text-[#5264a8] dark:border-[#344563] dark:bg-[#172238] dark:text-[#d5def0] shadow-sm transition hover:-translate-y-0.5 hover:border-[#b7c9ed]">
                Explore Features <ArrowUpRight size={17} />
              </a>
            </div>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-3 text-[11px] font-bold text-[#71809a] lg:justify-start">
              <span className="inline-flex items-center gap-2"><CheckCircle2 size={15} className="text-[#2b9b72]" /> Structured courses</span>
              <span className="inline-flex items-center gap-2"><CheckCircle2 size={15} className="text-[#2b9b72]" /> Lectures & notes</span>
              <span className="inline-flex items-center gap-2"><CheckCircle2 size={15} className="text-[#2b9b72]" /> Mobile friendly</span>
            </div>
          </div>

          <div className="relative mx-auto order-1 w-full max-w-[720px] sb-fade-up [animation-delay:120ms] lg:order-2">
            <div className="absolute -inset-5 rounded-[2.5rem] bg-gradient-to-r from-[#dceaff] via-[#eee8ff] to-[#d9f0ff] blur-2xl" />
            <div className="relative overflow-hidden rounded-[1.8rem] border border-white bg-white p-1.5 shadow-[0_24px_70px_rgba(48,82,145,.16)] sm:rounded-[2.3rem] sm:p-3">
              <div className="relative overflow-hidden rounded-[1.4rem] bg-[#111b34]">
                <img src="/hero-study-illustration.jpg" alt="A student studying at a desk with books and a laptop" className="aspect-[16/10] w-full object-cover" fetchPriority="high" />
              </div>
              <div className="grid grid-cols-3 gap-2 p-2 pt-3 sm:gap-3 sm:p-4">
                <div className="rounded-xl bg-[#f1f5ff] p-3 text-center"><MonitorPlay size={18} className="mx-auto text-[#416bd4]" /><p className="mt-1.5 text-[10px] font-extrabold text-[#334d7d]">Lectures</p></div>
                <div className="rounded-xl bg-[#f3efff] p-3 text-center"><BookText size={18} className="mx-auto text-[#8058d7]" /><p className="mt-1.5 text-[10px] font-extrabold text-[#574582]">Study Material</p></div>
                <div className="rounded-xl bg-[#eaf8f3] p-3 text-center"><Target size={18} className="mx-auto text-[#26936b]" /><p className="mt-1.5 text-[10px] font-extrabold text-[#286d55]">Practice</p></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20 lg:px-10">
        <div className="mx-auto mb-9 max-w-2xl text-center">
          <p className="text-[11px] font-black uppercase tracking-[.24em] text-[#4774d8]">Everything in one place</p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-[#172d50] dark:text-[#e8eef9] sm:text-4xl">Tools that make learning easier.</h2>
          <p className="mt-3 text-sm leading-7 text-[#74829a] dark:text-[#a8b6cc]">A simple learning space designed to help you stay focused, organized and consistent.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {features.map(({ icon: Icon, title, description }) => (
            <article key={title} className="rounded-[1.5rem] border border-[#e5ebf4] bg-white p-6 shadow-[0_8px_26px_rgba(32,57,101,.045)] transition hover:-translate-y-1 hover:shadow-[0_16px_35px_rgba(32,57,101,.09)] dark:border-[#293750] dark:bg-[#121c30]">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#edf3ff] text-[#3769d4]"><Icon size={22} /></span>
              <h3 className="mt-5 text-base font-extrabold text-[#1b3154] dark:text-[#e8eef9]">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-[#7c899f] dark:text-[#a8b6cc]">{description}</p>
            </article>
          ))}
        </div>
        <div className="mt-8 grid gap-3 border-t border-[#e7edf5] pt-7 sm:grid-cols-3">
          <div className="flex items-center gap-3 rounded-2xl px-3 py-2"><span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#edf3ff] text-[#3268d6]"><PlayCircle size={20} /></span><div><p className="text-sm font-extrabold text-[#20385e]">Video lectures</p><p className="text-xs text-[#8592a8]">Learn from educators</p></div></div>
          <div className="flex items-center gap-3 rounded-2xl px-3 py-2"><span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#e9f8fc] text-[#2695b8]"><BookText size={20} /></span><div><p className="text-sm font-extrabold text-[#20385e]">Notes & PDFs</p><p className="text-xs text-[#8592a8]">Study material</p></div></div>
          <div className="flex items-center gap-3 rounded-2xl px-3 py-2"><span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f2edff] text-[#8057d9]"><CalendarDays size={20} /></span><div><p className="text-sm font-extrabold text-[#20385e]">Practice & tests</p><p className="text-xs text-[#8592a8]">Check your progress</p></div></div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-14 sm:px-8 sm:pb-20 lg:px-10">
        <div className="relative isolate overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#101a30] via-[#1a2d50] to-[#32255d] p-6 text-white shadow-[0_22px_60px_rgba(24,42,84,.16)] sm:p-9 lg:p-11">
          <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-[#8c68ef]/25 blur-3xl" />
          <div className="relative grid gap-8 lg:grid-cols-[1fr_.9fr] lg:items-center">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[.24em] text-[#b8c7f1]">Make every session count</p>
              <h2 className="mt-3 max-w-xl text-3xl font-black leading-tight tracking-tight text-white sm:text-4xl">Your next study session starts here.</h2>
              <p className="mt-3 max-w-lg text-sm leading-7 text-[#d0d9ed]">Choose a batch, open a lecture and keep your notes and practice material close — all from one simple dashboard.</p>
              <button type="button" onClick={openInstitutions} className="mt-6 inline-flex h-12 items-center gap-2 rounded-xl bg-white px-5 text-sm font-extrabold text-[#233b70] shadow-sm transition hover:-translate-y-0.5 hover:bg-[#f1f4ff]">Explore batches <ArrowRight size={16} /></button>
            </div>
            <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/[.08] p-3 text-center backdrop-blur sm:p-4"><span className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-[#dce8ff] text-[#3569d2]"><PlayCircle size={20} /></span><p className="mt-3 text-[11px] font-extrabold text-white sm:text-xs">Watch</p><p className="mt-1 text-[9px] leading-4 text-[#bdc9e1]">Video lessons</p></div>
              <div className="rounded-2xl border border-white/10 bg-white/[.08] p-3 text-center backdrop-blur sm:p-4"><span className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-[#eee5ff] text-[#8058d7]"><BookText size={20} /></span><p className="mt-3 text-[11px] font-extrabold text-white sm:text-xs">Revise</p><p className="mt-1 text-[9px] leading-4 text-[#bdc9e1]">Notes & PDFs</p></div>
              <div className="rounded-2xl border border-white/10 bg-white/[.08] p-3 text-center backdrop-blur sm:p-4"><span className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-[#d9f5eb] text-[#218b68]"><CalendarDays size={20} /></span><p className="mt-3 text-[11px] font-extrabold text-white sm:text-xs">Practice</p><p className="mt-1 text-[9px] leading-4 text-[#bdc9e1]">Tests & progress</p></div>
            </div>
          </div>
        </div>
      </section>

      <section id="institutions" className="border-y border-[#e8edf5] bg-white px-5 py-14 dark:border-[#293750] dark:bg-[#10192b] sm:px-8 sm:py-20 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl">
              <span className="inline-flex rounded-full border border-[#dce7fb] bg-[#f4f8ff] px-4 py-2 text-xs font-extrabold text-[#386bd3]">Our Partners</span>
              <h2 className="mt-4 text-4xl font-black leading-[1.05] tracking-tight text-[#172d50] dark:text-[#e8eef9] sm:text-5xl">Trusted <span className="elite-gradient-text">Platforms</span></h2>
              <p className="mt-4 max-w-md text-sm leading-7 text-[#74829a] dark:text-[#a8b6cc]">Choose your learning platform and explore its courses, batches, lectures and study material.</p>
            </div>
            <div className="grid w-full gap-3 sm:max-w-xl">
              <button type="button" onClick={openInstitutions} className="group flex min-h-[92px] items-center gap-4 rounded-[1.5rem] border border-[#e4eaf3] bg-white p-5 text-left shadow-[0_6px_24px_rgba(30,55,96,.045)] transition hover:-translate-y-0.5 hover:border-[#c6d7f1] hover:shadow-[0_14px_30px_rgba(30,55,96,.08)] dark:border-[#293750] dark:bg-[#121c30]"><span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#e7edf5] bg-[#f7f9fc] text-[#18b985]"><span className="text-3xl font-black">»</span></span><span className="min-w-0 flex-1"><span className="block text-lg font-extrabold text-[#20385e] dark:text-[#e8eef9]">Next Topper</span><span className="mt-1 block text-[11px] font-bold text-[#9a8a64]">Coming soon</span></span><ArrowUpRight size={19} className="text-[#8a98ae] transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></button>
              <button type="button" onClick={openInstitutions} className="group flex min-h-[92px] items-center gap-4 rounded-[1.5rem] border border-[#e4eaf3] bg-white p-5 text-left shadow-[0_6px_24px_rgba(30,55,96,.045)] transition hover:-translate-y-0.5 hover:border-[#c6d7f1] hover:shadow-[0_14px_30px_rgba(30,55,96,.08)] dark:border-[#293750] dark:bg-[#121c30]"><span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#e7edf5] bg-white text-lg font-black text-black shadow-sm">PW</span><span className="min-w-0 flex-1"><span className="block text-lg font-extrabold text-[#20385e] dark:text-[#e8eef9]">Physics Wallah</span><span className="mt-1 block text-[11px] font-bold text-[#24936d]">Connected · Available now</span></span><ArrowUpRight size={19} className="text-[#8a98ae] transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></button>
            </div>
          </div>
          <div className="mt-8 flex justify-center"><button type="button" onClick={openInstitutions} className="elite-primary-button inline-flex h-12 items-center gap-2 rounded-xl bg-[#2862e9] px-6 text-sm font-extrabold text-white shadow-[0_10px_24px_rgba(40,98,233,.18)] transition hover:-translate-y-0.5 hover:bg-[#1e51d0]">Choose institution <ArrowRight size={16} /></button></div>
        </div>
      </section>

      <footer className="bg-[#f8fbff] px-5 py-8 dark:bg-[#0a1020] sm:px-8 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3"><span className="h-10 w-10 overflow-hidden rounded-xl border border-[#e8e0ca] bg-[#f6f1e5]"><img src="/elite-study-mark.png" alt="Elite Study" className="h-full w-full object-cover" /></span><div><p className="text-xs font-black tracking-[.14em] text-[#20385e] dark:text-[#e8eef9]">ELITE STUDY</p><p className="mt-1 text-[9px] font-semibold tracking-[.12em] text-[#8794aa]">WITH SACHINCODERX</p></div></div>
          <p className="text-xs text-[#8794aa] dark:text-[#91a1bd]">A focused space for curious minds and consistent learners.</p>
          <a href={TELEGRAM_CHANNEL_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-xs font-extrabold text-[#1689c7] transition hover:text-[#2862e9]"><Send size={14} /> Join {TELEGRAM_CHANNEL_HANDLE} <ArrowUpRight size={13} /></a>
        </div>
      </footer>
      <TelegramPopup />
    </main>
  );
}
