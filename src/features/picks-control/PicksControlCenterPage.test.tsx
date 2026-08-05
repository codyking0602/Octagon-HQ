import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { IdentityProvider } from "../identity/IdentityProvider";
import type { IdentityGateway } from "../identity/identityGateway";
import type { MonitoringInbox } from "../picks-monitoring/monitoringInboxModel";
import type { MonitoringInboxRepository } from "../picks-monitoring/monitoringInboxRepository";
import type { PickSetupDraft } from "../picks-setup/pickSetupModel";
import type { PickSetupRepository } from "../picks-setup/pickSetupRepository";
import type { PickControlEvent } from "./pickControlModel";
import type { PickControlRepository } from "./pickControlRepository";
import PicksControlCenterPage from "./PicksControlCenterPage";

const owner = {
  id: "11111111-1111-4111-8111-111111111111",
  displayName: "CODY",
  initials: "CK",
};

function gateway(profile: typeof owner | null = owner): IdentityGateway {
  return {
    getSession: async () => ({ userId: owner.id }),
    subscribe: () => () => undefined,
    loadProfile: async () => profile,
    signIn: async () => undefined,
    createProfile: async () => undefined,
    signOut: async () => undefined,
  };
}

function controlEvent(
  status: PickControlEvent["status"],
  resultStatus: PickControlEvent["bouts"][number]["resultStatus"] = "pending",
): PickControlEvent {
  return {
    eventId: "ufc-control",
    name: "UFC Control",
    subtitle: "Red Fighter vs. Blue Fighter",
    venue: "Test Arena",
    location: "Dallas, Texas",
    startsAt: "2099-08-09T04:00:00.000Z",
    locksAt: "2099-08-09T03:00:00.000Z",
    season: 2099,
    status,
    canLock: status === "upcoming",
    canComplete: status === "locked" && resultStatus !== "pending",
    canReorder: status === "upcoming",
    hasReorderHistory: false,
    recentCompletedEvents: status === "complete" ? [{
      eventId: "older-event",
      name: "UFC Older Event",
      startsAt: "2099-08-02T04:00:00.000Z",
      completedAt: "2099-08-02T06:00:00.000Z",
    }] : [],
    bouts: [{
      boutId: "red-blue",
      position: 1,
      weightClass: "Lightweight",
      redFighterSlug: "red-fighter",
      redFighterName: "Red Fighter",
      blueFighterSlug: "blue-fighter",
      blueFighterName: "Blue Fighter",
      resultStatus,
      winnerFighterSlug: resultStatus === "red_win" ? "red-fighter" : null,
      resultRecordedAt: resultStatus === "pending" ? null : "2099-08-09T03:30:00.000Z",
      includedInPicks: true,
      canCancel: false,
      canRestore: false,
      canReplace: false,
      canRemoveFromPicks: false,
      canRestoreToPicks: false,
      canCorrectResult: resultStatus !== "pending",
      hasReplacementHistory: false,
      hasRemovalHistory: false,
      hasCorrectionHistory: false,
    }],
  };
}

const stagedDraft: PickSetupDraft = {
  draftId: "draft",
  source: "UFC.com + MMA Mania",
  sourceEventKey: "ufc-staged",
  sourceUrl: "https://example.com/card",
  eventId: "ufc-staged",
  name: "UFC Staged",
  subtitle: "Alpha vs. Beta",
  venue: "Staged Arena",
  location: "Las Vegas, Nevada",
  startsAt: "2099-08-16T04:00:00.000Z",
  locksAt: "2099-08-16T03:00:00.000Z",
  season: 2099,
  state: "staged",
  syncedAt: "2099-08-01T12:00:00.000Z",
  updatedAt: "2099-08-01T12:00:00.000Z",
  warnings: [],
  canPublish: true,
  bouts: [{
    boutId: "main-event-alpha-beta",
    position: 1,
    weightClass: "Welterweight",
    redFighterSlug: "alpha",
    redFighterName: "Alpha",
    blueFighterSlug: "beta",
    blueFighterName: "Beta",
    included: true,
  }],
};

const monitoringInbox: MonitoringInbox = {
  generatedAt: "2099-08-01T12:00:00.000Z",
  scheduler: {
    jobId: 7,
    jobName: "octagon-hq-pick-monitoring",
    schedule: "7 * * * *",
    active: true,
    tokenConfigured: true,
    lastWakeStatus: "succeeded",
    lastWakeStartedAt: "2099-08-01T12:07:00.000Z",
    lastWakeEndedAt: "2099-08-01T12:07:02.000Z",
  },
  monitoredEvent: {
    kind: "current",
    eventId: "ufc-control",
    sourceEventIdentity: "ufc-control",
    name: "UFC Control",
    subtitle: "Red Fighter vs. Blue Fighter",
    startsAt: "2099-08-09T04:00:00.000Z",
    locksAt: "2099-08-09T03:00:00.000Z",
    boutCount: 1,
  },
  scheduleState: {
    sourceEventIdentity: "ufc-control",
    nextEligibleAt: "2099-08-01T18:00:00.000Z",
    leaseUntil: null,
    lastClaimedAt: "2099-08-01T12:07:00.000Z",
    updatedAt: "2099-08-01T12:07:02.000Z",
  },
  latestScheduledDecision: {
    outcome: "failed",
    reason: "card_source_failed",
    attemptedAt: "2099-08-01T12:07:00.000Z",
    providerCalled: false,
  },
  latestRun: null,
  unresolvedCount: 1,
  newFindings: [{
    findingId: "finding",
    runId: "run",
    triggerKind: "scheduled",
    runStatus: "failed",
    findingKey: "provider-error",
    findingType: "provider_error",
    severity: "error",
    reviewStatus: "new",
    matchupIdentity: null,
    boutId: null,
    summary: "Card source failed.",
    beforeValue: null,
    afterValue: null,
    sourceDetails: {},
    detectedAt: "2099-08-01T12:07:00.000Z",
    reviewedAt: null,
  }],
  reviewedFindings: [],
  recentRuns: [],
};

function controlRepository(events: Array<PickControlEvent | null>): PickControlRepository {
  const loadControlEvent = vi.fn();
  for (const event of events) loadControlEvent.mockResolvedValueOnce(event);
  loadControlEvent.mockResolvedValue(events.at(-1) ?? null);
  return {
    loadControlEvent,
    lockEvent: vi.fn().mockResolvedValue(undefined),
    adjustLockTime: vi.fn().mockResolvedValue(undefined),
    setCancellation: vi.fn().mockResolvedValue(undefined),
    setBoutInclusion: vi.fn().mockResolvedValue(undefined),
    replaceFighter: vi.fn().mockResolvedValue(undefined),
    reorderCard: vi.fn().mockResolvedValue(undefined),
    recordResult: vi.fn().mockResolvedValue(undefined),
    correctResult: vi.fn().mockResolvedValue(undefined),
    completeEvent: vi.fn().mockResolvedValue(undefined),
  };
}

function setupRepository(drafts: Array<PickSetupDraft | null>): PickSetupRepository {
  const loadDraft = vi.fn();
  for (const draft of drafts) loadDraft.mockResolvedValueOnce(draft);
  loadDraft.mockResolvedValue(drafts.at(-1) ?? null);
  return {
    loadDraft,
    syncNextEvent: vi.fn().mockResolvedValue(undefined),
    previewSource: vi.fn(),
    applySourcePreview: vi.fn().mockResolvedValue(undefined),
    updateMetadata: vi.fn().mockResolvedValue(undefined),
    saveBout: vi.fn().mockResolvedValue(undefined),
    removeBout: vi.fn().mockResolvedValue(undefined),
    reorderBouts: vi.fn().mockResolvedValue(undefined),
    publishDraft: vi.fn().mockResolvedValue(undefined),
    discardDraft: vi.fn().mockResolvedValue(undefined),
  };
}

function monitoringRepository(inbox = monitoringInbox): MonitoringInboxRepository {
  return {
    loadInbox: vi.fn().mockResolvedValue(inbox),
    runManualCheck: vi.fn().mockResolvedValue(undefined),
    reviewFinding: vi.fn().mockResolvedValue(undefined),
  };
}

function renderCenter(
  control: PickControlRepository,
  setup: PickSetupRepository,
  monitoring: MonitoringInboxRepository,
  identityGateway = gateway(),
  initialEntry = "/picks/control",
) {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <IdentityProvider gateway={identityGateway}>
        <PicksControlCenterPage
          controlRepository={control}
          setupRepository={setup}
          monitoringRepository={monitoring}
        />
      </IdentityProvider>
    </MemoryRouter>,
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
      unresolvedCount: 0,
    });
    renderCenter(control, setup, monitoring, gateway(), "/picks/control#setup");

    expect(await screen.findByText("REVIEW CARD")).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { name: "UFC Staged" })).not.toHaveLength(0);
    expect(screen.getByRole("link", { name: "REVIEW & PUBLISH" })).toHaveAttribute("href", "#setup");

    fireEvent.click(screen.getByRole("button", { name: "PUBLISH CARD" }));
    await waitFor(() => expect(setup.publishDraft).toHaveBeenCalledWith("draft"));
    expect(await screen.findByText("PICKS OPEN")).toBeInTheDocument();
    await waitFor(() => expect(control.loadControlEvent).toHaveBeenCalledTimes(2));
  });

  it("keeps the published-event action primary while surfacing monitoring failures", async () => {
    const control = controlRepository([controlEvent("upcoming")]);
    const monitoring = monitoringRepository();
    renderCenter(control, setupRepository([]), monitoring);

    expect(await screen.findByText("PICKS OPEN")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "MANAGE OPEN PICKS" })).toHaveAttribute("href", "#fight-night");
    await waitFor(() => expect(monitoring.loadInbox).toHaveBeenCalledTimes(1));
    expect(await screen.findByRole("heading", { name: "AUTO-SYNC NEEDS ATTENTION" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Review only what changed" })).toBeInTheDocument();
    expect(screen.getByText("Card source failed.")).toBeInTheDocument();
    expect(screen.getByLabelText("Automation status")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "LOCK ALL PICKS & BEGIN RESULTS" })).toBeEnabled();
  });

  it("exposes canonical result entry for locked events", async () => {
    const control = controlRepository([controlEvent("locked")]);
    renderCenter(control, setupRepository([]), monitoringRepository());

    expect(await screen.findByText("1 FIGHT NEED RESULTS")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "ENTER RESULTS" })).toHaveAttribute("href", "#fight-night");
    fireEvent.click(screen.getByRole("button", { name: "RED WINNER Red Fighter" }));
    await waitFor(() => expect(control.recordResult).toHaveBeenCalledWith("ufc-control", "red-blue", "red_win"));
  });

  it("keeps completed-event corrections and history in the canonical control", async () => {
    renderCenter(
      controlRepository([controlEvent("complete", "red_win")]),
      setupRepository([]),
      monitoringRepository(),
    );

    expect(await screen.findAllByText("EVENT COMPLETE")).not.toHaveLength(0);
    expect(screen.getByText("Recap published automatically")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "VIEW UFC OLDER EVENT" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "CORRECT RESULT" })).toBeInTheDocument();
  });

  it("does not initialize owner repositories before authorization", async () => {
    const control = controlRepository([controlEvent("upcoming")]);
    const setup = setupRepository([stagedDraft]);
    const monitoring = monitoringRepository();
    renderCenter(control, setup, monitoring, gateway(null));

    expect(await screen.findAllByText("OWNER SIGN-IN REQUIRED")).not.toHaveLength(0);
    expect(screen.getByRole("button", { name: "SIGN IN" })).toBeInTheDocument();
    expect(control.loadControlEvent).not.toHaveBeenCalled();
    expect(setup.loadDraft).not.toHaveBeenCalled();
    expect(monitoring.loadInbox).not.toHaveBeenCalled();
  });

  it("keeps one obvious primary action at a 390 by 844 phone viewport", async () => {
    Object.defineProperty(window, "innerWidth", { configurable: true, value: 390 });
    Object.defineProperty(window, "innerHeight", { configurable: true, value: 844 });
    renderCenter(controlRepository([controlEvent("locked")]), setupRepository([]), monitoringRepository());

    expect(await screen.findByText("1 FIGHT NEED RESULTS")).toBeInTheDocument();
    const header = screen.getByRole("banner");
    expect(header.querySelectorAll(".primary-action")).toHaveLength(1);
    expect(header).toHaveTextContent("UFC Control");
    expect(header).toHaveTextContent("PICKS LOCK");
    expect(header).toHaveTextContent("FIGHTS");
  });
});
