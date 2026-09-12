import type { WhoAmIClue, WhoAmIClueBand, WhoAmIEraBand } from "./whoAmIEngine";

export function whoAmISlug(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function whoAmIClue(id: string, text: string, band: WhoAmIClueBand): WhoAmIClue {
  return { id, text, band };
}

export function distinctWhoAmIClues(clues: readonly WhoAmIClue[]) {
  const seen = new Set<string>();
  return clues.filter((row) => {
    const key = row.text.trim().toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function whoAmIEraBand(startYear: number, endYear: number): WhoAmIEraBand {
  return ((startYear + endYear) / 2) >= 2000 ? "modern" : "legacy";
}
