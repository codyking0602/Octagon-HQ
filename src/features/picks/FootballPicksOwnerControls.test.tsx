import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useIdentity } from "../identity/IdentityProvider";
import FootballPushControl from "../picks-control/FootballPushControl";
import type { PickControlRepository } from "../picks-control/pickControlRepository";
import FootballPicksPage from "./FootballPicksPage";
import { usePicks } from "./PicksProvider";

vi.mock("../identity/IdentityProvider", () => ({ useIdentity: vi.fn() }));
vi.mock("./PicksProvider", () => ({ usePicks: vi.fn() }));
vi.mock("./FootballFuturesCard", () => ({ FootballFuturesCard: () => null }));
vi.mock("./GroupPickProgress", () => ({ GroupPickProgress: () => null }));
vi.mock("./GroupPickReveal", () => ({ GroupPickReveal: () => null }));

const footballEvent = {
  eventId: "football-picks-2026-09-08",
  name: "Football Picks · Week of Sep 8",
  subtitle: "Weekly ATS slate",
  venue: "Multiple venues",
  location: "NFL + College Football",
  startsAt: "2026-09-10T00:20:00Z",
  locksAt: "2026-09-10T00:20:00Z",
  season: 2026,
  status: "upcoming" as const,
  canLock: true,
  canComplete: false,
  canReorder: false,
  hasReorderHistory: false,
  bouts: [],
};

describe("Football Picks owner controls", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("keeps the owner back-room link available while the weekly slate is still being set", () => {
    vi.mocked(useIdentity).mockReturnValue({
      profile: { id: "owner", canControlPicks: true },
      ready: true,
      openDialog: vi.fn(),
    } as never);
    vi.mocked(usePicks).mockReturnValue({
      loading: false,
      error: "",
      event: null,
      selections: {},
      footballLocks: {},
      footballFutures: null,
      history: { season: null, summary: {}, events: [] },
    } as never);

    render(<MemoryRouter><FootballPicksPage /></MemoryRouter>);

    expect(screen.getByRole("link", { name: /MANAGE EVENT \/ SETUP/ })).toHaveAttribute(
      "href",
      "/picks/control?sport=football#setup",
    );
  });

  it("loads the published Football event and sends the existing owner push with its exact title", async () => {
    const loadControlEvent = vi.fn(async () => footballEvent);
    const sendEventPush = vi.fn(async () => undefined);
    const repository = { loadControlEvent, sendEventPush } as unknown as PickControlRepository;
    vi.spyOn(window, "confirm").mockReturnValue(true);

    render(<FootballPushControl eventId={footballEvent.eventId} repository={repository} />);

    const button = await screen.findByRole("button", { name: "SEND PUSH" });
    await waitFor(() => expect(button).toBeEnabled());
    fireEvent.click(button);

    expect(window.confirm).toHaveBeenCalledWith(`Send push notification for ${footballEvent.name}?`);
    await waitFor(() => expect(sendEventPush).toHaveBeenCalledWith(footballEvent.eventId, footballEvent.name));
    expect(await screen.findByRole("status")).toHaveTextContent(`Push notification sent for ${footballEvent.name}.`);
  });
});
