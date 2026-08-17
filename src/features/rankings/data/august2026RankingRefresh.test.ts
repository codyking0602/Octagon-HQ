import { describe, expect, it } from "vitest";
import { canonicalRankingInputs } from "./rankingInputs";
import { getFighter } from "../rankingModel";

const input = (name: string) => {
  const fighter = canonicalRankingInputs.fighters.find((row) => row.fighter === name);
  if (!fighter) throw new Error(`Missing ${name}`);
  return fighter;
};
const fightsAgainst = (name: string, opponent: string, date: string) =>
  input(name).facts.fights.filter((fight) => fight.opponent === opponent && fight.date === date);

describe("August 16, 2026 canonical ranking refresh", () => {
  it("advances the runtime owner while preserving the synchronized 81-fighter roster", () => {
    expect(canonicalRankingInputs.source.modelAsOfDate).toBe("2026-08-16");
    expect(canonicalRankingInputs.counts.fighters).toBe(canonicalRankingInputs.fighters.length);
    expect(canonicalRankingInputs.counts.fighters).toBe(81);
  });

  it("adds each new result exactly once with the approved title and prime context", () => {
    expect(fightsAgainst("Islam Makhachev", "Ian Machado Garry", "2026-08-15")).toEqual([
      expect.objectContaining({ division: "Welterweight", officialResult: "win", championshipType: "normal" }),
    ]);
    expect(fightsAgainst("Mackenzie Dern", "Gillian Robertson", "2026-08-15")).toEqual([
      expect.objectContaining({ division: "Strawweight", officialResult: "win", championshipType: "normal" }),
    ]);
    expect(fightsAgainst("Dricus du Plessis", "Kamaru Usman", "2026-07-18")).toHaveLength(1);
    expect(input("Dricus du Plessis").facts.primeWindow).toMatchObject({ open: true, endFightId: null });
    expect(input("Dricus du Plessis").era.window.end).toBeNull();
    expect(fightsAgainst("Kamaru Usman", "Dricus du Plessis", "2026-07-18")).toHaveLength(1);
    expect(input("Kamaru Usman").facts.primeWindow).toEqual({ startFightId: "2018-11-30-rafael-dos-anjos", endFightId: "2023-03-18-leon-edwards", open: false });
    expect(input("Kamaru Usman").era.window.end).toBe("2023-03-18");
  });

  it("stores reviewed round-control audits as whole rounds, not judge-card averages", () => {
    expect(fightsAgainst("Dricus du Plessis", "Kamaru Usman", "2026-07-18")[0].rounds).toEqual({
      status: "audited",
      won: 4,
      lost: 1,
      drawn: 0,
    });
    expect(fightsAgainst("Kamaru Usman", "Dricus du Plessis", "2026-07-18")[0].rounds).toEqual({
      status: "audited",
      won: 1,
      lost: 4,
      drawn: 0,
    });
    expect(fightsAgainst("Islam Makhachev", "Ian Machado Garry", "2026-08-15")[0].rounds).toEqual({
      status: "audited",
      won: 3,
      lost: 2,
      drawn: 0,
    });
    expect(fightsAgainst("Mackenzie Dern", "Gillian Robertson", "2026-08-15")[0].rounds).toEqual({
      status: "audited",
      won: 4,
      lost: 1,
      drawn: 0,
    });
  });

  it("keeps every July 11 result singular and in its approved era context", () => {
    const july = [
      ["Max Holloway", "Conor McGregor"],
      ["Conor McGregor", "Max Holloway"],
      ["Robert Whittaker", "Nikita Krylov"],
      ["Paddy Pimblett", "Benoit Saint Denis"],
    ] as const;
    july.forEach(([fighter, opponent]) => expect(fightsAgainst(fighter, opponent, "2026-07-11")).toHaveLength(1));
    expect(fightsAgainst("Max Holloway", "Conor McGregor", "2026-07-11")[0].methodCategory).toBe("ko-tko");
    expect(fightsAgainst("Conor McGregor", "Max Holloway", "2026-07-11")[0].methodCategory).toBe("ko-tko");
    expect(input("Max Holloway").facts.primeWindow.open).toBe(true);
    expect(input("Max Holloway").judgments.opponentQuality.inputs.filter((row) => row.fightId === "2026-07-11-conor-mcgregor")).toHaveLength(1);
    expect(input("Robert Whittaker").facts.primeWindow).toMatchObject({ open: false, endFightId: "2024-10-26-khamzat-chimaev" });
    expect(input("Robert Whittaker").judgments.opponentQuality.inputs.some((row) => row.fightId === "2026-07-11-nikita-krylov")).toBe(true);
  });

  it("derives refreshed visible records and title totals from canonical fights", () => {
    expect(getFighter("islam-makhachev")?.visibleStats).toMatchObject({ ufcRecord: "18-1", titleFightWins: 7 });
    expect(getFighter("islam-makhachev")?.longestUfcWinStreak).toBe(17);
    expect(getFighter("mackenzie-dern")?.visibleStats).toMatchObject({ ufcRecord: "12-5", titleFightWins: 2 });
    expect(getFighter("dricus-du-plessis")?.visibleStats.ufcRecord).toBe("10-1");
    expect(getFighter("kamaru-usman")?.visibleStats.ufcRecord).toBe("16-4");
    expect(getFighter("robert-whittaker")?.visibleStats.ufcRecord).toBe("18-7");
    expect(getFighter("max-holloway")?.visibleStats.ufcRecord).toBe("24-9");
    expect(getFighter("paddy-pimblett")?.visibleStats.ufcRecord).toBe("8-1");
  });
});
