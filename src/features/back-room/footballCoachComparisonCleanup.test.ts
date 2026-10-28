import { describe, expect, it } from "vitest";
import { buildFootballComparisonCandidatePool } from "./footballComparisonAuthority";
import { getFootballRankFivePack } from "./footballRankFiveModel";

function normalizedName(name: string) {
  return name.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]/g, "");
}

function coachCandidates(packId: "college-head-coaches" | "nfl-head-coaches") {
  const pack = getFootballRankFivePack(packId);
  return buildFootballComparisonCandidatePool(packId, pack.items);
}

function candidateById(packId: "college-head-coaches" | "nfl-head-coaches", id: string) {
  const candidate = coachCandidates(packId)
    .find((row) => row.id === id || row.canonicalSubjectId === id);
  expect(candidate, `${packId} should contain ${id}`).toBeDefined();
  return candidate!;
}

describe("Football coach comparison cleanup", () => {
  it("keeps one comparison candidate per coach name and the reviewed Bob Stoops identity", () => {
    for (const packId of ["college-head-coaches", "nfl-head-coaches"] as const) {
      const coaches = coachCandidates(packId);
      const names = coaches.map((coach) => normalizedName(coach.name));
      expect(new Set(names).size, `${packId} coach candidate names should be unique`).toBe(names.length);
    }

    const bobStoops = coachCandidates("college-head-coaches")
      .filter((coach) => normalizedName(coach.name) === "bobstoops");
    expect(bobStoops).toHaveLength(1);
    expect(bobStoops[0]?.canonicalSubjectId).toBe("bob-stoops-cfb");
    expect(bobStoops[0]?.evaluationSource).toBe("reviewed");
  });

  it("keeps the championship-era CFB anchors above lower-resume modern coaches", () => {
    const bearBryant = candidateById("college-head-coaches", "bear-bryant");
    const woodyHayes = candidateById("college-head-coaches", "woody-hayes");
    const tomOsborne = candidateById("college-head-coaches", "tom-osborne");
    const daboSwinney = candidateById("college-head-coaches", "dabo-swinney-cfb");
    const curtCignetti = candidateById("college-head-coaches", "curt-cignetti-cfb");

    expect([bearBryant, woodyHayes, tomOsborne].map((coach) => coach.evaluationSource))
      .toEqual(["reviewed", "reviewed", "reviewed"]);
    expect([bearBryant.rating, woodyHayes.rating, tomOsborne.rating]).toEqual([99, 98, 97]);
    expect(tomOsborne.rating).toBeGreaterThan(daboSwinney.rating);
    expect(daboSwinney.rating).toBeGreaterThan(curtCignetti.rating);
  });

  it("keeps Joe Gibbs in the same near-elite neighborhood as Andy Reid", () => {
    const joeGibbs = candidateById("nfl-head-coaches", "joe-gibbs");
    const andyReid = candidateById("nfl-head-coaches", "andy-reid");

    expect(joeGibbs.evaluationSource).toBe("reviewed");
    expect(andyReid.evaluationSource).toBe("reviewed");
    expect(joeGibbs.rating).toBe(93);
    expect(andyReid.rating).toBe(96);
    expect(andyReid.rating - joeGibbs.rating).toBeLessThanOrEqual(3);
  });
});
