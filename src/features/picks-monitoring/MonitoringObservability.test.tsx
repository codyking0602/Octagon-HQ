import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { IdentityProvider } from "../identity/IdentityProvider";
import type { IdentityGateway } from "../identity/identityGateway";
import MonitoringInboxPage from "./MonitoringInboxPage";
import type { MonitoringFinding, MonitoringInbox, MonitoringRun } from "./monitoringInboxModel";
import type { MonitoringInboxRepository } from "./monitoringInboxRepository";

const owner = {
  id: "11111111-1111-4111-8111-111111111111",
  displayName: "CODY",
  initials: "CK",
};

function gateway(): IdentityGateway {
  return {
    getSession: async () => ({ userId: owner.id }),
    subscribe: () => () => undefined,
    loadProfile: async () => owner,
    signIn: async () => undefined,
    createProfile: async () => undefined,
    signOut: async () => undefined,
  };
}

const completedRun: MonitoringRun = {
  runId: "22222222-2222-4222-8222-222222222222",
  triggerKind: "scheduled",
  status: "completed",
  sourceEventIdentity: "ufc:gamrot-quillan",
  eventId: "33333333-3333-4333-8333-333333333333",
  startedAt: "2099-08-06T09:07:00.000Z",
  completedAt: "2099-08-06T09:07:03.000Z",
  cardSource: "UFC.com event card",
  cardSourceUrl: "https://www.ufc.com/event/ufc-fight-night",
  oddsProvider: "The Odds API",
  providerRequestsRemaining: 487,
  providerRequestsUsed: 13,
  providerLastRequestCost: 1,
  providerEventCount: 1,
  completeSnapshotCount: 5,
  missingSnapshotCount: 0,
  diagnostics: [],
  findingCount: 3,
  newFindingCount: 3,
};

function oddsFinding(index: number): MonitoringFinding {
  return {
    findingId: `44444444-4444-4444-8444-44444444444${index}`,
    runId: completedRun.runId,
    triggerKind: "scheduled",
    runStatus: "completed",
    findingKey: `odds-${index}`,
    findingType: "odds_change",
    severity: "info",
    reviewStatus: "reviewed",
    matchupIdentity: `fighter-${index}|opponent-${index}`,
    boutId: `bout-${index}`,
    summary: `Odds updated for bout ${index}.`,
    beforeValue: -110,
    afterValue: -120,
    sourceDetails: { automatically_applied: true },
    approvalProposal: null,
    detectedAt: completedRun.completedAt!,
    reviewedAt: completedRun.completedAt!,
  };
}

const observableInbox: MonitoringInbox = {
  generatedAt: "2099-08-06T09:10:00.000Z",
  scheduler: {
    jobId: 7,
    jobName: "octagon-hq-pick-monitoring",
    schedule: "7 * * * *",
    active: true,
    tokenConfigured: true,
    lastWakeStatus: "succeeded",
    lastWakeStartedAt: "2099-08-06T09:07:00.000Z",
    lastWakeEndedAt: "2099-08-06T09:07:04.000Z",
  },
  monitoredEvent: {
    kind: "current",
    eventId: completedRun.eventId!,
    sourceEventIdentity: completedRun.sourceEventIdentity,
    name: "UFC Fight Night",
    subtitle: "Gamrot vs. Quillan",
    startsAt: "2099-08-09T01:00:00.000Z",
    locksAt: "2099-08-09T00:00:00.000Z",
    boutCount: 5,
  },
  scheduleState: {
    sourceEventIdentity: completedRun.sourceEventIdentity,
    nextEligibleAt: "2099-08-06T15:00:00.000Z",
    leaseUntil: null,
    lastClaimedAt: completedRun.startedAt,
    updatedAt: completedRun.completedAt!,
  },
  latestRun: completedRun,
  unresolvedCount: 0,
  newFindings: [],
  reviewedFindings: [oddsFinding(1), oddsFinding(2), oddsFinding(3)],
  recentRuns: [completedRun],
  latestScheduledDecision: {
    outcome: "completed",
    reason: null,
    attemptedAt: completedRun.startedAt,
    providerCalled: true,
  },
};

function repository(value: MonitoringInbox = observableInbox): MonitoringInboxRepository {
  return {
    loadInbox: vi.fn().mockResolvedValue(value),
    runManualCheck: vi.fn().mockResolvedValue(undefined),
    approveFinding: vi.fn().mockResolvedValue(undefined),
    reviewFinding: vi.fn().mockResolvedValue(undefined),
  };
}

function renderPage(repo: MonitoringInboxRepository) {
  return render(
    <MemoryRouter>
      <IdentityProvider gateway={gateway()}>
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

describe("Picks monitoring observability", () => {
  it("renders scheduler wakes and provider calls as distinct authoritative facts", async () => {
    renderPage(repository());

    expect(await screen.findByText("NEXT SCHEDULER WAKE")).toBeInTheDocument();
    expect(screen.getAllByText("NEXT PROVIDER CALL").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("LAST SCHEDULER WAKE")).toBeInTheDocument();
    expect(screen.getByText("LAST SUCCESSFUL PROVIDER CALL")).toBeInTheDocument();
    expect(screen.getByText("EXACT UFC EVENT SOURCE")).toBeInTheDocument();
    expect(screen.getByText("UFC.com event card")).toBeInTheDocument();
    expect(screen.getByText("5 OF 5 MATCHED")).toBeInTheDocument();
  });

  it("renders quota use, remaining requests, reset date, and the stored execution receipt", async () => {
    renderPage(repository());

    expect(await screen.findByText("MONTHLY REQUESTS USED")).toBeInTheDocument();
    expect(screen.getByText("13")).toBeInTheDocument();
    expect(screen.getByText("MONTHLY REQUESTS REMAINING")).toBeInTheDocument();
    expect(screen.getAllByText("487").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("MONTHLY RESET")).toBeInTheDocument();
    expect(screen.getByText(/5\/5 fights matched, 3 odds updated, 2 unchanged, 0 unmatched\./i)).toBeInTheDocument();
    expect(screen.getByText(/487 monthly requests remain\./i)).toBeInTheDocument();
  });

  it("runs Check Now through the supplied canonical runner and refreshes its receipt", async () => {
    const repo = repository();
    renderPage(repo);

    await waitFor(() => expect(repo.loadInbox).toHaveBeenCalledTimes(1));
    fireEvent.click(await screen.findByRole("button", { name: "CHECK NOW" }));

    await waitFor(() => expect(repo.runManualCheck).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(repo.loadInbox).toHaveBeenCalledTimes(2));
    expect(window.confirm).toHaveBeenCalledWith(expect.stringContaining("complete UFC card and odds monitoring operation"));
    expect(window.confirm).toHaveBeenCalledWith(expect.stringContaining("use one provider request"));
  });

  it("refreshes status without invoking the provider runner", async () => {
    const repo = repository();
    renderPage(repo);

    await waitFor(() => expect(repo.loadInbox).toHaveBeenCalledTimes(1));
    expect(await screen.findByText("NEXT SCHEDULER WAKE")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "REFRESH STATUS" }));

    await waitFor(() => expect(repo.loadInbox).toHaveBeenCalledTimes(2));
    expect(repo.runManualCheck).not.toHaveBeenCalled();
  });

  it("shows provider failures, unmatched fights, quota exhaustion, and stale credentials plainly", async () => {
    const failedRun: MonitoringRun = {
      ...completedRun,
      runId: "55555555-5555-4555-8555-555555555555",
      status: "failed",
      providerRequestsRemaining: 0,
      completeSnapshotCount: 4,
      missingSnapshotCount: 1,
      diagnostics: ["Odds provider rejected the configured credential."],
    };
    const providerFailure: MonitoringFinding = {
      ...oddsFinding(1),
      findingId: "66666666-6666-4666-8666-666666666666",
      runId: failedRun.runId,
      runStatus: "failed",
      findingKey: "provider-error",
      findingType: "provider_error",
      severity: "error",
      reviewStatus: "new",
      summary: "Odds provider rejected the configured credential.",
      sourceDetails: {},
      reviewedAt: null,
    };
    const unmatched: MonitoringFinding = {
      ...providerFailure,
      findingId: "77777777-7777-4777-8777-777777777777",
      findingKey: "unmatched",
      findingType: "unmatched_fight",
      severity: "warning",
      summary: "One monitored fight could not be matched.",
    };
    const failedInbox: MonitoringInbox = {
      ...observableInbox,
      scheduler: { ...observableInbox.scheduler, tokenConfigured: false },
      latestRun: failedRun,
      recentRuns: [failedRun, completedRun],
      newFindings: [providerFailure, unmatched],
      reviewedFindings: [],
      latestScheduledDecision: {
        outcome: "failed",
        reason: "provider_failed",
        attemptedAt: failedRun.startedAt,
        providerCalled: true,
      },
    };

    renderPage(repository(failedInbox));

    expect(await screen.findAllByText("Odds provider rejected the configured credential.")).not.toHaveLength(0);
    expect(screen.getByText("The monthly provider quota is exhausted.")).toBeInTheDocument();
    expect(screen.getByText("The scheduler credential is missing or stale.")).toBeInTheDocument();
    expect(screen.getByText("1 monitored fight is unmatched and needs review.")).toBeInTheDocument();
    expect(screen.getByText("4 OF 5 MATCHED")).toBeInTheDocument();
  });
});
