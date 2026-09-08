import { describe, expect, it } from "vitest";
import { notificationKinds, notificationSport, notificationSportLabel } from "./notificationModel";

describe("notificationSport", () => {
  it("keeps existing UFC notification context visible", () => {
    expect(notificationSport({ kind: "picks_repick_required", route: "/picks" })).toBe("ufc");
    expect(notificationSport({ kind: "ufc_event_starting", route: null })).toBe("ufc");
    expect(notificationSportLabel("ufc")).toBe("UFC");
  });

  it("accepts the canonical Football Picks notification kind and route", () => {
    expect(notificationKinds).toContain("football_picks_open");
    expect(notificationSport({ kind: "football_picks_open", route: "/football/picks" })).toBe("football");
    expect(notificationSportLabel("football")).toBe("Football");
  });

  it("uses the canonical Football destination before legacy Picks kind context", () => {
    expect(notificationSport({ kind: "picks_repick_required", route: "/football/picks" })).toBe("football");
    expect(notificationSport({ kind: "new_game_available", route: "/football/back-room" })).toBe("football");
    expect(notificationSportLabel("football")).toBe("Football");
  });

  it("leaves universal account and social notifications neutral", () => {
    expect(notificationSport({ kind: "war_room_mention", route: "/war-room" })).toBeNull();
  });
});
