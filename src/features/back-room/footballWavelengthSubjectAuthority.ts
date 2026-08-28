import type { FootballSubjectProfile } from "./footballSubjectRegistry";
import { footballSubjects, getFootballSubject } from "./footballSubjectRegistry";
import type { FootballWavelengthClue } from "./footballWavelengthModel";

function normalizedSubjectName(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

const canonicalSubjectByUniqueName = new Map<string, FootballSubjectProfile>();
const ambiguousCanonicalNames = new Set<string>();
for (const subject of footballSubjects) {
  const key = normalizedSubjectName(subject.name);
  if (ambiguousCanonicalNames.has(key)) continue;
  if (canonicalSubjectByUniqueName.has(key)) {
    canonicalSubjectByUniqueName.delete(key);
    ambiguousCanonicalNames.add(key);
    continue;
  }
  canonicalSubjectByUniqueName.set(key, subject);
}

/**
 * Resolves reusable Football entities through the one canonical subject universe.
 * Wavelength-only concepts and league-ambiguous career names intentionally return null;
 * subjective ratings remain owned by Wavelength instead of collapsing distinct identities.
 */
export function footballWavelengthCanonicalSubjectForClue(clue: FootballWavelengthClue) {
  const direct = getFootballSubject(clue.id);
  if (direct) return direct;
  return canonicalSubjectByUniqueName.get(normalizedSubjectName(clue.text)) ?? null;
}
