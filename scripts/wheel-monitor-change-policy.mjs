// Deterministic Wheel monitoring classification. This module NEVER writes grade authorities.
export const UFC_MENS_DIVISIONS = Object.freeze([
  "Flyweight", "Bantamweight", "Featherweight", "Lightweight",
  "Welterweight", "Middleweight", "Light Heavyweight", "Heavyweight",
]);
export const LEVEL = Object.freeze({
  NONE: "no-meaningful-change",
  REVIEW: "review-suggested",
  PRIORITY: "priority-review",
  FACT: "mandatory-factual-correction",
});
const FACT_FIELDS = ["team", "division", "ranking", "isChampion", "eligible", "rosterStatus", "contractEndSeason", "contractApy", "identityKey"];
const PRIORITY_FIELDS = ["starter", "role", "coach", "depthTier"];
const normalize = value => value == null ? null : String(value);
export function verifyUfcRankings(rows) {
  if (!Array.isArray(rows)) throw new Error("UFC ranking input must be an array.");
  const seen = new Set();
  for (const division of UFC_MENS_DIVISIONS) {
    const divisionRows = rows.filter(row => row.division === division && row.active !== false);
    const champions = divisionRows.filter(row => row.isChampion === true);
    const ranks = divisionRows.filter(row => Number.isInteger(row.ranking));
    if (champions.length !== 1 || champions[0].ranking != null ||
        ranks.length !== 15 || ranks.some((row, i) => !ranks.some(item => item.ranking === i + 1)) ||
        new Set(divisionRows.map(row => row.identityKey)).size !== divisionRows.length) {
      throw new Error(`UFC ${division}: expected one unranked champion and distinct contenders #1–15.`);
    }
    for (const row of divisionRows) {
      if (!row.identityKey) throw new Error(`UFC ${division}: missing canonical fighter identity.`);
      const key = `${division}:${row.identityKey}`;
      if (seen.has(key)) throw new Error(`Duplicate UFC division identity ${key}`);
      seen.add(key);
    }
  }
  if (rows.some(row => !UFC_MENS_DIVISIONS.includes(row.division))) {
    throw new Error("UFC ranking payload contains an unexpected division.");
  }
  return { divisions: 8, officialSlots: 128, coveredIdentities: rows.filter(row => row.active !== false).length };
}
export function classifyWheelChange(previous, current, evidence = {}) {
  if (!previous || !current) {
    return { level: LEVEL.FACT, reasons: ["identity-or-population-change"], gradeAction: "none", action: "verify-identity-and-onboarding" };
  }
  const facts = FACT_FIELDS.filter(field => normalize(previous[field]) !== normalize(current[field]));
  const roles = PRIORITY_FIELDS.filter(field => normalize(previous[field]) !== normalize(current[field]));
  const reasons = [...facts.map(field => `factual:${field}`), ...roles.map(field => `role:${field}`)];
  const sustained = Number(evidence.independentGames ?? 0) >= 3 && evidence.verifiedPerformanceChange === true;
  const significant = evidence.significantEvent === true;
  if (significant) reasons.push("verified-significant-event");
  if (sustained) reasons.push("sustained-performance-evidence");
  const level = facts.length ? LEVEL.FACT
    : roles.length || significant ? LEVEL.PRIORITY
    : sustained ? LEVEL.REVIEW : LEVEL.NONE;
  if (level !== LEVEL.NONE && (!evidence.sourceUrl || !evidence.observedAt)) {
    return { level, reasons, gradeAction: "none", action: "source-evidence-required", blocker: "source URL and timestamp required" };
  }
  return { level, reasons, gradeAction: "none",
    action: level === LEVEL.FACT ? "prepare-reviewed-factual-correction"
      : level === LEVEL.NONE ? "hold-existing-grade" : "editorial-peer-review" };
}
export function compareWheelSnapshots(before, after, evidenceByKey = {}) {
  if (!Array.isArray(before) || !Array.isArray(after)) throw new Error("Expected two complete identity arrays.");
  const index = (rows, label) => {
    const byId = new Map();
    for (const row of rows) {
      if (!row.identityKey || !row.sport) throw new Error(`${label}: row missing sport or identityKey`);
      const key = `${row.sport}:${row.identityKey}`;
      if (byId.has(key)) throw new Error(`${label}: duplicate identity ${key}`);
      byId.set(key, row);
    }
    return byId;
  };
  const old = index(before, "previous"), next = index(after, "current");
  const all = [...new Set([...old.keys(), ...next.keys()])].sort();
  const changes = [];
  for (const key of all) {
    const result = classifyWheelChange(old.get(key), next.get(key), evidenceByKey[key]);
    if (result.level !== LEVEL.NONE) {
      changes.push({ identity: key, previous: old.get(key) ?? null, current: next.get(key) ?? null, ...result,
        evidence: evidenceByKey[key] ?? null });
    }
  }
  return { monitored: next.size, unchanged: next.size - changes.filter(x => x.current).length,
    changed: changes.length, changes, gradeChanges: 0, // Review only; never auto-grade.
    needsEvidence: changes.filter(x => x.blocker || (x.evidence == null)).length };
}
