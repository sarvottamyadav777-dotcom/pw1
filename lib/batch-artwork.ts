/** Local branded artwork used when an upstream batch has no usable thumbnail. */
export function getBatchFallback(batchName?: string): string {
  const name = (batchName ?? "").toLowerCase();
  if (/udaan|class\s*10|10th|foundation/.test(name)) return "/batch-thumbnail-udaan.svg";
  if (/parishram|class\s*12|12th|accountancy/.test(name)) return "/batch-thumbnail-parishram.svg";
  return "/batch-thumbnail-fallback.svg";
}
