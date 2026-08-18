import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { PickSpotlight } from "../picks/spotlightModel";
import PublishedPicksSpotlightControl from "./PublishedPicksSpotlightControl";
import type { PickControlEvent } from "./pickControlModel";
import type { PickControlRepository } from "./pickControlRepository";

const spotlight: PickSpotlight = {
  boutId: "anthony-hernandez-gregory-rodrigues",
  preview: "Anthony Hernandez forces wrestling exchanges. Gregory Rodrigues needs space; the key is whether Rodrigues can stay separated.",
  red: {
    fighterSlug: "anthony-hernandez",
    record: "15-3-0 (1 NC)",
    age: "32",
    height: "6' 0\"",
    reach: "75\"",
    stance: "Orthodox",
    edges: ["Relentless takedown pressure", "Damage avoidance", "Submission threat"],
  },
  blue: {
    fighterSlug: "gregory-rodrigues",
    record: "19-6-0",
    age: "34",
    height: "6' 3\"",
    reach: "75\"",
    stance: "Orthodox",
    edges: ["High-volume striking", "Takedown resistance", "Efficient striking"],
  },
  watchSpotlights: [{ fighterSlug: "anthony-hernandez", url: "https://youtu.be/old" }],
  source: "UFCStats",
  generatedAt: "2026-08-18T19:00:00.000Z",
};

const event: PickControlEvent = {
  eventId: "ufc-sacramento",
  name: "UFC Fight Night",
  subtitle: "Hernandez vs. Rodrigues",
  venue: "Golden 1 Center",
  location: "Sacramento, California",
  startsAt: "2026-08-23T01:00:00.000Z",
  locksAt: "2026-08-23T00:00:00.000Z",
  season: 2026,
  status: "upcoming",
  canLock: true,
  canComplete: false,
  canReorder: true,
  hasReorderHistory: false,
  spotlights: [spotlight],
  bouts: [{
    boutId: spotlight.boutId,
    position: 1,
    weightClass: "Middleweight",
    redFighterSlug: "anthony-hernandez",
    redFighterName: "Anthony Hernandez",
    blueFighterSlug: "gregory-rodrigues",
    blueFighterName: "Gregory Rodrigues",
    resultStatus: "pending",
    winnerFighterSlug: null,
    resultRecordedAt: null,
    includedInPicks: true,
    canCancel: true,
    canRestore: false,
    canReplace: true,
    canRemoveFromPicks: true,
    canRestoreToPicks: false,
    hasReplacementHistory: false,
    hasRemovalHistory: false,
  }],
};

function repository(): PickControlRepository {
  return {
    loadControlEvent: vi.fn().mockResolvedValue(event),
    lockEvent: vi.fn().mockResolvedValue(undefined),
    adjustLockTime: vi.fn().mockResolvedValue(undefined),
    setCancellation: vi.fn().mockResolvedValue(undefined),
    setBoutInclusion: vi.fn().mockResolvedValue(undefined),
    replaceFighter: vi.fn().mockResolvedValue(undefined),
    reorderCard: vi.fn().mockResolvedValue(undefined),
    recordResult: vi.fn().mockResolvedValue(undefined),
    correctResult: vi.fn().mockResolvedValue(undefined),
    buildSpotlight: vi.fn().mockResolvedValue({ ...spotlight, generatedAt: "2026-08-18T20:00:00.000Z" }),
    saveSpotlights: vi.fn().mockResolvedValue(undefined),
    completeEvent: vi.fn().mockResolvedValue(undefined),
  };
}

afterEach(() => cleanup());

describe("published Fight Spotlight control", () => {
  it("reuses the canonical builder after the card is published", async () => {
    const repo = repository();
    render(<PublishedPicksSpotlightControl event={event} repository={repo} />);

    fireEvent.click(await screen.findByRole("button", { name: "REBUILD FROM UFCSTATS" }));

    await waitFor(() => expect(repo.buildSpotlight).toHaveBeenCalledWith(
      "ufc-sacramento",
      "anthony-hernandez-gregory-rodrigues",
    ));
  });

  it("updates the published Spotlight collection without republishing the card", async () => {
    const repo = repository();
    render(<PublishedPicksSpotlightControl event={event} repository={repo} />);

    const redUrl = await screen.findByLabelText("ANTHONY HERNANDEZ WATCH URL");
    fireEvent.change(redUrl, { target: { value: "https://youtu.be/new" } });
    fireEvent.click(screen.getByRole("button", { name: "UPDATE SPOTLIGHT" }));

    await waitFor(() => expect(repo.saveSpotlights).toHaveBeenCalledWith(
      "ufc-sacramento",
      [expect.objectContaining({
        boutId: "anthony-hernandez-gregory-rodrigues",
        watchSpotlights: [{ fighterSlug: "anthony-hernandez", url: "https://youtu.be/new" }],
      })],
    ));
  });
});
