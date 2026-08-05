import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { IdentityProvider } from "../identity/IdentityProvider";
import type { IdentityGateway } from "../identity/identityGateway";
import MonitoringInboxPage from "./MonitoringInboxPage";
import type { MonitoringInbox } from "./monitoringInboxModel";
import type { MonitoringInboxRepository } from "./monitoringInboxRepository";

const cody = { id: "11111111-1111-4111-8111-111111111111", displayName: "CODY", initials: "CK" };
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
  reviewedFindings: [],
  recentRuns: [],
  latestScheduledDecision: {
    outcome: "completed",
    reason: null,
    attemptedAt: "2026-08-01T12:00:00.000Z",
    providerCalled: true,
  },
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

function repository(value: MonitoringInbox): MonitoringInboxRepository {
  return {
    loadInbox: vi.fn().mockResolvedValue(value),
    runManualCheck: vi.fn().mockResolvedValue(undefined),
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

beforeEach(() => vi.spyOn(window, "confirm").mockReturnValue(true));
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

describe("Monitoring Inbox", () => {
  it("shows one compact automation state, current event, and pending changes", async () => {
    renderPage(repository(inbox));

    expect(await screen.findByRole("heading", { name: "AUTO-SYNC CHECKED THE EVENT" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "UFC Fight Night" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Review only what changed" })).toBeInTheDocument();
    expect(screen.getByText("Fight order changed.")).toBeInTheDocument();
    expect(screen.queryByText("SYSTEM DETAILS")).not.toBeInTheDocument();
    expect(screen.queryByText("RECENT CHECKS")).not.toBeInTheDocument();
    expect(screen.queryByText("REVIEWED FINDINGS")).not.toBeInTheDocument();
  });

  it("does not describe a scheduler wake as a provider check", async () => {
    renderPage(repository({
      ...inbox,
      latestRun: null,
      latestScheduledDecision: {
        outcome: "skipped",
        reason: "not_due",
        attemptedAt: "2026-08-01T12:07:00.000Z",
        providerCalled: false,
      },
    }));

    expect(await screen.findByRole("heading", { name: "AUTO-SYNC IS WAITING FOR ITS NEXT CHECK" })).toBeInTheDocument();
    expect(screen.getByText(/no provider check was due/i)).toBeInTheDocument();
  });

  it("runs the canonical manual check and refreshes the same inbox", async () => {
    const repo = repository(inbox);
    renderPage(repo);

    fireEvent.click(await screen.findByRole("button", { name: "CHECK NOW" }));
    await waitFor(() => expect(repo.runManualCheck).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(repo.loadInbox).toHaveBeenCalledTimes(2));
    expect(window.confirm).toHaveBeenCalledWith(expect.stringContaining("42 requests remaining"));
  });

  it("keeps existing review and dismiss mutations", async () => {
    const repo = repository(inbox);
    renderPage(repo);

    fireEvent.click(await screen.findByRole("button", { name: "MARK REVIEWED" }));
    await waitFor(() => expect(repo.reviewFinding).toHaveBeenCalledWith(finding.findingId, "reviewed"));
  });

  it("uses an honest empty state", async () => {
    renderPage(repository({
      ...inbox,
      unresolvedCount: 0,
      newFindings: [],
    }));

    expect(await screen.findByRole("heading", { name: "No event changes need your attention." })).toBeInTheDocument();
  });
});
