"use client";

import { create } from "zustand";

/**
 * Elite Study client-side router. The first visit opens the Study dashboard;
 * Physics Wallah is the default learning institution.
 */
export type ViewName =
  | "institutions"
  | "home"
  | "batch"
  | "subject"
  | "topic"
  | "watch"
  | "dashboard"
  | "about"
  | "pdf";

export interface RouteState {
  view: ViewName;
  institutionId?: string;
  institutionName?: string;
  batchId?: string;
  batchName?: string;
  batchImage?: string;
  subjectSlug?: string;
  subjectName?: string;
  topicId?: string;
  topicName?: string;
  contentId?: string;
  lectureTitle?: string;
  videoId?: string;
  videoType?: string;
  videoUrl?: string;
  videoApiId?: string;
  tab?: string;
}

interface AppState extends RouteState {
  navigate: (state: RouteState) => void;
  back: () => void;
  hydrateFromHash: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

function serialize(state: RouteState): string {
  // Batches have a real, refresh-safe route instead of living only in a hash.
  if (state.view === "batch" && state.batchId) return `/batch/${encodeURIComponent(state.batchId)}`;

  const parts: string[] = [`#${state.view}`];
  if (state.view === "dashboard") {
    if (state.institutionId) parts.push(encodeURIComponent(state.institutionId));
    if (state.institutionName) parts.push(encodeURIComponent(state.institutionName));
  }
  if (state.batchId) parts.push(encodeURIComponent(state.batchId));
  if (state.view === "subject" || state.view === "topic" || state.view === "watch") {
    if (state.subjectSlug) parts.push(encodeURIComponent(state.subjectSlug));
  }
  if (state.view === "topic") {
    if (state.topicId) parts.push(encodeURIComponent(state.topicId));
  }
  if (state.view === "watch") {
    // Keep the contentId slot stable for schedule/live classes without a chapter.
    parts.push(state.topicId ? encodeURIComponent(state.topicId) : "~");
  }
  if (state.view === "watch" && state.contentId) {
    parts.push(encodeURIComponent(state.contentId));
  }
  if (state.view === "pdf" && state.contentId) {
    parts.push(encodeURIComponent(state.contentId));
  }
  return parts.join("/");
}

function parseHash(hash: string): RouteState {
  const clean = hash.replace(/^#\/?/, "");
  if (!clean) return { view: "home" };
  const parts = clean.split("/").map((part) => decodeURIComponent(part));
  const [view, a, b, c, d] = parts;

  switch (view) {
    case "institutions":
      return { view: "institutions" };
    case "home":
      return { view: "home" };
    case "dashboard":
      return { view: "dashboard", institutionId: a, institutionName: b };
    case "batch":
      return { view: "batch", batchId: a };
    case "subject":
      return { view: "subject", batchId: a, subjectSlug: b };
    case "topic":
      return { view: "topic", batchId: a, subjectSlug: b, topicId: c };
    case "watch":
      return { view: "watch", batchId: a, subjectSlug: b, topicId: c && c !== "~" ? c : undefined, contentId: d };
    case "about":
      return { view: "about" };
    case "pdf":
      return { view: "pdf", batchId: a, contentId: b };
    default:
      return { view: "home" };
  }
}

const DEFAULT_INSTITUTION_ID = "physics-wallah";
const DEFAULT_INSTITUTION_NAME = "Physics Wallah";

export const useApp = create<AppState>((set, get) => ({
  view: "home",
  institutionId: DEFAULT_INSTITUTION_ID,
  institutionName: DEFAULT_INSTITUTION_NAME,
  navigate: (state) => {
    const current = get();
    const nextState: RouteState = {
      view: state.view,
      institutionId: state.institutionId ?? current.institutionId,
      institutionName: state.institutionName ?? current.institutionName,
      batchId: state.batchId,
      batchName: state.batchName ?? (state.batchId && state.batchId === current.batchId ? current.batchName : undefined),
      batchImage: state.batchImage ?? (state.batchId && state.batchId === current.batchId ? current.batchImage : undefined),
      subjectSlug: state.subjectSlug,
      subjectName: state.subjectName ?? (state.subjectSlug && state.subjectSlug === current.subjectSlug ? current.subjectName : undefined),
      topicId: state.topicId,
      topicName: state.topicName ?? (state.topicId && state.topicId === current.topicId ? current.topicName : undefined),
      contentId: state.contentId,
      lectureTitle: state.lectureTitle,
      videoId: state.videoId,
      videoType: state.videoType,
      videoUrl: state.videoUrl,
      videoApiId: state.videoApiId,
      tab: state.tab,
    };
    if (typeof window !== "undefined" && nextState.institutionId) {
      try {
        localStorage.setItem("elite-study:selected-institution", JSON.stringify({
          institutionId: nextState.institutionId,
          institutionName: nextState.institutionName ?? "",
        }));
      } catch {
        // The current route still works if browser storage is unavailable.
      }
    }
    const hash = serialize(nextState);
    if (typeof window !== "undefined" && window.location.hash !== hash) {
      const url = hash || `${window.location.pathname}${window.location.search}`;
      window.history.pushState(null, "", url);
    }
    set(nextState);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  },
  back: () => {
    if (typeof window !== "undefined") window.history.back();
  },
  hydrateFromHash: () => {
    if (typeof window === "undefined") return;
    const batchPath = window.location.pathname.match(/^\/batch\/([^/]+)\/?$/);
    const route = window.location.hash
      ? parseHash(window.location.hash)
      : batchPath
        ? { view: "batch" as const, batchId: decodeURIComponent(batchPath[1]) }
        : parseHash("");
    const current = get();
    let remembered: Pick<RouteState, "institutionId" | "institutionName"> = {};
    try {
      const stored = JSON.parse(localStorage.getItem("elite-study:selected-institution") || "null") as
        | { institutionId?: string; institutionName?: string }
        | null;
      if (stored?.institutionId) {
        remembered = { institutionId: stored.institutionId, institutionName: stored.institutionName };
      }
    } catch {
      // Ignore invalid or unavailable browser storage.
    }
    set({
      view: route.view,
      institutionId: route.institutionId ?? remembered.institutionId ?? DEFAULT_INSTITUTION_ID,
      institutionName: route.institutionName ?? remembered.institutionName ?? DEFAULT_INSTITUTION_NAME,
      batchId: route.batchId,
      batchName: route.batchName ?? (route.batchId && route.batchId === current.batchId ? current.batchName : undefined),
      batchImage: route.batchImage ?? (route.batchId && route.batchId === current.batchId ? current.batchImage : undefined),
      subjectSlug: route.subjectSlug,
      subjectName: route.subjectName ?? (route.subjectSlug && route.subjectSlug === current.subjectSlug ? current.subjectName : undefined),
      topicId: route.topicId,
      topicName: route.topicName ?? (route.topicId && route.topicId === current.topicId ? current.topicName : undefined),
      contentId: route.contentId,
      lectureTitle: route.lectureTitle,
      videoId: route.videoId,
      videoType: route.videoType,
      videoUrl: route.videoUrl,
      videoApiId: route.videoApiId,
      tab: route.tab,
    });
  },
  searchQuery: "",
  setSearchQuery: (q) => set({ searchQuery: q }),
}));

/** Initialize hash <-> store sync (call once from the root component). */
export function bindRouter() {
  if (typeof window === "undefined") return () => {};
  const onPop = () => useApp.getState().hydrateFromHash();
  window.addEventListener("popstate", onPop);
  useApp.getState().hydrateFromHash();
  return () => window.removeEventListener("popstate", onPop);
}
