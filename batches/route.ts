import { NextResponse } from "next/server";
import { fetchCatalog, lxpwBatches } from "@/lib/study-api";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const CATALOG_TTL = 30 * 60 * 1000;

type CatalogBatch = {
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
};

let catalogCache: { batches: CatalogBatch[]; expiresAt: number } | null = null;
let catalogRequest: Promise<CatalogBatch[] | null> | null = null;

async function persistSnapshot(batches: CatalogBatch[]) {
  try {
    const payload = JSON.stringify(batches);
    await db.catalogCache.upsert({
      where: { id: "batches" },
      create: { id: "batches", payload },
      update: { payload, fetchedAt: new Date() },
    });
  } catch {
    // The in-memory cache still serves the current instance when DB storage is unavailable.
  }
}

async function loadCatalog(): Promise<CatalogBatch[] | null> {
  if (catalogCache && catalogCache.expiresAt > Date.now()) return catalogCache.batches;
  if (catalogRequest) return catalogRequest;

  catalogRequest = (async () => {
    const upstreamP = fetchCatalog().then((result) => {
      const batches = result?.batches ?? [];
      return batches.length ? batches : Promise.reject(new Error("Empty primary catalog"));
    });
    const mirrorP = lxpwBatches(8).then((batches) =>
      batches.length ? batches : Promise.reject(new Error("Empty mirror catalog"))
    );

    const batches = await Promise.any([upstreamP, mirrorP]).catch(() => null);
    if (batches?.length) {
      catalogCache = { batches: batches as CatalogBatch[], expiresAt: Date.now() + CATALOG_TTL };
      void persistSnapshot(batches as CatalogBatch[]);
      return batches as CatalogBatch[];
    }

    try {
      const snapshot = await db.catalogCache.findUnique({ where: { id: "batches" } });
      if (snapshot) {
        const cached = JSON.parse(snapshot.payload) as CatalogBatch[];
        if (Array.isArray(cached) && cached.length) {
          catalogCache = { batches: cached, expiresAt: Date.now() + 5 * 60 * 1000 };
          return cached;
        }
      }
    } catch {
      // No usable snapshot.
    }
    return null;
  })();

  try {
    return await catalogRequest;
  } finally {
    catalogRequest = null;
  }
}

function normalize(value: unknown) {
  return typeof value === "string" ? value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim() : "";
}

function matchesCategory(batch: CatalogBatch, category: string) {
  if (!category || category === "All") return true;
  const text = normalize([batch.name, batch.byName, batch.language, batch.type, batch.slug].filter(Boolean).join(" "));
  const key = normalize(category);

  if (key.startsWith("class ")) {
    const number = key.replace("class ", "");
    return text.includes(`class ${number}`) || text.includes(`class${number}`) || text.includes(`${number}th`) || text.includes(`${number}rd`) || text.includes(`${number}st`);
  }
  return text.includes(key);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const page = Math.max(1, Number.parseInt(url.searchParams.get("page") ?? "1", 10) || 1);
  const pageSize = Math.min(24, Math.max(6, Number.parseInt(url.searchParams.get("pageSize") ?? "18", 10) || 18));
  const query = normalize(url.searchParams.get("q") ?? "");
  const category = url.searchParams.get("category") ?? "All";
  const ids = new Set((url.searchParams.get("ids") ?? "").split(",").map((id) => id.trim()).filter(Boolean).slice(0, 300));

  const catalog = await loadCatalog();
  if (!catalog) {
    return NextResponse.json(
      { success: false, batches: [], total: 0, page, pageSize, hasMore: false, error: "The batch catalog is temporarily unavailable. Please try again." },
      { status: 502 }
    );
  }

  const filtered = catalog.filter((batch) => {
    if (ids.size && !ids.has(batch._id)) return false;
    if (ids.size === 0 && url.searchParams.has("ids")) return false;
    if (!matchesCategory(batch, category)) return false;
    if (!query) return true;
    const haystack = normalize([batch.name, batch.byName, batch.language, batch.type, batch.slug].filter(Boolean).join(" "));
    return haystack.includes(query);
  });

  const start = (page - 1) * pageSize;
  const pageItems = filtered.slice(start, start + pageSize).map((batch) => ({
    _id: batch._id,
    name: batch.name,
    byName: batch.byName,
    startDate: batch.startDate,
    endDate: batch.endDate,
    language: batch.language,
    previewImage: batch.previewImage,
    feeTotal: batch.feeTotal,
    type: batch.type,
    slug: batch.slug,
  }));
  return NextResponse.json({
    success: true,
    source: "catalog",
    batches: pageItems,
    page,
    pageSize,
    total: filtered.length,
    hasMore: start + pageItems.length < filtered.length,
  });
}
