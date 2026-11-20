"use client";

import { useEffect } from "react";
import { useApp, bindRouter } from "@/lib/store";
import { InstitutionSelect } from "@/components/study-bison/institution-select";
import { SiteHeader } from "@/components/study-bison/header";
import { SiteFooter } from "@/components/study-bison/footer";
import { DashboardView } from "@/components/study-bison/dashboard-view";
import { StudyHomeView } from "@/components/study-bison/study-home-view";
import { BatchDetail } from "@/components/study-bison/batch-detail";
import { SubjectView } from "@/components/study-bison/subject-view";
import { TopicView } from "@/components/study-bison/topic-view";
import { WatchView } from "@/components/study-bison/player-view";
import { PdfViewerView } from "@/components/study-bison/pdf-viewer";
import { AboutView } from "@/components/study-bison/about-view";
import { AdsSection } from "@/components/study-bison/ads-section";
import { TelegramPopup } from "@/components/study-bison/telegram-popup";

export function AppShell() {
  const { view, batchId, subjectSlug, topicId, contentId, institutionId } = useApp();

  useEffect(() => bindRouter(), []);

  useEffect(() => {
    const base = "Elite Study with SachinCoderX — Learning Platform";
    const state = useApp.getState();
    const titles: Record<string, string> = {
      institutions: `Choose Institution · ${base}`,
      home: `Study · ${base}`,
      dashboard: `All Batches · ${base}`,
      batch: `${state.batchName ?? "Batch"} · ${base}`,
      subject: `${state.subjectName ?? "Subject"} · ${base}`,
      topic: `${state.topicName ?? "Chapter"} · ${base}`,
      watch: `${state.lectureTitle ?? "Lecture"} · ${base}`,
      about: `About · ${base}`,
      pdf: `${state.lectureTitle ?? "PDF"} · ${base}`,
    };
    document.title = titles[view] ?? base;
  }, [view]);

  if (view === "institutions") return <InstitutionSelect />;

  const immersive = view === "watch" || view === "pdf";
  const showDashboard = view === "dashboard" || view === "home";

  return (
    <div className="flex min-h-screen flex-col">
      {!immersive && <>
        <SiteHeader />
        <AdsSection />
      </>}
      {view === "about" ? (
        <AboutView />
      ) : view === "pdf" ? (
        <PdfViewerView />
      ) : view === "batch" && batchId ? (
        <BatchDetail key={batchId} batchId={batchId} />
      ) : view === "subject" && batchId && subjectSlug ? (
        <SubjectView key={`${batchId}:${subjectSlug}`} batchId={batchId} subjectSlug={subjectSlug} />
      ) : view === "topic" && batchId && subjectSlug && topicId ? (
        <TopicView key={`${batchId}:${subjectSlug}:${topicId}`} batchId={batchId} subjectSlug={subjectSlug} topicId={topicId} />
      ) : view === "watch" && batchId && subjectSlug && contentId ? (
        <WatchView key={`${batchId}:${subjectSlug}:${contentId}`} batchId={batchId} subjectSlug={subjectSlug} topicId={topicId} contentId={contentId} />
      ) : showDashboard && !institutionId ? (
        <InstitutionSelect />
      ) : view === "home" ? (
        <StudyHomeView />
      ) : view === "dashboard" ? (
        <DashboardView />
      ) : (
        <StudyHomeView />
      )}
      {!immersive && <SiteFooter />}
      {!immersive && <TelegramPopup />}
    </div>
  );
}
