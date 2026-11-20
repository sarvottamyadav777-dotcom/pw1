"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useApp } from "@/lib/store";
import { EmptyState, GlassSkeleton, SafeImage } from "./glass";
import {
  ArrowRight,
  BadgeCheck,
  Bookmark,
  BookmarkCheck,
  ChevronDown,
  Search,
  X,
} from "lucide-react";
import { getBatchFallback } from "@/lib/batch-artwork";
import { readMyStudyIds, writeMyStudyIds } from "@/lib/my-study";

interface CatalogBatch {
  _id: string;
  name: string;
  byName: string;
  startDate?: string;
  endDate?: string;
  language?: string;
  previewImage?: string;
  feeTotal?: number;
  type?: string;
  slug?: string;
}

interface BatchPageResponse {
  success?: boolean;
  batches?: CatalogBatch[];
  total?: number;
  hasMore?: boolean;
  error?: string;
}

type DashboardTab = "all" | "saved";
const PAGE_SIZE = 18;
const CATEGORIES = ["All", "Online", "Offline", "JEE", "NEET", "Foundation", "Class 9", "Class 10", "Class 11", "Class 12"];

export function DashboardView() {
  const { navigate, institutionName } = useApp();
  const [batches, setBatches] = useState<CatalogBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [moreError, setMoreError] = useState(false);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [tab, setTab] = useState<DashboardTab>("all");
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const activeFilterKey = useRef("");

  const savedKey = useMemo(() => Array.from(savedIds).sort().join(","), [savedIds]);
  const requestSavedKey = tab === "saved" ? savedKey : "";

  useEffect(() => {
    try {
      setSavedIds(new Set(readMyStudyIds()));
    } catch {
      setSavedIds(new Set());
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query.trim()), 280);
    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    activeFilterKey.current = `${tab}|${category}|${debouncedQuery}|${requestSavedKey}`;
    setLoading(true);
    setError(null);
    setMoreError(false);
    setBatches([]);
    setPage(1);
    setHasMore(false);

    if (tab === "saved" && !requestSavedKey) {
      setTotal(0);
      setLoading(false);
      return () => controller.abort();
    }

    const params = new URLSearchParams({ page: "1", pageSize: String(PAGE_SIZE), category });
    if (debouncedQuery) params.set("q", debouncedQuery);
    if (tab === "saved") params.set("ids", requestSavedKey);

    fetch(`/api/batches?${params.toString()}`, { signal: controller.signal })
      .then(async (response) => {
        const data = (await response.json()) as BatchPageResponse;
        if (!response.ok || !data.success) throw new Error(data.error || "Unable to load batches.");
        return data;
      })
      .then((data) => {
        if (!active) return;
        setBatches(data.batches ?? []);
        setTotal(data.total ?? 0);
        setHasMore(!!data.hasMore);
      })
      .catch((reason: unknown) => {
        if (!active || (reason instanceof DOMException && reason.name === "AbortError")) return;
        setError(reason instanceof Error ? reason.message : "A network error occurred while loading batches.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [category, debouncedQuery, requestSavedKey, tab]);

  const loadMore = async () => {
    if (loadingMore || loading || !hasMore) return;
    setLoadingMore(true);
    setMoreError(false);
    const requestFilterKey = `${tab}|${category}|${debouncedQuery}|${requestSavedKey}`;
    const nextPage = page + 1;
    const params = new URLSearchParams({ page: String(nextPage), pageSize: String(PAGE_SIZE), category });
    if (debouncedQuery) params.set("q", debouncedQuery);
    if (tab === "saved") params.set("ids", requestSavedKey);

    try {
      const response = await fetch(`/api/batches?${params.toString()}`);
      const data = (await response.json()) as BatchPageResponse;
      if (!response.ok || !data.success) throw new Error(data.error || "Unable to load more batches.");
      if (activeFilterKey.current !== requestFilterKey) return;
      setBatches((current) => {
        const known = new Set(current.map((batch) => batch._id));
        return [...current, ...(data.batches ?? []).filter((batch) => !known.has(batch._id))];
      });
      setPage(nextPage);
      setTotal(data.total ?? total);
      setHasMore(!!data.hasMore);
    } catch {
      if (activeFilterKey.current === requestFilterKey) setMoreError(true);
    } finally {
      setLoadingMore(false);
    }
  };

  const openBatch = (batch: CatalogBatch) => navigate({
    view: "batch",
    batchId: batch._id,
    batchName: batch.name,
    batchImage: batch.previewImage || getBatchFallback(batch.name),
  });

  const toggleMyStudy = (batch: CatalogBatch) => {
    const current = readMyStudyIds();
    const next = current.includes(batch._id)
      ? current.filter((id) => id !== batch._id)
      : [...current, batch._id];
    writeMyStudyIds(next);
    setSavedIds(new Set(next));
  };

  return (
    <main className="sb-dashboard min-w-0 flex-1 bg-[#f7f8fc] px-3 dark:bg-[#0a1020] sm:px-5">
      <div className="mx-auto max-w-6xl pb-14 pt-4 sm:pt-6">
        <section className="flex items-center gap-3 rounded-[1.35rem] border border-[#e4eaf3] bg-white p-4 shadow-[0_5px_22px_rgba(28,51,88,.045)] dark:border-[#293750] dark:bg-[#121c30]">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#111827] text-sm font-black tracking-tight text-white shadow-sm">PW</span>
          <span className="min-w-0 flex-1">
            <span className="flex flex-wrap items-center gap-1.5 text-[15px] font-extrabold text-[#172b4c] dark:text-[#e8eef9]">Physics Wallah <BadgeCheck size={16} className="fill-[#2872e8] text-white" /></span>
            <span className="mt-1 block text-[10px] font-bold text-[#8794aa] dark:text-[#91a1bd]">{institutionName || "Verified learning partner"} · Study packs</span>
          </span>
          <span className="hidden rounded-full bg-[#eef7f2] px-3 py-1.5 text-[10px] font-extrabold text-[#27805e] dark:bg-[#1b382e] dark:text-[#86d2ad] sm:inline-flex">Batches available</span>
        </section>

        <section id="batch-library" className="mt-5 scroll-mt-24 sm:mt-7">
          <div className="flex items-center gap-3 rounded-[1.15rem] border border-[#dfe5ef] bg-white px-4 shadow-[0_4px_16px_rgba(28,49,86,.035)] transition focus-within:border-[#a8b9e8] focus-within:ring-4 focus-within:ring-[#7b61df]/10 dark:border-[#293750] dark:bg-[#121c30]">
            <Search size={19} className="shrink-0 text-[#8290a8] dark:text-[#91a1bd]" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search batches by name, exam or teacher..." className="h-[54px] min-w-0 flex-1 bg-transparent text-sm text-[#263a5c] outline-none placeholder:text-[#9aa6b8] dark:text-[#e8eef9] dark:placeholder:text-[#7e8ea8]" aria-label="Search batches by name, exam or teacher" />
            {query && <button type="button" onClick={() => setQuery("")} aria-label="Clear search" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#7e8ba2] hover:bg-[#f0f3f9] dark:hover:bg-[#1a2740]"><X size={15} /></button>}
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[.2em] text-[#7655db]">Study packs</p>
              <h1 className="mt-1 text-[26px] font-black tracking-tight text-[#172b4c] dark:text-[#e8eef9] sm:text-3xl">All Batches</h1>
              <p className="mt-1 text-xs text-[#7d8aa0] dark:text-[#91a1bd]">{loading ? "Finding available batches..." : `${total.toLocaleString()} ${tab === "saved" ? "My Study " : ""}batches found`}</p>
            </div>
            <div className="flex w-fit items-center gap-1 rounded-full border border-[#e2e8f1] bg-white p-1 dark:border-[#293750] dark:bg-[#121c30]">
              <button type="button" onClick={() => setTab("all")} aria-pressed={tab === "all"} className={`rounded-full px-4 py-2 text-xs font-extrabold transition ${tab === "all" ? "bg-[#111827] text-white shadow-sm dark:bg-[#315eaf]" : "text-[#71809a] dark:text-[#a8b6cc]"}`}>All</button>
              <button type="button" onClick={() => setTab("saved")} aria-pressed={tab === "saved"} className={`rounded-full px-4 py-2 text-xs font-extrabold transition ${tab === "saved" ? "bg-[#111827] text-white shadow-sm dark:bg-[#315eaf]" : "text-[#71809a] dark:text-[#a8b6cc]"}`}>My Study ({savedIds.size})</button>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-2 sb-scroll" aria-label="Filter batches by category">
            {CATEGORIES.map((item) => (
              <button key={item} type="button" onClick={() => setCategory(item)} aria-pressed={category === item} className={`shrink-0 rounded-full border px-4 py-2.5 text-xs font-extrabold transition ${category === item ? "border-[#111a2c] bg-[#111a2c] text-white shadow-[0_5px_14px_rgba(17,26,44,.16)] dark:border-[#416fe2] dark:bg-[#315eaf]" : "border-[#dfe5ee] bg-white text-[#64738c] hover:border-[#b9c8e6] hover:text-[#385fbe] dark:border-[#293750] dark:bg-[#121c30] dark:text-[#a8b6cc] dark:hover:border-[#48608a]"}`}>
                {item}
              </button>
            ))}
          </div>

          <div className="mt-4">
            {loading ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }).map((_, index) => <GlassSkeleton key={index} className="h-[390px] rounded-[1.35rem]" />)}</div>
            ) : error ? (
              <EmptyState icon={<Search size={22} />} title="Could not load batches" hint={error} />
            ) : batches.length === 0 ? (
              <EmptyState icon={<BookmarkCheck size={22} />} title={tab === "saved" ? "No batches in My Study yet" : "No batches found"} hint={tab === "saved" ? "Add a batch to My Study to keep it close for your next session." : "Try another search or choose a different category."} />
            ) : (
              <>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {batches.map((batch, index) => <BatchCard key={batch._id} batch={batch} saved={savedIds.has(batch._id)} onOpen={() => openBatch(batch)} onSave={() => toggleMyStudy(batch)} index={index} />)}
                </div>
                <div className="mt-8 flex flex-col items-center gap-2">
                  {hasMore && (
                    <button type="button" onClick={loadMore} disabled={loadingMore} className="inline-flex h-12 min-w-48 items-center justify-center gap-2 rounded-full border border-[#dfe5ef] bg-white px-6 text-sm font-extrabold text-[#334b73] shadow-[0_5px_18px_rgba(28,49,86,.06)] transition hover:-translate-y-0.5 hover:border-[#b8c8e9] hover:text-[#5e4bc8] disabled:cursor-wait disabled:opacity-60 dark:border-[#293750] dark:bg-[#121c30] dark:text-[#d2def0]">
                      {loadingMore ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#8b77dc] border-t-transparent" /> : <ChevronDown size={17} />}
                      {loadingMore ? "Loading batches..." : "Load More Batches"}
                    </button>
                  )}
                  {moreError && <button type="button" onClick={loadMore} className="text-xs font-bold text-[#b54747] underline underline-offset-4">Could not load more. Try again.</button>}
                  <p className="text-[11px] text-[#8b97aa] dark:text-[#91a1bd]">Showing {batches.length.toLocaleString()} of {total.toLocaleString()} batches</p>
                </div>
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function BatchCard({ batch, saved, onOpen, onSave, index }: { batch: CatalogBatch; saved: boolean; onOpen: () => void; onSave: () => void; index: number }) {
  const price = batch.feeTotal === 0 ? "Free" : typeof batch.feeTotal === "number" ? `₹${batch.feeTotal.toLocaleString("en-IN")}` : "View details";
  const classMatch = batch.name.match(/class\s*([0-9]{1,2}\+?)/i);
  const classLabel = classMatch ? `CLASS ${classMatch[1]}` : "STUDY BATCH";
  const examMatch = `${batch.name} ${batch.type ?? ""}`.match(/\b(JEE|NEET|CUET|NDA|UPSC|SSC|FOUNDATION)\b/i);
  const examLabel = examMatch?.[1]?.toUpperCase() || batch.type || "Learning program";
  const statusLabel = batch.endDate
    ? (new Date(batch.endDate).getTime() >= Date.now() ? "Ongoing" : "Completed")
    : "Available";
  return (
    <article className="sb-lazy-card group overflow-hidden rounded-[1.4rem] border border-[#e3e8f0] bg-white shadow-[0_6px_22px_rgba(27,48,84,.045)] transition duration-300 hover:-translate-y-1 hover:border-[#c7d4eb] hover:shadow-[0_18px_38px_rgba(27,48,84,.11)] dark:border-[#293750] dark:bg-[#121c30]" style={{ animationDelay: `${Math.min(index, 10) * 25}ms` }}>
      <button type="button" onClick={onOpen} className="block w-full text-left">
        <div className="relative aspect-[16/8.6] overflow-hidden bg-[#101a31]">
          <SafeImage src={batch.previewImage} alt={batch.name} fallback={getBatchFallback(batch.name)} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.035]" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#091222]/50 via-transparent to-[#091222]/10" />
          <span className="absolute left-3 top-3 rounded-full border border-white/25 bg-[#0b1426]/70 px-3 py-1 text-[9px] font-black uppercase tracking-[.14em] text-white backdrop-blur">{batch.type || "Study batch"}</span>
          <span className="absolute bottom-3 left-3 text-[10px] font-black tracking-[.16em] text-white/90">PHYSICS WALLAH</span>
        </div>
        <div className="p-4 pb-4">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[12px] font-black tracking-wide text-[#df6a30] dark:text-[#ff9c68]">{classLabel}</span>
            <span className="rounded-lg border border-[#e3e9f2] bg-[#f6f8fc] px-2.5 py-1 text-[10px] font-extrabold text-[#566783] dark:border-[#33425d] dark:bg-[#1a2740] dark:text-[#c4d0e4]">{batch.language || "Language not listed"}</span>
          </div>
          <h3 className="mt-3 line-clamp-2 min-h-11 text-[16px] font-extrabold leading-snug text-[#182b4b] dark:text-[#e8eef9]">{batch.name}</h3>
          <p className="mt-3 flex items-center gap-2 text-xs text-[#71809a] dark:text-[#a8b6cc]"><span aria-hidden="true">📖</span> {examLabel}</p>
          <p className="mt-2 flex items-center gap-2 text-xs text-[#8290a6] dark:text-[#91a1bd]"><span className="h-2 w-2 rounded-full bg-[#e54c54]" /> {statusLabel}{batch.startDate ? ` · Started on ${formatBatchDate(batch.startDate)}` : ""}</p>
          <p className="mt-2 line-clamp-1 text-[11px] text-[#8491a6] dark:text-[#8798b3]">By {batch.byName || "Elite Study Educators"}</p>
        </div>
      </button>
      <div className="flex items-center gap-2 border-t border-[#edf1f6] px-4 py-3.5 dark:border-[#293750]">
        <div className="min-w-0 flex-1">
          <p className="text-[17px] font-black leading-tight text-[#182b4b] dark:text-[#f0f4fb]">{price}</p>
          {batch.feeTotal === 0 && <p className="mt-0.5 text-[10px] font-extrabold text-[#20a178]">Free access</p>}
        </div>
        <button type="button" onClick={onOpen} className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#111a2c] px-3 text-xs font-extrabold text-white transition hover:bg-[#263a60] dark:bg-[#315eaf] dark:hover:bg-[#3c6ec5]">Explore <ArrowRight size={14} /></button>
        <button type="button" onClick={onSave} aria-pressed={saved} aria-label={saved ? "Remove batch from My Study" : "Add batch to My Study"} title={saved ? "Remove from My Study" : "Add to My Study"} className={`flex h-11 shrink-0 items-center justify-center gap-1.5 rounded-xl border px-3 text-[11px] font-extrabold transition ${saved ? "border-[#cce9db] bg-[#effaf4] text-[#23845e] dark:border-[#285a46] dark:bg-[#17372b] dark:text-[#8de0b3]" : "border-[#dfe6f0] bg-white text-[#52627c] hover:border-[#b9cae8] hover:text-[#7655db] dark:border-[#33425d] dark:bg-[#17243a] dark:text-[#c4d0e4]"}`}>{saved ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}<span className="hidden sm:inline">{saved ? "Added" : "Add to Study"}</span></button>
      </div>
    </article>
  );
}

function formatBatchDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}
