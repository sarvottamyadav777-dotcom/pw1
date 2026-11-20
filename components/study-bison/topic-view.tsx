"use client";

import { useEffect, useMemo, useState } from "react";
import { useApp } from "@/lib/store";
import {
  GlassBadge,
  GlassButton,
  GlassCard,
  GlassSkeleton,
  EmptyState,
} from "./glass";
import {
  ArrowLeft,
  ChevronRight,
  Home,
  PlayCircle,
  FileText,
  Search,
  Play,
  BookMarked,
  Loader2,
  ClipboardPen,
  Download,
  Eye,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface LectureItem {
  id: string;
  title: string;
  date?: string;
  startTime?: string;
  status?: string;
  isLocked?: boolean;
  videoId?: string;
  videoType?: string;
  videoUrl?: string;
  videoApiId?: string;
  thumbnail?: string;
  duration?: string;
}

interface NoteItem {
  id: string;
  title: string;
  date?: string;
  fileUrl?: string;
  fileName?: string;
}

type Mode = "lectures" | "notes" | "dpps";

export function TopicView({
  batchId,
  subjectSlug,
  topicId,
}: {
  batchId: string;
  subjectSlug: string;
  topicId: string;
}) {
  // Keyed remount resets all data state whenever the chapter changes
  return (
    <TopicData
      key={`${batchId}:${subjectSlug}:${topicId}`}
      batchId={batchId}
      subjectSlug={subjectSlug}
      topicId={topicId}
    />
  );
}

function TopicData({
  batchId,
  subjectSlug,
  topicId,
}: {
  batchId: string;
  subjectSlug: string;
  topicId: string;
}) {
  const { navigate, back } = useApp();
  const appState = useApp();
  const [mode, setMode] = useState<Mode>("lectures");
  const [lectures, setLectures] = useState<LectureItem[] | null>(null);
  const [notes, setNotes] = useState<NoteItem[] | null>(null);
  const [dpps, setDpps] = useState<NoteItem[] | null>(null);
  const [query, setQuery] = useState("");
  const [playing, setPlaying] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    fetch(
      `/api/batches/${batchId}/subjects/${encodeURIComponent(subjectSlug)}/contents?contentType=videos&tag=${encodeURIComponent(topicId)}&pages=6`
    )
      .then((r) => r.json())
      .then((d) => alive && setLectures(d?.items ?? []))
      .catch(() => alive && setLectures([]));
    fetch(
      `/api/batches/${batchId}/subjects/${encodeURIComponent(subjectSlug)}/contents?contentType=notes&tag=${encodeURIComponent(topicId)}&pages=4`
    )
      .then((r) => r.json())
      .then((d) => alive && setNotes(d?.items ?? []))
      .catch(() => alive && setNotes([]));
    fetch(
      `/api/batches/${batchId}/subjects/${encodeURIComponent(subjectSlug)}/contents?contentType=DppNotes&tag=${encodeURIComponent(topicId)}&pages=4`
    )
      .then((r) => r.json())
      .then((d) => alive && setDpps(d?.items ?? []))
      .catch(() => alive && setDpps([]));
    return () => {
      alive = false;
    };
  }, [batchId, subjectSlug, topicId]);

  const filteredLectures = useMemo(() => {
    if (!lectures) return [];
    const q = query.trim().toLowerCase();
    return q ? lectures.filter((l) => l.title.toLowerCase().includes(q)) : lectures;
  }, [lectures, query]);

  const filteredNotes = useMemo(() => {
    if (!notes) return [];
    const q = query.trim().toLowerCase();
    return q ? notes.filter((n) => n.title.toLowerCase().includes(q)) : notes;
  }, [notes, query]);

  const filteredDpps = useMemo(() => {
    if (!dpps) return [];
    const q = query.trim().toLowerCase();
    return q ? dpps.filter((n) => n.title.toLowerCase().includes(q)) : dpps;
  }, [dpps, query]);

  const openLecture = (l: LectureItem) => {
    if (!l.videoId) {
      // need detail lookup
      setPlaying(l.id);
      fetch(
        `/api/batches/${batchId}/subjects/${encodeURIComponent(subjectSlug)}/schedule/${l.id}`
      )
        .then((r) => r.json())
        .then((d) => {
          setPlaying(null);
          if (d?.success) {
            navigate({
              view: "watch",
              batchId,
              subjectSlug,
              topicId,
              contentId: l.id,
              lectureTitle: d.lecture.title || l.title,
              videoId: d.lecture.videoId ?? d.lecture.videoUrl ?? "",
              videoType: d.lecture.urlType ?? "youtube",
              videoUrl: d.lecture.videoUrl ?? "",
              videoApiId: d.lecture.videoApiId ?? "",
            });
          }
        })
        .catch(() => setPlaying(null));
      return;
    }
    navigate({
      view: "watch",
      batchId,
      subjectSlug,
      topicId,
      contentId: l.id,
      lectureTitle: l.title,
      videoId: l.videoId,
      videoType: l.videoType ?? "youtube",
      videoUrl: l.videoUrl,
      videoApiId: l.videoApiId,
    });
  };

  return (
    <main className="flex-1 w-full px-3 sm:px-5">
      <div className="mx-auto max-w-7xl space-y-6 pb-6">
        {/* breadcrumb */}
        <div className="flex flex-wrap items-center gap-2 pt-6 text-xs text-muted-foreground">
          <GlassButton variant="glass" size="sm" onClick={back}>
            <ArrowLeft size={14} /> Back
          </GlassButton>
          <nav className="flex items-center gap-1.5 flex-wrap" aria-label="Breadcrumb">
            <button className="hover:text-[#3266e3] cursor-pointer flex items-center gap-1" onClick={() => navigate({ view: "home" })}>
              <Home size={12} /> Home
            </button>
            <ChevronRight size={12} />
            <button className="hover:text-[#3266e3] cursor-pointer line-clamp-1 max-w-[160px]" onClick={() => navigate({ view: "batch", batchId })}>
              {appState.batchName ?? "Batch"}
            </button>
            <ChevronRight size={12} />
            <button
              className="hover:text-[#3266e3] cursor-pointer line-clamp-1 max-w-[200px]"
              onClick={() => navigate({ view: "subject", batchId, subjectSlug })}
            >
              {appState.subjectName ?? "Subject"}
            </button>
            <ChevronRight size={12} />
            <span className="text-foreground/80 line-clamp-1 max-w-[220px]">{appState.topicName ?? "Chapter"}</span>
          </nav>
        </div>

        {/* header + tabs */}
        <div className="glass rounded-3xl p-6 sm:p-8 sb-fade-up">
          <GlassBadge tone="gold" className="mb-3">
            <BookMarked size={10} /> CHAPTER
          </GlassBadge>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
            {appState.topicName ?? "Chapter"}
          </h1>

          <div className="mt-6 grid gap-3">
            <div className="w-full overflow-x-auto sb-scroll">
              <div className="glass-soft rounded-full p-1 flex w-max min-w-full sm:min-w-0 gap-1">
                <ModeTab active={mode === "lectures"} onClick={() => setMode("lectures")} icon={<PlayCircle size={14} />} count={lectures?.length}>
                  Lectures
                </ModeTab>
                <ModeTab active={mode === "notes"} onClick={() => setMode("notes")} icon={<FileText size={14} />} count={notes?.length}>
                  Notes
                </ModeTab>
                <ModeTab active={mode === "dpps"} onClick={() => setMode("dpps")} icon={<ClipboardPen size={14} />} count={dpps?.length}>
                  DPP Quiz
                </ModeTab>
              </div>
            </div>
            <div className="flex items-center glass-soft rounded-full px-4 w-full">
              <Search size={15} className="text-[#7655db] shrink-0" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={mode === "lectures" ? "Search lectures..." : mode === "notes" ? "Search notes..." : "Search DPPs..."}
                className="w-full bg-transparent px-2.5 h-10 text-sm outline-none placeholder:text-muted-foreground/70"
                aria-label={`Search ${mode}`}
              />
            </div>
          </div>
        </div>

        {/* content */}
        {mode === "lectures" ? (
          <LectureList
            items={filteredLectures}
            loading={lectures === null}
            playing={playing}
            onPlay={openLecture}
          />
        ) : mode === "notes" ? (
          <NoteList
            items={filteredNotes}
            loading={notes === null}
            batchId={batchId}
            subjectSlug={subjectSlug}
          />
        ) : (
          <DppList
            items={filteredDpps}
            loading={dpps === null}
            batchId={batchId}
            subjectSlug={subjectSlug}
          />
        )}
      </div>
    </main>
  );
}

function ModeTab({
  active,
  onClick,
  icon,
  count,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 sm:gap-2 rounded-full px-3 sm:px-5 h-10 text-sm font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0",
        active ? "btn-gold" : "text-muted-foreground hover:text-foreground"
      )}
    >
      {icon}
      {children}
      {typeof count === "number" && (
        <span className={cn("text-[11px] rounded-full px-1.5 py-0.5", active ? "bg-black/20" : "bg-[#eef2f8] dark:bg-[#273550] dark:text-[#d5def0]")}>
          {count}
        </span>
      )}
    </button>
  );
}

function LectureList({
  items,
  loading,
  playing,
  onPlay,
}: {
  items: LectureItem[];
  loading: boolean;
  playing: string | null;
  onPlay: (l: LectureItem) => void;
}) {
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => <GlassSkeleton key={i} className="h-24" />)}
      </div>
    );
  }
  if (items.length === 0) {
    return <EmptyState icon={<PlayCircle size={22} />} title="No lectures here yet" hint="This chapter has no published lectures." />;
  }
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sb-fade-up">
      {items.map((l, i) => (
        <GlassCard key={l.id} className="p-3.5 cursor-pointer">
          <div className="flex gap-3.5">
            <button
              onClick={() => onPlay(l)}
              className="relative w-32 sm:w-44 aspect-video rounded-2xl overflow-hidden shrink-0 group border border-[#e5ebf4] cursor-pointer"
              aria-label={`Play ${l.title}`}
            >
              { }
              <img
                src={l.thumbnail || "/batch-thumbnail-fallback.svg"}
                alt=""
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                onError={(e) => ((e.currentTarget.src = "/batch-thumbnail-fallback.svg"))}
              />
              <span className="absolute inset-0 bg-black/25 flex items-center justify-center">
                {playing === l.id ? (
                  <Loader2 size={22} className="text-white animate-spin" />
                ) : (
                  <span className="w-10 h-10 rounded-full btn-gold flex items-center justify-center opacity-95 group-hover:scale-110 transition-transform">
                    <Play size={15} className="ml-0.5" />
                  </span>
                )}
              </span>
              {l.duration && (
                <span className="absolute bottom-1.5 right-1.5 rounded-md bg-black/70 backdrop-blur px-1.5 py-0.5 text-[10px] font-bold text-white">
                  {l.duration}
                </span>
              )}
            </button>
            <div className="min-w-0 flex-1 py-0.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Lecture {i + 1}
                {l.date ? ` · ${new Date(l.date).toLocaleDateString()}` : ""}
              </p>
              <h3
                className="mt-1 font-bold text-sm leading-snug line-clamp-2 cursor-pointer hover:text-[#3266e3] transition-colors"
                onClick={() => onPlay(l)}
              >
                {l.title}
              </h3>
              <div className="mt-2 flex items-center gap-1.5">
                {l.videoId && <GlassBadge tone="green">Ready to play</GlassBadge>}
              </div>
            </div>
          </div>
        </GlassCard>
      ))}
    </div>
  );
}

function NoteList({
  items,
  loading,
  batchId,
  subjectSlug,
}: {
  items: NoteItem[];
  loading: boolean;
  batchId: string;
  subjectSlug: string;
}) {
  if (loading) {
    return <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <GlassSkeleton key={i} className="h-32" />)}</div>;
  }
  if (items.length === 0) {
    return <EmptyState icon={<FileText size={22} />} title="No notes here yet" hint="Class notes and study material will appear here." />;
  }
  return (
    <div className="space-y-4 sb-fade-up">
      {items.map((note) => (
        <article key={note.id} className="overflow-hidden rounded-[1.4rem] border border-[#e4e9f1] bg-white shadow-[0_5px_18px_rgba(27,48,84,.04)] dark:border-[#293750] dark:bg-[#121c30]">
          <div className="flex items-start gap-3.5 p-4 sm:items-center sm:px-5 sm:py-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#edf4ff] text-[#3268df]"><FileText size={22} /></span>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold text-[#8290a5] dark:text-[#91a1bd]">Notes · Available{note.date ? ` · ${new Date(note.date).toLocaleDateString()}` : ""}</p>
              <h3 className="mt-1 line-clamp-2 text-[15px] font-bold leading-snug text-[#1c2e4c] dark:text-[#e8eef9] sm:text-base">{note.title}</h3>
            </div>
            <CheckCircle2 size={22} className="mt-1 shrink-0 text-[#71829d] sm:mt-0" />
          </div>
          <div className="grid grid-cols-2 gap-2 border-t border-[#edf1f6] p-3.5 dark:border-[#293750] sm:px-5">
            <NoteActionButton contentId={note.id} title={note.title} fileName={note.fileName} fileUrl={note.fileUrl} batchId={batchId} subjectSlug={subjectSlug} action="view" />
            <NoteActionButton contentId={note.id} title={note.title} fileName={note.fileName} fileUrl={note.fileUrl} batchId={batchId} subjectSlug={subjectSlug} action="download" />
          </div>
        </article>
      ))}
    </div>
  );
}

function DppList({
  items,
  loading,
  batchId,
  subjectSlug,
}: {
  items: NoteItem[];
  loading: boolean;
  batchId: string;
  subjectSlug: string;
}) {
  if (loading) {
    return <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <GlassSkeleton key={i} className="h-32" />)}</div>;
  }
  if (items.length === 0) {
    return <EmptyState icon={<ClipboardPen size={22} />} title="No DPPs here yet" hint="Daily Practice Problems will appear here." />;
  }
  return (
    <div className="space-y-4 sb-fade-up">
      {items.map((item) => (
        <article key={item.id} className="overflow-hidden rounded-[1.4rem] border border-[#e4e9f1] bg-white shadow-[0_5px_18px_rgba(27,48,84,.04)] dark:border-[#293750] dark:bg-[#121c30]">
          <div className="flex items-start gap-3.5 p-4 sm:items-center sm:px-5 sm:py-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#f2edff] text-[#8058d7]"><ClipboardPen size={22} /></span>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold text-[#8290a5] dark:text-[#91a1bd]">Practice sheet · Available{item.date ? ` · ${new Date(item.date).toLocaleDateString()}` : ""}</p>
              <h3 className="mt-1 line-clamp-2 text-[15px] font-bold leading-snug text-[#1c2e4c] dark:text-[#e8eef9] sm:text-base">{item.title}</h3>
            </div>
            <CheckCircle2 size={22} className="mt-1 shrink-0 text-[#71829d] sm:mt-0" />
          </div>
          <div className="grid grid-cols-2 gap-2 border-t border-[#edf1f6] p-3.5 dark:border-[#293750] sm:px-5">
            <NoteActionButton contentId={item.id} title={item.title} fileName={item.fileName} fileUrl={item.fileUrl} batchId={batchId} subjectSlug={subjectSlug} action="view" />
            <NoteActionButton contentId={item.id} title={item.title} fileName={item.fileName} fileUrl={item.fileUrl} batchId={batchId} subjectSlug={subjectSlug} action="download" />
          </div>
        </article>
      ))}
    </div>
  );
}

/** Open the resolved attachment in the in-app PDF viewer or download it directly. */
function NoteActionButton({
  contentId,
  title,
  fileName,
  fileUrl,
  batchId,
  subjectSlug,
  action,
}: {
  contentId: string;
  title: string;
  fileName?: string;
  fileUrl?: string;
  batchId: string;
  subjectSlug: string;
  action: "view" | "download";
}) {
  const [busy, setBusy] = useState(false);
  const appState = useApp();
  const { toast } = useToast();

  const open = async () => {
    if (busy) return;
    setBusy(true);
    try {
      let noteUrl = fileUrl;
      let resolvedName = fileName || title || "Study-Notes.pdf";

      // Older upstream records expose the file only on the schedule detail.
      if (!noteUrl) {
        const response = await fetch(
          `/api/batches/${encodeURIComponent(batchId)}/subjects/${encodeURIComponent(subjectSlug)}/schedule/${encodeURIComponent(contentId)}`,
          { cache: "no-store" }
        );
        if (!response.ok) throw new Error("The note details could not be loaded. Please try again.");
        const data = await response.json();
        const attachment = Array.isArray(data?.notes)
          ? data.notes.find((entry: { url?: string }) => !!entry?.url)
          : undefined;
        noteUrl = attachment?.url ?? data?.fileUrl ?? data?.attachment?.url;
        resolvedName = attachment?.name ?? data?.fileName ?? resolvedName;
      }

      if (!noteUrl) {
        throw new Error("This note does not have a PDF attachment available yet.");
      }

      if (action === "view") {
        appState.navigate({
          view: "pdf",
          batchId,
          subjectSlug,
          contentId,
          lectureTitle: resolvedName,
          videoId: noteUrl,
        });
      } else {
        const downloadName = makePdfFilename(resolvedName);
        const downloadUrl = `/api/pdf?url=${encodeURIComponent(noteUrl)}&download=1&filename=${encodeURIComponent(downloadName)}`;
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = downloadName;
        link.rel = "noopener";
        link.style.display = "none";
        document.body.appendChild(link);
        link.click();
        link.remove();
      }
    } catch (error) {
      toast({
        title: action === "view" ? "Unable to open note" : "Download failed",
        description: error instanceof Error ? error.message : "Please try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  };

  const isView = action === "view";
  return (
    <button type="button" onClick={open} disabled={busy} className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl border px-3 text-xs font-extrabold transition disabled:cursor-wait disabled:opacity-60 ${isView ? "border-[#dce8f2] bg-[#e8f5ff] text-[#1687ba] hover:bg-[#dff0fc] dark:border-[#294f70] dark:bg-[#17334a] dark:text-[#8ed5ff] dark:hover:bg-[#1b405b]" : "border-[#e2e7ee] bg-[#f8fafc] text-[#24344f] hover:bg-[#f0f3f8] dark:border-[#33425d] dark:bg-[#1a2740] dark:text-[#d5def0] dark:hover:bg-[#24334f]"}`}>
      {busy ? <Loader2 size={15} className="animate-spin" /> : isView ? <Eye size={15} /> : <Download size={15} />}
      {busy ? "Please wait..." : isView ? "View" : "Download"}
    </button>
  );
}

function makePdfFilename(value: string): string {
  const cleaned = value.replace(/[\\/:*?"<>|\r\n]+/g, "-").trim().slice(0, 100) || "Study-Notes";
  return /\.pdf$/i.test(cleaned) ? cleaned : `${cleaned}.pdf`;
}
