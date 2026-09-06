import type {
  FootballRankFiveItem,
  FootballRankFivePackId,
} from "./footballRankFiveModel";
import {
  queryFootballSubjects,
  resolveFootballSubjectReference,
  type FootballSubjectProfile,
} from "./footballSubjectRegistry";

const PROGRAM_ERA_QUERY = { kind: "program-era", league: "CFB" } as const;

function normalizedIdentity(value: string) {
  return value.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]/g, "");
}

function reviewedProgramEraWindow(item: Pick<FootballRankFiveItem, "id" | "name">) {
  const nameMatch = /^(.+?)\s+(\d{4})[–-](\d{4})$/.exec(item.name.trim());
  if (nameMatch) {
    return {
      school: nameMatch[1]!,
      startSeason: Number(nameMatch[2]),
      endSeason: Number(nameMatch[3]),
    };
  }

  const idMatch = /^(.+)-(\d{4})-(\d{4})$/.exec(item.id);
  if (!idMatch) return null;
  return {
    school: idMatch[1]!.replace(/-/g, " "),
    startSeason: Number(idMatch[2]),
    endSeason: Number(idMatch[3]),
  };
}

/**
 * Legacy editorial Program Era windows may predate the canonical coach-era identity model.
 * Exact canonical identities win. Otherwise reconcile only when one same-school canonical era
 * uniquely and tightly encloses the reviewed window; cross-coach windows fail closed.
 */
export function resolveFootballProgramEraReviewedItem(
  item: Pick<FootballRankFiveItem, "id" | "name">,
): FootballSubjectProfile | null {
  const direct = resolveFootballSubjectReference(item.id, item.name, PROGRAM_ERA_QUERY);
  if (direct) return direct;

  const window = reviewedProgramEraWindow(item);
  if (!window || window.startSeason > window.endSeason) return null;

  const candidates = queryFootballSubjects(PROGRAM_ERA_QUERY)
    .filter((subject) => (
      subject.school
      && normalizedIdentity(subject.school) === normalizedIdentity(window.school)
      && subject.startSeason != null
      && subject.endSeason != null
      && subject.startSeason <= window.startSeason
      && subject.endSeason >= window.endSeason
    ));
  if (!candidates.length) return null;

  const tightestSpan = Math.min(...candidates.map((subject) => subject.endSeason! - subject.startSeason!));
  const tightest = candidates.filter((subject) => subject.endSeason! - subject.startSeason! === tightestSpan);
  return tightest.length === 1 ? tightest[0]! : null;
}

/**
 * Runtime comparison calibration consumes canonical Program Era identities only.
 * Unresolvable legacy windows stay out of calibration rather than creating phantom eras.
 */
export function footballReviewedItemsForComparison(
  packId: FootballRankFivePackId,
  items: readonly FootballRankFiveItem[],
): readonly FootballRankFiveItem[] {
  if (packId !== "college-program-eras") return items;

  const canonical = new Map<string, FootballRankFiveItem>();
  for (const item of items) {
    const subject = resolveFootballProgramEraReviewedItem(item);
    if (!subject) continue;
    const seasons = subject.startSeason != null && subject.endSeason != null
      ? `${subject.startSeason}–${subject.endSeason}`
      : null;
    const reconciled: FootballRankFiveItem = {
      ...item,
      id: subject.id,
      name: subject.name,
      subtitle: [subject.school, seasons].filter(Boolean).join(" · ") || item.subtitle,
    };
    if (!canonical.has(subject.id)) canonical.set(subject.id, reconciled);
  }
  return [...canonical.values()];
}

function canonicalProgramEraBoardKey(item: FootballRankFiveItem) {
  const subject = resolveFootballSubjectReference(item.id, item.name, PROGRAM_ERA_QUERY);
  if (!subject) return null;
  if (subject.teamId) return `team:${String(subject.teamId)}`;
  if (subject.school) return `school:${normalizedIdentity(subject.school)}`;
  return null;
}

/**
 * Program Era boards compare at most one era from a canonical school/team. The conflict rule
 * is consumed by the shared comparison generator so Blind 5 and Keep 4 cannot diverge.
 */
export function footballComparisonItemsConflict(
  scopeId: string,
  left: FootballRankFiveItem,
  right: FootballRankFiveItem,
) {
  if (scopeId !== "college-program-eras") return false;
  const leftKey = canonicalProgramEraBoardKey(left);
  const rightKey = canonicalProgramEraBoardKey(right);
  return leftKey != null && rightKey != null && leftKey === rightKey;
}
