import { describe, expect, it } from "vitest";
import { resolveRankingDestination } from "./rankingDestination";

describe("resolveRankingDestination", () => {
  it("resolves a canonical fighter ranking target", () => {
    const destination = resolveRankingDestination(new URLSearchParams("fighter=jon-jones"));

    expect(destination.kind).toBe("fighter");
    if (destination.kind === "fighter") expect(destination.fighter.slug).toBe("jon-jones");
  });

  it("hands canonical comparisons to the existing Intelligence owner", () => {
    expect(
      resolveRankingDestination(
        new URLSearchParams("compareLeft=georges-st-pierre&compareRight=anderson-silva"),
      ),
    ).toEqual({
      kind: "comparison",
      path: "/intelligence?mode=compare&fighter=georges-st-pierre&opponent=anderson-silva",
    });
  });

  it("preserves comparison orientation", () => {
    expect(
      resolveRankingDestination(
        new URLSearchParams("compareLeft=anderson-silva&compareRight=georges-st-pierre"),
      ),
    ).toEqual({
      kind: "comparison",
      path: "/intelligence?mode=compare&fighter=anderson-silva&opponent=georges-st-pierre",
    });
  });

  it("ignores incomplete, unknown, or duplicate comparison targets", () => {
    expect(resolveRankingDestination(new URLSearchParams("compareLeft=jon-jones"))).toEqual({ kind: "none" });
    expect(
      resolveRankingDestination(new URLSearchParams("compareLeft=unknown&compareRight=jon-jones")),
    ).toEqual({ kind: "none" });
    expect(
      resolveRankingDestination(new URLSearchParams("compareLeft=jon-jones&compareRight=jon-jones")),
    ).toEqual({ kind: "none" });
  });

  it("ignores unknown fighter ranking targets", () => {
    expect(resolveRankingDestination(new URLSearchParams("fighter=unknown"))).toEqual({ kind: "none" });
  });
});
