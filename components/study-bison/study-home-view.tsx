"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  BookmarkCheck,
  CalendarDays,
  ChevronRight,
  GraduationCap,
  Layers3,
  Search,
  Trash2,
} from "lucide-react";
import { useApp } from "@/lib/store";
import { readMyStudyIds, writeMyStudyIds } from "@/lib/my-study";
import { EmptyState, GlassSkeleton, SafeImage } from "./glass";
import { getBatchFallback } from "@/lib/batch-artwork";

interface StudyBatch {
  _id: string;
  name: string;
  byName: string;
  startDate?: string;
  endDate?: string;
  language?: string;
  previewImage?: string;
  feeTotal?: number;
  type?: string;
}

interface BatchResponse {
  success?: boolean;
  batches?: StudyBatch[];
  total?: number;
  hasMore?: boolean;
  error?: string;
}

export function StudyHomeView() {
  const { navigate, institutionId, institutionName } = useApp();
  const [ids, setIds] = useState<string[]>([]);
  const [batches, setBatches] = useState<StudyBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [moreError, setMoreError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const idsKey = useMemo(() => ids.join(","), [ids]);

  useEffect(() => {
    setIds(readMyStudyIds());
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    if (!idsKey) {
      setBatches([]);
      setError("");
      setPage(1);
      setHasMore(false);
      setLoading(false);
      return () => controller.abort();
    }

    setLoading(true);
    setError("");
    setMoreError(false);
    setPage(1);
    setHasMore(false);
    const params = new URLSearchParams({
      ids: idsKey,
      page: "1",
      pageSize: "24",
      category: "All",
    });

    fetch(`/api/batches?${params.toString()}`, { signal: controller.signal })
      .then(async (response) => {
        const data = (await response.json()) as BatchResponse;
        if (!response.ok || !data.success) {
          throw new Error(data.error || "Your study batches could not be loaded.");
        }
        return data;
      })
      .then((data) => {
        if (!active) return;
        setBatches(data.batches ?? []);
        setHasMore(!!data.hasMore);
      })
      .catch((reason: unknown) => {
        if (!active || (reason instanceof DOMException && reason.name === "AbortError")) return;
        setError(reason instanceof Error ? reason.message : "A network error occurred.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [idsKey, reloadKey]);

  const filteredBatches = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return batches;
    return batches.filter((batch) =>
      `${batch.name} ${batch.byName} ${batch.type ?? ""}`.toLowerCase().includes(term)
    );
  }, [batches, query]);

  const openBatch = (batch: StudyBatch) => {
    navigate({
      view: "batch",
      batchId: batch._id,
      batchName: batch.name,
      batchImage: batch.previewImage || getBatchFallback(batch.name),
    });
  };

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    setMoreError(false);
    const nextPage = page + 1;
    const params = new URLSearchParams({
      ids: idsKey,
      page: String(nextPage),
      pageSize: "24",
      category: "All",
    });
    try {
      const response = await fetch(`/api/batches?${params.toString()}`);
      const data = (await response.json()) as BatchResponse;
      if (!response.ok || !data.success) throw new Error(data.error || "Could not load more batches.");
      setBatches((current) => {
        const known = new Set(current.map((batch) => batch._id));
        return [...current, ...(data.batches ?? []).filter((batch) => !known.has(batch._id))];
      });
      setPage(nextPage);
      setHasMore(!!data.hasMore);
    } catch {
      setMoreError(true);
    } finally {
      setLoadingMore(false);
    }
  };

  const removeBatch = (id: string) => {
    const next = ids.filter((item) => item !== id);
    writeMyStudyIds(next);
    setIds(next);
    setBatches((current) => current.filter((batch) => batch._id !== id));
  };

  const browseBatches = () =>
    navigate({
      view: "dashboard",
      institutionId: institutionId || "physics-wallah",
      institutionName: institutionName || "Physics Wallah",
    });

  return (
    <main className="sb-study-home min-w-0 flex-1 px-3 pb-12 sm:px-5">
      <div className="mx-auto max-w-7xl pt-4 sm:pt-6">
        <section className="relative isolate overflow-hidden rounded-[1.7rem] bg-[#101a30] px-5 py-6 text-white shadow-[0_18px_45px_rgba(12,24,48,.18)] sm:px-8 sm:py-8">
          <div className="pointer-events-none absolute -right-16 -top-28 h-72 w-72 rounded-full border border-[#8e7cf2]/20" />
          <div className="pointer-events-none absolute -right-2 -top-14 h-52 w-52 rounded-full bg-[#7655db]/25 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 left-1/3 h-52 w-52 rounded-full bg-[#276be8]/20 blur-3xl" />
          <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[.07] px-3 py-1.5 text-[10px] font-black uppercase tracking-[.18em] text-[#b9c8ff]">
                <GraduationCap size={14} /> Study dashboard
              </span>
              <h1 className="mt-4 text-[1.8rem] font-black leading-tight tracking-tight sm:text-4xl">
                Your learning space
                <span className="mt-1 block bg-gradient-to-r from-[#9bbaff] to-[#c4a8ff] bg-clip-text text-transparent">
                  starts here.
                </span>
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-[#b4c0d7] sm:text-[15px]">
                Pick up where you left off, open your batches and keep your study material in one place.
              </p>
              <button
                type="button"
                onClick={browseBatches}
                className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#3679ed] to-[#7655db] px-5 text-xs font-black text-white shadow-[0_10px_24px_rgba(83,99,220,.28)] transition hover:-translate-y-0.5 hover:brightness-110"
              >
                Explore all batches <ArrowRight size={15} />
              </button>
            </div>

            <div className="grid w-full max-w-sm grid-cols-2 gap-3 md:max-w-[330px]">
              <div className="rounded-2xl border border-white/10 bg-white/[.07] p-4 backdrop-blur">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#7c69e8]/20 text-[#c3b8ff]"><Layers3 size={18} /></span>
                <p className="mt-4 text-2xl font-black tabular-nums">{ids.length}</p>
                <p className="mt-1 text-[10px] font-bold text-[#aebbd3]">My batches</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[.07] p-4 backdrop-blur">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#3288e8]/20 text-[#9acbff]"><BookOpen size={18} /></span>
                <p className="mt-4 text-base font-black leading-7">Study</p>
                <p className="mt-1 text-[10px] font-bold text-[#aebbd3]">{institutionName || "Physics Wallah"}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-7 sm:mt-9">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[.2em] text-[#7655db]">Learn online</p>
              <h2 className="mt-1 text-2xl font-black tracking-tight text-[#172b4c] dark:text-[#e8eef9] sm:text-[28px]">
                My Study Batches
              </h2>
              <p className="mt-1 text-xs text-[#7d8aa0] dark:text-[#91a1bd]">
                {ids.length} {ids.length === 1 ? "batch" : "batches"} added to your study list
              </p>
            </div>
            {batches.length > 0 && (
              <div className="flex h-11 items-center gap-2 rounded-xl border border-[#e2e8f1] bg-white px-3 dark:border-[#293750] dark:bg-[#121c30]">
                <Search size={16} className="text-[#8290a8] dark:text-[#91a1bd]" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search my batches..."
                  aria-label="Search my batches"
                  className="w-full min-w-0 bg-transparent text-xs outline-none placeholder:text-[#9aa6b8] dark:text-[#e8eef9]"
                />
              </div>
            )}
          </div>

          {loading ? (
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => <GlassSkeleton key={index} className="h-[280px] rounded-[1.4rem]" />)}
            </div>
          ) : error ? (
            <div className="mt-5">
              <EmptyState icon={<BookOpen size={22} />} title="Could not load your batches" hint={error} />
              <button type="button" onClick={() => setReloadKey((value) => value + 1)} className="mx-auto mt-3 block text-xs font-extrabold text-[#5b58cf] underline underline-offset-4">Try again</button>
            </div>
          ) : ids.length === 0 ? (
            <div className="mt-5 rounded-[1.5rem] border border-dashed border-[#cbd5e5] bg-white px-5 py-12 text-center dark:border-[#35445f] dark:bg-[#121c30]">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f0edff] text-[#7655db] dark:bg-[#2b2140] dark:text-[#c8adff]"><BookmarkCheck size={25} /></span>
              <h3 className="mt-4 text-lg font-black text-[#1b2d4d] dark:text-[#e8eef9]">No batches added yet</h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#78869d] dark:text-[#a8b6cc]">
                Open All Batches and tap “Add to My Study” on the batches you want to keep here.
              </p>
              <button type="button" onClick={browseBatches} className="mt-5 inline-flex h-11 items-center gap-2 rounded-xl bg-[#5b4bd8] px-5 text-xs font-black text-white transition hover:bg-[#4e40c7]">
                Browse batches <ArrowRight size={15} />
              </button>
            </div>
          ) : filteredBatches.length === 0 ? (
            <div className="mt-5">
              <EmptyState icon={<Search size={22} />} title="No matching batches" hint="Try a different batch or teacher name." />
            </div>
          ) : (
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filteredBatches.map((batch) => (
                <article key={batch._id} className="group overflow-hidden rounded-[1.4rem] border border-[#e2e8f1] bg-white shadow-[0_6px_22px_rgba(27,48,84,.045)] transition hover:-translate-y-1 hover:border-[#c7d4eb] hover:shadow-[0_18px_38px_rgba(27,48,84,.11)] dark:border-[#293750] dark:bg-[#121c30]">
                  <button type="button" onClick={() => openBatch(batch)} className="block w-full text-left">
                    <div className="relative aspect-[16/8.5] overflow-hidden bg-[#101a31]">
                      <SafeImage src={batch.previewImage} alt={batch.name} fallback={getBatchFallback(batch.name)} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.035]" />
                      <span className="absolute left-3 top-3 rounded-full border border-white/20 bg-[#0b1426]/75 px-3 py-1 text-[9px] font-black uppercase tracking-[.14em] text-white backdrop-blur">{batch.type || "Study batch"}</span>
                      <span className="absolute right-3 top-3 rounded-full bg-[#188b66] px-2.5 py-1 text-[9px] font-black text-white">MY STUDY</span>
                    </div>
                    <div className="p-4">
                      <h3 className="line-clamp-2 min-h-11 text-[15px] font-extrabold leading-snug text-[#182b4b] dark:text-[#e8eef9]">{batch.name}</h3>
                      <p className="mt-2 line-clamp-1 text-xs text-[#71809a] dark:text-[#a8b6cc]">By {batch.byName || "Elite Study Educators"}</p>
                      <div className="mt-3 flex flex-wrap items-center gap-2 text-[10px] font-bold text-[#8290a6] dark:text-[#91a1bd]">
                        {batch.startDate && <span className="inline-flex items-center gap-1"><CalendarDays size={12} /> Starts {formatDate(batch.startDate)}</span>}
                        {batch.language && <span className="rounded-lg bg-[#f1f4fa] px-2 py-1 dark:bg-[#1a2740]">{batch.language}</span>}
                      </div>
                    </div>
                  </button>
                  <div className="flex items-center justify-between gap-3 border-t border-[#edf1f6] px-4 py-3 dark:border-[#293750]">
                    <span className="text-sm font-black text-[#1b2d4d] dark:text-[#e8eef9]">{batch.feeTotal === 0 ? "Free" : typeof batch.feeTotal === "number" ? `₹${batch.feeTotal.toLocaleString("en-IN")}` : "Batch"}</span>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => removeBatch(batch._id)} aria-label={`Remove ${batch.name} from My Study`} title="Remove from My Study" className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#e2e8f1] text-[#7b879a] transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-[#33425d] dark:text-[#a8b6cc] dark:hover:bg-[#3a2028] dark:hover:text-[#ff9aa3]"><Trash2 size={15} /></button>
                      <button type="button" onClick={() => openBatch(batch)} className="inline-flex h-9 items-center gap-2 rounded-xl bg-[#5b4bd8] px-3 text-[11px] font-black text-white transition hover:bg-[#4e40c7]">
                        Open batch <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
          {!loading && !error && hasMore && (
            <div className="mt-6 flex justify-center">
              <button type="button" onClick={loadMore} disabled={loadingMore} className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#dfe5ef] bg-white px-5 text-xs font-extrabold text-[#52627c] transition hover:border-[#b9c8e6] hover:text-[#5b4bd8] disabled:opacity-60 dark:border-[#293750] dark:bg-[#121c30] dark:text-[#d5def0]">
                {loadingMore ? "Loading..." : "Load more batches"} <ChevronRight size={14} />
              </button>
              {moreError && (
                <button type="button" onClick={loadMore} className="ml-3 text-xs font-bold text-[#b54747] underline underline-offset-4">Retry</button>
              )}
            </div>
          )}
        </section>

        <p className="mt-6 text-center text-[10px] text-[#8a96aa] dark:text-[#8292ad]">
          Your My Study list is saved on this device.
        </p>
      </div>
    </main>
  );
}

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}
