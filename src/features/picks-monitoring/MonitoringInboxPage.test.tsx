import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { IdentityProvider } from "../identity/IdentityProvider";
import type { IdentityGateway } from "../identity/identityGateway";
import MonitoringInboxPage from "./MonitoringInboxPage";
import type { MonitoringFinding, MonitoringInbox } from "./monitoringInboxModel";
import type { MonitoringInboxRepository } from "./monitoringInboxRepository";

const cody = {
  id: "11111111-1111-4111-8111-111111111111",
  displayName: "CODY",
  initials: "CK",
};

const finding: MonitoringFinding = {
  findingId: "22222222-2222-4222-8222-222222222222",
  runId: "33333333-3333-4333-8333-333333333333",
  triggerKind: "scheduled",
  runStatus: "completed",
  findingKey: "ufc:event-test:card-change:test",
  findingType: "card_change",
  severity: "warning",
  reviewStatus: "new",
  matchupIdentity: "red-fighter|blue-fighter",
  boutId: "main-event-red-fighter-blue-fighter",
  summary: "Fight order changed.",
  beforeValue: ["main-event-red-fighter-blue-fighter", "co-main"],
  afterValue: ["co-main", "main-event-red-fighter-blue-fighter"],
  sourceDetails: { source: "MMA Mania" },
  approvalProposal: {
    action: "reorder_card",
    event_id: "ufc-event-test",
    expected_bout_ids: ["main-event-red-fighter-blue-fighter", "co-main"],
    proposed_bout_ids: ["co-main", "main-event-red-fighter-blue-fighter"],
  },
  detectedAt: "2026-08-01T12:00:05.000Z",
  reviewedAt: null,
};

const operationalFinding: MonitoringFinding = {
  ...finding,
  findingId: "55555555-5555-4555-8555-555555555555",
  findingKey: "provider-warning",
  findingType: "provider_error",
  severity: "error",
  summary: "Odds provider rejected the configured credential.",
  beforeValue: null,
  afterValue: null,
  sourceDetails: {},
  approvalProposal: null,
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
    approveFinding: vi.fn().mockResolvedValue(undefined),
    reviewFinding: vi.fn().mockResolvedValue(undefined),
  };
}

function renderPage(
  repo: MonitoringInboxRepository,
  identityGateway: IdentityGateway = gateway(),
  embedded = false,
) {
  return render(
    <MemoryRouter>
      <IdentityProvider gateway={identityGateway}>
        <MonitoringInboxPage repository={repo} embedded={embedded} />
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
  it("shows one compact automation state, current event, source, and pending owner decision", async () => {
    renderPage(repository(inbox));

    expect(await screen.findByRole("heading", { name: "AUTO-SYNC CHECKED THE EVENT" })).toBeInTheDocument();
    expect(screen.getByText(/last scheduled provider check/i)).toBeInTheDocument();
    expect(screen.getAllByText(/UFC Fight Night · Red Fighter vs. Blue Fighter/i).length).toBeGreaterThan(0);
    expect(screen.getByRole("link", { name: "OPEN UFC EVENT SOURCE" })).toHaveAttribute("href", "https://www.mmamania.com/test");
    expect(screen.getByRole("heading", { name: "One finding, one clear decision" })).toBeInTheDocument();
    expect(screen.getByText(/eligible pre-lock odds continue to apply automatically/i)).toBeInTheDocument();
    expect(screen.getByText("Fight order changed.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "CONFIRM CHANGE" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "KEEP CURRENT" })).toBeInTheDocument();
    expect(screen.queryByText("SYSTEM DETAILS")).not.toBeInTheDocument();
    expect(screen.queryByText("RECENT CHECKS")).not.toBeInTheDocument();
    expect(screen.queryByText("REVIEWED FINDINGS")).not.toBeInTheDocument();
  });

  it("keeps the embedded dashboard free of a duplicate standalone event card", async () => {
    renderPage(repository(inbox), gateway(), true);

    expect(await screen.findByRole("heading", { name: "AUTO-SYNC CHECKED THE EVENT" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "UFC Fight Night" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "CHECK NOW" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "REFRESH STATUS" })).toBeInTheDocument();
  });

  it("does not describe a scheduler wake as a provider check", async () => {
    renderPage(repository({
      ...inbox,
      latestScheduledDecision: {
        outcome: "skipped",
        reason: "not_due",
        attemptedAt: "2026-08-01T12:07:00.000Z",
        providerCalled: false,
      },
    }));

    expect(await screen.findByRole("heading", { name: "AUTO-SYNC IS WAITING FOR ITS NEXT CHECK" })).toBeInTheDocument();
    expect(screen.getByText(/no provider check was due/i)).toBeInTheDocument();
    expect(screen.queryByText(/last scheduled provider check/i)).not.toBeInTheDocument();
  });

  it("surfaces partial scheduled coverage as needing attention", async () => {
    renderPage(repository({
      ...inbox,
      latestScheduledDecision: {
        outcome: "partial",
        reason: "partial_coverage",
        attemptedAt: "2026-08-01T12:07:00.000Z",
        providerCalled: true,
      },
    }));

    expect(await screen.findByRole("heading", { name: "AUTO-SYNC HAS PARTIAL COVERAGE" })).toBeInTheDocument();
    expect(screen.getByText(/returned partial coverage/i)).toBeInTheDocument();
  });

  it("runs the canonical manual check and refreshes the same inbox", async () => {
    const repo = repository(inbox);
    renderPage(repo);

    fireEvent.click(await screen.findByRole("button", { name: "CHECK NOW" }));

    await waitFor(() => expect(repo.runManualCheck).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(repo.loadInbox).toHaveBeenCalledTimes(2));
    expect(window.confirm).toHaveBeenCalledWith(expect.stringContaining("42 requests remaining"));
  });

  it("keeps refresh read-only", async () => {
    const repo = repository(inbox);
    renderPage(repo);

    fireEvent.click(await screen.findByRole("button", { name: "REFRESH STATUS" }));

    await waitFor(() => expect(repo.loadInbox).toHaveBeenCalledTimes(2));
    expect(repo.runManualCheck).not.toHaveBeenCalled();
  });

  it("keeps current and dismiss notice on the existing review mutation", async () => {
    const keepRepo = repository(inbox);
    renderPage(keepRepo);
    fireEvent.click(await screen.findByRole("button", { name: "KEEP CURRENT" }));
    await waitFor(() => expect(keepRepo.reviewFinding).toHaveBeenCalledWith(finding.findingId, "reviewed"));
    cleanup();

    const dismissRepo = repository({ ...inbox, newFindings: [operationalFinding] });
    renderPage(dismissRepo);
    fireEvent.click(await screen.findByRole("button", { name: "DISMISS NOTICE" }));
    await waitFor(() => expect(dismissRepo.reviewFinding).toHaveBeenCalledWith(operationalFinding.findingId, "dismissed"));
  });

  it("disables owner actions while a manual check is in progress", async () => {
    let finish: () => void = () => undefined;
    const repo = repository(inbox);
    vi.mocked(repo.runManualCheck).mockImplementation(() => new Promise<void>((resolve) => { finish = resolve; }));
    renderPage(repo);

    fireEvent.click(await screen.findByRole("button", { name: "CHECK NOW" }));
    expect(await screen.findByRole("button", { name: "CHECKING NOW…" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "REFRESH STATUS" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "CONFIRM CHANGE" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "KEEP CURRENT" })).toBeDisabled();
    finish();
    await waitFor(() => expect(repo.loadInbox).toHaveBeenCalledTimes(2));
  });

  it("shows an owner sign-in prompt without loading operational data", async () => {
    const repo = repository(inbox);
    renderPage(repo, signedOutGateway());

    expect(await screen.findByRole("heading", { name: "Sign in to manage Picks monitoring." })).toBeInTheDocument();
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

  it("keeps zero findings compact and omits the owner decisions section", async () => {
    renderPage(repository({
      ...inbox,
      unresolvedCount: 0,
      newFindings: [],
      reviewedFindings: [],
    }));

    expect(await screen.findByLabelText("Pending changes all clear")).toHaveTextContent("No event changes need your attention.");
    expect(screen.queryByRole("heading", { name: "One finding, one clear decision" })).not.toBeInTheDocument();
    expect(screen.queryByText("PENDING OWNER DECISIONS")).not.toBeInTheDocument();
  });

  it("explains the no-event state without a large empty findings section", async () => {
    renderPage(repository({
      ...inbox,
      monitoredEvent: null,
      scheduleState: null,
      latestRun: null,
      unresolvedCount: 0,
      newFindings: [],
      reviewedFindings: [],
      recentRuns: [],
      latestScheduledDecision: {
        outcome: "skipped",
        reason: "no_event",
        attemptedAt: "2026-08-01T12:07:00.000Z",
        providerCalled: false,
      },
    }));

    expect(await screen.findByRole("heading", { name: "Stage or publish the next UFC card." })).toBeInTheDocument();
    expect(screen.getByLabelText("Pending changes all clear")).toBeInTheDocument();
    expect(screen.getByText(/there is no event to monitor/i)).toBeInTheDocument();
    expect(screen.queryByText("PENDING OWNER DECISIONS")).not.toBeInTheDocument();
  });
});
