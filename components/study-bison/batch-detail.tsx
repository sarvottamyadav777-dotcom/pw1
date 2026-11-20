"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/lib/store";
import {
  GlassBadge,
  GlassButton,
  GlassCard,
  GlassSkeleton,
  SafeImage,
  EmptyState,
} from "./glass";
import {
  ArrowLeft,
  GraduationCap,
  Users2,
  BookOpen,
  CalendarDays,
  Megaphone,
  ClipboardList,
  Play,
  FileText,
  Radio,
  Clock,
  Calculator,
  BarChart3,
  Atom,
  FlaskConical,
  Languages,
  Landmark,
  BookOpenText,
  Sigma,
  Monitor,
  Clock3,
  MessageCircle,
  Users,
  Gauge,
  Archive,
  Gift,
  BookmarkCheck,
  BookmarkPlus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TestRunner } from "./test-runner";
import { getBatchFallback } from "@/lib/batch-artwork";
import { TELEGRAM_CHANNEL_URL } from "@/lib/telegram";
import { readMyStudyIds, toggleMyStudyId } from "@/lib/my-study";

interface SubjectItem {
  id: string;
  name: string;
  slug: string;
  lectureCount: number;
}

interface BatchInfo {
  id: string;
  name: string;
  byName: string;
  description: string;
  startDate: string;
  endDate: string;
  language: string;
  previewImage: string;
  feeTotal: number;
}

type TabKey = "subjects" | "today" | "announcements" | "tests";

const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: "subjects", label: "Subjects & Modules", icon: <BookOpen size={14} /> },
  { key: "today", label: "Today's Classes", icon: <CalendarDays size={14} /> },
  { key: "announcements", label: "Announcements", icon: <Megaphone size={14} /> },
  { key: "tests", label: "Test Series", icon: <ClipboardList size={14} /> },
];

export function BatchDetail({ batchId }: { batchId: string }) {
  const { navigate, back } = useApp();
  const fallbackImage = useApp((s) => s.batchImage);
  const [payload, setPayload] = useState<{
    id: string;
    batch: BatchInfo | null;
    subjects: SubjectItem[];
    error?: string;
  } | null>(null);
  const [tab, setTab] = useState<TabKey>("today");
  const [inMyStudy, setInMyStudy] = useState(false);

  useEffect(() => {
    setInMyStudy(readMyStudyIds().includes(batchId));
  }, [batchId]);

  const toggleStudy = () => {
    setInMyStudy(toggleMyStudyId(batchId));
  };

  const loading = !payload || payload.id !== batchId;
  const batch = loading ? null : payload!.batch;
  const subjects = loading ? [] : payload!.subjects;

  useEffect(() => {
    const controller = new AbortController();
    let alive = true;
    fetch(`/api/batches/${encodeURIComponent(batchId)}`, { signal: controller.signal })
      .then(async (response) => {
        const contentType = response.headers.get("content-type") ?? "";
        if (!contentType.toLowerCase().includes("application/json")) {
          throw new Error("The batch service returned an invalid response. Please try again.");
        }
        const data = await response.json();
        if (!response.ok || !data?.success) {
          throw new Error(data?.error || "Batch details could not be loaded.");
        }
        return data;
      })
      .then((data) => {
        if (!alive) return;
        setPayload({ id: batchId, batch: data.batch as BatchInfo, subjects: data.subjects ?? [] });
      })
      .catch((reason: unknown) => {
        if (!alive || (reason instanceof DOMException && reason.name === "AbortError")) return;
        setPayload({
          id: batchId,
          batch: null,
          subjects: [],
          error: reason instanceof Error ? reason.message : "A network error occurred while loading this batch.",
        });
      });
    return () => {
      alive = false;
      controller.abort();
    };
  }, [batchId]);

  return (
    <main className="flex-1 w-full bg-[#f8faff] px-3 dark:bg-[#0a1020] sm:px-5">
      <div className="mx-auto max-w-6xl space-y-5 pb-8">
        {/* breadcrumb actions */}
        <div className="flex items-center gap-2 pt-6">
          <GlassButton variant="glass" size="sm" onClick={back}>
            <ArrowLeft size={15} /> Back
          </GlassButton>
        </div>

        {/* hero */}
        {loading ? (
          <div className="glass rounded-3xl overflow-hidden">
            <GlassSkeleton className="h-56 rounded-none" />
          </div>
        ) : batch ? (
          <GlassCard hover={false} sheen={false} className="overflow-hidden rounded-[1.7rem] border-[#1b2948] bg-[#0d1527] text-white shadow-[0_18px_48px_rgba(13,24,48,.16)]">
            <div className="relative isolate overflow-hidden bg-gradient-to-br from-[#0d1527] via-[#172443] to-[#30204e]">
              <div className="pointer-events-none absolute -right-20 -top-28 h-80 w-80 rounded-full bg-[#7855dc]/25 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-36 left-1/3 h-72 w-72 rounded-full bg-[#3c78e8]/15 blur-3xl" />
              <div className="relative grid gap-6 p-5 sm:p-8 md:grid-cols-[1fr_270px] md:items-center">
                <div className="min-w-0">
                  <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[.2em] text-[#c6b4ff]"><GraduationCap size={14} /> Your batch</span>
                  <h1 className="mt-3 text-2xl font-black leading-tight tracking-tight sm:text-3xl lg:text-4xl">{batch.name}</h1>
                  <p className="mt-2 flex items-center gap-1.5 text-sm text-[#c1cbe0]"><Users2 size={14} className="text-[#b9a5ff]" /> {batch.byName || "Elite Study Educators"}</p>
                  {batch.description && (
                    <div className="sb-prose sb-batch-description mt-3 line-clamp-3 max-w-2xl text-xs leading-6 text-[#aebbd3] sm:text-sm">
                      <div dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(batch.description) }} />
                    </div>
                  )}
                  <div className="mt-5 flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-white/15 bg-white/[.08] px-3 py-1.5 text-xs font-extrabold text-white">{batch.feeTotal === 0 ? "Free" : `₹${batch.feeTotal.toLocaleString()}`}</span>
                    {batch.language && <span className="rounded-full border border-white/15 bg-white/[.08] px-3 py-1.5 text-[10px] font-bold text-[#d6def0]">{batch.language}</span>}
                    {batch.startDate && <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[.08] px-3 py-1.5 text-[10px] font-bold text-[#d6def0]"><CalendarDays size={11} /> {fmtDate(batch.startDate)}</span>}
                  </div>
                  <button
                    type="button"
                    onClick={toggleStudy}
                    aria-pressed={inMyStudy}
                    className={`mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-xl px-4 text-xs font-black transition ${inMyStudy ? "border border-emerald-300/25 bg-emerald-400/15 text-emerald-100 hover:bg-emerald-400/20" : "bg-gradient-to-r from-[#3679ed] to-[#7655db] text-white shadow-[0_8px_22px_rgba(73,91,214,.25)] hover:brightness-110"}`}
                  >
                    {inMyStudy ? <BookmarkCheck size={15} /> : <BookmarkPlus size={15} />}
                    {inMyStudy ? "Added to My Study" : "Add to My Study"}
                  </button>
                  <p className="mt-3 text-[9px] font-extrabold tracking-[.18em] text-[#8493b0]">ELITE STUDY · WITH SACHINCODERX</p>
                </div>
                <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-white/15 bg-white/5 shadow-[0_18px_36px_rgba(0,0,0,.2)] md:aspect-[4/3]">
                  <SafeImage src={batch.previewImage || fallbackImage || getBatchFallback(batch.name)} alt={batch.name} fallback={getBatchFallback(batch.name)} className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#091222]/35 to-transparent" />
                </div>
              </div>
            </div>

            {/* tabs */}
            <div className="relative border-t border-[#e7edf5] bg-white px-3 py-3 dark:border-[#293750] dark:bg-[#121c30] sm:px-5">
              <div className="flex gap-1.5 overflow-x-auto sb-scroll">
                {TABS.map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setTab(t.key)}
                    aria-pressed={tab === t.key}
                    className={cn(
                      "shrink-0 flex items-center gap-1.5 rounded-full px-4 h-10 text-[12px] sm:text-[13px] font-bold transition-all cursor-pointer",
                      tab === t.key
                        ? "bg-[#17233b] text-white shadow-[0_5px_14px_rgba(23,35,59,.18)]"
                        : "text-[#6e7d95] hover:text-[#263d68] hover:bg-[#f3f5fa] dark:text-[#a8b6cc] dark:hover:text-[#e8eef9] dark:hover:bg-[#1a2740]"
                    )}
                  >
                    {t.icon}
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </GlassCard>
        ) : (
          <EmptyState title={payload?.error ? "Unable to load batch details" : "Batch not found"} hint={payload?.error || "It may have been removed from the catalog."} />
        )}

        {/* PW-style batch shortcuts: keep the tools on the batch's own page. */}
        {!loading && batch && (
          <section className="rounded-[1.7rem] border border-[#e5eaf2] bg-white p-4 shadow-[0_8px_26px_rgba(27,48,84,.045)] sm:p-5 dark:border-[#293750] dark:bg-[#121c30]">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[.2em] text-[#7a8aa5] dark:text-[#91a1bd]">Your learning space</p>
                <h2 className="mt-1 text-base font-extrabold text-[#1b2d4d] dark:text-[#e8eef9]">Batch tools</h2>
              </div>
              <span className="rounded-full bg-[#f1f4fa] px-3 py-1.5 text-[10px] font-extrabold text-[#71809a] dark:bg-[#1a2740] dark:text-[#a8b6cc]">{batch.language || "Online learning"}</span>
            </div>
            <div className="grid grid-cols-4 gap-2.5 sm:gap-4">
              <BatchShortcut icon={<Monitor size={21} />} label="All Classes" tone="red" onClick={() => setTab("subjects")} />
              <BatchShortcut icon={<Clock3 size={21} />} label="All Tests" tone="pink" onClick={() => setTab("tests")} />
              <BatchShortcut icon={<MessageCircle size={21} />} label="My Doubts" tone="blue" onClick={() => window.open(TELEGRAM_CHANNEL_URL, "_blank", "noopener,noreferrer")} />
              <BatchShortcut icon={<BookOpenText size={21} />} label="Digital Books" tone="indigo" onClick={() => setTab("subjects")} />
              <BatchShortcut icon={<Users size={21} />} label="Community" tone="violet" onClick={() => window.open(TELEGRAM_CHANNEL_URL, "_blank", "noopener,noreferrer")} />
              <BatchShortcut icon={<Gift size={21} />} label="Pi" tone="amber" disabled />
              <BatchShortcut icon={<Gauge size={21} />} label="Preparation" tone="teal" disabled />
              <BatchShortcut icon={<Archive size={21} />} label="Khazana" tone="green" onClick={() => setTab("announcements")} />
            </div>
          </section>
        )}

        {tab === "today" && batch && (
          <div className="flex items-end justify-between gap-3 px-1 pt-1">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[.2em] text-[#7b5bd8]">Your schedule</p>
              <h2 className="mt-1 text-xl font-black tracking-tight text-[#1b2d4d] dark:text-[#e8eef9]">Today&apos;s Schedule</h2>
            </div>
            <span className="rounded-full border border-[#f4df9b] bg-[#fff9e9] px-3 py-1.5 text-[10px] font-extrabold text-[#a9771e] dark:border-[#604d2a] dark:bg-[#302817] dark:text-[#f1c56c]">Live & upcoming</span>
          </div>
        )}

        {/* tab content */}
        {tab === "subjects" && (
          <SubjectsTab subjects={subjects} loading={loading} batchId={batchId} batchName={batch?.name} batchImage={batch?.previewImage || getBatchFallback(batch?.name)} />
        )}
        {tab === "today" && batch && <TodayTab batchId={batchId} batchName={batch.name} batchImage={batch.previewImage || getBatchFallback(batch.name)} />}
        {tab === "announcements" && <AnnouncementsTab batchId={batchId} />}
        {tab === "tests" && <TestsTab batchId={batchId} />}
      </div>
    </main>
  );
}

function BatchShortcut({
  icon,
  label,
  tone,
  onClick,
  disabled = false,
}: {
  icon: React.ReactNode;
  label: string;
  tone: "red" | "pink" | "blue" | "indigo" | "violet" | "amber" | "teal" | "green";
  onClick?: () => void;
  disabled?: boolean;
}) {
  const tones = {
    red: "bg-[#fff0f0] text-[#e34b54] dark:bg-[#38232a] dark:text-[#ff8d97]",
    pink: "bg-[#fff0f7] text-[#d94d9b] dark:bg-[#392239] dark:text-[#f18dc2]",
    blue: "bg-[#edf4ff] text-[#3e7be8] dark:bg-[#1c2e4c] dark:text-[#8db6ff]",
    indigo: "bg-[#eef1ff] text-[#526fdf] dark:bg-[#242d50] dark:text-[#a6b4ff]",
    violet: "bg-[#f4edff] text-[#9655db] dark:bg-[#302447] dark:text-[#c6a0ff]",
    amber: "bg-[#fff7e7] text-[#d6a018] dark:bg-[#382e1c] dark:text-[#f2c86e]",
    teal: "bg-[#e9fbf7] text-[#20a18e] dark:bg-[#1b3837] dark:text-[#75d6c6]",
    green: "bg-[#eaf8ef] text-[#25a66b] dark:bg-[#1d382d] dark:text-[#84d5a7]",
  };
  const content = (
    <>
      <span className={`mx-auto flex h-12 w-12 items-center justify-center rounded-2xl ${tones[tone]} sm:h-14 sm:w-14`}>{icon}</span>
      <span className="mt-2 block text-center text-[10px] font-extrabold leading-tight text-[#34445f] dark:text-[#d8e1f0] sm:text-xs">{label}</span>
      {disabled && <span className="mt-1 block text-center text-[8px] font-bold text-[#a0aabd] dark:text-[#7888a2]">Coming soon</span>}
    </>
  );
  if (disabled) return <div aria-disabled="true" className="min-w-0 rounded-2xl px-1 py-2 opacity-60">{content}</div>;
  return <button type="button" onClick={onClick} className="min-w-0 rounded-2xl px-1 py-2 transition hover:bg-[#f7f8fc] active:scale-[.98] dark:hover:bg-[#1a2740]">{content}</button>;
}

/* ------------------------------- Subjects tab ------------------------------- */

function SubjectsTab({
  subjects,
  loading,
  batchId,
  batchName,
  batchImage,
}: {
  subjects: SubjectItem[];
  loading: boolean;
  batchId: string;
  batchName?: string;
  batchImage?: string;
}) {
  const { navigate } = useApp();
  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {Array.from({ length: 6 }).map((_, i) => <GlassSkeleton key={i} className="h-28" />)}
      </div>
    );
  }
  if (subjects.length === 0) {
    return <EmptyState icon={<BookOpen size={22} />} title="No subjects published yet" hint="Check back soon." />;
  }
  return (
    <div className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-3.5 lg:grid-cols-2 sb-fade-up">
      {subjects.map((s) => {
        const Icon = subjectIcon(s.name);
        return (
          <button
            key={s.id}
            className="group flex min-h-[116px] w-full items-center gap-4 rounded-[1.4rem] border border-[#e5eaf2] bg-white p-4 text-left shadow-[0_5px_18px_rgba(27,48,84,.035)] transition hover:-translate-y-0.5 hover:border-[#c9d4ee] hover:shadow-[0_12px_28px_rgba(27,48,84,.08)] dark:border-[#293750] dark:bg-[#121c30] dark:hover:border-[#465d86] sm:p-5"
            onClick={() => navigate({ view: "subject", batchId, batchName, batchImage, subjectSlug: s.slug, subjectName: s.name })}
          >
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#f0f4fb] text-[#315aaf] transition group-hover:bg-[#e9edff] group-hover:text-[#7655db]">
              <Icon size={27} strokeWidth={1.8} />
            </span>
            <span className="flex min-w-0 flex-1 flex-col justify-center py-1">
              <span className="text-[15px] font-extrabold leading-snug text-[#1b2d4d] dark:text-[#e8eef9] sm:text-base">{s.name}</span>
              <span className="mt-2 text-xs text-[#7b89a0] dark:text-[#a8b6cc]">{s.lectureCount} Lectures <span className="mx-1 text-[#c2cad7]">|</span> Explore chapters</span>
            </span>
            <span className="flex shrink-0 items-center text-xl text-[#9aa6ba] transition group-hover:translate-x-1 group-hover:text-[#7356d8]">›</span>
          </button>
        );
      })}
    </div>
  );
}

/* -------------------------------- Today tab --------------------------------- */

interface TodayClass {
  id: string;
  title: string;
  subject: string;
  startTime: string;
  endTime: string;
  thumbnail: string;
  duration: string;
  videoId: string;
  isLive?: boolean;
  status?: string;
  videoType?: string;
  videoUrl?: string;
  videoApiId?: string;
  subjectSlug: string;
}

function TodayTab({
  batchId,
  batchName,
  batchImage,
}: {
  batchId: string;
  batchName: string;
  batchImage?: string;
}) {
  const { navigate } = useApp();
  const [classes, setClasses] = useState<TodayClass[] | null>(null);

  useEffect(() => {
    let alive = true;
    fetch(`/api/batches/${batchId}/today`)
      .then((r) => r.json())
      .then((d) => alive && setClasses(d?.classes ?? []))
      .catch(() => alive && setClasses([]));
    return () => {
      alive = false;
    };
  }, [batchId]);

  if (classes === null) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => <GlassSkeleton key={i} className="h-28" />)}
      </div>
    );
  }
  if (classes.length === 0) {
    return (
      <EmptyState
        icon={<CalendarDays size={22} />}
        title="No classes scheduled today"
        hint="Enjoy the rest day or revise a previous lecture."
      />
    );
  }
  return (
    <div className="space-y-4 sb-fade-up">
      {classes.map((c) => (
        <GlassCard key={c.id} className="p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-full sm:w-40 aspect-video rounded-2xl overflow-hidden shrink-0 relative border border-[#e5ebf4] dark:border-[#293750]">
              <SafeImage src={c.thumbnail} alt={c.title} className="w-full h-full object-cover" />
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="w-10 h-10 rounded-full btn-gold flex items-center justify-center">
                  <Play size={15} className="ml-0.5" />
                </span>
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <GlassBadge tone={c.isLive ? "red" : "gold"}>
                  <Radio size={10} /> {c.isLive ? "LIVE NOW" : c.status || "SCHEDULED"}
                </GlassBadge>
                {c.subject && <span className="text-[10px] font-bold text-[#7d8aa0] dark:text-[#a8b6cc]">{c.subject}</span>}
              </div>
              <h3 className="font-bold text-[15px] leading-snug line-clamp-2">{c.title}</h3>
              <p className="mt-1.5 text-xs text-muted-foreground flex items-center gap-1.5">
                <Clock size={12} />
                {fmtTime(c.startTime)}
                {c.duration ? ` · ${c.duration}` : ""}
              </p>
            </div>
            <GlassButton
              variant="gold"
              onClick={() => {
                if (c.id && c.subjectSlug) {
                  navigate({
                    view: "watch",
                    batchId,
                    subjectSlug: c.subjectSlug,
                    subjectName: c.subject,
                    batchName,
                    batchImage,
                    contentId: c.id,
                    lectureTitle: c.title,
                    videoId: c.videoId,
                    videoType: c.videoType,
                    videoUrl: c.videoUrl,
                    videoApiId: c.videoApiId,
                  });
                } else {
                  navigate({ view: "batch", batchId, batchName, batchImage });
                }
              }}
            >
              <Play size={14} /> Watch class
            </GlassButton>
          </div>
        </GlassCard>
      ))}
    </div>
  );
}

/* ---------------------------- Announcements tab ----------------------------- */

interface Announcement {
  id: string;
  description: string;
  createdAt: string;
  attachments: { name: string; url: string }[];
}

function AnnouncementsTab({ batchId }: { batchId: string }) {
  const [items, setItems] = useState<Announcement[] | null>(null);

  useEffect(() => {
    let alive = true;
    fetch(`/api/batches/${batchId}/announcements`)
      .then((r) => r.json())
      .then((d) => alive && setItems(d?.announcements ?? []))
      .catch(() => alive && setItems([]));
    return () => {
      alive = false;
    };
  }, [batchId]);

  if (items === null) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => <GlassSkeleton key={i} className="h-24" />)}
      </div>
    );
  }
  if (items.length === 0) {
    return <EmptyState icon={<Megaphone size={22} />} title="No announcements yet" hint="Faculty posts will appear here." />;
  }
  return (
    <div className="space-y-4 sb-fade-up max-h-[70vh] overflow-y-auto sb-scroll pr-1">
      {items.map((a) => (
        <GlassCard key={a.id} hover={false} className="p-5">
          <p className="text-xs text-muted-foreground mb-2">{fmtTime(a.createdAt)}</p>
          <div
            className="sb-prose text-sm line-clamp-6"
            dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(a.description) }}
          />
          {a.attachments.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {a.attachments.map((att) => (
                <a
                  key={att.url}
                  href={att.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full btn-glass px-3.5 h-8 text-xs font-semibold"
                >
                  <FileText size={12} className="text-[#7655db]" /> {att.name}
                </a>
              ))}
            </div>
          )}
        </GlassCard>
      ))}
    </div>
  );
}

/* ------------------------------- Tests tab ---------------------------------- */

interface TestItem {
  id: string;
  name: string;
  totalQuestions: number;
  marks: number;
  duration: string;
  type: string;
  subjects: string[];
}

function TestsTab({ batchId }: { batchId: string }) {
  const [tests, setTests] = useState<TestItem[] | null>(null);
  const [activeTest, setActiveTest] = useState<TestItem | null>(null);

  useEffect(() => {
    let alive = true;
    fetch(`/api/batches/${batchId}/tests`)
      .then((r) => r.json())
      .then((d) => alive && setTests(d?.tests ?? []))
      .catch(() => alive && setTests([]));
    return () => {
      alive = false;
    };
  }, [batchId]);

  if (tests === null) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 6 }).map((_, i) => <GlassSkeleton key={i} className="h-40" />)}
      </div>
    );
  }
  if (tests.length === 0) {
    return <EmptyState icon={<ClipboardList size={22} />} title="No tests published yet" hint="Mock tests will appear here." />;
  }
  return (
    <>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sb-fade-up max-h-[70vh] overflow-y-auto sb-scroll p-1">
      {tests.map((t) => (
        <GlassCard key={t.id} className="p-5">
          <div className="flex items-center justify-between gap-2 mb-3">
            <GlassBadge tone="violet">{t.type}</GlassBadge>
            <span className="text-[11px] text-muted-foreground">{t.duration}</span>
          </div>
          <h3 className="font-bold text-[15px] leading-snug line-clamp-2 min-h-[2.6em]">{t.name}</h3>
          <p className="mt-2 text-xs text-muted-foreground">
            {t.totalQuestions} Questions{t.marks ? ` · ${t.marks} marks` : ""}
          </p>
          <GlassButton variant="gold" size="sm" className="mt-4 w-full" onClick={() => setActiveTest(t)}>
            <Play size={13} /> Start test
          </GlassButton>
        </GlassCard>
      ))}
    </div>
    {activeTest && <TestRunner test={activeTest} onClose={() => setActiveTest(null)} />}
    </>
  );
}

/* --------------------------------- helpers ---------------------------------- */

function fmtDate(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

function fmtTime(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Render upstream rich descriptions as safe HTML instead of printing escaped
 * tags as visible text. Only basic formatting tags and safe links survive.
 */
function sanitizeRichHtml(input: string): string {
  if (!input) return "";
  const allowed = new Set([
    "p", "br", "strong", "b", "em", "i", "u", "ul", "ol", "li",
    "a", "div", "span", "h1", "h2", "h3", "h4", "h5", "h6",
    "blockquote", "hr", "table", "thead", "tbody", "tr", "th", "td",
  ]);
  let html = input
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/<\s*(script|style|iframe|object|embed|form|svg|math)\b[\s\S]*?<\s*\/\s*\1\s*>/gi, "")
    .replace(/<!--([\s\S]*?)-->/g, "");

  html = html.replace(/<(\/?)([a-z][a-z0-9]*)\b([^>]*)>/gi, (match, closing: string, rawTag: string, attrs: string) => {
    const tag = rawTag.toLowerCase();
    if (!allowed.has(tag)) return "";
    if (closing) return `</${tag}>`;
    if (tag === "br" || tag === "hr") return `<${tag}/>`;
    if (tag === "a") {
      const hrefMatch = attrs.match(/\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
      const href = (hrefMatch?.[1] ?? hrefMatch?.[2] ?? hrefMatch?.[3] ?? "").trim();
      const safe = /^(https?:\/\/|mailto:|\/|#)/i.test(href) && !/^\/\//.test(href);
      return safe ? `<a href="${href.replace(/"/g, "&quot;")}" target="_blank" rel="noopener noreferrer">` : "<a>";
    }
    return `<${tag}>`;
  });
  return html;
}

function subjectIcon(name: string) {
  const value = name.toLowerCase();
  if (/account|commerce|bookkeep/.test(value)) return Calculator;
  if (/business|econom|statistic/.test(value)) return BarChart3;
  if (/physics|science/.test(value)) return Atom;
  if (/chem/.test(value)) return FlaskConical;
  if (/english|language|hindi/.test(value)) return Languages;
  if (/history|political|geography|civics/.test(value)) return Landmark;
  if (/math|algebra/.test(value)) return Sigma;
  return BookOpenText;
}
