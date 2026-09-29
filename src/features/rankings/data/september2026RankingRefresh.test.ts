import { describe, expect, it } from "vitest";
import { canonicalRankingInputs } from "./rankingInputs";
import { getFighter } from "../rankingModel";

const input = (name: string) => {
  const fighter = canonicalRankingInputs.fighters.find(
    (candidate) => candidate.fighter === name,
  );
  if (!fighter) throw new Error(`Missing ${name}`);
  return fighter;
};

const fightsAgainst = (name: string, opponent: string, date: string) =>
  input(name).facts.fights.filter(
    (fight) => fight.opponent === opponent && fight.date === date,
  );

describe("September 19, 2026 canonical ranking refresh", () => {
  it("advances the canonical clock and adds Joshua Van exactly once", () => {
    expect(canonicalRankingInputs.source.modelAsOfDate).toBe("2026-09-19");
    expect(
      canonicalRankingInputs.fighters.filter(
        (fighter) => fighter.fighter === "Joshua Van",
      ),
    ).toHaveLength(1);
    expect(input("Joshua Van").facts.fights).toHaveLength(12);
    expect(getFighter("joshua-van")?.visibleStats).toMatchObject({
      ufcRecord: "11-1",
      titleFightWins: 3,
    });
    expect(getFighter("joshua-van")?.longestUfcWinStreak).toBe(8);
  });

  it("locks Van's championship run and conservative injury credit", () => {
    expect(
      fightsAgainst("Joshua Van", "Alexandre Pantoja", "2025-12-06"),
    ).toEqual([
      expect.objectContaining({
        officialResult: "win",
        championshipType: "normal",
        championshipManualCredit: 0.5,
      }),
    ]);
    expect(
      fightsAgainst("Joshua Van", "Tatsuro Taira", "2026-05-09"),
    ).toEqual([
      expect.objectContaining({
        officialResult: "win",
        championshipType: "normal",
        methodCategory: "ko-tko",
      }),
    ]);
    expect(
      fightsAgainst("Joshua Van", "Alexandre Pantoja", "2026-09-19"),
    ).toEqual([
      expect.objectContaining({
        officialResult: "win",
        championshipType: "normal",
        rounds: {
          status: "audited",
          won: 3,
          lost: 2,
          drawn: 0,
        },
      }),
    ]);
    expect(input("Joshua Van").facts.primeWindow).toMatchObject({
      startFightId: "2025-06-28-brandon-royval",
      endFightId: null,
      open: true,
    });
  });

  it("refreshes Pantoja through the full Van rematch", () => {
    expect(
      fightsAgainst("Alexandre Pantoja", "Joshua Van", "2026-09-19"),
    ).toEqual([
      expect.objectContaining({
        officialResult: "loss",
        methodCategory: "decision",
        championshipType: "normal",
        rounds: {
          status: "audited",
          won: 2,
          lost: 3,
          drawn: 0,
        },
      }),
    ]);
    expect(input("Alexandre Pantoja").facts.primeWindow).toEqual({
      startFightId: "2021-02-06-manel-kape",
      endFightId: "2026-09-19-joshua-van",
      open: false,
    });
    expect(input("Alexandre Pantoja").era.window.end).toBe("2026-09-19");
    expect(getFighter("alex-pantoja")?.visibleStats).toMatchObject({
      ufcRecord: "13-6",
      titleFightWins: 5,
    });
  });

  it("keeps Van's ranking assets local and his era ownership explicit", () => {
    const van = input("Joshua Van");
    expect(van.presentation.photoUrl).toBe(
      "assets/fighters/joshua-van-profile.webp",
    );
    expect(van.presentation.thumbUrl).toBe(
      "assets/fighters/joshua-van-thumb.webp",
    );
    expect(canonicalRankingInputs.filters.eraMembership["Joshua Van"]).toEqual({
      primary: "new-blood",
      secondary: null,
    });
  });
});
