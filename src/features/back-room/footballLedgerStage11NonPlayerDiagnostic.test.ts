import { describe, it } from "vitest";
import { getFootballFactualRecord } from "./footballFactualStatsCore";
import { queryFootballSubjects } from "./footballSubjectRegistry";

const ABC = ["A", "B", "C"] as const;
type League = "NFL" | "CFB";
type Kind = "team-season" | "program" | "program-era" | "coach";

function audit(league: League, kind: Kind) {
  const subjects = queryFootballSubjects({
    league,
    kind,
    recognizabilityTiers: ABC,
    casualEligible: true,
    includeProjectedSourceSubjects: true,
    includeProjectedCanonicalRecognition: true,
  });
  const factCounts = subjects.map((subject) => getFootballFactualRecord(subject.id)?.facts.length ?? 0);
  const withFacts = factCounts.filter((count) => count > 0).length;
  return {
    productABC: subjects.length,
    byTier: Object.fromEntries(ABC.map((tier) => [tier, subjects.filter((subject) => subject.recognizabilityTier === tier).length])),
    withAnyFacts: withFacts,
    averageFactCount: Number((subjects.length ? factCounts.reduce((sum, count) => sum + count, 0) / subjects.length : 0).toFixed(2)),
  };
}

describe("Football Stage 11 non-player diagnostic", () => {
  it("reports non-player factual completeness from the clean canonical owners", () => {
    throw new Error(`FOOTBALL_STAGE11_NON_PLAYER ${JSON.stringify({
      NFL: {
        teamSeasons: audit("NFL", "team-season"),
        headCoaches: audit("NFL", "coach"),
        eras: audit("NFL", "program-era"),
      },
      CFB: {
        teamSeasons: audit("CFB", "team-season"),
        programs: audit("CFB", "program"),
        headCoaches: audit("CFB", "coach"),
        eras: audit("CFB", "program-era"),
      },
    })}`);
  });
});
