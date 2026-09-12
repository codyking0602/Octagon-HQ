import { describe, it } from "vitest";
import { queryFootballSubjects } from "./footballSubjectRegistry";

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
});
