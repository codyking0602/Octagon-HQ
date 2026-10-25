// Read-only, staged player-monitor snapshot reconciliation.
// This file owns NO grades, contracts, rankings or scheduler.
import { createHash } from "node:crypto";
import { compareWheelSnapshots, verifyUfcRankings } from "./wheel-monitor-change-policy.mjs";
export const stableHash = value => createHash("sha256").update(JSON.stringify(value)).digest("hex");
export const normalizePerson = value => String(value ?? "").normalize("NFKD").replace(/[\\u0300-\\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "").replace(/(iii|ii|iv|jr|sr)$/,"");
export function flattenEspnRoster(payload) {
  const rows = Array.isArray(payload?.athletes) ? payload.athletes : [];
  const athletes = rows.flatMap(group => Array.isArray(group?.items) ? group.items : group?.id ? [group] : []);
  if (!athletes.length) throw new Error("ESPN roster source returned no athletes.");
  const names = new Map();
  for (const athlete of athletes) {
    const key = normalizePerson(athlete?.displayName ?? athlete?.fullName);
    if (!key) continue;
    const values = names.get(key) ?? [];
    values.push(String(athlete.id ?? ""));
    names.set(key,values);
  }
  if (!names.size) throw new Error("ESPN roster source contains no canonical athlete names.");
  return names;
}
export function inventoryFromAuthorities({football,ufc,rosters}) {
  if (!Array.isArray(football) || !Array.isArray(ufc)) throw new Error("Incomplete authority snapshot.");
  const current = [];
  const coverage = {NFL:0,CFB:0,UFC:0,rosterConfirmed:0,rosterMissing:0,rosterAmbiguous:0,coachUnverified:0};
  const found = new Set();
  for (const row of football) {
    const sport = /^[A-Z]{2,3}$/.test(row.team_code) ? "NFL" : "CFB";
    const identityKey = `${row.team_code}:${row.position_group}:${row.name_key}`;
    const key = `${sport}:${identityKey}`;
    if (found.has(key)) throw new Error(`Current authority includes duplicate grade identity ${key}`);
    found.add(key);
    const map = rosters?.[`${sport}:${row.team_code}`];
    const candidates = map?.get(normalizePerson(row.display_name)) ?? [];
    const rosterStatus = row.position_group === "Head Coach" ? "coach-external-check-required"
      : !map ? "source-unavailable" : candidates.length === 1 ? "verified"
      : candidates.length > 1 ? "ambiguous" : "not-on-espn-roster";
    if (rosterStatus === "verified") coverage.rosterConfirmed++;
    if (rosterStatus === "not-on-espn-roster") coverage.rosterMissing++;
    if (rosterStatus === "ambiguous") coverage.rosterAmbiguous++;
    if (row.position_group === "Head Coach") coverage.coachUnverified++;
    coverage[sport]++;
    current.push({sport,identityKey,team:row.team_code,role:row.position_group,player:row.display_name,rosterStatus,
      canonicalGradeVersion:row.grade_version,gradeEffectiveDate:row.effective_date});
  }
  const ranks = ufc.map(row => ({identityKey:row.fighter_id,division:row.division,ranking:row.ranking,
    isChampion:row.is_champion,active:row.active}));
  verifyUfcRankings(ranks);
  for (const row of ufc) {
    const identityKey = `${row.division}:${row.fighter_id}`;
    const key = `UFC:${identityKey}`;
    if (found.has(key)) throw new Error(`Duplicate active UFC identity ${key}`);
    found.add(key);coverage.UFC++;
    if (!row.headshot_url) throw new Error(`Missing UFC fighter headshot path for ${key}`);
    current.push({sport:"UFC",identityKey,division:row.division,ranking:row.ranking,
      isChampion:row.is_champion,player:row.display_name,gradeEffectiveDate:row.rankings_as_of,
      canonicalGradeVersion:row.grade_version,headshotPath:row.headshot_url});
  }
  return {identities:current.sort((a,b)=>a.sport.localeCompare(b.sport)||a.identityKey.localeCompare(b.identityKey)),coverage};
}
export function createReviewReceipt({lastGood,current,evidenceByKey,sourceStatus,createdAt}) {
  if (!sourceStatus?.db || !sourceStatus?.nflRosters || !sourceStatus?.cfbRosters ||
    !sourceStatus?.officialUfcVerified || !sourceStatus?.gmContracts) {
    return {status:"blocked",createdAt,coverage:current.coverage,
      blockers:Object.entries(sourceStatus??{}).filter(([,ok])=>ok!==true).map(([name])=>name),
      preservedLastGood:true,gradeChanges:0};
  }
  if (!lastGood || !Array.isArray(lastGood.identities)) {
    return {status:"baseline-review-required",createdAt,coverage:current.coverage,
      blockers:["initial-baseline-requires-reviewed-certification"],gradeChanges:0,preservedLastGood:true};
  }
  const delta=compareWheelSnapshots(lastGood.identities,current.identities,evidenceByKey);
  return {status:delta.needsEvidence?"evidence-review-required":"compared",createdAt,
    coverage:current.coverage,review:delta,gradeChanges:0,previousHash:stableHash(lastGood.identities),
    currentHash:stableHash(current.identities),preservedLastGood:true};
}
