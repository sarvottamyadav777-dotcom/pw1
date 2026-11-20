"use client";

import { Heart, Send } from "lucide-react";
import { useApp } from "@/lib/store";
import { TELEGRAM_CHANNEL_URL } from "@/lib/telegram";

export function SiteFooter() {
  const { navigate, institutionId, institutionName } = useApp();
  const year = new Date().getFullYear();
  const openDashboard = () => institutionId
    ? navigate({ view: "dashboard", institutionId, institutionName })
    : navigate({ view: "institutions" });

  return (
    <footer className="mt-auto w-full border-t border-[#e6ecf4] bg-white px-4 pb-6 pt-9 dark:border-[#293750] dark:bg-[#10192b] sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3">
              <span className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-[#e8e0ca] bg-[#f6f1e5]"><img src="/elite-study-mark.png" alt="Elite Study logo" className="h-full w-full object-cover" /></span>
              <div className="leading-tight"><p className="text-sm font-black tracking-[.1em] text-[#1c3154] dark:text-[#e8eef9]">ELITE STUDY</p><p className="mt-1 text-[9px] font-extrabold tracking-[.12em] text-[#8995a9]">WITH SACHINCODERX</p></div>
            </div>
            <p className="mt-4 max-w-xs text-xs leading-6 text-[#7b89a0] dark:text-[#a8b6cc]">A focused learning space for curious minds and consistent learners.</p>
          </div>
          <div><p className="text-xs font-black uppercase tracking-[.16em] text-[#344b72] dark:text-[#d5def0]">Explore</p><div className="mt-4 flex flex-col items-start gap-3 text-xs"><FooterLink onClick={openDashboard}>Dashboard</FooterLink><FooterLink onClick={() => navigate({ view: "institutions" })}>Choose institution</FooterLink><FooterLink onClick={() => navigate({ view: "about" })}>About Elite Study</FooterLink></div></div>
          <div><p className="text-xs font-black uppercase tracking-[.16em] text-[#344b72] dark:text-[#d5def0]">Learning</p><div className="mt-4 flex flex-col items-start gap-3 text-xs"><FooterLink onClick={openDashboard}>All batches</FooterLink></div></div>
          <div><p className="text-xs font-black uppercase tracking-[.16em] text-[#344b72] dark:text-[#d5def0]">Stay connected</p><a href={TELEGRAM_CHANNEL_URL} target="_blank" rel="noreferrer" className="mt-4 inline-flex h-10 items-center gap-2 rounded-xl bg-[#229ed9] px-4 text-xs font-extrabold text-white shadow-[0_7px_18px_rgba(34,158,217,.15)] transition hover:-translate-y-0.5 hover:bg-[#1689c1]"><Send size={14} /> Join Telegram Community</a></div>
        </div>
        <div className="mt-8 flex flex-col gap-2 border-t border-[#edf1f6] pt-5 text-[11px] text-[#8a97aa] dark:border-[#293750] dark:text-[#91a1bd] sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} Elite Study. All rights reserved.</p>
          <p className="flex items-center gap-1.5">Made for learners with <Heart size={12} className="fill-[#e56d83] text-[#e56d83]" /></p>
          <p className="font-bold tracking-[.08em]">WITH SACHINCODERX</p>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return <button type="button" onClick={onClick} className="cursor-pointer text-[#71809a] transition-colors hover:text-[#3266e3] dark:text-[#a8b6cc] dark:hover:text-[#a9c5ff]">{children}</button>;
}
