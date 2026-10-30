import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { NBA_GM_SKILL_KEYS, NBA_GM_TEAM_CODES } from "./nbaGmFoundation";

const draft = JSON.parse(readFileSync("docs/nba-gm-330-six-skills-PROVISIONAL-2026-10-29.json", "utf8")) as {
  players: Array<{name:string; teamCode:string; overall:number; skills:Record<string,number>; reviewStatus:string; gradeReviewStatus:string}>;
  published:boolean; certifiedCount:number;
};
const review = JSON.parse(readFileSync("docs/nba-gm-official-identity-and-evidence-review-2026-10-29.json", "utf8")) as {
  productionPublished:boolean; completeSixSkillCertified:number;
  officialRosterIdentity:Array<{name:string; teamCode:string; nbaPlayerId:number; officialPositionFamily:string; officialPlayerUrl:string; verificationStatus:string}>;
  official2026DraftIdentity:Array<{name:string; draftingTeam:string; pick:number; sourceUrl:string; verificationStatus:string}>;
  individualResearch:Array<{name:string; season:string; skillsReviewed:string[]; before:number|null; after:number|null; sourceUrl:string; status:string}>;
  roleFlags:Array<{name:string;why:string}>;
};

describe("NBA GM evidence-led provisional identity and skill review", () => {
  const players = new Map(draft.players.map(p => [p.name, p]));
  it("ties 19 official NBA player IDs and current teams to existing draft identities, without substituting generic roster URLs", () => {
    expect(review.officialRosterIdentity).toHaveLength(19);
    const ids = new Set<number>();
    const names = new Set<string>();
    for (const entry of review.officialRosterIdentity) {
      expect(ids.has(entry.nbaPlayerId), entry.name).toBe(false);
      expect(names.has(entry.name), entry.name).toBe(false);
      ids.add(entry.nbaPlayerId); names.add(entry.name);
      expect(players.get(entry.name)?.teamCode, entry.name).toBe(entry.teamCode);
      expect(NBA_GM_TEAM_CODES).toContain(entry.teamCode);
      expect(entry.officialPositionFamily).toMatch(/^(G|F|C)(-(G|F|C))?$/);
      expect(entry.officialPlayerUrl, entry.name).toMatch(new RegExp("^https://www\\.nba\\.com/player/" + entry.nbaPlayerId + "(?:/|$)"));
      expect(entry.verificationStatus).toBe("NBA_PLAYER_ID_AND_CURRENT_TEAM_VERIFIED_EXACT_SLOT_PENDING");
    }
    const indDraft = draft.players.filter(p => p.teamCode === "IND");
    expect(indDraft).toHaveLength(12);
    for (const p of indDraft) expect(names.has(p.name), p.name).toBe(true);
  });
  it("records first 2026 draft identity and distinguishes pick origin from opening roster", () => {
    expect(review.official2026DraftIdentity).toHaveLength(13);
    const picks = new Set<number>();
    for (const p of review.official2026DraftIdentity) {
      expect(players.has(p.name), p.name).toBe(true);
      expect(picks.has(p.pick), p.name).toBe(false);
      picks.add(p.pick);
      expect(NBA_GM_TEAM_CODES).toContain(p.draftingTeam);
      expect(p.sourceUrl).toBe("https://www.nba.com/draft/2026");
      expect(p.verificationStatus).toBe("DRAFT_IDENTITY_AND_ORIGINAL_PICK_ONLY_NOT_CURRENT_ROSTER");
    }
    expect(review.official2026DraftIdentity.find(p => p.name === "Nate Ament")?.draftingTeam).toBe("MIA");
    expect(players.get("Nate Ament")?.teamCode).toBe("MIL");
  });
  it("enforces targeted evidence and guards that source context is not all-six certification", () => {
    expect(draft.players).toHaveLength(330);
    expect(draft.published).toBe(false);
    expect(review.productionPublished).toBe(false);
    expect(draft.certifiedCount).toBe(0);
    expect(review.completeSixSkillCertified).toBe(0);
    expect(draft.players.every(p => p.reviewStatus === "PROVISIONAL_NOT_CERTIFIED")).toBe(true);
    const corrections = review.individualResearch.filter(p => p.after !== null);
    expect(corrections.map(p => p.name).sort()).toEqual(["Bub Carrington", "Jaden McDaniels"]);
    for (const c of corrections) {
      expect(c.season).toBe("2025-26");
      expect(c.skillsReviewed).toEqual(["shooting"]);
      expect(Number.isInteger(c.before)).toBe(true);
      expect(Number.isInteger(c.after)).toBe(true);
      expect(players.get(c.name)?.skills.shooting).toBe(c.after);
      expect(players.get(c.name)?.gradeReviewStatus).toBe("partially-evidence-reviewed-not-certified");
      expect(c.status).toBe("EVIDENCE_BACKED_PROVISIONAL_REGRADE_NOT_FULL_CERTIFICATION");
      expect(c.sourceUrl).toMatch(/^https:\/\//);
    }
    for (const e of review.individualResearch) {
      expect(players.has(e.name), e.name).toBe(true);
      expect(e.sourceUrl).toMatch(/^https:\/\//);
      expect(e.skillsReviewed.every(x => NBA_GM_SKILL_KEYS.includes(x as typeof NBA_GM_SKILL_KEYS[number]))).toBe(true);
    }
    expect(review.individualResearch.some(e => e.name === "Tyrese Haliburton" && e.status.startsWith("NO_2025_26"))).toBe(true);
    for (const flag of review.roleFlags) expect(players.has(flag.name), flag.name).toBe(true);
  });
});