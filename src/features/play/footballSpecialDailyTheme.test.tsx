import { renderToStaticMarkup } from "react-dom/server";
import { footballThemedMillionaireRunForDay, footballThemedSportsFeudPackForDay, footballThemedBarTriviaRunForDay } from "./footballTeamThemeDailyPacks";
import { describe, expect, it } from "vitest";
import {
  FootballSpecialDailyChrome,
  FootballSpecialDailyHubMark,
  footballSpecialDailyStyle,
  footballSpecialDailyThemeForDay,
  footballSpecialDailyThemeForCentralToday,
} from "./footballSpecialDailyTheme";

describe("Football special Daily theme", () => {
  it("maps only the four locked Cowboys and Longhorns event dates", () => {
    expect(footballSpecialDailyThemeForDay("2026-10-10")).toMatchObject({
      eventLabel: "RED RIVER EDITION",
      matchup: "TEXAS vs OKLAHOMA",
      teamName: "Texas",
    });
    expect(footballSpecialDailyThemeForDay("2026-10-26")).toMatchObject({
      eventLabel: "RIVALRY GAME EDITION",
      matchup: "COWBOYS @ EAGLES",
      teamName: "Dallas Cowboys",
    });
    expect(footballSpecialDailyThemeForDay("2026-11-27")).toMatchObject({
      eventLabel: "LONE STAR SHOWDOWN",
      matchup: "TEXAS @ TEXAS A&M",
    });
    expect(footballSpecialDailyThemeForDay("2026-12-07")).toMatchObject({
      eventLabel: "COWBOYS GAME DAY",
      matchup: "COWBOYS @ SEAHAWKS",
    });
    expect(footballSpecialDailyThemeForDay("2026-10-11")).toBeNull();
  });

  it("keeps the Red River event visible on Home before sign-in using Central time", () => {
    expect(footballSpecialDailyThemeForCentralToday(new Date("2026-10-10T05:30:00Z"))).toMatchObject({
      eventLabel: "RED RIVER EDITION",
      rivalryAccent: "#841617",
      videoUrl: "https://www.youtube.com/shorts/W4f0b2CwUGM",
    });
    expect(footballSpecialDailyThemeForCentralToday(new Date("2026-10-11T05:30:00Z"))).toBeNull();
  });

  it("provides reusable team-color variables without changing the game template", () => {
    const theme = footballSpecialDailyThemeForDay("2026-10-10")!;
    expect(footballSpecialDailyStyle(theme)).toMatchObject({
      "--special-daily-primary": "#BF5700",
      "--special-daily-secondary": "#F4E9DA",
    });
  });

  it("gives all three upcoming featured games their own team/opponent palettes", () => {
    const locked = [
      { day: "2026-10-26", primary: "#041E42", opponent: "#004C54", label: "COWBOYS @ EAGLES" },
      { day: "2026-11-27", primary: "#BF5700", opponent: "#500000", label: "TEXAS @ TEXAS A&M" },
      { day: "2026-12-07", primary: "#041E42", opponent: "#69BE28", label: "COWBOYS @ SEAHAWKS" },
    ];
    for (const { day, primary, opponent, label } of locked) {
      const theme = footballSpecialDailyThemeForDay(day)!;
      expect(theme.matchup).toBe(label);
      expect(theme.opponentAccent).toBe(opponent);
      expect(theme.videoUrl).toBeUndefined();
      expect(footballSpecialDailyStyle(theme)).toMatchObject({
        "--special-daily-primary": primary,
        "--special-daily-opponent": opponent,
      });
      const hub = renderToStaticMarkup(<FootballSpecialDailyHubMark theme={theme} />);
      expect(hub).toContain(theme.eventLabel);
      expect(hub).toContain(label.replaceAll("&", "&amp;"));
      expect(hub.match(/<img /g)).toHaveLength(2);
    }
  });

  it("pairs each future themed presentation with its already-authored game content", () => {
    expect(footballThemedMillionaireRunForDay("2026-10-26")).toHaveLength(8);
    expect(footballThemedMillionaireRunForDay("2026-11-27")).toBeNull();
    const longhornFeud = footballThemedSportsFeudPackForDay("cfb", "2026-11-27");
    expect(longhornFeud?.main).toHaveLength(2);
    expect(longhornFeud?.fastMoney).toHaveLength(5);
    expect(footballThemedSportsFeudPackForDay("nfl", "2026-11-27")).toBeNull();
    expect(footballThemedBarTriviaRunForDay("2026-12-07")).toHaveLength(10);
    expect(footballThemedBarTriviaRunForDay("2026-10-26")).toBeNull();
  });

  it("renders matchup branding and a score-aware result stamp", () => {
    const theme = footballSpecialDailyThemeForDay("2026-10-26")!;
    const hub = renderToStaticMarkup(<FootballSpecialDailyHubMark theme={theme} />);
    const result = renderToStaticMarkup(
      <FootballSpecialDailyChrome theme={theme} score={84} showIntro />,
    );

    expect(hub).toContain("RIVALRY GAME EDITION");
    expect(hub).toContain("COWBOYS @ EAGLES");
    expect(result).toContain("COWBOYS GAME DAY RESULT");
    expect(result).toContain("84/100");
    expect(result).toContain("football-special-daily-intro");
  });
});
