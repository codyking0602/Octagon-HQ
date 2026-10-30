import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { NBA_GM_TEAM_CODES } from "./nbaGmFoundation";

/** Official NBA *broad* roster identity audit, not certification of skill or game eligibility. */
type Row = {
  name: string;
  teamCode: string;
  officialRosterPosition: string;
  officialRosterUrl: string;
  teamIdentityStatus: string;
  positionStatus: string;
  officialNBAPlayerId: string | null;
};
const source = JSON.parse(readFileSync(
  "docs/nba-gm-official-nba-30-team-roster-crosswalk-2026-10-29.json", "utf8",
)) as { published: boolean; teamCount: number; playerCount: number; notVerifiedTeams: string[]; crosswalk: Row[] };
const board = JSON.parse(readFileSync(
  "docs/nba-gm-330-six-skills-PROVISIONAL-2026-10-29.json", "utf8",
)) as { published: boolean; certifiedCount: number; players: Array<{name: string; teamCode: string}> };
const normalize = (s: string) => s.normalize("NFKD")
  .replace(/[\u0300-\u036f]/g, "").toLowerCase()
  .replace(/[^a-z0-9]/g, "").replace(/(?:iii|ii|jr|sr)$/, "");
const broad = new Set(["G", "F", "C", "G-F", "F-G", "C-F", "F-C", "G-C", "C-G"]);

describe("NBA GM official roster snapshot — unpublished evidence only", () => {
  it("reconciles 330 unique proposed players and all 30 team codes", () => {
    expect(source.published).toBe(false);
    expect(board.published).toBe(false);
    expect(board.certifiedCount).toBe(0);
    expect(source.playerCount).toBe(330);
    expect(source.teamCount).toBe(30);
    expect(source.notVerifiedTeams).toEqual([]);
    expect(source.crosswalk).toHaveLength(330);
    const ids = source.crosswalk.map(r => normalize(r.name));
    expect(new Set(ids).size).toBe(330);
    const boardIds = new Set(board.players.map(p => normalize(p.name)));
    expect(boardIds).toEqual(new Set(ids));
    expect(new Set(source.crosswalk.map(r => r.teamCode))).toEqual(new Set(NBA_GM_TEAM_CODES));
    const teams = new Map(board.players.map(p => [normalize(p.name), p.teamCode]));
    for (const p of source.crosswalk) {
      expect(teams.get(normalize(p.name)), p.name).toBe(p.teamCode);
      expect(broad.has(p.officialRosterPosition), p.name).toBe(true);
      expect(p.officialRosterUrl, p.name).toMatch(/^https:\/\/www\.nba\.com\/team\/\d+\/(?:[a-z-]+\/)?roster$/);
      expect(p.teamIdentityStatus, p.name).toContain("confirmed-on-NBA-official");
      expect(p.positionStatus, p.name).toContain("not-certified");
      if (p.officialNBAPlayerId !== null) expect(p.officialNBAPlayerId, p.name).toMatch(/^\d+$/);
    }
  });
  it("keeps official NBA broad positions separate from exact GM playable eligibility", () => {
    const offenders = source.crosswalk.filter(row => {
      const match = board.players.find(p => normalize(p.name) === normalize(row.name));
      return !match || match.teamCode !== row.teamCode;
    });
    expect(offenders).toEqual([]);
    const sourceText = readFileSync("docs/nba-gm-official-nba-30-team-roster-crosswalk-2026-10-29.json", "utf8");
    expect(sourceText).toContain("specific game PG/SG/SF/PF/C slot eligibility");
    expect(sourceText).toContain("remain unverified");
    const runtime = readFileSync("src/features/nba/nbaGmFoundation.ts", "utf8");
    expect(runtime).not.toContain("nba-gm-official-nba-30-team-roster-crosswalk");
  });
  it("checks 32 direct roster-to-profile October 30 identity links without certifying exact slots", () => {
    const md = readFileSync("docs/nba-gm-official-32-roster-to-profile-verifications-2026-10-30.md", "utf8");
    const matched = [...md.matchAll(/^\\| (DET|HOU|LAL) \\| ([^|]+) \\| \\[(\\d+)\\]\\(https:\\/\\/www\\.nba\\.com\\/player\\/\\3\\) \\|$/gm)];
    expect(matched).toHaveLength(32);
    const exactRows = new Map(source.crosswalk.map(p => [p.name, p]));
    for (const hit of matched) {
      const row = exactRows.get(hit[2]!.trim());
      expect(row?.teamCode, hit[2]).toBe(hit[1]);
      expect(row?.officialNBAPlayerId, hit[2]).toBe(hit[3]);
      expect(row?.positionStatus, hit[2]).toContain("not-certified");
    }
    expect(source.published).toBe(false);
    expect(board.certifiedCount).toBe(0);
  });

});
