import { describe, expect, it } from "vitest";
import { resolvePicksDestination } from "./picksDestination";

const archivedEventIds = ["ufc-325", "ufc-fight-night-dallas"];

describe("resolvePicksDestination", () => {
  it("resolves a canonical archived Picks event", () => {
    expect(
      resolvePicksDestination(new URLSearchParams("event=ufc-325"), archivedEventIds),
    ).toEqual({
      kind: "archived-event",
      eventId: "ufc-325",
      recapRequested: false,
    });
  });

  it("preserves an exact recap request", () => {
    expect(
      resolvePicksDestination(
        new URLSearchParams("event=ufc-325&view=recap"),
        archivedEventIds,
      ),
    ).toEqual({
      kind: "archived-event",
      eventId: "ufc-325",
      recapRequested: true,
    });
  });

  it("hands a legacy recap request to the newest archived event", () => {
    expect(resolvePicksDestination(new URLSearchParams("view=recap"), archivedEventIds)).toEqual({
      kind: "archived-event",
      eventId: "ufc-325",
      recapRequested: true,
    });
  });

  it("safely ignores unknown explicit events", () => {
    expect(
      resolvePicksDestination(new URLSearchParams("event=unknown&view=recap"), archivedEventIds),
    ).toEqual({ kind: "none" });
  });

  it("does not treat unsupported views as recap requests", () => {
    expect(
      resolvePicksDestination(
        new URLSearchParams("event=ufc-325&view=standings"),
        archivedEventIds,
      ),
    ).toEqual({
      kind: "archived-event",
      eventId: "ufc-325",
      recapRequested: false,
    });
  });
});
