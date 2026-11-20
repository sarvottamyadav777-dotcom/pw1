"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useApp } from "@/lib/store";
import {
  GlassBadge,
  GlassButton,
  GlassCard,
  GlassSkeleton,
  SafeImage,
} from "./glass";
import {
  FileText,
  ListVideo,
  Bookmark,
  BookmarkCheck,
  ChevronLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NativePlayer } from "./native-player";

export interface StreamResolution {
  playable: boolean;
  kind: "mp4" | "hls" | "dash" | "unknown";
  url: string;
  reason?: string;
  folder?: string;
  engine?: "hls" | "dash" | "native";
  manifestVia?: string;
  clearKey?: string;
  clearKid?: string;
  sig?: string;
  title?: string;
  duration?: string;
}

/* --------------------------------- component --------------------------------- */

export function WatchView({
  batchId,
  subjectSlug,
  topicId,
  contentId,
  playerOnly = false,
}: {
  batchId: string;
  subjectSlug: string;
  topicId?: string;
  contentId: string;
  playerOnly?: boolean;
}) {
  const { navigate, back } = useApp();
  const appState = useApp();

  const [videoId, setVideoId] = useState<string | undefined>(appState.videoId);
  const [urlType, setUrlType] = useState<string>(appState.videoType ?? "youtube");
  const [stream, setStream] = useState<StreamResolution | null>(null);
  const [resolving, setResolving] = useState(false);
  const [title, setTitle] = useState(appState.lectureTitle ?? "");
  const [notes, setNotes] = useState<NoteDoc[]>([]);
  const [playlist, setPlaylist] = useState<PlaylistLecture[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookmarkSet, setBookmarkSet] = useState(false);

  /* ----------------------------- fetch detail ----------------------------- */
  useEffect(() => {
    let alive = true;
    const routeVideoId = appState.videoId?.trim() ?? "";
    const routeVideoUrl = appState.videoUrl?.trim() ?? "";
    const routeVideoApiId = appState.videoApiId?.trim() ?? "";
    const routeType = inferPlayerType(appState.videoType, routeVideoUrl || routeVideoId);
    const routeRawUrl = routeVideoUrl || (
      routeType !== "youtube" && isHttpUrl(routeVideoId) ? routeVideoId : ""
    );
    const hasRouteSource = !!(routeVideoId || routeVideoUrl || routeVideoApiId);

    const resolveStream = (apiId: string, rawUrl: string) => {
      if (!alive) return;
      setResolving(true);
      setStream(null);
      const endpointId = apiId || (rawUrl ? "direct" : "unknown");
      const query = rawUrl ? `?url=${encodeURIComponent(rawUrl)}` : "";
      fetch(`/api/streams/${encodeURIComponent(endpointId)}${query}`)
        .then((response) => response.json())
        .then((result) => {
          if (!alive) return;
          setStream({ ...result, playable: !!result?.playable });
          setResolving(false);
        })
        .catch(() => {
          if (!alive) return;
          setStream({ playable: false, kind: "unknown", url: "", reason: "Could not resolve this lecture stream. Check the connection and retry." });
          setResolving(false);
        });
    };

    // Content lists and today's live schedule already provide the source. Use
    // it immediately; the schedule detail request below is only for notes and
    // extra metadata, not a prerequisite for starting playback.
    if (hasRouteSource) {
      setTitle(appState.lectureTitle ?? "Lecture");
      setUrlType(routeType);
      setVideoId(routeVideoId || routeVideoApiId || routeRawUrl);
      setLoading(false);
      if (routeType === "youtube") {
        setResolving(false);
        setStream(null);
      } else {
        resolveStream(routeVideoApiId || (routeRawUrl ? "direct" : routeVideoId), routeRawUrl);
      }
    } else {
      setLoading(true);
      setStream(null);
      setResolving(false);
    }

    fetch(`/api/batches/${encodeURIComponent(batchId)}/subjects/${encodeURIComponent(subjectSlug)}/schedule/${encodeURIComponent(contentId)}`)
      .then((response) => response.json())
      .then((data) => {
        if (!alive) return;
        if (!data?.success) {
          if (!hasRouteSource) {
            setLoading(false);
            setStream({ playable: false, kind: "unknown", url: "", reason: data?.error || "Lecture details are unavailable." });
          }
          return;
        }
        const lecture = data.lecture ?? {};
        setNotes(data.notes ?? []);
        if (lecture.title) setTitle(lecture.title);

        if (!hasRouteSource) {
          const type = inferPlayerType(lecture.urlType, lecture.videoUrl || lecture.videoId || "");
          const rawUrl = lecture.videoUrl || (type !== "youtube" && isHttpUrl(lecture.videoId) ? lecture.videoId : "");
          setUrlType(type);
          setVideoId(lecture.videoId || lecture.videoApiId || rawUrl || undefined);
          setLoading(false);
          if (type === "youtube") {
            setResolving(false);
            setStream(null);
          } else {
            resolveStream(lecture.videoApiId || (rawUrl ? "direct" : lecture.videoId || ""), rawUrl);
          }
        }
      })
      .catch(() => {
        if (!alive) return;
        if (!hasRouteSource) {
          setLoading(false);
          setStream({ playable: false, kind: "unknown", url: "", reason: "Lecture details could not be loaded. Please try again." });
        }
      });

    return () => {
      alive = false;
    };
  }, [batchId, subjectSlug, contentId, appState.videoId, appState.videoType, appState.videoUrl, appState.videoApiId, appState.lectureTitle]);

  /* ------------------------------ playlist -------------------------------- */
  useEffect(() => {
    if (!topicId) return;
    let alive = true;
    fetch(
      `/api/batches/${batchId}/subjects/${encodeURIComponent(subjectSlug)}/contents?contentType=videos&tag=${encodeURIComponent(topicId)}&pages=6`
    )
      .then((r) => r.json())
      .then((d) => {
        if (!alive) return;
        setPlaylist(
          (d?.items ?? []).map((x: PlaylistLecture) => ({
            id: x.id,
            title: x.title,
            thumbnail: x.thumbnail,
            duration: x.duration,
            isLocked: x.isLocked,
          }))
        );
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [batchId, subjectSlug, topicId]);

  /* ------------------------------ bookmark -------------------------------- */
  useEffect(() => {
    let alive = true;
    fetch("/api/bookmarks")
      .then((r) => r.json())
      .then((d) => {
        if (!alive) return;
        setBookmarkSet((d?.items ?? []).some((b: { contentId: string }) => b.contentId === contentId));
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [contentId]);

  const toggleBookmark = async () => {
    const res = await fetch("/api/bookmarks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kind: "lecture",
        contentId,
        batchId,
        batchName: appState.batchName ?? "",
        subjectName: appState.subjectName ?? "",
        title,
        subtitle: appState.topicName ?? "",
        url: videoId,
        urlType: urlType === "youtube" ? "youtube" : stream?.kind ?? "hls",
        thumbnail: "",
      }),
    });
    const d = await res.json();
    if (d?.success) setBookmarkSet(d.bookmarked);
  };

  /* --------------------------- history tracking --------------------------- */
  const savePosition = useCallback(
    (pos: number) => {
      fetch("/api/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          batchId,
          batchName: appState.batchName ?? "",
          batchImage: appState.batchImage ?? "",
          subjectId: subjectSlug,
          subjectName: appState.subjectName ?? prettify(subjectSlug),
          subjectSlug,
          topicId,
          topicName: appState.topicName ?? "",
          contentId,
          lectureTitle: title,
          videoId,
          videoType: urlType === "youtube" ? "youtube" : stream?.kind ?? "hls",
          positionSec: Math.floor(pos),
        }),
      }).catch(() => {});
    },
    [batchId, subjectSlug, topicId, contentId, title, videoId, urlType, stream, appState.batchName, appState.batchImage, appState.subjectName, appState.topicName]
  );

  /* ------------------- history ping (once) -------------------- */
  const historyInitRef = useRef<string | null>(null);
  useEffect(() => {
    if (historyInitRef.current !== contentId) {
      historyInitRef.current = contentId;
      savePosition(0);
    }
  }, [contentId, savePosition]);

  if (playerOnly && (loading || (resolving && urlType !== "youtube"))) {
    return (
      <main className="fixed inset-0 flex items-center justify-center bg-black">
        <GlassSkeleton className="h-[60vh] w-[92vw] max-w-[1600px] rounded-2xl" />
      </main>
    );
  }

  if (playerOnly) {
    return (
      <main className="fixed inset-0 flex min-h-0 min-w-0 flex-col bg-black">
        {/* Player — fills the entire viewport, responsive */}
        <div className="relative flex min-h-0 flex-1 w-full items-center justify-center bg-black">
          <div className="relative w-full h-full max-w-[1600px] mx-auto flex items-center justify-center">
            <PlayerBlock
              urlType={urlType}
              videoId={videoId}
              stream={stream}
              title={title}
              notes={notes}
              onPosition={savePosition}
              onOpenNote={(url, name) => navigate({ view: "pdf", lectureTitle: name, videoId: url })}
              fullPage
              onBack={back}
              bookmarked={bookmarkSet}
              onBookmark={toggleBookmark}
            />
          </div>
        </div>
      </main>
    );
  }

  if (loading || (resolving && urlType !== "youtube")) {
    return (
      <main className="flex-1 w-full px-3 sm:px-5">
        <div className="mx-auto max-w-7xl pt-6 space-y-4">
          <GlassSkeleton className="aspect-video max-w-4xl" />
          <GlassSkeleton className="h-8 w-2/3 max-w-xl" />
        </div>
      </main>
    );
  }

  if (!videoId) {
    return (
      <main className="flex-1 w-full px-3 sm:px-5">
        <div className="mx-auto max-w-7xl pt-6 pb-8 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <GlassButton variant="glass" size="sm" onClick={back} className="shrink-0">
              <ChevronLeft size={15} /> Back to chapter
            </GlassButton>
          </div>
          <div className="grid gap-5 grid-cols-1 xl:grid-cols-[1fr_360px]">
            <div className="space-y-4 min-w-0">
              <PlayerBlock
                urlType={urlType}
                videoId={videoId}
                stream={stream}
                title={title}
                notes={notes}
                onPosition={savePosition}
                onOpenNote={(url, name) => navigate({ view: "pdf", lectureTitle: name, videoId: url })}
              />
              {playlist.length > 0 && (
                <div className="xl:hidden">
                  <PlaylistCard
                    playlist={playlist}
                    contentId={contentId}
                    onOpen={(p) => navigate({ view: "watch", batchId, subjectSlug, topicId, contentId: p.id, lectureTitle: p.title })}
                  />
                </div>
              )}
              <LectureMetaCard
                title={title}
                appState={appState}
                batchId={batchId}
                navigate={navigate}
                bookmarkSet={bookmarkSet}
                onBookmark={toggleBookmark}
              />
              <NotesCard notes={notes} />
            </div>
            {playlist.length > 0 && (
              <aside className="hidden min-w-0 xl:block">
                <PlaylistCard
                  playlist={playlist}
                  contentId={contentId}
                  onOpen={(p) =>
                    navigate({
                      view: "watch",
                      batchId,
                      subjectSlug,
                      topicId,
                      contentId: p.id,
                      lectureTitle: p.title,
                    })
                  }
                />
              </aside>
            )}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 w-full px-3 sm:px-5">
      <div className="mx-auto max-w-[1400px] pt-6 pb-8 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <GlassButton variant="glass" size="sm" onClick={back} className="shrink-0">
            <ChevronLeft size={15} /> Back to chapter
          </GlassButton>
        </div>

        <div className={cn("grid gap-5", "grid-cols-1 xl:grid-cols-[1fr_360px]")}>
          {/* player column */}
          <div className="space-y-4 min-w-0">
            <PlayerBlock
              urlType={urlType}
              videoId={videoId}
              stream={stream}
              title={title}
              notes={notes}
              onPosition={savePosition}
              onOpenNote={(url, name) => navigate({ view: "pdf", lectureTitle: name, videoId: url })}
            />

            {playlist.length > 0 && (
              <div className="xl:hidden">
                <PlaylistCard
                  playlist={playlist}
                  contentId={contentId}
                  onOpen={(p) => navigate({ view: "watch", batchId, subjectSlug, topicId, contentId: p.id, lectureTitle: p.title })}
                />
              </div>
            )}
            <LectureMetaCard
              title={title}
              appState={appState}
              batchId={batchId}
              navigate={navigate}
              bookmarkSet={bookmarkSet}
              onBookmark={toggleBookmark}
            />

            <NotesCard notes={notes} />
          </div>

          {/* playlist column */}
          {playlist.length > 0 && (
            <aside className="hidden min-w-0 xl:block">
              <PlaylistCard
                playlist={playlist}
                contentId={contentId}
                onOpen={(p) =>
                  navigate({
                    view: "watch",
                    batchId,
                    subjectSlug,
                    topicId,
                    contentId: p.id,
                    lectureTitle: p.title,
                  })
                }
              />
            </aside>
          )}
        </div>
      </div>
    </main>
  );
}

/* --------------------------- Unified video player --------------------------- */

function PlayerBlock({
  urlType,
  videoId,
  stream,
  title,
  notes,
  onPosition,
  onOpenNote,
  fullPage = false,
  onBack,
  bookmarked,
  onBookmark,
}: {
  urlType: string;
  videoId?: string;
  stream: StreamResolution | null;
  title: string;
  notes?: NoteDoc[];
  onPosition?: (seconds: number) => void;
  onOpenNote?: (url: string, name: string) => void;
  fullPage?: boolean;
  onBack?: () => void;
  bookmarked?: boolean;
  onBookmark?: () => void;
}) {
  const youtubeId = urlType === "youtube" ? extractYoutubeId(videoId ?? "") : undefined;

  if (youtubeId) {
    return (
      <div className={cn(
        "relative min-w-0 overflow-hidden bg-black",
        fullPage ? "flex h-full w-full items-center justify-center" : "aspect-video w-full rounded-2xl border border-white/10"
      )}>
        {fullPage && (
          <div className="absolute inset-x-0 top-0 z-20 flex items-center gap-3 bg-gradient-to-b from-black/80 to-transparent px-3 pb-8 pt-3 sm:px-5">
            <button type="button" onClick={onBack} aria-label="Close player" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20">
              <ChevronLeft size={19} />
            </button>
            <p className="min-w-0 flex-1 truncate text-sm font-semibold text-white">{title}</p>
            {onBookmark && (
              <button type="button" onClick={onBookmark} aria-label={bookmarked ? "Remove bookmark" : "Bookmark lecture"} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20">
                {bookmarked ? <BookmarkCheck size={17} /> : <Bookmark size={17} />}
              </button>
            )}
          </div>
        )}
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${youtubeId}?controls=1&rel=0&modestbranding=1&playsinline=1&iv_load_policy=3`}
          title={title || "Lecture video"}
          className={cn("border-0", fullPage ? "h-full w-full" : "absolute inset-0 h-full w-full")}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
    );
  }

  if (stream?.playable && stream.url) {
    return (
      <NativePlayer
        stream={stream}
        title={title}
        notes={notes}
        onPosition={onPosition}
        onOpenNote={onOpenNote}
        fullPage={fullPage}
        onBack={onBack}
        bookmarked={bookmarked}
        onBookmark={onBookmark}
      />
    );
  }

  return (
    <div className={cn(
      "flex flex-col items-center justify-center gap-3 rounded-2xl border border-white/10 bg-[#0b241e] px-6 text-center text-white",
      fullPage ? "h-full w-full" : "aspect-video w-full"
    )}>
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 text-[#e7bd6d]">
        <ListVideo size={25} />
      </div>
      <div className="max-w-md">
        <p className="text-base font-bold">This lecture is not available right now</p>
        <p className="mt-2 text-sm leading-6 text-white/60">{stream?.reason || "The video stream could not be prepared. Please try again later."}</p>
      </div>
      {fullPage && onBack && (
        <button type="button" onClick={onBack} className="mt-2 inline-flex h-10 items-center gap-2 rounded-full bg-white/10 px-4 text-sm font-semibold text-white transition hover:bg-white/15">
          <ChevronLeft size={16} /> Back to lectures
        </button>
      )}
    </div>
  );
}

function isHttpUrl(value: string): boolean {
  return /^https?:\/\//i.test(value.trim());
}

function inferPlayerType(declared: string | undefined, source: string): string {
  const value = source.trim();
  if (/(?:youtube\.com|youtu\.be)/i.test(value)) return "youtube";
  const type = (declared ?? "").trim().toLowerCase();
  if (type && type !== "youtube") return type;
  if (!value || /^[A-Za-z0-9_-]{11}$/.test(value)) return "youtube";
  return "hls";
}

function extractYoutubeId(value: string): string | undefined {
  const raw = value.trim();
  if (!raw) return undefined;
  if (/^[A-Za-z0-9_-]{6,20}$/.test(raw)) return raw;
  const match = raw.match(/(?:youtube\.com\/(?:watch\?.*v=|embed\/|live\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,20})/);
  return match?.[1];
}

/* ------------------------------ shared cards ------------------------------ */

function LectureMetaCard({
  title,
  appState,
  batchId,
  navigate,
  bookmarkSet,
  onBookmark,
}: {
  title: string;
  appState: ReturnType<typeof useApp.getState>;
  batchId: string;
  navigate: ReturnType<typeof useApp.getState>["navigate"];
  bookmarkSet: boolean;
  onBookmark: () => void;
}) {
  return (
    <GlassCard hover={false} className="p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-lg sm:text-2xl font-extrabold tracking-tight leading-snug">{title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {appState.batchName && (
              <button
                className="cursor-pointer"
                onClick={() => navigate({ view: "batch", batchId })}
              >
                <GlassBadge tone="gold">{appState.batchName}</GlassBadge>
              </button>
            )}
            {appState.subjectName && <GlassBadge>{appState.subjectName}</GlassBadge>}
            {appState.topicName && <GlassBadge>{appState.topicName}</GlassBadge>}
          </div>
        </div>
        <GlassButton variant={bookmarkSet ? "gold" : "glass"} onClick={onBookmark}>
          {bookmarkSet ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}
          {bookmarkSet ? "Saved" : "Save"}
        </GlassButton>
      </div>
    </GlassCard>
  );
}

function NotesCard({ notes }: { notes: NoteDoc[] }) {
  const navigate = useApp((s) => s.navigate);
  return (
    <GlassCard hover={false} className="p-5 sm:p-6">
      <h2 className="flex items-center gap-2 font-bold">
        <FileText size={17} className="text-[#d3a64c]" /> Attached Notes & DPPs
      </h2>
      {notes.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">No notes attached to this lecture.</p>
      ) : (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {notes.map((n) => (
            <button
              key={n.id}
              onClick={() => navigate({ view: "pdf", lectureTitle: n.name, videoId: n.url })}
              className="flex items-center gap-3 rounded-2xl glass-soft px-4 py-3 group text-left cursor-pointer"
            >
              <span className="w-10 h-10 rounded-xl glass flex items-center justify-center text-[#d3a64c] shrink-0">
                <FileText size={17} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold line-clamp-1 group-hover:text-[#f2d28b] transition-colors">
                  {n.name}
                </span>
                <span className="block text-[11px] text-muted-foreground">PDF · opens in viewer</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </GlassCard>
  );
}

function PlaylistCard({
  playlist,
  contentId,
  onOpen,
}: {
  playlist: PlaylistLecture[];
  contentId: string;
  onOpen: (p: PlaylistLecture) => void;
}) {
  return (
    <GlassCard hover={false} className="overflow-hidden xl:sticky xl:top-24">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-white/8">
        <ListVideo size={17} className="text-[#d3a64c]" />
        <h2 className="font-bold text-sm">Chapter Playlist</h2>
        <span className="ml-auto text-xs text-muted-foreground">{playlist.length}</span>
      </div>
      <div className="max-h-[60vh] overflow-y-auto sb-scroll">
        {playlist.length === 0 ? (
          <p className="px-5 py-8 text-sm text-muted-foreground text-center">
            Playlist unavailable for this chapter.
          </p>
        ) : (
          playlist.map((p, i) => (
            <button
              key={p.id}
              onClick={() => onOpen(p)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 text-left transition-colors cursor-pointer border-b border-white/5 last:border-0",
                p.id === contentId ? "bg-[#d3a64c]/10" : "hover:bg-white/5"
              )}
            >
              <span className={cn("text-[11px] font-bold w-5 shrink-0", p.id === contentId ? "text-[#d3a64c]" : "text-muted-foreground")}>
                {i + 1}
              </span>
              <span className="relative w-20 aspect-video rounded-lg overflow-hidden shrink-0 border border-white/10">
                <SafeImage src={p.thumbnail} alt="" className="w-full h-full object-cover" />
              </span>
              <span className={cn("min-w-0 flex-1 text-[13px] leading-snug line-clamp-2 font-medium", p.id === contentId && "text-[#f2d28b]")}>
                {p.title}
              </span>
            </button>
          ))
        )}
      </div>
    </GlassCard>
  );
}

/* --------------------------------- types ----------------------------------- */

interface NoteDoc {
  id: string;
  name: string;
  url: string;
  note?: string;
}

interface PlaylistLecture {
  id: string;
  title: string;
  thumbnail?: string;
  duration?: string;
  isLocked?: boolean;
}

/* --------------------------------- helpers ---------------------------------- */

function prettify(slug: string): string {
  return slug
    .split("-")
    .slice(0, -1)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}