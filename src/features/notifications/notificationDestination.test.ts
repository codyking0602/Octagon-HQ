import { describe, expect, it } from "vitest";
import { notificationDestination } from "./notificationDestination";

function destination(kind: "picks_recap_ready" | "picks_repick_required", route: string | null) {
  return notificationDestination({ kind, route });
}

describe("notificationDestination", () => {
  it("keeps an exact archived recap route", () => {
    expect(destination(
      "picks_recap_ready",
      "/picks?event=ufc-fight-night-belgrade&view=recap",
    )).toBe("/picks?event=ufc-fight-night-belgrade&view=recap");
  });

  it("hands stale generic recap notifications to the latest canonical recap", () => {
    expect(destination("picks_recap_ready", "/picks")).toBe("/picks?view=recap");
    expect(destination("picks_recap_ready", null)).toBe("/picks?view=recap");
  });

  it("does not rewrite other Picks notifications", () => {
    expect(destination("picks_repick_required", "/picks")).toBe("/picks");
  });

  it("preserves Football destinations through the same resolver", () => {
    expect(destination("picks_repick_required", "/football/picks")).toBe("/football/picks");
  });
});
