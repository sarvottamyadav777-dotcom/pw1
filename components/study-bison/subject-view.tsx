"use client";

import { useEffect, useMemo, useState } from "react";
import { useApp } from "@/lib/store";
import {
  GlassBadge,
  GlassButton,
  GlassSkeleton,
  EmptyState,
  SectionHeading,
} from "./glass";
import {
  ArrowLeft,
  ChevronRight,
  Search,
  Layers,
  Home,
} from "lucide-react";

interface Topic {
  id: string;
  name: string;
  videos: number;
  notes: number;
  exercises: number;
  type?: string;
}

export function SubjectView({
  batchId,
  subjectSlug,
}: {
  batchId: string;
  subjectSlug: string;
}) {
  const { navigate, back } = useApp();
  const [topics, setTopics] = useState<Topic[] | null>(null);
  const [subjectName, setSubjectName] = useState<string>("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "chapters" | "extra" | "study">("all");

  useEffect(() => {
    let alive = true;
    fetch(`/api/batches/${batchId}/subjects/${encodeURIComponent(subjectSlug)}/topics`)
      .then((r) => r.json())
      .then((d) => {
        if (!alive) return;
        setTopics(d?.topics ?? []);
        setSubjectName(prettifySlug(subjectSlug));
      })
      .catch(() => alive && setTopics([]));
    return () => {
      alive = false;
    };
  }, [batchId, subjectSlug]);

  const shownName = useApp((s) => s.subjectName) || subjectName || prettifySlug(subjectSlug);

  const filtered = useMemo(() => {
    if (!topics) return [];
    const q = query.trim().toLowerCase();
    return topics.filter((topic) => {
      const type = (topic.type ?? "").toLowerCase();
      if (filter === "extra" && !type.includes("extra") && !topic.name.toLowerCase().includes("extra lecture")) return false;
      if (filter === "study" && topic.notes <= 0) return false;
      if (filter === "chapters" && type && !type.includes("chapter") && (type.includes("extra") || type.includes("material"))) return false;
      return !q || topic.name.toLowerCase().includes(q);
    });
  }, [topics, query, filter]);

  const totals = useMemo(() => {
    if (!topics) return { lectures: 0, notes: 0 };
    return {
      lectures: topics.reduce((a, t) => a + t.videos, 0),
      notes: topics.reduce((a, t) => a + t.notes, 0),
    };
  }, [topics]);

  return (
    <main className="flex-1 w-full bg-[#f8faff] px-3 dark:bg-[#0a1020] sm:px-5">
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
            <button
              className="hover:text-[#3266e3] cursor-pointer line-clamp-1 max-w-[180px]"
              onClick={() => navigate({ view: "batch", batchId })}
            >
              {useApp.getState().batchName ?? "Batch"}
            </button>
            <ChevronRight size={12} />
            <span className="text-foreground/80 line-clamp-1 max-w-[240px]">{shownName}</span>
          </nav>
        </div>

        {/* header */}
        <div className="glass rounded-3xl p-6 sm:p-8 sb-fade-up">
          <GlassBadge tone="gold" className="mb-3">
            <Layers size={10} /> SUBJECT
          </GlassBadge>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-[#1b2d4d] dark:text-[#e8eef9] sm:text-3xl">{shownName}</h1>
              {topics && (
                <p className="mt-2 text-sm text-muted-foreground">
                  {topics.length} chapters · {totals.lectures} lectures · {totals.notes} notes
                </p>
              )}
            </div>
            <div className="flex items-center glass-soft rounded-full px-4 w-full sm:w-80">
              <Search size={15} className="text-[#7655db] shrink-0" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search chapters (e.g. Kinematics, Thermodynamics)..."
                className="w-full bg-transparent px-2.5 h-10 text-sm text-[#263a5c] outline-none placeholder:text-muted-foreground/70 dark:text-[#e8eef9]"
                aria-label="Search chapters"
              />
            </div>
          </div>
        </div>

        {/* content filters */}
        <div className="-mx-1 flex items-center gap-1 overflow-x-auto border-b border-[#e6ebf3] px-1 sb-scroll">
          {([
            ["all", "All"],
            ["chapters", "Chapters"],
            ["extra", "Extra Lectures"],
            ["study", "Study Material"],
          ] as const).map(([value, label]) => (
            <button key={value} type="button" onClick={() => setFilter(value)} aria-pressed={filter === value} className={`shrink-0 border-b-2 px-4 py-3 text-sm font-extrabold transition ${filter === value ? "border-[#8158e8] text-[#8158e8]" : "border-transparent text-[#71809a] hover:text-[#354d76] dark:text-[#a8b6cc] dark:hover:text-[#e8eef9]"}`}>
              {label}
            </button>
          ))}
        </div>

        {/* chapters */}
        <div>
          {topics === null ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 9 }).map((_, i) => <GlassSkeleton key={i} className="h-24" />)}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={<Search size={22} />}
              title="No content found"
              hint={query ? "Try another keyword." : "There is no content in this section yet."}
            />
          ) : (
            <div className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-4 md:grid-cols-2 sb-fade-up">
              {filtered.map((t) => (
                <button
                  key={t.id}
                  className="group flex min-h-[138px] w-full items-center gap-4 rounded-[1.4rem] border border-[#e5eaf2] bg-white p-5 text-left shadow-[0_5px_18px_rgba(27,48,84,.035)] transition hover:-translate-y-0.5 hover:border-[#c9d4ee] hover:shadow-[0_12px_28px_rgba(27,48,84,.08)] dark:border-[#293750] dark:bg-[#121c30] dark:hover:border-[#465d86]"
                  onClick={() => navigate({ view: "topic", batchId, subjectSlug, topicId: t.id, topicName: t.name })}
                >
                  <span className="h-20 w-1.5 shrink-0 rounded-full bg-gradient-to-b from-[#9a65f0] to-[#7059df]" />
                  <span className="min-w-0 flex-1 py-1">
                    <span className="block text-[16px] font-extrabold leading-snug text-[#1b2d4d] dark:text-[#e8eef9]">{t.name}</span>
                    <span className="mt-3 block text-xs leading-6 text-[#7b89a0] dark:text-[#a8b6cc]">
                      {t.videos} Videos <span className="mx-1 text-[#c2cad7]">|</span> {t.exercises} Exercises <span className="mx-1 text-[#c2cad7]">|</span> {t.notes} Notes
                    </span>
                  </span>
                  <span className="shrink-0 text-xl text-[#9aa6ba] transition group-hover:translate-x-1 group-hover:text-[#7356d8]">›</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* footer note */}
        <SectionHeading
          className="pt-4"
          title=""
        />
      </div>
    </main>
  );
}

function prettifySlug(slug: string): string {
  return slug
    .split("-")
    .slice(0, -1)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
