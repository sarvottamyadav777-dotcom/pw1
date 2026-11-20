import { NextRequest, NextResponse } from "next/server";
import { getGuestToken } from "@/lib/study-api";

export const dynamic = "force-dynamic";

/** Domains that require the PW guest token for asset access. */
const PW_DOMAINS = ["pw.live", "penpencilvdo", "learnxpw.site"];

function isPwUrl(url: URL): boolean {
  const host = url.hostname.toLowerCase();
  return PW_DOMAINS.some((domain) => host === domain || host.endsWith(`.${domain}`) || host.includes(domain));
}

function safePdfFilename(value: string | null): string {
  const cleaned = (value || "Elite-Study-Document.pdf")
    .replace(/[\\/:*?"<>|\r\n]+/g, "-")
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .trim()
    .slice(0, 120) || "Elite-Study-Document.pdf";
  return /\.pdf$/i.test(cleaned) ? cleaned : `${cleaned}.pdf`;
}

function contentDisposition(filename: string, download: boolean): string {
  const disposition = download ? "attachment" : "inline";
  const ascii = filename.replace(/[^\x20-\x7E]/g, "_").replace(/["\\]/g, "_");
  const encoded = encodeURIComponent(filename).replace(/[!'()*]/g, (char) =>
    `%${char.charCodeAt(0).toString(16).toUpperCase()}`
  );
  return `${disposition}; filename="${ascii}"; filename*=UTF-8''${encoded}`;
}

/**
 * GET /api/pdf?url=<encoded-pdf-url>
 * Proxies a remote PDF through our own origin so the in-app pdf.js viewer
 * can load it without CORS restrictions.
 */
export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  const download = req.nextUrl.searchParams.get("download") === "1";
  const filename = safePdfFilename(req.nextUrl.searchParams.get("filename"));
  if (!url) {
    return NextResponse.json({ success: false, error: "url required" }, { status: 400 });
  }

  let assetUrl: URL;
  try {
    assetUrl = new URL(url);
    if (assetUrl.protocol !== "https:" && assetUrl.protocol !== "http:") throw new Error("Unsupported protocol");
  } catch {
    return NextResponse.json({ success: false, error: "A valid HTTP(S) document URL is required." }, { status: 400 });
  }

  try {
    const headers: Record<string, string> = {
      Accept: "application/pdf,*/*",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
    };

    if (isPwUrl(assetUrl)) {
      const token = await getGuestToken();
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
        headers["token"] = token;
        headers["client-type"] = "WEB";
        headers["client-version"] = "1.0.0";
      }
    }

    const res = await fetch(assetUrl.toString(), {
      headers,
      redirect: "follow",
      signal: AbortSignal.timeout(30000),
    });

    if (!res.ok || !res.body) {
      return NextResponse.json(
        { success: false, error: `Upstream returned ${res.status}` },
        { status: 502 }
      );
    }

    const upstreamContentType = res.headers.get("Content-Type") ?? "application/pdf";
    const contentType = upstreamContentType.toLowerCase().includes("pdf")
      ? upstreamContentType
      : "application/pdf";

    // If the upstream returned HTML (error page), don't pass it through as a PDF
    if (upstreamContentType.toLowerCase().includes("text/html")) {
      return NextResponse.json(
        { success: false, error: "Upstream returned an error page instead of a PDF." },
        { status: 502 }
      );
    }

    const outHeaders = new Headers({
      "Content-Type": contentType,
      "Cache-Control": "private, max-age=300",
      "Access-Control-Allow-Origin": "*",
      "X-Content-Type-Options": "nosniff",
      "Content-Disposition": contentDisposition(filename, download),
    });
    const len = res.headers.get("Content-Length");
    if (len) outHeaders.set("Content-Length", len);

    return new NextResponse(res.body, { headers: outHeaders });
  } catch {
    return NextResponse.json(
      { success: false, error: "Could not fetch the PDF." },
      { status: 502 }
    );
  }
}
