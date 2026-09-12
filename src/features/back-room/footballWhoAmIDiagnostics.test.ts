import { describe, it } from "vitest";
import { queryFootballSubjects } from "./footballSubjectRegistry";
import { buildFootballComparisonCandidatePool } from "./footballComparisonAuthority";
import { getFootballRankFivePack as getReviewedRankFivePack } from "./footballRankFiveModel";
import { footballGreatnessTierForItem } from "./footballGreatnessTier";
import { footballPersonIdentityCfbBResearch } from "./footballPersonIdentityCfbBResearch";
import { getFootballWhoAmILaunchPool, getFootballWhoAmIUniverse } from "../games/footballWhoAmIAuthority";

describe("temporary Who Am I registry diagnostics", () => {
  it("prints CFB A/B wide receiver candidates", () => {
    const rows = queryFootballSubjects({
      league: "CFB",
      recognizabilityTiers: ["A", "B"],
      includeProjectedSourceSubjects: true,
      includeProjectedCanonicalRecognition: true,
    }).filter((subject) => subject.kind === "player-career" && subject.position === "WR");

    const byName = new Map<string, typeof rows>();
    for (const row of rows) {
      const key = row.name.toLowerCase();
      const group = byName.get(key) ?? [];
      group.push(row);
      byName.set(key, group);
    }

    console.log("WHO_AM_I_DIAG_CFB_WR", JSON.stringify(rows.map((row) => ({
      id: row.id,
      name: row.name,
      tier: row.recognizabilityTier,
      sourceIdentityKeys: row.sourceIdentityKeys,
    }))));
    console.log("WHO_AM_I_DIAG_CFB_WR_DUPES", JSON.stringify(
      [...byName.entries()]
        .filter(([, group]) => group.length > 1)
        .map(([name, group]) => ({ name, ids: group.map((row) => row.id) })),
    ));
  });

  it("prints remaining Who Am I identity and clue gaps", () => {
    const cfbLaunch = getFootballWhoAmILaunchPool("CFB");
    const launchB = cfbLaunch.subjects.filter((subject) => subject.recognizabilityTier === "B");
    const researchedB = new Set(footballPersonIdentityCfbBResearch.map(([subjectId]) => subjectId));
    console.log("WHO_AM_I_DIAG_CFB_B_GAP", JSON.stringify({
      launchBCount: launchB.length,
      researchBCount: researchedB.size,
      missingResearch: launchB.filter((subject) => !researchedB.has(subject.id)).map(({ id, name, position, school, startSeason, endSeason }) => ({ id, name, position, school, startSeason, endSeason })),
      extraResearch: [...researchedB].filter((id) => !launchB.some((subject) => subject.id === id)),
    }));
    const universe = getFootballWhoAmIUniverse("CFB");
    console.log("WHO_AM_I_DIAG_THIN_CFB", JSON.stringify(
      ["cfb-jj-watt", "cfb-nakobe-dean"].map((id) => {
        const candidate = universe.candidates.find((row) => row.id === id);
        const subject = cfbLaunch.subjects.find((row) => row.id === id);
        return {
          id,
          subject,
          clueCount: candidate?.clues.length,
          clues: candidate?.clues.map(({ id: clueId, text, band, facet, sourceFactId }) => ({ id: clueId, text, band, facet, sourceFactId })),
        };
      }),
    ));
  });

  it("prints NFL secondary calibration diagnostics", () => {
    const reviewed = getReviewedRankFivePack("nfl-secondary").items;
    const rows = buildFootballComparisonCandidatePool("nfl-secondary", reviewed);
    const byFactCount = new Map<number, number>();
    const bySource = new Map<string, number>();
    const byTier = new Map<string, number>();
    for (const row of rows) {
      byFactCount.set(row.factMetricIds.length, (byFactCount.get(row.factMetricIds.length) ?? 0) + 1);
      bySource.set(row.evaluationSource, (bySource.get(row.evaluationSource) ?? 0) + 1);
      const tier = footballGreatnessTierForItem(row);
      byTier.set(tier, (byTier.get(tier) ?? 0) + 1);
    }
    console.log("WHO_AM_I_DIAG_SECONDARY", JSON.stringify({
      total: rows.length,
      byFactCount: Object.fromEntries([...byFactCount].sort((a,b) => a[0]-b[0])),
      bySource: Object.fromEntries(bySource),
      byTier: Object.fromEntries(byTier),
      oneFact: rows.filter((row) => row.factMetricIds.length === 1).slice(0, 40).map((row) => ({ id: row.id, name: row.name, rating: row.rating, metrics: row.factMetricIds })),
      twoFact: rows.filter((row) => row.factMetricIds.length === 2).slice(0, 40).map((row) => ({ id: row.id, name: row.name, rating: row.rating, metrics: row.factMetricIds })),
    }));
  });
});
