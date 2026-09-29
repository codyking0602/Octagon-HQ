import { describe, expect, it } from "vitest";
import { divisionRankingReport } from "../rankingControls";
import { getFighter } from "../rankingModel";
import { canonicalRankingInputs } from "./rankingInputs";

const input = (name: string) => {
  const fighter = canonicalRankingInputs.fighters.find(
    (candidate) => candidate.fighter === name,
  );
  if (!fighter) throw new Error(`Missing ${name}`);
  return fighter;
};

const fight = (fighter: string, opponent: string, date: string) =>
  input(fighter).facts.fights.filter(
    (candidate) => candidate.opponent === opponent && candidate.date === date,
  );

describe("September 19, 2026 Van and Pantoja ranking refresh", () => {
  it("owns Joshua Van exactly once with a complete UFC ledger and era membership", () => {
    expect(
      canonicalRankingInputs.fighters.filter(({ fighter }) => fighter === "Joshua Van"),
    ).toHaveLength(1);
    expect(input("Joshua Van").facts.fights).toHaveLength(12);
    expect(getFighter("joshua-van")?.visibleStats).toMatchObject({
      ufcRecord: "11-1",
      titleFightWins: 3,
    });
    expect(canonicalRankingInputs.filters.eraMembership["Joshua Van"]).toEqual({
      primary: "new-blood",
      secondary: null,
    });
  });

  it("represents all three Van title results and the latest rematch once", () => {
    expect(fight("Joshua Van", "Alexandre Pantoja", "2025-12-06")).toEqual([
      expect.objectContaining({
        officialResult: "win",
        methodCategory: "other",
        championshipType: "normal",
      }),
    ]);
    expect(fight("Joshua Van", "Tatsuro Taira", "2026-05-09")).toEqual([
      expect.objectContaining({
        officialResult: "win",
        methodCategory: "ko-tko",
        championshipType: "normal",
      }),
    ]);
    expect(fight("Joshua Van", "Alexandre Pantoja", "2026-09-19")).toEqual([
      expect.objectContaining({
        officialResult: "win",
        methodCategory: "decision",
        championshipType: "normal",
        rounds: { status: "audited", won: 4, lost: 1, drawn: 0 },
      }),
    ]);
    expect(input("Joshua Van").judgments.championship.inputs).toHaveLength(3);
  });

  it("uses the exact supplied Van profile media and safe image fallback", () => {
    expect(input("Joshua Van").presentation).toMatchObject({
      photoUrl: null,
      thumbUrl: "assets/fighters/joshua-van-thumb.webp",
      watchUrl: "https://youtube.com/shorts/owyAiZa33XY?is=vNNc2me-zGbAnNZ3",
      signatureFightUrl: "https://youtu.be/nwO2UPz7p28?is=YgmgRj5wjPQQuw8i",
    });
  });

  it("adds Pantoja's rematch loss once without reopening his prime", () => {
    expect(fight("Alexandre Pantoja", "Joshua Van", "2026-09-19")).toEqual([
      expect.objectContaining({
        officialResult: "loss",
        methodCategory: "decision",
        championshipType: "normal",
        rounds: { status: "audited", won: 1, lost: 4, drawn: 0 },
      }),
    ]);
    expect(fight("Alexandre Pantoja", "Joshua Van", "2025-12-06")).toEqual([
      expect.objectContaining({
        officialResult: "loss",
        methodCategory: "other",
        championshipType: "normal",
      }),
    ]);
    expect(input("Alexandre Pantoja").facts.primeWindow).toEqual({
      startFightId: "2021-02-06-manel-kape",
      endFightId: "2025-12-06-joshua-van",
      open: false,
    });
    expect(getFighter("alex-pantoja")?.visibleStats).toMatchObject({
      ufcRecord: "14-5",
      titleFightWins: 5,
    });
  });

  it("uses reviewed whole-round audits for Van's earlier decisions", () => {
    expect(fight("Joshua Van", "Kevin Borjas", "2023-11-11")[0]?.rounds).toEqual({
      status: "audited",
      won: 2,
      lost: 1,
      drawn: 0,
    });
    expect(fight("Joshua Van", "Edgar Chairez", "2024-09-14")[0]?.rounds).toEqual({
      status: "audited",
      won: 2,
      lost: 1,
      drawn: 0,
    });
  });

  it("uses reviewed whole-round audits for Van's elite run", () => {
    expect(fight("Joshua Van", "Brandon Royval", "2025-06-28")[0]?.rounds).toEqual({
      status: "audited",
      won: 2,
      lost: 1,
      drawn: 0,
    });
    expect(fight("Joshua Van", "Tatsuro Taira", "2026-05-09")[0]?.rounds).toEqual({
      status: "audited",
      won: 3,
      lost: 2,
      drawn: 0,
    });
  });

  it("produces valid calculated all-time and flyweight placements", () => {
    const van = getFighter("joshua-van");
    const pantoja = getFighter("alex-pantoja");
    expect(van?.fighter).toBe("Joshua Van");
    expect(pantoja?.fighter).toBe("Alexandre Pantoja");
    expect(van?.rank).toBeGreaterThan(0);
    expect(pantoja?.rank).toBeGreaterThan(0);
    expect(Number.isFinite(van?.rawScore)).toBe(true);
    expect(Number.isFinite(pantoja?.rawScore)).toBe(true);
    expect(
      divisionRankingReport.boards.Flyweight?.some(
        (row) => row.fighter.fighter === "Joshua Van",
      ),
    ).toBe(true);
    expect(
      divisionRankingReport.boards.Flyweight?.find(
        (row) => row.fighter.fighter === "Alexandre Pantoja",
      )?.rank,
    ).toBe(2);
    expect(divisionRankingReport.passed).toBe(true);
  });
});
