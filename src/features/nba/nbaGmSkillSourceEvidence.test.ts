import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { NBA_GM_SKILL_KEYS, NBA_GM_TEAM_CODES } from "./nbaGmFoundation";

/** Evidence inventory and source-to-proposal integrity ONLY. Not a certification of basketball judgments. */
type Observation = { season: string; metric: string; value: number; sourceUrl: string; sourceKind: string; gradeInterpretation: string };
type Award = { season: string; honor: string; sourceUrl: string };
type SourceRow = { name: string; observations: Observation[]; awards: Award[] };
type Player = {
  editorialId: string;
  name: string;
  teamCode: string;
  overall: number;
  skills: Record<string, number>;
  reviewStatus: string;
  confidence: string;
  candidatePositions: string[];
  positionReview: string;
  independentSkillValidation: string;
  gradeReviewStatus: string;
  sourcedSeasonFacts: { sourceDocument: string; observations: Observation[]; awards: Award[] } | null;
  reviewFlags: string[];
};
const docPath = "docs/nba-gm-sourced-2025-26-facts-2026-10-29.json";
const proposalPath = "docs/nba-gm-330-six-skills-PROVISIONAL-2026-10-29.json";
const source = JSON.parse(readFileSync(docPath, "utf8")) as { players: SourceRow[]; sources: Record<string, string> };
const draft = JSON.parse(readFileSync(proposalPath, "utf8")) as {
  players: Player[];
  certifiedCount: number;
  published: boolean;
  lockedSkillKeys: string[];
  reviewProvenance: { sourceContextPlayers: number; fullSixSkillCertifications: number };
};
const normalize = (s: string) => s.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "").replace(/(?:iii|ii|jr|sr)$/, "");
const actualMetrics = new Set(["pointsPerGame", "assistsPerGame", "reboundsPerGame", "threePointPercentage", "threePointAttempts", "blocksPerGame", "stealsPerGame"]);
const validUrl = (s: string) => /^https:\/\/[^\s/]+\/\S+/.test(s);

describe("NBA GM draft ratings evidence, confidence, and source integrity", () => {
  it("has exactly 330 distinct provisional profiles with no skill deficits or runtime publication", () => {
    expect(draft.players.length).toBe(330);
    expect(draft.certifiedCount).toBe(0);
    expect(draft.published).toBe(false);
    expect(draft.reviewProvenance.fullSixSkillCertifications).toBe(0);
    expect(new Set(draft.players.map(p => normalize(p.name))).size).toBe(330);
    expect(new Set(draft.players.map(p => p.editorialId)).size).toBe(330);
    expect(new Set(draft.players.map(p => p.teamCode))).toEqual(new Set(NBA_GM_TEAM_CODES));
    expect(new Set(draft.lockedSkillKeys)).toEqual(new Set(NBA_GM_SKILL_KEYS));
    for (const p of draft.players) {
      expect(p.reviewStatus, p.name).toBe("PROVISIONAL_NOT_CERTIFIED");
      expect(["manually-proposed-not-certified", "partially-evidence-reviewed-not-certified"], p.name).toContain(p.gradeReviewStatus);
      if (p.gradeReviewStatus === "partially-evidence-reviewed-not-certified") {
        expect(p.reviewFlags.some(flag => /^evidence-led-(shooting|playmaking|interior-defense)-regrade-not-certified$/.test(flag)),p.name).toBe(true);
        expect(p.independentSkillValidation, p.name).toMatch(/^incomplete; (shooting|playmaking|interior defense) grade reviewed separately/);
      } else {
        expect(p.independentSkillValidation, p.name).toBe("incomplete");
      }
      expect(p.confidence, p.name).toBe("medium-editorial");
      expect(p.positionReview, p.name).toBe("unverified");
      expect(p.candidatePositions.length, p.name).toBeGreaterThan(0);
      expect(Object.keys(p.skills).sort(), p.name).toEqual([...draft.lockedSkillKeys].sort());
      for (const skill of draft.lockedSkillKeys) {
        expect(Number.isInteger(p.skills[skill]), p.name + ":" + skill).toBe(true);
        expect(p.skills[skill], p.name + ":" + skill).toBeGreaterThanOrEqual(0);
        expect(p.skills[skill], p.name + ":" + skill).toBeLessThanOrEqual(99);
      }
    }
  });

  it("retains individually traceable source contexts and exactly preserves 2025-26 facts", () => {
    const sourceByName = new Map(source.players.map(row => [normalize(row.name), row]));
    expect(sourceByName.size).toBe(source.players.length);
    expect(source.players.length).toBeGreaterThanOrEqual(207);
    expect(draft.reviewProvenance.sourceContextPlayers).toBe(source.players.length);
    const actual = draft.players.filter(p => p.sourcedSeasonFacts !== null);
    expect(actual.length).toBe(source.players.length);
    for (const p of actual) {
      const row = sourceByName.get(normalize(p.name));
      expect(row, p.name).toBeDefined();
      expect(p.sourcedSeasonFacts?.sourceDocument, p.name).toBe(docPath);
      expect(p.sourcedSeasonFacts?.observations, p.name).toEqual(row?.observations);
      expect(p.sourcedSeasonFacts?.awards, p.name).toEqual(row?.awards);
    }
    for (const row of source.players) {
      expect(row.observations.length + row.awards.length, row.name).toBeGreaterThan(0);
      for (const o of row.observations) {
        expect(o.season, row.name).toBe("2025-26");
        expect(actualMetrics.has(o.metric), row.name + ":" + o.metric).toBe(true);
        expect(Number.isFinite(o.value), row.name).toBe(true);
        expect(o.value).toBeGreaterThanOrEqual(0);
        expect(validUrl(o.sourceUrl), row.name).toBe(true);
        expect(Object.values(source.sources)).toContain(o.sourceUrl);
        expect(o.gradeInterpretation).toContain("not-algorithm");
      }
      for (const award of row.awards) {
        expect(award.season).toBe("2025-26");
        expect(validUrl(award.sourceUrl)).toBe(true);
        expect(award.honor.trim().length).toBeGreaterThan(2);
      }
    }
    expect(source.players.reduce((s, p) => s + p.observations.length, 0)).toBeGreaterThanOrEqual(429);
    expect(source.players.reduce((s, p) => s + p.awards.length, 0)).toBeGreaterThanOrEqual(37);
  });

  it("keeps anchor experts and role specialists distinct without making overall a skill average", () => {
    const byName = (name: string) => draft.players.find(p => p.name === name)!;
    expect(byName("Victor Wembanyama").skills.interiorDefense).toBe(99);
    expect(byName("Nikola Jokić").skills.playmaking).toBe(99);
    expect(byName("Stephen Curry").skills.shooting).toBe(99);
    expect(byName("Luke Kennard").skills.shooting).toBe(95);
    expect(byName("Luke Kennard").overall).toBe(78);
    expect(byName("Shai Gilgeous-Alexander").skills.scoring).toBe(99);
    expect(byName("Oscar Tshiebwe").skills.rebounding).toBeGreaterThanOrEqual(90);
    expect(draft.players.filter(p => p.overall >= 75 && p.overall <= 79)).toHaveLength(149);
    expect(draft.players.filter(p => p.overall >= 75 && p.overall <= 79)
      .every(p => p.reviewFlags.includes("75-79-compression-review"))).toBe(true);
    const repeated = new Map<string, number>();
    for (const p of draft.players) {
      const profile = draft.lockedSkillKeys.map(k => p.skills[k]).join("/");
      repeated.set(profile, (repeated.get(profile) ?? 0) + 1);
    }
    // Repeated complete profiles are allowed, but four identical six-trait profiles require human peer review.
    expect(Math.max(...repeated.values())).toBeLessThan(4);
  });
});
