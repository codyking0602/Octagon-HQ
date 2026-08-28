import { describe, it } from "vitest";
import { FOOTBALL_LEDGER_PLAYER_POOL_CONTRACTS } from "./footballLedgerAuditContract";
import { queryFootballSubjects, type FootballSubjectKind } from "./footballSubjectRegistry";

const ABC = ["A", "B", "C"] as const;
const projected = {
  recognizabilityTiers: ABC,
  casualEligible: true,
  includeProjectedSourceSubjects: true,
  includeProjectedCanonicalRecognition: true,
} as const;

function tierCounts(subjects: readonly { recognizabilityTier: "A" | "B" | "C" | "D" }[]) {
  return Object.fromEntries(ABC.map((tier) => [tier, subjects.filter((subject) => subject.recognizabilityTier === tier).length]));
}

describe("temporary Stage 12 recognition census", () => {
  it("prints the exact post-recognition product universe", () => {
    const players = Object.fromEntries((["NFL", "CFB"] as const).map((league) => [league, Object.fromEntries(
      FOOTBALL_LEDGER_PLAYER_POOL_CONTRACTS.map((pool) => {
        const subjects = queryFootballSubjects({
          kind: "player-career",
          league,
          positions: pool.positions,
          ...projected,
        });
        return [pool.id, { total: subjects.length, tiers: tierCounts(subjects) }];
      }),
    )]));

    const nonPlayerKinds: readonly FootballSubjectKind[] = ["team-season", "program", "coach", "program-era", "franchise", "game"];
    const nonPlayers = Object.fromEntries((["NFL", "CFB"] as const).map((league) => [league, Object.fromEntries(
      nonPlayerKinds.map((kind) => {
        const subjects = queryFootballSubjects({ kind, league, ...projected });
        return [kind, { total: subjects.length, tiers: tierCounts(subjects) }];
      }),
    )]));

    throw new Error(`STAGE12_RECOGNITION_CENSUS ${JSON.stringify({ players, nonPlayers })}`);
  });
});
