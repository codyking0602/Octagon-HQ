import { describe, expect, it } from "vitest";
import type { PickEvent } from "../picks/picksModel";
import type { WhatsNewItem } from "../whats-new/whatsNewModel";
import { buildUpNextAction, newestUnreadResultOrRecap } from "./upNextModel";

function event(overrides: Partial<PickEvent> = {}): PickEvent {
  return {
    eventId: "ufc-999",
    name: "UFC 999",
    subtitle: "Example vs. Example",
    venue: "T-Mobile Arena",
    location: "Las Vegas, NV",
    startsAt: "2026-09-06T02:00:00.000Z",
    locksAt: "2026-09-06T00:00:00.000Z",
    season: 2026,
    status: "upcoming",
    bouts: [
      {
        boutId: "main",
        position: 1,
        weightClass: "Lightweight",
        redFighterSlug: "red",
        redFighterName: "Red Fighter",
        blueFighterSlug: "blue",
        blueFighterName: "Blue Fighter",
        redAmericanOdds: -110,
        blueAmericanOdds: -110,
        winnerFighterSlug: null,
      },
    ],
    ...overrides,
  };
}

function recap(overrides: Partial<WhatsNewItem> = {}): WhatsNewItem {
  return {
    id: "recap-1",
    sourceKey: "picks:ufc-998",
    kind: "picks_event_completed",
    category: "picks",
    origin: "automatic",
    title: "UFC 998 Picks recap is ready",
    summary: "See the final group results and your record.",
    route: "/picks/history/ufc-998",
    actionLabel: "VIEW RECAP",
    publishedAt: "2026-09-01T14:00:00.000Z",
    lifecycle: "active",
    isRead: false,
    ...overrides,
  };
}

const challengeAction = {
  title: "SHANE is waiting for your answer",
  description: "Find the Leader challenge is ready.",
  label: "RESPOND TO CHALLENGE",
  to: "/play/find-leader?challenge=MATCH123",
};

function build(overrides: Partial<Parameters<typeof buildUpNextAction>[0]> = {}) {
  return buildUpNextAction({
    signedIn: true,
    picksEvent: event(),
    selections: {},
    playedToday: false,
    currentStreak: 4,
    dailyChallengeTitle: "Find the Leader",
    dailyChallengeRoute: "/play/today",
    challengeAction,
    whatsNewItems: [recap()],
    ...overrides,
  });
}

describe("Home Up Next priority", () => {
  it("uses exactly the locked Picks → daily → challenge → recap → event priority", () => {
    expect(build()?.kind).toBe("picks");

    expect(build({ selections: { main: "red" } })?.kind).toBe("daily");

    expect(build({ selections: { main: "red" }, playedToday: true })?.kind).toBe("challenge");

    expect(build({
      selections: { main: "red" },
      playedToday: true,
      challengeAction: null,
    })?.kind).toBe("recap");

    expect(build({
      selections: { main: "red" },
      playedToday: true,
      challengeAction: null,
      whatsNewItems: [],
    })?.kind).toBe("event");
  });

  it("treats an open repick as urgent even when the bout still has a saved selection", () => {
    const repickEvent = event({
      bouts: [{ ...event().bouts[0], repickRequired: true }],
    });
    const action = build({ picksEvent: repickEvent, selections: { main: "red" } });

    expect(action?.kind).toBe("picks");
    expect(action?.label).toBe("UPDATE UFC PICKS");
  });

  it("does not turn locked or completed Picks into an urgent action", () => {
    expect(build({ picksEvent: event({ status: "locked" }) })?.kind).toBe("daily");
    expect(build({
      picksEvent: event({ status: "complete" }),
      playedToday: true,
      challengeAction: null,
      whatsNewItems: [],
    })).toBeNull();
  });

  it("uses only active unread result/recap items for the new-result slot", () => {
    expect(newestUnreadResultOrRecap([
      recap({ isRead: true }),
      recap({ id: "announcement", kind: "app_announcement", isRead: false }),
      recap({ id: "archive", lifecycle: "archive", isRead: false }),
    ])).toBeNull();

    expect(newestUnreadResultOrRecap([
      recap({ id: "new-recap", kind: "new_recap", isRead: false }),
    ])?.id).toBe("new-recap");
  });

  it("keeps signed-out Home non-personalized and falls through to the scheduled event", () => {
    const action = build({ signedIn: false });

    expect(action?.kind).toBe("event");
    expect(action?.to).toBe("/picks");
  });
});
