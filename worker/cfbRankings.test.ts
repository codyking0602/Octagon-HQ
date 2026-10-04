import { describe, expect, it } from "vitest";
import { normalizeCfbApTop25 } from "./cfbRankings";

function ranking(rank: number) {
  return {
    current: rank,
    team: {
      id: String(rank),
      displayName: `Team ${rank}`,
      abbreviation: `T${rank}`,
    },
  };
}

describe("CFB AP Top 25 normalization", () => {
  it("extracts one ordered 25-team AP poll", () => {
    const snapshot = normalizeCfbApTop25({
      timestamp: "2026-09-27T18:00:00Z",
      rankings: [
        { name: "Coaches Poll", ranks: Array.from({ length: 25 }, (_, index) => ranking(index + 1)) },
        { name: "AP Top 25", date: "2026-09-27T16:00:00Z", ranks: Array.from({ length: 25 }, (_, index) => ranking(index + 1)) },
      ],
    });

    expect(snapshot?.poll).toBe("AP Top 25");
    expect(snapshot?.pollDate).toBe("2026-09-27");
    expect(snapshot?.teams).toHaveLength(25);
    expect(snapshot?.teams[0]).toMatchObject({ rank: 1, espnId: "1", name: "Team 1" });
    expect(snapshot?.teams[24]).toMatchObject({ rank: 25, espnId: "25" });
  });

  it("fails closed instead of publishing an incomplete poll", () => {
    expect(normalizeCfbApTop25({
      rankings: [{ shortName: "AP Top 25", ranks: Array.from({ length: 24 }, (_, index) => ranking(index + 1)) }],
    })).toBeNull();
  });
});
