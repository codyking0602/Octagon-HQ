import { writeFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { nbaFindLeaderHeadshot, nbaFindLeaderSubjects } from "./nbaFindTheLeaderModel";
import { NBA_HIGHER_LOWER_ELIGIBLE_PHOTO_SUBJECTS } from "./nbaHigherLowerModel";
import { nbaHitHeadshot, nbaHitSubjects } from "./nbaHitTheNumberStats";
import { nbaPortraitSource } from "./nbaHigherLowerPortraits";

interface Candidate {
  name: string;
  nbaId: number | null;
  season?: number;
  game: string;
  url: string | null;
}
function key(name: string) {
  return name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
}
/**
 * Enumerate ALL roster-eligible identities, rather than only seeded sample
 * boards. The generated manifest is used by the exact-head, pixel-level CI
 * audit. No published game setup, scoring or generated lineup is modified.
 */
export function nbaCompletePortraitInventory() {
  const candidates: Candidate[] = [
    ...nbaFindLeaderSubjects.map(s => ({
      name: s.name, nbaId: s.nbaId, season: s.season ?? undefined,
      game: "find-leader", url: nbaFindLeaderHeadshot(s),
    })),
    ...NBA_HIGHER_LOWER_ELIGIBLE_PHOTO_SUBJECTS.map(s => ({
      name: s.name, nbaId: s.nbaId, game: "higher-lower",
      url: nbaPortraitSource(s),
    })),
    ...nbaHitSubjects.map(s => ({
      name: s.name, nbaId: s.nbaId, season: s.season ?? undefined,
      game: "hit-the-number", url: nbaHitHeadshot(s),
    })),
  ];
  const byName = new Map<string, Candidate[]>();
  for (const candidate of candidates) {
    const k = key(candidate.name);
    byName.set(k, [...(byName.get(k) ?? []), candidate]);
  }
  const result = [...byName.entries()].map(([identity, rows]) => {
    const ids = [...new Set(rows.map(row => row.nbaId).filter((id): id is number => id != null))];
    // Never collapse same-name people carrying conflicting NBA person IDs.
    if (ids.length > 1) throw new Error("Conflicting NBA person IDs for " + rows[0]!.name + ": " + ids.join(", "));
    const urls = [...new Set(rows.map(row => row.url).filter((url): url is string => url != null))];
    if (urls.length > 1) throw new Error("Conflicting NBA portraits across games for " + rows[0]!.name + ": " + urls.join(", "));
    return {
      identity, name: rows[0]!.name, nbaId: ids[0] ?? null, url: urls[0] ?? null,
      games: [...new Set(rows.map(row => row.game))].sort(),
      historicalSeasons: [...new Set(rows.map(row => row.season).filter((season): season is number => season != null))].sort(),
    };
  });
  return result.sort((a, b) => a.identity.localeCompare(b.identity));
}

describe("NBA complete eligible photo inventory", () => {
  it("checks historical Find Leader, Higher or Lower, and Hit Number player bindings", () => {
    const manifest = nbaCompletePortraitInventory();
    expect(manifest.length).toBeGreaterThan(180);
    expect(new Set(manifest.map(x => x.identity)).size).toBe(manifest.length);
    for (const person of manifest) {
      expect(person.games.length).toBeGreaterThan(0);
      expect(person.url == null || person.url.startsWith("https://")).toBe(true);
    }
    for (const name of ["Michael Finley", "Tim Hardaway", "Glen Rice", "Jerry Stackhouse"]) {
      const entry = manifest.find(x => x.name === name);
      expect(entry?.games).toContain("find-leader");
      expect(entry?.url).not.toContain("/headshots/nba/latest/");
    }
    expect(manifest.find(x => x.name === "Tim Hardaway Jr.")?.url)
      .not.toBe(manifest.find(x => x.name === "Tim Hardaway")?.url);
    if (process.env.NBA_PHOTO_AUDIT === "1") {
      writeFileSync("nba-photo-audit-manifest.json", JSON.stringify(manifest, null, 2));
      console.log("Complete NBA portrait audit source: " + manifest.length + " eligible identities");
    }
  });
});
