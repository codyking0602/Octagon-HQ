import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { IdentityProvider } from "../identity/IdentityProvider";
import type { IdentityGateway } from "../identity/identityGateway";
import type { PickSetupBout, PickSetupDraft, PickSetupSourcePreview, PickSetupSpotlight } from "./pickSetupModel";
import PicksSetupPage from "./PicksSetupPage";
import type { PickSetupRepository } from "./pickSetupRepository";

const cody = {
  id: "11111111-1111-4111-8111-111111111111",
  displayName: "CODY",
  initials: "CK",
};

const stagedDraft: PickSetupDraft = {
  draftId: "22222222-2222-4222-8222-222222222222",
  source: "MMA Mania",
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
  spotlights: [],
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

function builtSpotlight(bout: PickSetupBout): PickSetupSpotlight {
  return {
    boutId: bout.boutId,
    preview: `${bout.redFighterName} brings the higher striking volume while ${bout.blueFighterName} answers with stronger wrestling and defensive numbers.`,
    red: {
      fighterSlug: bout.redFighterSlug,
      record: "8-1-0",
      age: "28",
      height: "6' 0\"",
      reach: "75\"",
      stance: "Orthodox",
      edges: ["5.0 significant strikes landed/min"],
    },
    blue: {
      fighterSlug: bout.blueFighterSlug,
      record: "10-2-0",
      age: "30",
      height: "5' 11\"",
      reach: "73\"",
      stance: "Southpaw",
      edges: ["3.1 takedowns per 15 min"],
    },
    watchSpotlights: [],
    source: "UFCStats",
    generatedAt: "2026-07-27T00:00:00.000Z",
  };
}

function previewBout(position: number, red: string, blue: string): PickSetupBout {
  const slug = (value: string) => value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return {
    boutId: `${position === 1 ? "main-event" : "main"}-${slug(red)}-${slug(blue)}`,
    position,
    weightClass: "",
    redFighterSlug: slug(red),
    redFighterName: red,
    blueFighterSlug: slug(blue),
    blueFighterName: blue,
    included: true,
  };
}

const sourcePreview: PickSetupSourcePreview = {
  sourceHash: "abc123",
  requestedScope: "auto",
  effectiveScope: "main",
  source: "MMA Mania",
  sourceUrl: "https://www.mmamania.com/ufc-fight-cards/446488/latest-ufc-belgrade-fight-card",
  fightCount: 4,
  changes: ["Venue changed."],
  warnings: [],
  event: {
    name: "UFC Fight Night",
    subtitle: "Uroš Medić vs. Daniel Rodriguez",
    venue: "Belgrade Arena",
    location: "Belgrade, Serbia",
    startsAt: "2026-08-01T17:00:00.000Z",
    locksAt: "2026-08-01T17:00:00.000Z",
    bouts: [
      previewBout(1, "Uroš Medić", "Daniel Rodriguez"),
      previewBout(2, "Marcin Tybura", "Aleksandar Rakić"),
      previewBout(3, "Ante Delija", "Johnny Walker"),
      previewBout(4, "Jan Błachowicz", "Bogdan Guskov"),
    ],
  },
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
    buildSpotlight: vi.fn().mockImplementation(async (_draftId: string, boutId: string) => {
      const bout = stagedDraft.bouts.find((candidate) => candidate.boutId === boutId)!;
      return builtSpotlight(bout);
    }),
    saveSpotlights: vi.fn().mockResolvedValue(undefined),
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
    fireEvent.change(await screen.findByPlaceholderText("https://www.mmamania.com/..."), { target: { value: exactUrl } });
    fireEvent.click(screen.getByRole("button", { name: "SYNC NEXT UFC EVENT" }));
    await waitFor(() => expect(repo.syncNextEvent).toHaveBeenCalledWith("auto", exactUrl));
  });

  it("shows the clean prospective event and hides polluted staged fields before apply", async () => {
    const pollutedDraft = { ...stagedDraft, venue: `src="https://www.googletagmanager.com/ns.html?id=GTM-WFBHZX5"`, location: "Skip to main <iframe> UFC" };
    const repo = repository(pollutedDraft);
    renderPage(repo);
    fireEvent.click(await screen.findByRole("button", { name: "CHECK FOR CARD UPDATES" }));
    expect(await screen.findByText("SOURCE REVIEW · NOT APPLIED")).toBeInTheDocument();
    expect(screen.getAllByText("Uroš Medić vs. Daniel Rodriguez").length).toBeGreaterThan(0);
    expect(screen.getByText("Marcin Tybura vs. Aleksandar Rakić")).toBeInTheDocument();
    expect(document.body.textContent).not.toMatch(/iframe|googletagmanager|skip to main|src=/i);
    expect(repo.applySourcePreview).not.toHaveBeenCalled();
  });

  it("checks the saved source article without applying changes until owner confirmation", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    const repo = repository(stagedDraft);
    renderPage(repo);
    await waitFor(() => expect(screen.getByPlaceholderText("https://www.mmamania.com/...")).toHaveValue(stagedDraft.sourceUrl));
    fireEvent.click(await screen.findByRole("button", { name: "CHECK FOR CARD UPDATES" }));
    await waitFor(() => expect(repo.previewSource).toHaveBeenCalledWith("auto", stagedDraft.sourceUrl));
    expect(repo.applySourcePreview).not.toHaveBeenCalled();
    expect(await screen.findByText("CARD CHANGES DETECTED")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "APPLY SOURCE CHANGES" }));
    await waitFor(() => expect(repo.applySourcePreview).toHaveBeenCalledWith(sourcePreview));
  });

  it("uses the full-card override with the saved source article", async () => {
    const repo = repository(stagedDraft);
    renderPage(repo);
    await waitFor(() => expect(screen.getByPlaceholderText("https://www.mmamania.com/...")).toHaveValue(stagedDraft.sourceUrl));
    fireEvent.click((await screen.findByText("FULL CARD")).closest("button")!);
    fireEvent.click(screen.getByRole("button", { name: "CHECK FOR CARD UPDATES" }));
    await waitFor(() => expect(repo.previewSource).toHaveBeenCalledWith("full", stagedDraft.sourceUrl));
  });

  it("offers every included fight as an independent full Spotlight and saves the built package", async () => {
    const repo = repository(stagedDraft);
    renderPage(repo);

    const addButtons = await screen.findAllByRole("button", { name: "ADD SPOTLIGHT" });
    expect(addButtons).toHaveLength(2);
    fireEvent.click(addButtons[0]!);

    await waitFor(() => expect(repo.buildSpotlight).toHaveBeenCalledWith(
      stagedDraft.draftId,
      "main-event-red-fighter-blue-fighter",
    ));
    expect(await screen.findByText(/Red Fighter brings the higher striking volume/)).toBeInTheDocument();
    expect(screen.getByText("8-1-0")).toBeInTheDocument();
    expect(screen.getByText("5.0 significant strikes landed/min")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("RED FIGHTER WATCH URL"), { target: { value: "https://youtu.be/red-fighter" } });
    fireEvent.change(screen.getByLabelText("BLUE FIGHTER WATCH URL"), { target: { value: "https://youtu.be/blue-fighter" } });
    fireEvent.click(screen.getByRole("button", { name: "SAVE SPOTLIGHT" }));

    await waitFor(() => expect(repo.saveSpotlights).toHaveBeenCalledWith(
      stagedDraft.draftId,
      [expect.objectContaining({
        boutId: "main-event-red-fighter-blue-fighter",
        preview: expect.stringContaining("Red Fighter"),
        red: expect.objectContaining({ fighterSlug: "red-fighter", record: "8-1-0" }),
        blue: expect.objectContaining({ fighterSlug: "blue-fighter", record: "10-2-0" }),
        watchSpotlights: [
          { fighterSlug: "red-fighter", url: "https://youtu.be/red-fighter" },
          { fighterSlug: "blue-fighter", url: "https://youtu.be/blue-fighter" },
        ],
      })],
    ));
  });

  it("keeps review edits staged before publish", async () => {
    const repo = repository(stagedDraft);
    renderPage(repo);
    expect(await screen.findByRole("heading", { name: "UFC Fight Night" })).toBeInTheDocument();
    expect(screen.getByText("2 fights included")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("VENUE"), { target: { value: "Updated Arena" } });
    fireEvent.click(screen.getByRole("button", { name: "SAVE EVENT DETAILS" }));
    await waitFor(() => expect(repo.updateMetadata).toHaveBeenCalledWith(
      stagedDraft.draftId,
      expect.objectContaining({ venue: "Updated Arena" }),
    ));

    const moveDown = screen.getByRole("button", { name: /Move Red Fighter vs Blue Fighter down/i });
    await waitFor(() => expect(moveDown).toBeEnabled());
    fireEvent.click(moveDown);
    await waitFor(() => expect(repo.reorderBouts).toHaveBeenCalledWith(
      stagedDraft.draftId,
      ["main-second-fighter-third-fighter", "main-event-red-fighter-blue-fighter"],
    ));
    expect(repo.publishDraft).not.toHaveBeenCalled();
  });

  it("publishes only after owner confirmation", async () => {
    const confirm = vi.spyOn(window, "confirm")
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true);
    const repo = repository(stagedDraft);
    renderPage(repo);

    const publish = await screen.findByRole("button", { name: "PUBLISH CARD" });
    await waitFor(() => expect(publish).toBeEnabled());

    fireEvent.click(publish);
    expect(confirm).toHaveBeenCalledTimes(1);
    expect(repo.publishDraft).not.toHaveBeenCalled();

    fireEvent.click(publish);
    await waitFor(() => expect(repo.publishDraft).toHaveBeenCalledWith(stagedDraft.draftId));
    expect(confirm).toHaveBeenCalledTimes(2);
  });

  it("shows warnings and disables publish for an incomplete staged card", async () => {
    const repo = repository({ ...stagedDraft, venue: "", warnings: ["MISSING VENUE"], canPublish: false });
    renderPage(repo);
    expect(await screen.findByText("MISSING VENUE")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "PUBLISH CARD" })).toBeDisabled();
  });
});
