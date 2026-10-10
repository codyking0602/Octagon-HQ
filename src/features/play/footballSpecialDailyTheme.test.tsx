import { renderToStaticMarkup } from "react-dom/server";
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
