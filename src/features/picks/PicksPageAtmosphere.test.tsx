import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { useIdentity } from "../identity/IdentityProvider";
import PicksPage from "./PicksPage";
import { usePicks } from "./PicksProvider";
import type { PickEvent } from "./picksModel";

vi.mock("../identity/IdentityProvider", () => ({ useIdentity: vi.fn() }));
vi.mock("./PicksProvider", () => ({ usePicks: vi.fn() }));
vi.mock("./FighterThumbnail", () => ({ FighterThumbnail: () => <span data-testid="fighter-thumb" /> }));
vi.mock("./GroupPickProgress", () => ({ GroupPickProgress: () => null }));
vi.mock("./GroupPickReveal", () => ({ GroupPickReveal: () => null }));
vi.mock("./MainEventSpotlight", () => ({ MainEventSpotlight: () => null }));
vi.mock("./PicksSeasonHub", () => ({ PicksSeasonHub: () => null }));
vi.mock("../../lib/supabase", () => ({
  getSupabaseClient: () => ({
    storage: {
      from: (bucket: string) => ({
        getPublicUrl: (path: string) => ({
          data: { publicUrl: `https://storage.test/${bucket}/${path}` },
        }),
      }),
    },
  }),
}));

const event: PickEvent = {
  eventId: "ufc-atmosphere-test",
  name: "UFC Fight Night",
  subtitle: "Hernandez vs. Rodrigues",
  venue: "UFC Apex",
  location: "Las Vegas, Nevada",
  startsAt: "2099-08-22T23:00:00.000Z",
  locksAt: "2099-08-22T23:00:00.000Z",
  season: 2026,
  status: "upcoming",
  headerStoragePath: "ufc-atmosphere-test/event-header",
  headerNaturalWidth: 2400,
  headerNaturalHeight: 1200,
  bouts: [{
    boutId: "hernandez-rodrigues",
    position: 1,
    weightClass: "Middleweight",
    redFighterSlug: "anthony-hernandez",
    redFighterName: "Anthony Hernandez",
    blueFighterSlug: "gregory-rodrigues",
    blueFighterName: "Gregory Rodrigues",
    redAmericanOdds: -165,
    blueAmericanOdds: 140,
    oddsSource: "DraftKings",
    oddsUpdatedAt: "2026-08-18T20:00:00.000Z",
    winnerFighterSlug: null,
  }],
};

function mockPicks(currentEvent: PickEvent) {
  vi.mocked(usePicks).mockReturnValue({
    event: currentEvent,
    loading: false,
    selections: {},
    underdogLock: null,
    savingBoutId: null,
    savingLock: false,
    error: null,
    history: null,
    setPick: vi.fn(),
    setUnderdogLock: vi.fn(),
    clearUnderdogLock: vi.fn(),
  } as never);
}

beforeEach(() => {
  vi.mocked(useIdentity).mockReturnValue({
    profile: { id: "cody", displayName: "CODY", initials: "CK" },
    openDialog: vi.fn(),
  } as never);
  mockPicks(event);
});

afterEach(cleanup);

describe("PicksPage event atmosphere", () => {
  it("shares the persisted event artwork with the page while preserving the existing hero", async () => {
    const { container } = render(<MemoryRouter><PicksPage /></MemoryRouter>);

    await screen.findByText("Hernandez vs. Rodrigues");
    const page = container.querySelector(".picks-page");
    const hero = container.querySelector(".picks-event-hero");

    expect(page).toHaveClass("has-event-atmosphere");
    expect(page).toHaveStyle('--picks-event-poster: url("https://storage.test/pick-event-headers/ufc-atmosphere-test/event-header")');
    expect(page).toHaveStyle("--picks-event-poster-aspect: 2400 / 1200");
    expect(hero).toHaveClass("has-poster");
    expect(hero).not.toHaveAttribute("style");
  });

  it("does not add event atmosphere without persisted header artwork", async () => {
    mockPicks({
      ...event,
      headerStoragePath: undefined,
      headerNaturalWidth: undefined,
      headerNaturalHeight: undefined,
    });

    const { container } = render(<MemoryRouter><PicksPage /></MemoryRouter>);

    await screen.findByText("Hernandez vs. Rodrigues");
    expect(container.querySelector(".picks-page")).not.toHaveClass("has-event-atmosphere");
    expect(container.querySelector(".picks-event-hero")).not.toHaveClass("has-poster");
  });
});
