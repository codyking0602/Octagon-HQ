import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { IdentityProvider } from "../identity/IdentityProvider";
import type { IdentityGateway } from "../identity/identityGateway";
import MonitoringInboxPage from "./MonitoringInboxPage";
import type { MonitoringInbox } from "./monitoringInboxModel";
import type { MonitoringInboxRepository } from "./monitoringInboxRepository";

const cody = {
  id: "11111111-1111-4111-8111-111111111111",
  displayName: "CODY",
  initials: "CK",
};

const finding = {
  findingId: "22222222-2222-4222-8222-222222222222",
  runId: "33333333-3333-4333-8333-333333333333",
  triggerKind: "scheduled" as const,
  runStatus: "completed" as const,
  findingKey: "ufc:event-test:card-change:test",
  findingType: "card_change" as const,
  severity: "warning" as const,
  reviewStatus: "new" as const,
  matchupIdentity: "red-fighter|blue-fighter",
  boutId: "main-event-red-fighter-blue-fighter",
  summary: "Fight order changed.",
  beforeValue: { position: 2 },
  afterValue: { position: 1 },
  sourceDetails: { source: "MMA Mania" },
  detectedAt: "2026-08-01T12:00:05.000Z",
  reviewedAt: null,
};

const inbox: MonitoringInbox = {
  generatedAt: "2026-08-01T12:01:00.000Z",
  scheduler: {
    jobId: 7,
    jobName: "octagon-hq-pick-monitoring",
    schedule: "7 * * * *",
    active: true,
    tokenConfigured: true,
    lastWakeStatus: "succeeded",
    lastWakeStartedAt: "2026-08-01T12:07:00.000Z",
    lastWakeEndedAt: "2026-08-01T12:07:03.000Z",
  },
  monitoredEvent: {
    kind: "staged",
    eventId: "ufc-event-test",
    sourceEventIdentity: "ufc:event-test",
    name: "UFC Fight Night",
    subtitle: "Red Fighter vs. Blue Fighter",
    startsAt: "2026-08-03T00:00:00.000Z",
    locksAt: "2026-08-03T00:00:00.000Z",
    boutCount: 6,
  },
  scheduleState: {
    sourceEventIdentity: "ufc:event-test",
    nextEligibleAt: "2026-08-01T18:00:00.000Z",
    leaseUntil: null,
    lastClaimedAt: "2026-08-01T12:00:00.000Z",
    updatedAt: "2026-08-01T12:00:05.000Z",
  },
  latestRun: {
    runId: finding.runId,
    triggerKind: "scheduled",
    status: "completed",
    sourceEventIdentity: "ufc:event-test",
    eventId: "ufc-event-test",
    startedAt: "2026-08-01T12:00:00.000Z",
    completedAt: "2026-08-01T12:00:05.000Z",
    cardSource: "MMA Mania",
    cardSourceUrl: "https://www.mmamania.com/test",
    oddsProvider: "the-odds-api",
    providerRequestsRemaining: 42,
    providerRequestsUsed: 8,
    providerLastRequestCost: 1,
    providerEventCount: 1,
    completeSnapshotCount: 6,
    missingSnapshotCount: 0,
    diagnostics: [],
    findingCount: 1,
    newFindingCount: 1,
  },
  unresolvedCount: 1,
  newFindings: [finding],
  reviewedFindings: [{
    ...finding,
    findingId: "44444444-4444-4444-8444-444444444444",
    reviewStatus: "dismissed",
    reviewedAt: "2026-08-01T12:30:00.000Z",
  }],
  recentRuns: [],
};

function gateway(profile = cody): IdentityGateway {
  return {
    getSession: async () => ({ userId: profile.id }),
    subscribe: () => () => undefined,
    loadProfile: async () => profile,
    signIn: async () => undefined,
    createProfile: async () => undefined,
    signOut: async () => undefined,
  };
}

function signedOutGateway(): IdentityGateway {
  return {
    getSession: async () => null,
    subscribe: () => () => undefined,
    loadProfile: async () => null,
    signIn: async () => undefined,
    createProfile: async () => undefined,
    signOut: async () => undefined,
  };
}

function repository(value: MonitoringInbox): MonitoringInboxRepository {
  return {
    loadInbox: vi.fn().mockResolvedValue(value),
    runManualCheck: vi.fn().mockResolvedValue(undefined),
    reviewFinding: vi.fn().mockResolvedValue(undefined),
  };
}

function renderPage(repo: MonitoringInboxRepository, identityGateway: IdentityGateway = gateway()) {
  return render(
    <MemoryRouter>
      <IdentityProvider gateway={identityGateway}>
        <MonitoringInboxPage repository={repo} />
      </IdentityProvider>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.spyOn(window, "confirm").mockReturnValue(true);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("Monitoring Inbox", () => {
  it("renders compact scheduler, event, quota, coverage, and finding information for the owner", async () => {
    renderPage(repository(inbox));

    expect(await screen.findByRole("heading", { name: "Monitoring Inbox" })).toBeInTheDocument();
    expect(await screen.findByRole("heading", { name: "Scheduler active" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "UFC Fight Night" })).toBeInTheDocument();
    expect(screen.getByText("Red Fighter vs. Blue Fighter")).toBeInTheDocument();
    expect(screen.getAllByText("Fight order changed.").length).toBeGreaterThan(0);
    expect(screen.getByText("42")).toBeInTheDocument();
    expect(screen.getByText("1", { selector: ".monitoring-summary strong" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "EVENT SETUP" })).toHaveAttribute("href", "/picks/setup");
    expect(screen.getByRole("link", { name: "FIGHT NIGHT RESULTS" })).toHaveAttribute("href", "/picks/control");
    expect(screen.getByRole("link", { name: "PLAYER PICKS" })).toHaveAttribute("href", "/picks");
  });

  it("uses the existing manual runner and refreshes the ledger after success", async () => {
    const repo = repository(inbox);
    renderPage(repo);

    fireEvent.click(await screen.findByRole("button", { name: "RUN CHECK NOW" }));

    await waitFor(() => expect(repo.runManualCheck).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(repo.loadInbox).toHaveBeenCalledTimes(2));
    expect(window.confirm).toHaveBeenCalledWith(expect.stringContaining("42 requests remaining"));
  });

  it("marks or dismisses a new finding through the canonical review owner", async () => {
    const reviewRepo = repository(inbox);
    renderPage(reviewRepo);

    fireEvent.click(await screen.findByRole("button", { name: "MARK REVIEWED" }));
    await waitFor(() => expect(reviewRepo.reviewFinding).toHaveBeenCalledWith(finding.findingId, "reviewed"));
    cleanup();

    const dismissRepo = repository(inbox);
    renderPage(dismissRepo);
    fireEvent.click(await screen.findByRole("button", { name: "DISMISS" }));
    await waitFor(() => expect(dismissRepo.reviewFinding).toHaveBeenCalledWith(finding.findingId, "dismissed"));
  });

  it("disables owner actions while a manual check is in progress", async () => {
    let finish: () => void = () => undefined;
    const repo = repository(inbox);
    vi.mocked(repo.runManualCheck).mockImplementation(() => new Promise<void>((resolve) => { finish = resolve; }));
    renderPage(repo);

    fireEvent.click(await screen.findByRole("button", { name: "RUN CHECK NOW" }));
    expect(await screen.findByRole("button", { name: "RUNNING CHECK…" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "REFRESH INBOX" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "MARK REVIEWED" })).toBeDisabled();
    finish();
    await waitFor(() => expect(repo.loadInbox).toHaveBeenCalledTimes(2));
  });

  it("shows an owner sign-in prompt without loading operational data", async () => {
    const repo = repository(inbox);
    renderPage(repo, signedOutGateway());

    expect(await screen.findByRole("heading", { name: "Sign in to open Monitoring Inbox." })).toBeInTheDocument();
    expect(repo.loadInbox).not.toHaveBeenCalled();
    expect(screen.queryByText("UFC Fight Night")).not.toBeInTheDocument();
  });

  it("shows a non-owner denial without leaking event or finding data", async () => {
    const repo = repository(inbox);
    vi.mocked(repo.loadInbox).mockRejectedValue(new Error("pick control owner required"));
    renderPage(repo);

    expect(await screen.findByText("Monitoring Inbox is available only to the designated Fight Night owner.")).toBeInTheDocument();
    expect(screen.queryByText("UFC Fight Night")).not.toBeInTheDocument();
    expect(screen.queryByText("Fight order changed.")).not.toBeInTheDocument();
  });

  it("explains the no-event, no-run, and no-finding state", async () => {
    renderPage(repository({
      ...inbox,
      monitoredEvent: null,
      scheduleState: null,
      latestRun: null,
      unresolvedCount: 0,
      newFindings: [],
      reviewedFindings: [],
      recentRuns: [],
    }));

    expect(await screen.findByRole("heading", { name: "Stage or publish the next UFC card." })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "No unresolved monitoring findings." })).toBeInTheDocument();
    expect(screen.getByText("NO RUN")).toBeInTheDocument();
    expect(screen.getByText("No monitoring runs have been recorded yet.")).toBeInTheDocument();
  });
});
