import { describe, expect, it } from "vitest";
import { routeOwnsNavigationItem } from "./BottomNavigation";

describe("NBA private GM bottom navigation", () => {
  it("highlights Play for private NBA GM and other NBA games", () => {
    for (const path of ["/nba", "/nba/gm-dev", "/nba/today", "/nba/average-fan"]) {
      expect(routeOwnsNavigationItem("play", path)).toBe(true);
      expect(routeOwnsNavigationItem("picks", path)).toBe(false);
    }
  });
  it("preserves the Picks tab for NBA picks and never mislabels GM", () => {
    for (const path of ["/nba/picks", "/nba/picks/event"]) {
      expect(routeOwnsNavigationItem("picks", path)).toBe(true);
      expect(routeOwnsNavigationItem("play", path)).toBe(false);
    }
    expect(routeOwnsNavigationItem("home", "/nba/gm-dev")).toBe(false);
    expect(routeOwnsNavigationItem("play", "/football/gm")).toBe(true);
  });
});
