import { NextRequest, NextResponse } from "next/server";
import { apiGet, TTL, resolveAssetUrl, lxpwGet } from "@/lib/study-api";

export const dynamic = "force-dynamic";

type ScheduleData = {
  _id?: string;
  url?: string;
  urlType?: string;
  videoDetails?: {
    name?: string;
    image?: string;
    description?: string;
    duration?: string;
    videoUrl?: string;
    embedCode?: string;
    _id?: string;
    video_id?: string;
    videoId?: string;
    hls_url?: string;
  };
  attachmentIds?: RawAttachment[];
  homeworkIds?: {
    _id?: string;
    topic?: string;
    note?: string;
    attachmentIds?: RawAttachment[];
  }[];
  exerciseIds?: unknown[];
};

type RawAttachment = {
  _id?: string;
  name?: string;
  baseUrl?: string;
  path?: string;
  key?: string;
  fileName?: string;
  fileType?: string;
  url?: string;
  fileUrl?: string;
  downloadUrl?: string;
  signedUrl?: string;
};

type ScheduleResponse = { data?: ScheduleData };

type Attachment = {
  id: string;
  name: string;
  url: string;
  note?: string;
};

function attachmentUrl(
  att: RawAttachment,
  fallbackId: string,
  idx: number
): Attachment | null {
  const candidate =
    att.url ?? att.fileUrl ?? att.downloadUrl ?? att.signedUrl ??
    att.path ?? att.key ?? att._id ?? "";
  const url = resolveAssetUrl(candidate, att.baseUrl || "https://static.pw.live/");
  if (!url) return null;
  return {
    id: att._id ?? `${fallbackId}-${idx}`,
    name: att.name ?? att.fileName ?? "Document",
    url,
  };
}

function normalize(raw: NonNullable<ScheduleData>, contentId: string) {
  const notes: Attachment[] = [];

  // Top-level attachmentIds = lecture slides / class notes PDFs
  let idx = 0;
  for (const att of raw.attachmentIds ?? []) {
    const a = attachmentUrl(att, contentId, idx++);
    if (a) notes.push(a);
  }

  // Homework attachments = DPPs and additional notes
  for (const hw of raw.homeworkIds ?? []) {
    let hidx = 0;
    for (const att of hw.attachmentIds ?? []) {
      const a = attachmentUrl(att, hw._id ?? contentId, hidx++);
      if (a) notes.push({ ...a, note: hw.note });
    }
  }

  const vd = raw.videoDetails ?? {};
  const candidateVideoUrl = (vd.videoUrl ?? vd.hls_url ?? raw.url ?? "").trim();
  const declaredType = (raw.urlType ?? "").trim().toLowerCase();
  const urlType = /youtube\.com|youtu\.be/i.test(candidateVideoUrl)
    ? "youtube"
    : declaredType && declaredType !== "youtube"
      ? declaredType
      : !candidateVideoUrl || /^[A-Za-z0-9_-]{11}$/.test(candidateVideoUrl)
        ? "youtube"
        : "hls";
  const videoApiId = vd._id ?? vd.video_id ?? vd.videoId ?? "";
  // Some note records expose the PDF directly on `url` instead of attachments.
  if (!notes.length && raw.url && (/\.pdf(?:$|[?#])/i.test(raw.url) || /pdf|document|file/.test(urlType))) {
    const directUrl = resolveAssetUrl(raw.url);
    if (directUrl) {
      notes.push({ id: contentId, name: vd.name ?? "Study Notes", url: directUrl });
    }
  }

  // videoId: prefer parsing `url`; fall back to the thumbnail (i.ytimg.com/vi/<id>/...)
  let videoId = extractYoutubeId(candidateVideoUrl || raw.url || "");
  if (!videoId && vd.image) {
    const m = String(vd.image).match(/\/vi\/([^/]+)\//);
    if (m) videoId = m[1];
  }

  return {
    success: true,
    lecture: {
      id: raw._id ?? contentId,
      title: vd.name ?? "",
      description: vd.description ?? "",
      duration: vd.duration ?? "",
      thumbnail: vd.image ?? "",
      urlType,
      videoId: urlType === "youtube" ? videoId : (videoApiId || candidateVideoUrl),
      videoUrl: urlType !== "youtube" ? candidateVideoUrl : "",
      videoApiId: urlType !== "youtube" ? videoApiId : "",
    },
    notes,
  };
}

/**
 * GET /api/batches/:batchId/subjects/:subjectSlug/schedule/:contentId
 * Full lecture detail: video info + attached notes (PDF homework attachments).
 * Primary upstream first; LearnX PW mirror as fallback.
 */
export async function GET(
  _req: NextRequest,
  {
    params,
  }: { params: Promise<{ batchId: string; subjectSlug: string; contentId: string }> }
) {
  const { batchId, subjectSlug, contentId } = await params;

  const res = await apiGet<ScheduleResponse>(
    `/v1/batches/${batchId}/subject/${encodeURIComponent(subjectSlug)}/schedule/${contentId}`,
    { ttl: TTL.schedule, timeoutMs: 20000 }
  );

  const raw = res.data?.data;
  if (raw) {
    return NextResponse.json(normalize(raw, contentId));
  }

  // Fallback: LearnX PW mirror
  const mirror = await lxpwGet<ScheduleResponse>(
    `/Schedule?BatchId=${encodeURIComponent(batchId)}&SubjectId=${encodeURIComponent(subjectSlug)}&ContentId=${encodeURIComponent(contentId)}`,
    18000
  );
  const mraw = mirror?.data;
  if (mraw) {
    return NextResponse.json({ ...normalize(mraw, contentId), source: "learnxpw-mirror" });
  }

  return NextResponse.json(
    { success: false, error: res.error ?? "Lecture not found" },
    { status: 502 }
  );
}

function extractYoutubeId(url: string): string | undefined {
  if (!url) return undefined;
  const m = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/live\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([A-Za-z0-9_-]{6,20})/
  );
  if (m) return m[1];
  if (/^[A-Za-z0-9_-]{6,20}$/.test(url)) return url;
  return undefined;
}
