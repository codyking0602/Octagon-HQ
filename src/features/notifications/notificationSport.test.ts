import { describe, expect, it } from "vitest";
import { notificationKinds, notificationSport, notificationSportLabel } from "./notificationModel";

describe("notificationSport", () => {
  it("keeps existing UFC notification context visible", () => {
    expect(notificationSport({ kind: "picks_repick_required", route: "/picks" })).toBe("ufc");
    expect(notificationSport({ kind: "ufc_event_starting", route: null })).toBe("ufc");
    expect(notificationSport({ kind: "fighter_watchlist_added", route: "/fighters-to-watch#ty-miller" })).toBe("ufc");
    expect(notificationSportLabel("ufc")).toBe("UFC");
  });

  it("recognizes the Contender Series in-app notification kind", () => {
    expect(notificationKinds).toContain("fighter_watchlist_added");
  });

  it("accepts the canonical UFC card-update notification kind", () => {
    expect(notificationKinds).toContain("picks_card_updated");
    expect(notificationSport({ kind: "picks_card_updated", route: "/picks" })).toBe("ufc");
    expect(notificationSport({ kind: "picks_card_updated", route: null })).toBe("ufc");
  });

  it("recognizes MLB notifications and routes them through the green baseball identity", () => {
    expect(notificationKinds).toContain("mlb_launch_available");
    expect(notificationKinds).toContain("mlb_challenge_available");
    expect(notificationKinds).toContain("mlb_challenge_four_hours");
    expect(notificationKinds).toContain("mlb_round_available");
    expect(notificationKinds).toContain("mlb_round_recap");
    expect(notificationSport({ kind: "mlb_launch_available", route: "/mlb" })).toBe("mlb");
    expect(notificationSport({ kind: "mlb_challenge_available", route: "/mlb/challenge" })).toBe("mlb");
    expect(notificationSport({ kind: "mlb_round_available", route: "/mlb/picks" })).toBe("mlb");
    expect(notificationSport({ kind: "mlb_round_recap", route: null })).toBe("mlb");
    expect(notificationSportLabel("mlb")).toBe("MLB");
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
