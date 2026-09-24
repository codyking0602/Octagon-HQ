import { describe, expect, it } from "vitest";
import { bracketComplete, sanitizeBracketPicks } from "./mlbBracket";
import type { MlbBracketTemplate } from "./mlbPlayoffsRepository";

const template: MlbBracketTemplate = {
  teams: [
    { id: "a", name: "A", abbreviation: "A", seed: 1, league: "AL", logo_url: null },
    { id: "b", name: "B", abbreviation: "B", seed: 2, league: "AL", logo_url: null },
    { id: "c", name: "C", abbreviation: "C", seed: 3, league: "AL", logo_url: null },
  ],
  nodes: [
    {
      id: "wc",
      round: "wild_card",
      league: "AL",
      label: "AL Wild Card",
      points: 1,
      left: { teamId: "b", sourceNodeId: null },
      right: { teamId: "c", sourceNodeId: null },
    },
    {
      id: "ds",
      round: "division_series",
      league: "AL",
      label: "ALDS",
      points: 2,
      left: { teamId: "a", sourceNodeId: null },
      right: { teamId: null, sourceNodeId: "wc" },
    },
  ],
};

describe("MLB bracket path", () => {
  it("keeps only picks that are valid for the path selected so far", () => {
    expect(sanitizeBracketPicks(template, { wc: "b", ds: "b" })).toEqual({ wc: "b", ds: "b" });
    expect(sanitizeBracketPicks(template, { wc: "c", ds: "b" })).toEqual({ wc: "c" });
  });

  it("requires every matchup to have a valid winner", () => {
    expect(bracketComplete(template, { wc: "b" })).toBe(false);
    expect(bracketComplete(template, { wc: "b", ds: "a" })).toBe(true);
  });
});
