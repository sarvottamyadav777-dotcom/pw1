import { NextRequest, NextResponse } from "next/server";
import { apiGet, TTL, resolveAssetUrl } from "@/lib/study-api";

export const dynamic = "force-dynamic";

type TodayItem = {
  type?: string;
  _id?: string;
  data?: {
    _id?: string;
    topic?: string;
    date?: string;
    startTime?: string;
    endTime?: string;
    urlType?: string;
    status?: string;
    url?: string;
    batchSubjectId?: string;
    subjectSlug?: string;
    subjectId?: string;
    tag?: string | { name?: string };
    tags?: { name?: string }[];
    videoId?: string;
    videoApiId?: string;
    videoDetails?: {
      _id?: string; video_id?: string; videoId?: string;
      name?: string; image?: string; duration?: string; videoUrl?: string; hls_url?: string;
    };
  };
};

type TodayResponse = { data?: TodayItem[] | null } | TodayItem[];

function inferVideoType(declared: string | undefined, url: string): string {
  const value = (declared ?? "").trim().toLowerCase();
  if (/youtube\.com|youtu\.be/i.test(url)) return "youtube";
  if (value && value !== "youtube") return value;
  if (!url || /^[A-Za-z0-9_-]{11}$/.test(url)) return "youtube";
  return "hls";
}

function extractYoutubeId(value: string): string {
  const match = value.match(/(?:youtube\.com\/(?:watch\?.*v=|embed\/|live\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,20})/);
  return match?.[1] ?? (/^[A-Za-z0-9_-]{6,20}$/.test(value) ? value : "");
}

function tagName(tag: unknown): string {
  if (!tag) return "";
  if (typeof tag === "string") return tag;
  const t = tag as { name?: string };
  return t.name ?? "";
}

/** GET /api/batches/:batchId/today — today's live/scheduled classes. */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ batchId: string }> }
) {
  const { batchId } = await params;

  const variants = [
    `/v2/batches/${batchId}/todays-schedule`,
    `/batch-service/v1/batch-subject-schedules/today?batchId=${batchId}`,
    `/batch-service/v1/batch-schedules/today?batchId=${batchId}`,
  ];

  for (const path of variants) {
    const res = await apiGet<TodayResponse>(path, { ttl: TTL.misc, timeoutMs: 20000 });
    const payload = res.data;
    const arr: TodayItem[] = Array.isArray(payload)
      ? payload
      : Array.isArray(payload?.data)
        ? payload.data
        : [];
    if (arr.length > 0) {
      return NextResponse.json({
        success: true,
        classes: arr.map((row) => {
          const c = row.data ?? {};
          const rawVideoUrl = c.videoDetails?.videoUrl ?? c.videoDetails?.hls_url ?? c.url ?? c.videoDetails?.videoId ?? c.videoDetails?.video_id ?? c.videoId ?? "";
          const urlType = inferVideoType(c.urlType, rawVideoUrl);
          const videoApiId = c.videoApiId ?? c.videoDetails?._id ?? c.videoDetails?.video_id ?? c.videoDetails?.videoId ??
            (rawVideoUrl && !/^https?:\/\//i.test(rawVideoUrl) && urlType !== "youtube" ? rawVideoUrl : "");
          const videoId = urlType === "youtube"
            ? extractYoutubeId(rawVideoUrl)
            : videoApiId || rawVideoUrl;
          return {
            id: c._id ?? (row as TodayItem)._id ?? "",
            type: (row as TodayItem).type ?? "LECTURE",
            isLive: /live/i.test(`${(row as TodayItem).type ?? ""} ${c.status ?? ""} ${c.urlType ?? ""}`),
            status: c.status ?? "",
            title: c.videoDetails?.name ?? c.topic ?? "Class",
            subject: tagName(c.tag) || c.tags?.[0]?.name || "",
            subjectSlug: c.subjectSlug ?? c.subjectId ?? c.batchSubjectId ?? (c.tag && typeof c.tag === "object" ? c.tag.name : c.tag) ?? "",
            batchSubjectId: c.batchSubjectId ?? "",
            startTime: c.startTime ?? c.date ?? "",
            endTime: c.endTime ?? "",
            thumbnail: c.videoDetails?.image ?? "",
            duration: c.videoDetails?.duration ?? "",
            videoId,
            videoType: urlType,
            videoUrl: urlType === "youtube" ? "" : rawVideoUrl,
            videoApiId: urlType === "youtube" ? "" : videoApiId,
          };
        }),
      });
    }
  }

  return NextResponse.json({ success: true, classes: [] });
}

// silence unused import warning if resolveAssetUrl unused later
void resolveAssetUrl;
