import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { NBA_GM_VERIFIED_HEADSHOT_IDS, nbaGmOfficialHeadshotId } from "./nbaGmOfficialHeadshots";

const fixture = readFileSync("supabase/migrations/202612310894_nba_gm_private_330_development_fixtures.sql", "utf8");
const page = readFileSync("src/features/nba/NbaGmDevPage.tsx", "utf8");
const finalPage = readFileSync("src/features/nba/NbaGmFinalExperience.tsx", "utf8");
const css = readFileSync("src/styles/nba-gm-dev.css", "utf8");
const teamBranding = readFileSync("src/features/nba/nbaTeamBranding.tsx", "utf8");
const repository = readFileSync("src/features/nba/nbaGmDevRepository.ts", "utf8");

const players = [...fixture.matchAll(/\('([^']+)','((?:[^']|'')+)','([A-Z]{3})',ARRAY\[[^\n]*?::bigint\[\],(null|'[0-9]+'),/g)].map(row => ({
  id: row[1]!,
  name: row[2]!,
  teamCode: row[3]!,
  officialNbaPlayerId: row[4] === "null" ? null : row[4]!.slice(1, -1),
}));

describe("NBA GM 30-team headshot and Football presentation parity", () => {
  it("recovers every missing official player identity without altering the catalog", () => {
    expect(players).toHaveLength(330);
    expect(new Set(players.map(player => player.id)).size).toBe(330);
    expect(Object.keys(NBA_GM_VERIFIED_HEADSHOT_IDS)).toHaveLength(98);
    expect(players.filter(player => !player.officialNbaPlayerId)).toHaveLength(98);
    const ids = players.map(player => nbaGmOfficialHeadshotId(player));
    expect(ids.every(id => id && /^\d+$/.test(id))).toBe(true);
    expect(new Set(ids).size).toBe(330);
    const byTeam = new Map<string, typeof players>();
    for (const player of players) byTeam.set(player.teamCode, [...(byTeam.get(player.teamCode) ?? []), player]);
    for (const [team, entries] of byTeam) {
      expect(team).toMatch(/^[A-Z]{3}$/);
      expect(entries.length).toBeGreaterThanOrEqual(9);
      expect(entries.every(player => Boolean(nbaGmOfficialHeadshotId(player)))).toBe(true);
    }
    expect(new Set(players.map(player => player.teamCode)).size).toBe(30);
  });

  it("binds the server-owned repricing forecast to the approved scouting pills", () => {
    expect(page).toContain("nbaGmRepriceLabel(player.repriceRisk,player.gameContract)");
    expect(page).toContain("nba-gm-dev__reprice is-");
    expect(css).toContain(".nba-gm-dev__reprice.is-high");
    expect(repository).toContain('repriceRisk:z.enum(["LOW","MEDIUM","HIGH","LOCKED"]).nullable().optional()');
  });

  it("uses the recovered identities on draft, roster and final screens", () => {
    expect(page).toContain("nbaGmOfficialHeadshotId(player)");
    expect(finalPage).toContain("nbaGmOfficialHeadshotId(player)");
    expect(page).toContain("cdn.nba.com/headshots/nba/latest/260x190/");
    expect(finalPage).toContain("cdn.nba.com/headshots/nba/latest/260x190/");
  });

  it("follows Football GM roster and position-picker markup without clipped portraits", () => {
    expect(page).toContain('football-gm__roster surface-card nba-gm-dev__roster-panel');
    expect(page).toContain('football-gm__roster-grid nba-gm-dev__roster');
    expect(page).toContain('football-wheel-picker football-gm__picker surface-card');
    expect(page).toContain("football-gm__position-tabs");
    expect(css).toContain("object-fit:contain;object-position:center bottom");
    expect(css).toContain("flex:0 0 42px");
    expect(page).not.toContain('<span>{code}</span>');
    expect(teamBranding).not.toContain('<span className="nba-team-mark__fallback">{team.id}</span>\n    <img');
  });
});
