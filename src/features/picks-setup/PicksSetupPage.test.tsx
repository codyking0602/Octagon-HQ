import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { IdentityProvider } from "../identity/IdentityProvider";
import type { IdentityGateway } from "../identity/identityGateway";
import type { PickSetupDraft, PickSetupSourcePreview } from "./pickSetupModel";
import PicksSetupPage from "./PicksSetupPage";
import type { PickSetupRepository } from "./pickSetupRepository";

const cody = {
  id: "11111111-1111-4111-8111-111111111111",
  displayName: "CODY",
  initials: "CK",
};

const stagedDraft: PickSetupDraft = {
  draftId: "22222222-2222-4222-8222-222222222222",
  source: "UFC.com metadata + MMA Mania card",
  sourceEventKey: "event/ufc-test",
  sourceUrl: "https://www.mmamania.com/ufc-fight-cards/1/ufc-test",
  eventId: "ufc-test-2026-08-01",
  name: "UFC Fight Night",
  subtitle: "Red vs. Blue",
  venue: "Test Arena",
  location: "Dallas, Texas",
  startsAt: "2026-08-02T00:00:00.000Z",
  locksAt: "2026-08-02T00:00:00.000Z",
  season: 2026,
  state: "staged",
  syncedAt: "2026-07-26T20:00:00.000Z",
  updatedAt: "2026-07-26T20:00:00.000Z",
  warnings: [],
  canPublish: true,
  bouts: [{
    boutId: "main-event-red-fighter-blue-fighter",
    position: 1,
    weightClass: "Lightweight",
    redFighterSlug: "red-fighter",
    redFighterName: "Red Fighter",
    blueFighterSlug: "blue-fighter",
    blueFighterName: "Blue Fighter",
    included: true,
  }, {
    boutId: "main-second-fighter-third-fighter",
    position: 2,
    weightClass: "Welterweight",
    redFighterSlug: "second-fighter",
    redFighterName: "Second Fighter",
    blueFighterSlug: "third-fighter",
    blueFighterName: "Third Fighter",
    included: true,
  }],
};

const sourcePreview: PickSetupSourcePreview = {
  sourceHash: "abc123",
  requestedScope: "auto",
  effectiveScope: "main",
  source: "UFC.com metadata + MMA Mania card",
  sourceUrl: "https://www.mmamania.com/ufc-fight-cards/1/ufc-test",
  fightCount: 6,
  changes: ["Moved Red Fighter vs. Blue Fighter from prelims to main event."],
  warnings: [],
};

function gateway(): IdentityGateway {
  return {
    getSession: async () => ({ userId: cody.id }),
    subscribe: () => () => undefined,
    loadProfile: async () => cody,
    signIn: async () => undefined,
    createProfile: async () => undefined,
    signOut: async () => undefined,
  };
}

function repository(draft: PickSetupDraft | null): PickSetupRepository {
  return {
    loadDraft: vi.fn().mockResolvedValue(draft),
    syncNextEvent: vi.fn().mockResolvedValue(undefined),
    previewSource: vi.fn().mockResolvedValue(sourcePreview),
    applySourcePreview: vi.fn().mockResolvedValue(undefined),
    updateMetadata: vi.fn().mockResolvedValue(undefined),
    saveBout: vi.fn().mockResolvedValue(undefined),
    removeBout: vi.fn().mockResolvedValue(undefined),
    reorderBouts: vi.fn().mockResolvedValue(undefined),
    publishDraft: vi.fn().mockResolvedValue(undefined),
    discardDraft: vi.fn().mockResolvedValue(undefined),
  };
}

function renderPage(repo: PickSetupRepository) {
  return render(
    <MemoryRouter>
      <IdentityProvider gateway={gateway()}>
        <PicksSetupPage repository={repo} />
      </IdentityProvider>
    </MemoryRouter>,
  );
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("Event Setup and card review", () => {
  it("syncs the next event with automatic discovery when no source URL is entered", async () => {
    const repo = repository(null);
    renderPage(repo);

    fireEvent.click(await screen.findByRole("button", { name: "SYNC NEXT UFC EVENT" }));
    await waitFor(() => expect(repo.syncNextEvent).toHaveBeenCalledWith("auto", ""));
  });

  it("allows the owner to supply an exact MMA Mania article when discovery is unreliable", async () => {
    const repo = repository(null);
    renderPage(repo);

    const exactUrl = "https://www.mmamania.com/ufc-fight-cards/446488/latest-ufc-belgrade-fight-card";
    fireEvent.change(await screen.findByLabelText("MMA MANIA CARD URL (OPTIONAL)"), {
      target: { value: exactUrl },
    });
    fireEvent.click(screen.getByRole("button", { name: "SYNC NEXT UFC EVENT" }));

    await waitFor(() => expect(repo.syncNextEvent).toHaveBeenCalledWith("auto", exactUrl));
  });

  it("checks the saved source article without applying changes until owner confirmation", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    const repo = repository(stagedDraft);
    renderPage(repo);

    fireEvent.click(await screen.findByRole("button", { name: "CHECK FOR CARD UPDATES" }));
    await waitFor(() => expect(repo.previewSource).toHaveBeenCalledWith("auto", stagedDraft.sourceUrl));
    expect(repo.applySourcePreview).not.toHaveBeenCalled();
    expect(await screen.findByText("CARD CHANGES DETECTED")).toBeInTheDocument();
    expect(screen.getByText(sourcePreview.changes[0])).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "APPLY SOURCE CHANGES" }));
    await waitFor(() => expect(repo.applySourcePreview).toHaveBeenCalledWith(sourcePreview));
  });

  it("uses the full-card override with the saved source article", async () => {
    const repo = repository(stagedDraft);
    renderPage(repo);

    fireEvent.click(await screen.findByRole("button", { name: /FULL CARD Main card, prelims/i }));
    fireEvent.click(screen.getByRole("button", { name: "CHECK FOR CARD UPDATES" }));
    await waitFor(() => expect(repo.previewSource).toHaveBeenCalledWith("full", stagedDraft.sourceUrl));
  });

  it("keeps review edits staged and publishes only after confirmation", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    const repo = repository(stagedDraft);
    renderPage(repo);

    expect(await screen.findByRole("heading", { name: "UFC Fight Night" })).toBeInTheDocument();
    expect(screen.getByText("STAGED CARD · NOT LIVE")).toBeInTheDocument();
    expect(screen.getByText("2 fights included")).toBeInTheDocument();
    expect(screen.getByText("MAIN EVENT")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("VENUE"), { target: { value: "Updated Arena" } });
    fireEvent.click(screen.getByRole("button", { name: "SAVE EVENT DETAILS" }));
    await waitFor(() => expect(repo.updateMetadata).toHaveBeenCalledWith(
      stagedDraft.draftId,
      expect.objectContaining({ venue: "Updated Arena" }),
    ));

    fireEvent.click(screen.getByRole("button", { name: /Move Red Fighter vs Blue Fighter down/i }));
    await waitFor(() => expect(repo.reorderBouts).toHaveBeenCalledWith(
      stagedDraft.draftId,
      ["main-second-fighter-third-fighter", "main-event-red-fighter-blue-fighter"],
    ));

    fireEvent.click(screen.getByRole("button", { name: "PUBLISH CARD" }));
    await waitFor(() => expect(repo.publishDraft).toHaveBeenCalledWith(stagedDraft.draftId));
  });

  it("shows warnings and disables publish for an incomplete staged card", async () => {
    const repo = repository({
      ...stagedDraft,
      venue: "",
      warnings: ["MISSING VENUE"],
      canPublish: false,
    });
    renderPage(repo);

    expect(await screen.findByText("MISSING VENUE")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "PUBLISH CARD" })).toBeDisabled();
  });
});
