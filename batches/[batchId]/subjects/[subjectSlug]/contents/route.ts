import { NextRequest, NextResponse } from "next/server";
import { apiGet, TTL, lxpwGet, resolveAssetUrl } from "@/lib/study-api";

export const dynamic = "force-dynamic";

type RawContent = {
  _id: string;
  topic?: string;
  name?: string;
  title?: string;
  note?: string;
  url?: string;
  urlType?: string;
  date?: string;
  startTime?: string;
  status?: string;
  lectureType?: string;
  isLocked?: boolean;
  videoDetails?: {
    name?: string;
    image?: string;
    description?: string;
    duration?: string;
    _id?: string;
    video_id?: string;
    videoId?: string;
    videoUrl?: string;
    hls_url?: string;
  };
  attachmentIds?: RawAttachment[];
  homeworkIds?: {
    topic?: string;
    note?: string;
    attachmentIds?: RawAttachment[];
  }[];
  tags?: { name?: string }[];
};

type RawAttachment = {
  _id?: string;
  name?: string;
  fileName?: string;
  fileType?: string;
  baseUrl?: string;
  path?: string;
  key?: string;
  url?: string;
  fileUrl?: string;
  downloadUrl?: string;
  signedUrl?: string;
};

type ContentsResponse = {
  data?: RawContent[] | null;
  paginate?: { totalCount?: number };
};

type ContentRow = {
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
  description?: string;
  chapter?: string;
  fileUrl?: string;
  fileName?: string;
};

const CONTENT_TYPES = new Set(["videos", "notes", "DppNotes", "DPP_QUIZ"]);

/** Normalize the different attachment shapes returned by PenPencil-compatible APIs. */
function getAttachmentUrl(att: RawAttachment): string {
  const candidate =
    att.url ?? att.fileUrl ?? att.downloadUrl ?? att.signedUrl ??
    att.path ?? att.key ?? att._id ?? "";
  if (!candidate) return "";
  const resolved = resolveAssetUrl(candidate, att.baseUrl || "https://static.pw.live/");
  try {
    const parsed = new URL(resolved);
    return parsed.protocol === "https:" || parsed.protocol === "http:" ? parsed.toString() : "";
  } catch {
    return "";
  }
}

function getDocument(c: RawContent): { fileUrl?: string; fileName?: string } {
  const attachments = [
    ...(c.attachmentIds ?? []),
    ...(c.homeworkIds ?? []).flatMap((homework) => homework.attachmentIds ?? []),
  ];
  const usable = attachments
    .map((attachment) => ({ attachment, url: getAttachmentUrl(attachment) }))
    .filter((entry) => !!entry.url);
  const selected =
    usable.find(({ attachment }) =>
      /pdf/i.test(`${attachment.fileType ?? ""} ${attachment.fileName ?? ""} ${attachment.name ?? ""} ${attachment.path ?? ""}`)
    ) ?? usable[0];

  // Notes endpoints sometimes provide the file directly on the content row.
  const directUrl = c.url ? resolveAssetUrl(c.url) : "";
  const fileUrl = selected?.url || directUrl || undefined;
  const fileName = selected?.attachment.fileName ?? selected?.attachment.name ??
    c.name ?? c.title ?? c.topic ?? "Study-Notes.pdf";
  return { fileUrl, fileName };
}

function mapRow(c: RawContent, contentType: string): ContentRow {
  const vd = c.videoDetails;
  let title = "";

  if (contentType === "videos") {
    title = (vd?.name ?? c.topic ?? c.name ?? "Untitled").trim();
  } else {
    // Notes & DPPs return no videoDetails — the title lives on the content/homework itself.
    const hw = c.homeworkIds?.[0];
    const firstAttName = hw?.attachmentIds?.[0]?.name ??
      hw?.attachmentIds?.[0]?.fileName ??
      c.attachmentIds?.[0]?.name ??
      c.attachmentIds?.[0]?.fileName;
    title = (
      c.topic ??
      c.name ??
      c.title ??
      hw?.topic ??
      firstAttName ??
      "Untitled"
    ).trim();
  }

  let videoId: string | undefined;
  const rawVideoUrl = (vd?.videoUrl ?? vd?.hls_url ?? c.url ?? "").trim();
  const declaredVideoType = (c.urlType ?? "").trim().toLowerCase();
  const videoType = /youtube\.com|youtu\.be/i.test(rawVideoUrl)
    ? "youtube"
    : declaredVideoType && declaredVideoType !== "youtube"
      ? declaredVideoType
      : !rawVideoUrl || /^[A-Za-z0-9_-]{11}$/.test(rawVideoUrl)
        ? "youtube"
        : "hls";
  const videoApiId = vd?._id ?? vd?.video_id ?? vd?.videoId ?? "";
  const videoUrl = videoType === "youtube" ? undefined : rawVideoUrl || undefined;

  if (contentType === "videos") {
    if (videoType === "youtube") {
      videoId = extractYoutubeId(rawVideoUrl);
      if (!videoId && vd?.image) {
        const m = vd.image.match(/\/vi\/([^/]+)\//);
        if (m) videoId = m[1];
      }
    } else {
      videoId = videoApiId || videoUrl || undefined;
    }
  }

  const document = contentType === "videos" ? {} : getDocument(c);

  return {
    id: c._id,
    title,
    ...document,
    date: c.date,
    startTime: c.startTime,
    status: c.status,
    isLocked: c.isLocked,
    videoId,
    videoType,
    videoUrl,
    videoApiId: videoType === "youtube" ? undefined : (videoApiId || undefined),
    thumbnail: vd?.image ?? "",
    duration: vd?.duration ?? "",
    description: vd?.description ?? "",
    chapter: c.tags?.[0]?.name ?? "",
  };
}

/**
 * Walk the LearnX PW mirror content list (paginated, identical ids).
 * ContentType: videos | notes — the mirror serves the same chapter content.
 */
async function mirrorContents(
  batchId: string,
  subjectSlug: string,
  tag: string,
  contentType: string,
  maxPages: number
): Promise<{ items: ContentRow[]; totalCount: number }> {
  if (contentType !== "videos" && contentType !== "notes") {
    return { items: [], totalCount: 0 };
  }
  const items: ContentRow[] = [];
  for (let page = 1; page <= maxPages * 2; page++) {
    const d = await lxpwGet<{ data?: RawContent[] }>(
      `/TopicInfo?BatchId=${encodeURIComponent(batchId)}&SubjectId=${encodeURIComponent(subjectSlug)}` +
        `&TopicId=${encodeURIComponent(tag)}&ContentType=${contentType}&page=${page}`,
      15000
    );
    const arr = Array.isArray(d?.data) ? d!.data! : [];
    if (arr.length === 0) break;
    for (const c of arr) items.push(mapRow(c, contentType));
  }
  return { items, totalCount: items.length };
}

/**
 * GET /api/batches/:batchId/subjects/:subjectSlug/contents
 *   ?contentType=videos|notes|DppNotes|DPP_QUIZ &tag=<topicId> &pages=<n>
 * Normalized lecture / note listing for a chapter. Primary upstream first;
 * LearnX PW mirror as fallback when the primary returns nothing.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ batchId: string; subjectSlug: string }> }
) {
  const { batchId, subjectSlug } = await params;
  const searchParams = req.nextUrl.searchParams;
  const contentType = searchParams.get("contentType") ?? "videos";
  const tag = searchParams.get("tag") ?? "";
  const maxPages = Math.min(Number(searchParams.get("pages") ?? 3) || 3, 6);

  if (!CONTENT_TYPES.has(contentType)) {
    return NextResponse.json(
      { success: false, error: "Invalid contentType" },
      { status: 400 }
    );
  }
  if (!tag) {
    return NextResponse.json(
      { success: false, error: "tag (topicId) is required" },
      { status: 400 }
    );
  }

  const items: ContentRow[] = [];
  let totalCount = 0;

  for (let page = 1; page <= maxPages; page++) {
    const res = await apiGet<ContentsResponse>(
      `/v2/batches/${batchId}/subject/${encodeURIComponent(subjectSlug)}/contents?page=${page}&contentType=${contentType}&tag=${encodeURIComponent(tag)}`,
      { ttl: TTL.contents, timeoutMs: 20000 }
    );
    const arr = Array.isArray(res.data?.data) ? res.data!.data! : [];
    totalCount = res.data?.paginate?.totalCount ?? totalCount;
    if (arr.length === 0) break;

    for (const c of arr) items.push(mapRow(c, contentType));
    if (items.length >= totalCount) break;
  }

  // Fallback: use the LearnX mirror when the primary yielded nothing, or
  // enrich note rows when the primary omitted the attachment URL.
  if (items.length === 0 || (contentType === "notes" && !items.some((item) => item.fileUrl))) {
    const m = await mirrorContents(batchId, subjectSlug, tag, contentType, maxPages);
    if (m.items.length) {
      if (items.length === 0) {
        return NextResponse.json({
          success: true,
          items: m.items,
          totalCount: m.totalCount,
          source: "learnxpw-mirror",
        });
      }

      const mirrorById = new Map(m.items.map((item) => [item.id, item]));
      const enriched = items.map((item) => {
        const mirrorItem = mirrorById.get(item.id);
        return {
          ...item,
          fileUrl: item.fileUrl ?? mirrorItem?.fileUrl,
          fileName: item.fileName ?? mirrorItem?.fileName,
        };
      });
      const finalItems = enriched.some((item) => item.fileUrl)
        ? enriched
        : m.items.some((item) => item.fileUrl) ? m.items : enriched;
      return NextResponse.json({
        success: true,
        items: finalItems,
        totalCount: Math.max(totalCount, m.totalCount),
        source: "learnxpw-mirror",
      });
    }
  }

  return NextResponse.json({ success: true, items, totalCount });
}

function extractYoutubeId(url: string): string | undefined {
  if (!url) return undefined;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/live\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([A-Za-z0-9_-]{6,20})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return undefined;
}
