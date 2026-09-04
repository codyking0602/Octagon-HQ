import { footballSubjectAsset } from "./footballSubjectAssets";

const EXACT_YEAR = /\b(?:18|19|20)\d{2}\b\s*[:·\-–—]?\s*/g;

export function footballBlindResumeFactText(value: unknown) {
  const text = String(value ?? "—")
    .replace(EXACT_YEAR, "")
    .replace(/\s{2,}/g, " ")
    .trim();
  return text || "—";
}

export function footballBlindResumeRevealAsset(subjectId: unknown) {
  return footballSubjectAsset(String(subjectId ?? ""));
}
