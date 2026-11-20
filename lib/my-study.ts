"use client";

export const MY_STUDY_STORAGE_KEY = "elite-study:saved-batches";

/** Read the learner's device-local My Study list. */
export function readMyStudyIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const value = JSON.parse(window.localStorage.getItem(MY_STUDY_STORAGE_KEY) || "[]");
    return Array.isArray(value)
      ? value.filter((id): id is string => typeof id === "string" && id.length > 0)
      : [];
  } catch {
    return [];
  }
}

/** Persist a de-duplicated list without allowing storage errors to block study. */
export function writeMyStudyIds(ids: string[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(MY_STUDY_STORAGE_KEY, JSON.stringify([...new Set(ids)]));
  } catch {
    // The current session remains usable if browser storage is unavailable.
  }
}

/** Toggle a batch in My Study and return its new membership state. */
export function toggleMyStudyId(id: string): boolean {
  const current = readMyStudyIds();
  const exists = current.includes(id);
  const next = exists ? current.filter((item) => item !== id) : [...current, id];
  writeMyStudyIds(next);
  return !exists;
}
