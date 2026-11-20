"use client";

import { ArrowLeft, ArrowRight, CheckCircle2, Clock3, GraduationCap, Layers3, Send, ShieldCheck } from "lucide-react";
import { useApp } from "@/lib/store";
import { TELEGRAM_CHANNEL_URL } from "@/lib/telegram";
import { ThemeToggle } from "./theme-toggle";

export function InstitutionSelect() {
  const { navigate } = useApp();
  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_50%_0%,#edf4ff_0%,#f8fbff_55%,#ffffff_100%)] px-4 py-5 text-[#172d50] dark:bg-[#0a1020] dark:text-[#e8eef9] sm:px-8 sm:py-8">
      <header className="mx-auto flex max-w-6xl items-center justify-between gap-3 rounded-2xl border border-[#e7edf5] bg-white/90 px-4 py-3 shadow-sm dark:border-[#293750] dark:bg-[#121c30]">
        <a href="/" onClick={(event) => { event.preventDefault(); navigate({ view: "home", institutionId: "physics-wallah", institutionName: "Physics Wallah" }); }} className="flex items-center gap-2.5">
          <span className="h-11 w-11 overflow-hidden rounded-xl border border-[#e8e0ca] bg-[#f6f1e5]"><img src="/elite-study-mark.png" alt="Elite Study logo" className="h-full w-full object-cover" /></span>
          <span><strong className="block text-sm font-black tracking-[.08em]">ELITE STUDY</strong><small className="mt-1 block text-[9px] font-bold tracking-[.14em] text-[#8794aa]">WITH SACHINCODERX</small></span>
        </a>
        <div className="flex items-center gap-2"><ThemeToggle /><a href={TELEGRAM_CHANNEL_URL} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#eff7ff] px-3 text-xs font-extrabold text-[#1689c7] transition hover:bg-[#e3f1ff]"><Send size={14} /> Telegram</a></div>
      </header>

      <div className="mx-auto max-w-5xl">
        <button type="button" onClick={() => navigate({ view: "home", institutionId: "physics-wallah", institutionName: "Physics Wallah" })} className="mt-7 inline-flex items-center gap-2 rounded-full border border-[#dfe7f2] bg-white px-4 py-2.5 text-sm font-bold text-[#64748b] shadow-sm transition hover:border-[#c6d6f0] hover:text-[#3263cf]">
          <ArrowLeft size={16} /> Back to home
        </button>

        <div className="mx-auto mt-10 max-w-2xl text-center sm:mt-14">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#3471ef] to-[#7954db] text-white shadow-[0_12px_30px_rgba(66,94,208,.22)]"><GraduationCap size={29} /></span>
          <p className="mt-6 text-[11px] font-black uppercase tracking-[.24em] text-[#5576c8]">One quick step</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-[#172d50] dark:text-[#e8eef9] sm:text-5xl">Choose your institution</h1>
          <p className="mt-4 text-sm leading-7 text-[#74829a] dark:text-[#a8b6cc] sm:text-base">Select the platform you study with. We’ll take you to its learning dashboard.</p>
        </div>

        <div className="mx-auto mt-10 grid max-w-3xl gap-5 sm:grid-cols-2 sm:mt-12">
          <button type="button" onClick={() => navigate({ view: "home", institutionId: "physics-wallah", institutionName: "Physics Wallah" })} className="group relative flex min-h-[260px] flex-col rounded-[1.75rem] border border-[#dce6f5] bg-white p-7 text-left shadow-[0_12px_34px_rgba(34,61,108,.07)] transition duration-300 hover:-translate-y-1 hover:border-[#9cb7ef] hover:shadow-[0_22px_46px_rgba(34,61,108,.13)] dark:border-[#293750] dark:bg-[#121c30]">
            <span className="absolute right-6 top-6 inline-flex items-center gap-1.5 rounded-full bg-[#e9f8f0] px-3 py-1.5 text-[10px] font-extrabold text-[#21835d]"><CheckCircle2 size={12} /> AVAILABLE</span>
            <span className="flex h-16 w-16 items-center justify-center rounded-[1.25rem] bg-[#101827] text-xl font-black text-white shadow-lg">PW</span>
            <h2 className="mt-6 text-xl font-black text-[#1b3154] dark:text-[#e8eef9]">Physics Wallah</h2>
            <p className="mt-2 max-w-xs text-sm leading-6 text-[#7c899f] dark:text-[#a8b6cc]">Browse available batches, lectures, notes and practice resources.</p>
            <span className="mt-auto flex items-center gap-2 pt-6 text-sm font-extrabold text-[#3264d7]">Open Study <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" /></span>
          </button>

          <div aria-disabled="true" className="relative flex min-h-[260px] flex-col rounded-[1.75rem] border border-dashed border-[#d9e1ed] bg-white/75 p-7 opacity-85 dark:border-[#293750] dark:bg-[#121c30]">
            <span className="absolute right-6 top-6 inline-flex items-center gap-1.5 rounded-full bg-[#f4f0e7] px-3 py-1.5 text-[10px] font-extrabold text-[#9a793e]"><Clock3 size={12} /> COMING SOON</span>
            <span className="flex h-16 w-16 items-center justify-center rounded-[1.25rem] bg-[#eff3fb] text-xl font-black text-[#62799f]">NT</span>
            <h2 className="mt-6 text-xl font-black text-[#52647f]">Next Topper</h2>
            <p className="mt-2 max-w-xs text-sm leading-6 text-[#8793a7]">This institution will appear here as soon as its course catalog is connected.</p>
            <span className="mt-auto flex items-center gap-2 pt-6 text-sm font-bold text-[#9a865b]"><Layers3 size={16} /> Integration in progress</span>
          </div>
        </div>

        <div className="mx-auto mt-8 flex max-w-3xl items-start gap-3 rounded-2xl border border-[#e2eaf5] bg-white/85 px-5 py-4 text-xs leading-5 text-[#7a899f]">
          <ShieldCheck size={17} className="mt-0.5 shrink-0 text-[#4388d8]" />
          <p>Your choice only changes which institution’s learning catalog is shown. You can switch institutions later from the dashboard.</p>
        </div>
      </div>
    </main>
  );
}
