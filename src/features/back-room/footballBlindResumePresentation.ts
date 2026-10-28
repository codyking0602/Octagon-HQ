import { footballCfbTeamMediaId } from "./footballMediaIdentity";
import { footballSubjectAsset, footballTeamAssets } from "./footballSubjectAssets";

const EXACT_YEAR = /\b(?:18|19|20)\d{2}\b\s*[:·\-–—]?\s*/g;
const LEGACY_CFB_PROGRAM = /^(.+)-program$/;
const LEGACY_CFB_PROGRAM_ERA = /^(.+)-\d{4}-\d{4}$/;

export function footballBlindResumeFactText(value: unknown) {
  const text = String(value ?? "—")
    .replace(EXACT_YEAR, "")
    .replace(/\s{2,}/g, " ")
    .trim();
  return text || "—";
}

function legacyCfbRevealTeamId(subjectId: string) {
  const program = LEGACY_CFB_PROGRAM.exec(subjectId);
  if (program) return footballCfbTeamMediaId(program[1]!);
  const era = LEGACY_CFB_PROGRAM_ERA.exec(subjectId);
  return era ? footballCfbTeamMediaId(era[1]!) : null;
}

export function footballBlindResumeRevealAsset(subjectId: unknown) {
  const id = String(subjectId ?? "");
  const canonicalAsset = footballSubjectAsset(id);
  if (canonicalAsset) return canonicalAsset;

  // Blind Resume still has a few curated CFB-era IDs whose boundaries intentionally differ
  // from the canonical subject registry. Resolve only their team mark through the existing
  // canonical media catalog instead of creating a second reveal-only asset registry.
  const teamId = legacyCfbRevealTeamId(id);
  return teamId ? footballTeamAssets[teamId] ?? null : null;
}
