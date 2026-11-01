import { describe, expect, it } from "vitest";
import { notificationDestination } from "./notificationDestination";

function destination(
  kind: "picks_recap_ready" | "picks_repick_required" | "football_gotw_starting",
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

  it("does not rewrite other Picks notifications", () => {
    expect(destination("picks_repick_required", "/picks")).toBe("/picks");
  });

  it("opens the correct published NFL or CFB GOTW breakdown from legacy inbox routes", () => {
    expect(destination("football_gotw_starting", "/football",
      "NFL Game of the Week starts soon")).toBe("/football/picks?gotw=nfl");
    expect(destination("football_gotw_starting", "/football",
      "CFB Game of the Week starts soon")).toBe("/football/picks?gotw=cfb");
    expect(destination("football_gotw_starting", null,
      "NFL Game of the Week starts soon")).toBe("/football/picks?gotw=nfl");
  });

  it("does not misroute unknown football notification titles", () => {
    expect(destination("football_gotw_starting", "/football",
      "Football weekly update")).toBe("/football");
  });

  it("preserves Football destinations through the same resolver", () => {
    expect(destination("picks_repick_required", "/football/picks")).toBe("/football/picks");
  });
});
