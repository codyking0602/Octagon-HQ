import { describe, expect, it } from "vitest";
import { notificationDestination } from "./notificationDestination";

function destination(
  kind: "picks_recap_ready" | "picks_repick_required",
  route: string | null,
  title = "UFC Picks recap",
  summary = "The event is final.",
) {
  return notificationDestination({ kind, route, title, summary });
}

describe("notificationDestination", () => {
  it("keeps an exact archived recap route", () => {
    expect(destination(
      "picks_recap_ready",
      "/picks?event=ufc-fight-night-belgrade&view=recap",
    )).toBe("/picks?event=ufc-fight-night-belgrade&view=recap");
  });

  it("hands stale generic UFC recap notifications to the latest canonical recap", () => {
    expect(destination("picks_recap_ready", "/picks")).toBe("/picks?view=recap");
    expect(destination("picks_recap_ready", null)).toBe("/picks?view=recap");
  });

  it("routes cached football recap notifications to Football Picks", () => {
    expect(destination(
      "picks_recap_ready",
      "/picks",
      "Football Picks are final",
      "Week 1 ATS results are ready.",
    )).toBe("/football/picks?view=recap");
    expect(destination(
      "picks_recap_ready",
      "/football/picks",
      "Football Picks are final",
      "Week 1 ATS results are ready.",
    )).toBe("/football/picks?view=recap");
  });

  it("opens the exact week and sport for previously delivered NFL and CFB GOTW notifications", () => {
    expect(notificationDestination({
      kind: "football_gotw_starting",
      route: "/football",
      title: "NFL Game of the Week starts soon",
      summary: "Chicago Bears at Seattle Seahawks kicks off in under one hour.",
      aggregationKey: "football-gotw-starting:2026-10-27:nfl",
    })).toBe("/football/gotw?league=nfl&week=2026-10-27");
    expect(notificationDestination({
      kind: "football_gotw_starting",
      route: "/football",
      title: "CFB Game of the Week starts soon",
      summary: "Miami at North Carolina kicks off in under one hour.",
      aggregationKey: "football-gotw-starting:2026-10-27:cfb",
    })).toBe("/football/gotw?league=cfb&week=2026-10-27");
  });

  it("preserves new GOTW destinations and handles old notifications without aggregation keys", () => {
    expect(notificationDestination({
      kind: "football_gotw_starting", route: "/football/gotw?league=nfl&week=2026-10-27",
      title: "NFL Game of the Week starts soon", summary: "",
    })).toBe("/football/gotw?league=nfl&week=2026-10-27");
    expect(notificationDestination({
      kind: "football_gotw_starting", route: "/football",
      title: "CFB Game of the Week starts soon", summary: "",
    })).toBe("/football/gotw?league=cfb");
  });

  it("does not rewrite other Picks notifications", () => {
    expect(destination("picks_repick_required", "/picks")).toBe("/picks");
  });

  it("preserves Football destinations through the same resolver", () => {
    expect(destination("picks_repick_required", "/football/picks")).toBe("/football/picks");
  });
});
