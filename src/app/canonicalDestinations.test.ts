import { describe, expect, it } from "vitest";
import {
  canonicalDestinationPath,
  canonicalDestinationUrl,
  type CanonicalDestination,
} from "./canonicalDestinations";

describe("canonicalDestinationPath", () => {
  it.each<[CanonicalDestination, string]>([
    [{ kind: "fighter", fighterSlug: "jon-jones" }, "/fighters/jon-jones"],
    [{ kind: "ranking", fighterSlug: "georges-st-pierre" }, "/rankings?fighter=georges-st-pierre"],
    [
      {
        kind: "comparison",
        leftFighterSlug: "georges-st-pierre",
        rightFighterSlug: "anderson-silva",
      },
      "/rankings?compareLeft=georges-st-pierre&compareRight=anderson-silva",
    ],
    [
      { kind: "game-result", gameSlug: "find-leader", resultId: "result-42" },
      "/play/find-leader?result=result-42",
    ],
    [{ kind: "challenge", challengeId: "challenge-42" }, "/play?challenge=challenge-42"],
    [{ kind: "picks-event", eventId: "ufc-325" }, "/picks?event=ufc-325"],
    [{ kind: "picks-recap", eventId: "ufc-325" }, "/picks?event=ufc-325&view=recap"],
    [
      { kind: "war-room", conversationId: "ufc-325", messageId: "message-9" },
      "/war-room?conversation=ufc-325&message=message-9",
    ],
  ])("builds the stable route for %o", (destination, expected) => {
    expect(canonicalDestinationPath(destination)).toBe(expected);
  });

  it("preserves comparison orientation", () => {
    expect(
      canonicalDestinationPath({
        kind: "comparison",
        leftFighterSlug: "anderson-silva",
        rightFighterSlug: "georges-st-pierre",
      }),
    ).toBe("/rankings?compareLeft=anderson-silva&compareRight=georges-st-pierre");
  });

  it("makes notification targets resolve to the real feature destination", () => {
    expect(
      canonicalDestinationPath({
        kind: "notification-target",
        target: { kind: "picks-recap", eventId: "ufc-325" },
      }),
    ).toBe("/picks?event=ufc-325&view=recap");
  });

  it("trims and safely encodes identifiers", () => {
    expect(
      canonicalDestinationPath({ kind: "fighter", fighterSlug: "  fighter/name  " }),
    ).toBe("/fighters/fighter%2Fname");
  });

  it("rejects incomplete destinations", () => {
    expect(() => canonicalDestinationPath({ kind: "challenge", challengeId: "  " })).toThrow(
      "challenge is required",
    );
  });
});

describe("canonicalDestinationUrl", () => {
  it("builds an absolute same-origin share URL", () => {
    expect(
      canonicalDestinationUrl(
        { kind: "fighter", fighterSlug: "jon-jones" },
        "https://octagon.hq-app.workers.dev/current/path",
      ),
    ).toBe("https://octagon.hq-app.workers.dev/fighters/jon-jones");
  });

  it("rejects non-web origins", () => {
    expect(() =>
      canonicalDestinationUrl({ kind: "fighter", fighterSlug: "jon-jones" }, "file:///tmp/app"),
    ).toThrow("appOrigin must use http or https");
  });
});
