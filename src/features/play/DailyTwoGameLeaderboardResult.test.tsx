import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DailyTwoGameLeaderboardResult } from "./DailyTwoGameLeaderboardResult";
import type { TodayChallengeProjection } from "./todayChallengeRepository";

function projection(overrides: Partial<TodayChallengeProjection> = {}): TodayChallengeProjection {
  return {
    available: true,
    id: "11111111-1111-4111-8111-111111111111",
    centralDay: "2026-09-27",
    scheduleVersion: "test",
    gameType: "find_leader",
    setupKey: "test",
    contentVersion: "test",
    scoringVersion: "daily-two-game-average-score-v1",
    fallbackReason: null,
    publicSetup: {
      format_version: "daily-two-game-average-v1",
      rounds: [
        { question: "Who leads game one?", stat_label: "STAT ONE", candidates: [] },
        { question: "Who leads game two?", stat_label: "STAT TWO", candidates: [] },
      ],
    },
    progressRevision: 1,
    publicState: {},
    revealSetup: {
      format_version: "daily-two-game-average-v1",
      rounds: [
        {
          leader_id: "leader-one",
          candidates: Array.from({ length: 10 }, (_, index) => ({
            id: index === 0 ? "leader-one" : `one-${index}`,
            name: index === 0 ? "Leader One" : `Game One ${index}`,
            value: 10 - index,
            division: "TEST",
          })),
        },
        {
          leader_id: "leader-two",
          candidates: Array.from({ length: 10 }, (_, index) => ({
            id: index === 0 ? "leader-two" : `two-${index}`,
            name: index === 0 ? "Leader Two" : `Game Two ${index}`,
            value: 20 - index,
            division: "TEST",
          })),
        },
      ],
    },
    officialAttempt: {
      nativeScore: 9,
      normalizedScore: 95,
      completedAt: "2026-09-27T12:00:00.000Z",
      publicResult: {
        daily_series: {
          format_version: "daily-two-game-average-v1",
          round_scores: [100, 90],
          average_score: 95,
          rounds: [
            {
              perfect: true,
              native_score: 10,
              normalized_score: 100,
              eliminated_ids: Array.from({ length: 9 }, (_, index) => `one-${index + 1}`),
            },
            {
              perfect: false,
              native_score: 9,
              normalized_score: 90,
              eliminated_ids: ["two-1", "two-2", "two-3", "two-4", "two-5", "two-6", "two-7", "two-8", "leader-two"],
            },
          ],
        },
      },
    },
    deploymentSha: "test",
    ...overrides,
  };
}

describe("compact two-game leaderboard result", () => {
  it("shows the Daily average with both games collapsed by default", () => {
    const { container } = render(
      <DailyTwoGameLeaderboardResult projection={projection()} resultDetail={{}} sport="ufc" />,
    );

    expect(container.textContent).toContain("DAILY AVERAGE");
    expect(container.textContent).toContain("95");
    expect(container.textContent).toContain("GAME 1");
    expect(container.textContent).toContain("100");
    expect(container.textContent).toContain("GAME 2");
    expect(container.textContent).toContain("90");
    const games = [...container.querySelectorAll<HTMLDetailsElement>(".daily-two-game-result__game")];
    expect(games).toHaveLength(2);
    expect(games.every((game) => !game.open)).toBe(true);
  });

  it("switches an expanded Find the Leader game from the run to the compact 1-10 reveal rail", () => {
    const { container, getAllByText } = render(
      <DailyTwoGameLeaderboardResult projection={projection()} resultDetail={{}} sport="ufc" />,
    );

    const games = [...container.querySelectorAll<HTMLDetailsElement>(".daily-two-game-result__game")];
    fireEvent.click(games[1]!.querySelector("summary")!);
    const revealButton = getAllByText("FINAL REVEAL")[1]!;
    fireEvent.click(revealButton);

    const openGame = games[1]!;
    const tiles = openGame.querySelectorAll(".daily-two-game-result__tile");
    expect(tiles).toHaveLength(10);
    expect(openGame.textContent).toContain("SCROLL 1–10");
    expect(openGame.textContent).toContain("Leader Two");
    expect(openGame.textContent).toContain("#1");
  });

  it("uses sanitized leaderboard detail when the live projection does not carry Find the Leader reveal rounds", () => {
    const missingRevealProjection = projection({
      publicSetup: { format_version: "daily-two-game-average-v1" },
      revealSetup: null,
    });
    const setupRounds = [
      { question: "Who leads game one?", stat_label: "STAT ONE", candidates: [] },
      { question: "Who leads game two?", stat_label: "STAT TWO", candidates: [] },
    ];
    const revealRounds = [
      {
        leader_id: "leader-one",
        candidates: Array.from({ length: 10 }, (_, index) => ({
          id: index === 0 ? "leader-one" : `one-${index}`,
          name: index === 0 ? "Leader One" : `Game One ${index}`,
          value: 10 - index,
          division: "TEST",
        })),
      },
      {
        leader_id: "leader-two",
        candidates: Array.from({ length: 10 }, (_, index) => ({
          id: index === 0 ? "leader-two" : `two-${index}`,
          name: index === 0 ? "Leader Two" : `Game Two ${index}`,
          value: 20 - index,
          division: "TEST",
        })),
      },
    ];

    const { container, getAllByText } = render(
      <DailyTwoGameLeaderboardResult
        projection={missingRevealProjection}
        resultDetail={{ setup_rounds: setupRounds, reveal_rounds: revealRounds }}
        sport="ufc"
      />,
    );

    const games = [...container.querySelectorAll<HTMLDetailsElement>(".daily-two-game-result__game")];
    fireEvent.click(games[1]!.querySelector("summary")!);
    fireEvent.click(getAllByText("FINAL REVEAL")[1]!);

    const openGame = games[1]!;
    expect(openGame.querySelectorAll(".daily-two-game-result__tile")).toHaveLength(10);
    expect(openGame.textContent).toContain("Who leads game two?");
    expect(openGame.textContent).toContain("Leader Two");
    expect(openGame.textContent).not.toContain("unavailable");
  });

  it("reconstructs both Wavelength rounds from sanitized leaderboard detail", () => {
    const wavelengthProjection = projection({
      gameType: "wavelength",
      publicSetup: {
        format_version: "daily-two-game-average-v1",
        rounds: [{}, {}],
      },
      revealSetup: { format_version: "daily-two-game-average-v1", rounds: [{}, {}] },
      officialAttempt: {
        nativeScore: 82,
        normalizedScore: 89,
        completedAt: "2026-09-27T12:00:00.000Z",
        publicResult: {
          daily_series: {
            format_version: "daily-two-game-average-v1",
            round_scores: [96, 82],
            average_score: 89,
            rounds: [
              { normalized_score: 96, guesses: [95, 96, 94, 97], distance: 2 },
              { normalized_score: 82, guesses: [78, 62, 50, 55], distance: 9 },
            ],
          },
        },
      },
    });
    const { container } = render(
      <DailyTwoGameLeaderboardResult
        projection={wavelengthProjection}
        sport="football"
        resultDetail={{
          rounds: [
            { target: 99, clue_ids: ["freak-randy-moss"] },
            { target: 46, clue_ids: ["system-qb-ryan-tannehill"] },
          ],
        }}
      />,
    );

    const games = container.querySelectorAll(".daily-two-game-result__game");
    expect(games[0]!.textContent).toContain("95 → 96 → 94 → 97");
    expect(games[0]!.textContent).toContain("Randy Moss");
    expect(games[1]!.textContent).toContain("78 → 62 → 50 → 55");
    expect(games[1]!.textContent).toContain("Ryan Tannehill");
    expect(games[1]!.textContent).toContain("46");
  });
  it("reveals recorded UFC contributions for both games without exposing unpicked fighters", () => {
    const ufcProjection = projection({
      gameType: "hit_the_number",
      publicSetup: {
        rounds: [
          { statId: "ufc-wins", target: 24 },
          { statId: "ufc-title-fights", target: 29 },
        ],
      },
      revealSetup: { rounds: [{}, {}] },
      officialAttempt: {
        nativeScore: 20,
        normalizedScore: 60,
        completedAt: "2026-10-14T12:00:00.000Z",
        publicResult: {
          daily_series: {
            round_scores: [46, 74],
            average_score: 60,
            rounds: [
              { normalized_score: 46, target: 24, total: 26, status: "bust", selections: [
                { fighterId: "tony-ferguson", value: 8 },
                { fighterId: "leon-edwards", value: 7 },
                { fighterId: "conor-mcgregor", value: 5 },
                { fighterId: "sean-strickland", value: 4 },
                { fighterId: "matt-hughes", value: 2 },
              ] },
              { normalized_score: 74, target: 29, total: 14, status: "under", selections: [
                { fighterId: "alex-pereira", value: 4 },
                { fighterId: "anderson-silva", value: 3 },
                { fighterId: "amanda-nunes", value: 3 },
                { fighterId: "conor-mcgregor", value: 2 },
                { fighterId: "francis-ngannou", value: 2 },
              ] },
            ],
          },
        },
      },
    });
    const { container } = render(
      <DailyTwoGameLeaderboardResult projection={ufcProjection} resultDetail={{}} sport="ufc" />,
    );
    const breakdowns = container.querySelectorAll(".hit-number-pick-breakdown");
    expect(breakdowns).toHaveLength(2);
    expect(breakdowns[0]!.textContent).toContain("UFC Wins");
    expect(breakdowns[1]!.textContent).toContain("UFC Title Fights");
    expect(breakdowns[0]!.querySelectorAll("li")).toHaveLength(5);
    expect(breakdowns[0]!.querySelector("li")!.textContent).toContain("Tony Ferguson");
    expect(breakdowns[0]!.querySelector("li")!.textContent).toContain("8");
    expect(breakdowns[1]!.textContent).toContain("Francis Ngannou");
    expect(breakdowns[1]!.querySelectorAll("li")).toHaveLength(5);
    expect(breakdowns[0]!.textContent).not.toContain("Unpicked Fighter");
  });

  it("shows NFL and CFB recorded values, including zero, decimals and full season years", () => {
    const footballProjection = projection({
      gameType: "hit_the_number",
      publicSetup: { rounds: [
        { metric_label: "NFL Passing Touchdowns", target: 45, candidates: [
          { id: "nfl-a", name: "Quarterback A" }, { id: "nfl-b", name: "Quarterback B" },
        ] },
        { metric_label: "CFB 2024 Passing Yards", target: 5000, candidates: [
          { id: "cfb-a", name: "Quarterback A · 2024" }, { id: "cfb-b", name: "Quarterback B · 2023" },
        ] },
      ] },
      revealSetup: { rounds: [{}, {}] },
      officialAttempt: {
        nativeScore: 100,
        normalizedScore: 93,
        completedAt: "2026-10-14T12:00:00.000Z",
        publicResult: { daily_series: {
          round_scores: [90, 96], average_score: 93,
          rounds: [
            { normalized_score: 90, total: 12.5, target: 45, status: "under", selections: [
              { fighterId: "nfl-a", value: 12.5 }, { fighterId: "nfl-b", value: 0 },
            ] },
            { normalized_score: 96, total: 2000.5, target: 5000, status: "under", selections: [
              { fighterId: "cfb-a", value: 1024.5 }, { fighterId: "cfb-b", value: 976 },
            ] },
          ],
        } },
      },
    });
    const { container } = render(
      <DailyTwoGameLeaderboardResult projection={footballProjection} resultDetail={{}} sport="football" />,
    );
    const breakdowns = container.querySelectorAll(".hit-number-pick-breakdown");
    expect(breakdowns).toHaveLength(2);
    expect(breakdowns[0]!.textContent).toContain("NFL Passing Touchdowns");
    expect(breakdowns[0]!.textContent).toContain("12.5");
    expect(breakdowns[0]!.querySelectorAll("li")[1]!.textContent).toContain("0");
    expect(breakdowns[1]!.textContent).toContain("CFB 2024 Passing Yards");
    expect(breakdowns[1]!.textContent).toContain("Quarterback A · 2024");
    expect(breakdowns[1]!.textContent).toContain("1,024.5");
  });

  it("never invents a missing historical contribution", () => {
    const legacyProjection = projection({
      gameType: "hit_the_number",
      publicSetup: { rounds: [{ statId: "ufc-wins" }, {}] },
      officialAttempt: {
        nativeScore: 5,
        normalizedScore: 50,
        completedAt: "2026-10-14T12:00:00.000Z",
        publicResult: { daily_series: {
          round_scores: [50, 50], average_score: 50,
          rounds: [
            { selected_ids: ["tony-ferguson"], total: 5, target: 10, status: "under" },
            { selections: [], total: 0, target: 10, status: "under" },
          ],
        } },
      },
    });
    const { container } = render(
      <DailyTwoGameLeaderboardResult projection={legacyProjection} resultDetail={{}} sport="ufc" />,
    );
    expect(container.querySelectorAll(".hit-number-pick-breakdown")).toHaveLength(1);
    expect(container.querySelector(".hit-number-pick-breakdown li")!.textContent).toContain("—");
  });

  it("renders the October 25 Football Hit the Number drill-down without raw source IDs, long decimals, or numeric overflow", () => {
    const footballProjection = projection({
      gameType: "hit_the_number",
      publicSetup: { rounds: [
        { metric_label: "Points Per Game", target: 201.399999999, candidates: [
          { id: "2004-usc", name: "2004 Usc" },
        ] },
        { metric_label: "Passer Rating", target: 362.8936, candidates: [
          { id: "nflverse-player-season-00-0023459-2024", name: "Nflverse Player Season 00 0023459 2024" },
          { id: "nflverse-player-season-00-0021678-2010", name: "Nflverse Player Season 00 0021678 2010" },
        ] },
      ] },
      officialAttempt: {
        nativeScore: 71,
        normalizedScore: 71,
        completedAt: "2026-10-25T14:37:00Z",
        publicResult: { daily_series: {
          round_scores: [48, 94], average_score: 71,
          rounds: [
            { normalized_score: 48, target: 201.399999999, total: 211.7, status: "bust",
              selected_ids: ["2004-usc"], selections: [{ fighterId: "2004-usc", value: 38.2 }] },
            { normalized_score: 94, target: 362.8936, total: 321.85817,
              distance: 41.03543, status: "under",
              selections: [
                { fighterId: "nflverse-player-season-00-0023459-2024", value: 90.53224886 },
                { fighterId: "nflverse-player-season-00-0021678-2010", value: 94.9041471 },
              ] },
          ],
        } },
      },
    });
    const { container } = render(
      <DailyTwoGameLeaderboardResult projection={footballProjection} resultDetail={{}} sport="football" />,
    );
    const games = container.querySelectorAll(".daily-two-game-result__game");
    expect(games).toHaveLength(2);
    expect(games[1]!.querySelector("summary")?.textContent).toContain("41.0 OFF");
    const metricGroups = container.querySelectorAll(".daily-two-game-result__metrics--hit-number");
    expect(metricGroups).toHaveLength(2);
    expect(metricGroups[0]!.textContent).toContain("201.4");
    expect(metricGroups[0]!.textContent).toContain("211.7");
    expect(metricGroups[1]!.textContent).toContain("362.9");
    expect(metricGroups[1]!.textContent).toContain("321.9");
    expect(container.textContent).toContain("2004 USC");
    expect(container.textContent).toContain("Aaron Rodgers · 2024");
    expect(container.textContent).toContain("Tony Romo · 2010");
    expect(container.textContent).toContain("90.5");
    expect(container.textContent).toContain("94.9");
    expect(container.textContent).not.toContain("Nflverse Player Season");
    expect(container.textContent).not.toContain("201.399999");
    expect(container.textContent).not.toContain("90.53224886");
    expect(footballProjection.officialAttempt?.publicResult.daily_series).toMatchObject({
      round_scores: [48, 94], average_score: 71,
    });
  });

  it("uses the approved compact result drill-down for NBA career and season identities", () => {
    const nba = projection({
      gameType: "hit_the_number",
      publicSetup: { rounds: [
        { metric_label: "Career Points Per Game", target: 80.199999999, candidates: [] },
        { metric_label: "Season Points Per Game", target: 55.099999999, candidates: [] },
      ] },
      officialAttempt: {
        nativeScore: 92, normalizedScore: 92, completedAt: "2026-10-25T14:30:00Z",
        publicResult: { daily_series: {
          format_version: "daily-two-game-average-v1",
          round_scores: [90, 94], average_score: 92,
          rounds: [
            { normalized_score: 90, status: "under", target: 80.199999999, total: 75.099999999,
              distance: 5.10000001, selections: [
                { fighterId: "career:Michael Jordan", value: 30.10000001 },
              ] },
            { normalized_score: 94, status: "bust", target: 55.099999999, total: 60.2999999,
              distance: 5.19999999, selections: [
                { fighterId: "season-2025:Stephen Curry", value: 24.5000001 },
                { fighterId: "season-2026:Nikola Jokić", value: 27.8999999 },
              ] },
          ],
        } },
      },
    });
    const { container } = render(<DailyTwoGameLeaderboardResult projection={nba} resultDetail={{}} sport="nba" />);
    expect(container.classList.contains("daily-two-game-result")).toBe(true);
    expect(container.querySelectorAll(".daily-two-game-result__metrics--hit-number")).toHaveLength(2);
    expect(container.textContent).toContain("Michael Jordan");
    expect(container.textContent).toContain("Stephen Curry · 2024–25");
    expect(container.textContent).toContain("Nikola Jokić · 2025–26");
    expect(container.textContent).toContain("80.2");
    expect(container.textContent).toContain("75.1");
    expect(container.textContent).toContain("24.5");
    expect(container.textContent).not.toContain("season-2025");
    expect(container.textContent).not.toContain("30.10000001");
  });

  it("retains UFC fighter names and the same mobile-friendly result breakdown", () => {
    const ufc = projection({
      gameType: "hit_the_number",
      publicSetup: { rounds: [
        { statId: "ufc-wins", target: 25 },
        { statId: "ufc-title-fights", target: 15 },
      ] },
      officialAttempt: {
        nativeScore: 88, normalizedScore: 88, completedAt: "2026-10-25T14:30:00Z",
        publicResult: { daily_series: {
          format_version: "daily-two-game-average-v1",
          round_scores: [90, 86], average_score: 88,
          rounds: [
            { normalized_score: 90, status: "bust", target: 25, total: 27, distance: 2,
              selections: [{ fighterId: "tony-ferguson", value: 11 }] },
            { normalized_score: 86, status: "under", target: 15, total: 12, distance: 3,
              selections: [{ fighterId: "amanda-nunes", value: 7 }] },
          ],
        } },
      },
    });
    const { container } = render(<DailyTwoGameLeaderboardResult projection={ufc} resultDetail={{}} sport="ufc" />);
    expect(container.querySelectorAll(".daily-two-game-result__metrics--hit-number")).toHaveLength(2);
    expect(container.querySelectorAll(".hit-number-pick-breakdown")).toHaveLength(2);
    expect(container.textContent).toContain("Tony Ferguson");
    expect(container.textContent).toContain("Amanda Nunes");
    expect(container.textContent).toContain("UFC Wins");
    expect(container.textContent).toContain("UFC Title Fights");
    expect(container.textContent).not.toContain("Tony Ferguson 00");
  });

});
