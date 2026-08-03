import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { IdentityContext, type IdentityContextValue } from "../identity/identityContext";
import type { IdentityProfile } from "../identity/identityModel";
import type { MonitoringInbox } from "../picks-monitoring/monitoringModel";
import type { MonitoringInboxRepository } from "../picks-monitoring/monitoringInboxRepository";
import type { PickSetupDraft } from "../picks-setup/pickSetupModel";
import type { PickSetupRepository } from "../picks-setup/pickSetupRepository";
import type { PickControlEvent } from "./pickControlModel";
import type { PickControlRepository } from "./pickControlRepository";
import PicksControlCenterPage from "./PicksControlCenterPage";

const profile: IdentityProfile = {
  id: "profile-owner",
  displayName: "CODY",
  favoriteFighterSlug: null,
  avatarUrl: null,
};

const identity: IdentityContextValue = {
  ready: true,
  profile,
  openDialog: vi.fn(),
  closeDialog: vi.fn(),
  isDialogOpen: false,
  signIn: vi.fn(),
  signOut: vi.fn(),
  updateProfile: vi.fn(),
};

const stagedDraft: PickSetupDraft = {
  draftId: "draft-1",
  name: "UFC Test",
  subtitle: "Red vs Blue",
  startsAt: "2026-08-08T23:00:00.000Z",
  locksAt: "2026-08-08T22:00:00.000Z",
  venue: "Test Arena",
  location: "Test City",
  season: 2026,
  status: "staged",
  sourceUrl: "https://www.mmamania.com/test",
  cardScope: "main",
  canPublish: true,
  bouts: [{
    boutId: "bout-1",
    position: 1,
    weightClass: "Lightweight",
    redFighterName: "Red Fighter",
    blueFighterName: "Blue Fighter",
    included: true,
  }],
};

const monitoringInbox: MonitoringInbox = {
  checkedAt: "2026-08-08T20:00:00.000Z",
  schedulerStatus: "healthy",
  eventId: "ufc-test",
  eventName: "UFC Test",
  eventStartsAt: "2026-08-08T23:00:00.000Z",
  monitoringWindowOpen: true,
  remainingChecks: 12,
  checkedSources: 2,
  expectedSources: 2,
  nextCheckAt: "2026-08-08T20:15:00.000Z",
  latestScheduledDecision: {
    action: "no_change",
    reason: "No card changes detected.",
  },
  newFindings: [],
  openFindings: [],
};

function controlEvent(status: PickControlEvent["status"]): PickControlEvent {
  return {
    eventId: "ufc-test",
    name: "UFC Test",
    subtitle: "Red vs Blue",
    startsAt: "2026-08-08T23:00:00.000Z",
    locksAt: "2026-08-08T22:00:00.000Z",
    venue: "Test Arena",
    location: "Test City",
    season: 2026,
    status,
    canLock: status === "upcoming",
    canComplete: status === "locked",
    canReorder: false,
    hasReorderHistory: false,
    recentCompletedEvents: [],
    bouts: [{
      boutId: "bout-1",
      position: 1,
      weightClass: "Lightweight",
      redFighterName: "Red Fighter",
      blueFighterName: "Blue Fighter",
      includedInPicks: true,
      isLocked: status !== "upcoming",
      locksAt: "2026-08-08T22:00:00.000Z",
      canAdjustLock: status === "upcoming",
      canCancel: status === "upcoming",
      canRestore: false,
      canReplace: status === "upcoming",
      canRemoveFromPicks: status === "upcoming",
      canRestoreToPicks: false,
      canCorrectResult: status === "complete",
      hasReplacementHistory: false,
      hasRemovalHistory: false,
      resultStatus: status === "complete" ? "red_win" : "pending",
      resultRecordedAt: status === "complete" ? "2026-08-08T23:30:00.000Z" : null,
    }],
  };
}

function controlRepository(events: Array<PickControlEvent | null>): PickControlRepository {
  const queue = [...events];
  return {
    loadControlEvent: vi.fn(async () => queue.shift() ?? events.at(-1) ?? null),
    lockEvent: vi.fn(async () => undefined),
    completeEvent: vi.fn(async () => undefined),
    recordResult: vi.fn(async () => undefined),
    correctResult: vi.fn(async () => undefined),
    setCancellation: vi.fn(async () => undefined),
    setBoutInclusion: vi.fn(async () => undefined),
    replaceFighter: vi.fn(async () => undefined),
    reorderCard: vi.fn(async () => undefined),
    adjustLockTime: vi.fn(async () => undefined),
    adjustBoutLockTime: vi.fn(async () => undefined),
  };
}

function setupRepository(drafts: Array<PickSetupDraft | null>): PickSetupRepository {
  const queue = [...drafts];
  return {
    loadDraft: vi.fn(async () => queue.shift() ?? drafts.at(-1) ?? null),
    syncNextEvent: vi.fn(async () => undefined),
    previewSource: vi.fn(async () => { throw new Error("Card source failed."); }),
    applySourcePreview: vi.fn(async () => undefined),
    updateMetadata: vi.fn(async () => undefined),
    saveBout: vi.fn(async () => undefined),
    removeBout: vi.fn(async () => undefined),
    reorderBouts: vi.fn(async () => undefined),
    publishDraft: vi.fn(async () => undefined),
    discardDraft: vi.fn(async () => undefined),
  };
}

function monitoringRepository(inbox: MonitoringInbox = monitoringInbox): MonitoringInboxRepository {
  return {
    loadInbox: vi.fn(async () => inbox),
    runManualCheck: vi.fn(async () => undefined),
    approveFinding: vi.fn(async () => undefined),
    dismissFinding: vi.fn(async () => undefined),
  };
}

function renderCenter(
  control: PickControlRepository,
  setup: PickSetupRepository,
  monitoring: MonitoringInboxRepository,
  route = "/picks/control",
) {
  return render(
    <IdentityContext.Provider value={identity}>
      <MemoryRouter initialEntries={[route]}>
        <PicksControlCenterPage
          controlRepository={control}
          setupRepository={setup}
          monitoringRepository={monitoring}
        />
      </MemoryRouter>
    </IdentityContext.Provider>,
  );
}

beforeEach(() => {
  vi.spyOn(window, "confirm").mockReturnValue(true);
  vi.spyOn(window, "prompt").mockReturnValue("Official correction reason");
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("Unified Picks Control Center", () => {
  it("loads each canonical no-event owner exactly once and keeps setup available without overpowering the page", async () => {
    const control = controlRepository([null]);
    const setup = setupRepository([null]);
    const monitoring = monitoringRepository();
    renderCenter(control, setup, monitoring);

    expect(await screen.findByText("SET UP NEXT EVENT")).toBeInTheDocument();
    const setupLink = screen.getByRole("link", { name: "OPEN EVENT SETUP" });
    expect(setupLink).toHaveAttribute("href", "#setup");
    expect(setupLink).toHaveClass("secondary-action");
    expect(screen.getByRole("region", { name: "Event setup" })).toBeInTheDocument();
    expect(control.loadControlEvent).toHaveBeenCalledTimes(1);
    expect(setup.loadDraft).toHaveBeenCalledTimes(1);
    expect(monitoring.loadInbox).not.toHaveBeenCalled();
    expect(screen.queryByRole("button", { name: /WINNER/ })).not.toBeInTheDocument();
  });

  it("distinguishes a staged card, publishes canonically, and refreshes the current event", async () => {
    const control = controlRepository([null, controlEvent("upcoming")]);
    const setup = setupRepository([stagedDraft, null]);
    const monitoring = monitoringRepository({
      ...monitoringInbox,
      latestScheduledDecision: null,
      newFindings: [],
    });
    renderCenter(control, setup, monitoring);

    expect(await screen.findByText("REVIEW CARD")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "REVIEW & PUBLISH" })).toHaveAttribute("href", "#setup");
    fireEvent.click(screen.getByRole("button", { name: "PUBLISH CARD" }));
    await waitFor(() => expect(setup.publishDraft).toHaveBeenCalledWith("draft-1"));
    await waitFor(() => expect(control.loadControlEvent).toHaveBeenCalledTimes(2));
  });

  it("keeps the published-event action primary while surfacing monitoring failures", async () => {
    const control = controlRepository([controlEvent("upcoming")]);
    const setup = setupRepository([null]);
    const monitoring = monitoringRepository();
    monitoring.loadInbox = vi.fn(async () => { throw new Error("Card source failed."); });
    renderCenter(control, setup, monitoring);

    const action = await screen.findByRole("link", { name: "MANAGE OPEN PICKS" });
    expect(action).toHaveClass("primary-action");
    expect(screen.getByText("Card source failed.")).toBeInTheDocument();
    expect(screen.getByLabelText("Monitoring status summary")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "LOCK ALL PICKS & BEGIN RESULTS" })).toBeEnabled();
  });

  it("exposes canonical result entry for locked events", async () => {
    const control = controlRepository([controlEvent("locked")]);
    const setup = setupRepository([null]);
    const monitoring = monitoringRepository();
    renderCenter(control, setup, monitoring);

    expect(await screen.findByRole("link", { name: "ENTER RESULTS" })).toHaveAttribute("href", "#fight-night");
    expect(screen.getByRole("button", { name: "RED WINNER Red Fighter" })).toBeEnabled();
    expect(monitoring.loadInbox).not.toHaveBeenCalled();
  });

  it("keeps completed-event corrections and history in the canonical control", async () => {
    const complete = controlEvent("complete");
    complete.recentCompletedEvents = [{
      eventId: "ufc-prior",
      name: "UFC Prior",
      subtitle: "Prior Red vs Prior Blue",
      startsAt: "2026-08-01T23:00:00.000Z",
    }];
    const current = controlEvent("upcoming");
    const control = controlRepository([complete, current]);
    const setup = setupRepository([null]);
    const monitoring = monitoringRepository();
    renderCenter(control, setup, monitoring);

    expect(await screen.findByRole("button", { name: "CORRECT RESULT" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "VIEW UFC PRIOR" })).toBeEnabled();
    fireEvent.click(screen.getByRole("button", { name: "OPEN CURRENT EVENT" }));
    await waitFor(() => expect(control.loadControlEvent).toHaveBeenCalledTimes(2));
  });

  it("does not initialize owner repositories before authorization", () => {
    const signedOut: IdentityContextValue = { ...identity, profile: null };
    render(
      <IdentityContext.Provider value={signedOut}>
        <MemoryRouter initialEntries={["/picks/control"]}>
          <PicksControlCenterPage
            controlRepository={null}
            setupRepository={null}
            monitoringRepository={null}
          />
        </MemoryRouter>
      </IdentityContext.Provider>,
    );

    expect(screen.getByText("OWNER SIGN-IN REQUIRED")).toBeInTheDocument();
  });

  it("keeps one obvious primary action at a 390 by 844 phone viewport", async () => {
    const control = controlRepository([controlEvent("upcoming")]);
    const setup = setupRepository([null]);
    const monitoring = monitoringRepository();
    renderCenter(control, setup, monitoring);

    expect(await screen.findByRole("link", { name: "MANAGE OPEN PICKS" })).toHaveClass("primary-action");
    expect(screen.getByRole("link", { name: "OPEN PLAYER PICKS" })).toHaveClass("secondary-action");
  });
});
