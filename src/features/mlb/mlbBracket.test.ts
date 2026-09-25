import { describe, expect, it } from "vitest";
import { bracketComplete, bracketGuideNodes, firstBracketGuideNode, nextBracketGuideNode, previousBracketGuideNode, sanitizeBracketPicks } from "./mlbBracket";
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
  it("walks a guided bracket in league-path order", () => {
    expect(bracketGuideNodes(template).map((node) => node.id)).toEqual(["wc", "ds"]);
    expect(firstBracketGuideNode(template, {} )?.id).toBe("wc");
    expect(nextBracketGuideNode(template, { wc: "b" }, "wc")?.id).toBe("ds");
    expect(previousBracketGuideNode(template, { wc: "b" }, "ds")?.id).toBe("wc");
  });

  it("can review an already-complete bracket one matchup at a time", () => {
    const picks = { wc: "b", ds: "a" };
    expect(firstBracketGuideNode(template, picks, true)?.id).toBe("wc");
    expect(nextBracketGuideNode(template, picks, "wc", true)?.id).toBe("ds");
    expect(nextBracketGuideNode(template, picks, "ds", true)).toBeNull();
  });
});
