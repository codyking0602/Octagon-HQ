import { describe, expect, it } from "vitest";
import profiles from "../../../data/curated/football/gm-nfl-development-profiles-2026-10-07.json";
import audit from "../../../data/curated/football/gm-nfl-development-review-audit-2026-10-08.json";
import qb from "../../../data/curated/football/gm-nfl-deep-research-qb-2026-10-08.json";
import rb from "../../../data/curated/football/gm-nfl-deep-research-rb-2026-10-08.json";
import wr from "../../../data/curated/football/gm-nfl-deep-research-wr-2026-10-08.json";
import te from "../../../data/curated/football/gm-nfl-deep-research-te-2026-10-08.json";
import frontSeven from "../../../data/curated/football/gm-nfl-deep-research-front-seven-2026-10-08.json";
import secondary from "../../../data/curated/football/gm-nfl-deep-research-secondary-2026-10-08.json";

type Development = { breakoutPct: number; improvePct: number; steadyPct: number; declinePct: number;
  maxAnnualGain: number; maxAnnualLoss: number; marketVariancePct: number };
type SourceEntry = { id: string; team: string; name: string; [key: string]: unknown };
const studies: { family: string; records: SourceEntry[]; proposal: (entry: any) => Development;
  sources: (entry: any) => { url?: string }[] }[] = [
  { family: "QB", records: qb.players, proposal: e => e.recommendedDevelopment, sources: e => e.sourceReferences },
  { family: "RB", records: rb.players, proposal: e => e.proposedResearchProfile, sources: e => e.evidence },
  { family: "WR", records: wr.research, proposal: e => e.recommendedDevelopment, sources: e => e.sources },
  { family: "TE", records: te.assessments, proposal: e => e.recommendedDevelopment, sources: e => e.sources },
  { family: "Front Seven", records: frontSeven.players, proposal: e => e.calibratedDevelopment, sources: e => e.sources },
  { family: "Secondary", records: secondary.assessments, proposal: e => e.proposed, sources: e => e.sources },
];
const expected = { QB: 34, RB: 65, WR: 103, TE: 33, "Front Seven": 191, Secondary: 168 };
const keys = ["breakoutPct", "improvePct", "declinePct", "maxAnnualGain", "maxAnnualLoss", "marketVariancePct"] as const;

describe("2026 NFL GM six-position independent research integration", () => {
  it("covers all 594 canonical identities without cross-position, duplicate or orphan proposals", () => {
    const byId = new Map(profiles.profiles.map(p => [p.id, p]));
    const reviewById = new Map(audit.reviews.map(p => [p.id, p]));
    const seen = new Set<string>();
    for (const study of studies) {
      expect(study.records).toHaveLength(expected[study.family as keyof typeof expected]);
      for (const item of study.records) {
        const record = byId.get(item.id);
        const review = reviewById.get(item.id);
        expect(record, item.id).toBeDefined();
        expect(review, item.id).toBeDefined();
        expect(seen.has(item.id), item.id).toBe(false);
        seen.add(item.id);
        expect(record!.family).toBe(study.family);
        expect(record!.team).toBe(item.team);
        expect(record!.name).toBe(item.name);
        const recommended = study.proposal(item);
        expect(recommended.breakoutPct + recommended.improvePct + recommended.steadyPct +
          recommended.declinePct, item.id).toBe(100);
        for (const key of keys) expect(record![key], `${item.id} ${key}`).toBe(recommended[key]);
        expect((review as any).researchFile, item.id).toContain("gm-nfl-deep-research-");
        expect((review as any).developmentEvidenceSourceCount, item.id).toBeGreaterThan(0);
        expect((review as any).developmentResearchRationale.length, item.id).toBeGreaterThan(20);
        expect(study.sources(item).some(x => /^https:\/\//.test(x.url ?? "")), item.id).toBe(true);
      }
    }
    expect(seen.size).toBe(594);
    expect(byId.size).toBe(594);
    expect(reviewById.size).toBe(594);
    expect(audit.positionResearchCount).toBe(594);
  });
});
