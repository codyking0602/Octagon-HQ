import type { FootballSubjectProfile } from "./footballSubjectRegistry";
import { footballSubjects, getFootballSubject } from "./footballSubjectRegistry";
import type { FootballWavelengthClue } from "./footballWavelengthModel";

function normalizedSubjectName(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

const canonicalSubjectByName = new Map<string, FootballSubjectProfile>();
for (const subject of footballSubjects) {
  const key = normalizedSubjectName(subject.name);
  if (!canonicalSubjectByName.has(key)) canonicalSubjectByName.set(key, subject);
}

/**
 * Resolves reusable Football entities through the one canonical subject universe.
 * Wavelength-only concepts intentionally return null; subjective ratings remain owned by Wavelength.
 */
export function footballWavelengthCanonicalSubjectForClue(clue: FootballWavelengthClue) {
  const direct = getFootballSubject(clue.id);
  if (direct) return direct;
  return canonicalSubjectByName.get(normalizedSubjectName(clue.text)) ?? null;
}
