import { describe, expect, it } from "vitest";
import { allTime } from "../rankingModel";

const wordCount = (copy: string) => copy.trim().split(/\s+/u).length;

const bandsForRank = (rank: number) => {
  if (rank <= 5)
    return {
      oneLiner: [34, 40],
      whyRankedHere: [50, 60],
      whyNotHigher: [45, 60],
    } as const;
  if (rank <= 15)
    return {
      oneLiner: [30, 38],
      whyRankedHere: [45, 55],
      whyNotHigher: [40, 55],
    } as const;
  if (rank <= 30)
    return {
      oneLiner: [27, 35],
      whyRankedHere: [40, 50],
      whyNotHigher: [35, 50],
    } as const;
  if (rank <= 50)
    return {
      oneLiner: [24, 32],
      whyRankedHere: [35, 45],
      whyNotHigher: [32, 45],
    } as const;
  return {
    oneLiner: [20, 28],
    whyRankedHere: [30, 40],
    whyNotHigher: [30, 40],
  } as const;
};

const copyFields = ["oneLiner", "whyRankedHere", "whyNotHigher"] as const;

describe("intentional fighter profile-copy review", () => {
  it("covers the complete canonical roster without a fixed fighter count", () => {
    expect(allTime.length).toBeGreaterThan(0);
    for (const fighter of allTime) {
      for (const field of copyFields)
        expect(fighter[field].trim()).not.toBe("");
    }
  });

  it("uses the writing band selected by each fighter's current board rank", () => {
    for (const fighter of allTime) {
      const bands = bandsForRank(fighter.rank);
      for (const field of copyFields) {
        expect(
          wordCount(fighter[field]),
          `${fighter.fighter} ${field}`,
        ).toBeGreaterThanOrEqual(bands[field][0]);
        expect(
          wordCount(fighter[field]),
          `${fighter.fighter} ${field}`,
        ).toBeLessThanOrEqual(bands[field][1]);
      }
    }
  });

  it("keeps consumer copy ASCII-safe and free of obvious internal phrases", () => {
    const forbidden =
      /\b(?:UFC-only|scored era|prime ledger|quality tier|ranking score|model score|scoring model|score|scored|scoring|model|calculation|inputs|ledger|penalty|weighting|adjustment)\b/iu;
    for (const fighter of allTime) {
      for (const field of copyFields) {
        expect(fighter[field], `${fighter.fighter} ${field}`).toMatch(
          /^[\x00-\x7F]+$/u,
        );
        expect(fighter[field], `${fighter.fighter} ${field}`).not.toMatch(
          forbidden,
        );
      }
    }
  });
});
