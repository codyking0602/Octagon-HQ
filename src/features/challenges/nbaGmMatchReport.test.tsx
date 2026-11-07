import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { NbaGmMatchReport } from "./NbaGmMatchReport";
import {
  nbaGmChallengeRecapSchema,
  nbaGmChallengeInsights,
  nbaGmDevelopmentLabel,
  type NbaGmChallengeRecap,
} from "../nba/nbaGmChallengeRecap";

const slots = ["PG", "SG", "SF", "PF", "C", "GUARD", "BIG"] as const;
const roster = (prefix: string) => slots.map((slot, index) => ({
  slot, playerId: `${prefix}-${index}`, name: `${prefix} Player ${index + 1}`,
  teamCode: "DAL", nbaPlayerId: null, developmentDelta: index === 0 ? 3 : 0,
}));
const creatorOpening = roster("Cody");
const creatorFinal = creatorOpening;
const shaneOpening = roster("Shane");
const shaneFinal = [...shaneOpening];
shaneFinal[3] = { ...shaneOpening[3]!, playerId: "lebron", name: "LeBron James", teamCode: "LAL", developmentDelta: 0 };

const report: NbaGmChallengeRecap = {
  creator: {
    score: 94.5, rosterGrade: 94.3, recordGrade: 89.6, playoffGrade: 99.6,
    weights: [.9, .03, .07],
    seasons: [
      { year: 1, overall: 91, wins: 56, losses: 26, finish: "Champion", titleOdds: 23.3 },
      { year: 2, overall: 96, wins: 61, losses: 21, finish: "Champion", titleOdds: 35 },
      { year: 3, overall: 96, wins: 65, losses: 17, finish: "Finals", titleOdds: 31 },
    ],
    openingRoster: creatorOpening, finalRoster: creatorFinal,
  },
  responder: {
    score: 85.3, rosterGrade: 85.7, recordGrade: 83.4, playoffGrade: 81,
    weights: [.9, .03, .07],
    seasons: [
      { year: 1, overall: 81, wins: 45, losses: 37, finish: "First Round", titleOdds: 5 },
      { year: 2, overall: 87, wins: 50, losses: 32, finish: "Conference Semifinals", titleOdds: 13 },
      { year: 3, overall: 89, wins: 49, losses: 33, finish: "Finals", titleOdds: 16 },
    ],
    openingRoster: shaneOpening, finalRoster: shaneFinal,
  },
};

describe("full NBA GM challenge recap", () => {
  afterEach(cleanup);

  it("parses a complete server-owned report and rejects missing rosters", () => {
    expect(nbaGmChallengeRecapSchema.parse(report).creator.seasons).toHaveLength(3);
    expect(nbaGmChallengeRecapSchema.safeParse({ ...report, responder: { ...report.responder, finalRoster: [] } }).success)
      .toBe(false);
  });

  it("uses the exact historical results, scores and championship finishes", () => {
    render(<NbaGmMatchReport report={report} creatorName="Cody" responderName="Shane" />);
    const seasons = screen.getByRole("region", { name: "Year by year team results" });
    expect(within(seasons).getAllByText("Champion")).toHaveLength(2);
    expect(within(seasons).getAllByText("Finals")).toHaveLength(2);
    expect(within(seasons).getByText("65–17")).toBeTruthy();
    expect(within(seasons).getByText("45–37")).toBeTruthy();
    const grades = screen.getByRole("region", { name: "What determined the GM scores" });
    expect(within(grades).getByText("94.3")).toBeTruthy();
    expect(within(grades).getByText("85.7")).toBeTruthy();
    expect(within(grades).getByText("90% OF SCORE")).toBeTruthy();
    expect(screen.getByText("2 TITLES")).toBeTruthy();
    expect(screen.getByText("0 TITLES")).toBeTruthy();
  });

  it("compares both final sevens, offseason changes, and development without inventing players", () => {
    render(<NbaGmMatchReport report={report} creatorName="Cody" responderName="Shane" />);
    expect(screen.getByText("LeBron James")).toBeTruthy();
    expect(screen.getByText("6/7 RETAINED")).toBeTruthy();
    expect(screen.getByText("7/7 RETAINED")).toBeTruthy();
    expect(screen.getAllByText(/Shane Player 4/).length).toBeGreaterThan(0);
    expect(screen.getAllByText("BREAKOUT").length).toBeGreaterThan(0);
    expect(nbaGmChallengeInsights(report.responder).acquired.map(p => p.name)).toEqual(["LeBron James"]);
    expect(nbaGmDevelopmentLabel(-2.6)).toBe("MAJOR REGRESSION");
    expect(nbaGmDevelopmentLabel(1.1)).toBe("IMPROVED");
  });
});
