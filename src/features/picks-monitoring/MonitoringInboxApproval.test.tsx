import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { IdentityProvider } from "../identity/IdentityProvider";
import type { IdentityGateway } from "../identity/identityGateway";
import MonitoringInboxPage from "./MonitoringInboxPage";
import type { MonitoringInbox, MonitoringFinding } from "./monitoringInboxModel";
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

const replacementFinding: MonitoringFinding = {
  findingId: "22222222-2222-4222-8222-222222222222",
  runId: "33333333-3333-4333-8333-333333333333",
  triggerKind: "manual",
  runStatus: "completed",
  findingKey: "replacement",
  findingType: "card_change",
  severity: "warning",
  reviewStatus: "new",
  matchupIdentity: "alpha|beta",
  boutId: "main-event-alpha-beta",
  summary: "Replace Beta with Replacement.",
  beforeValue: { blue_fighter_name: "Beta" },
  afterValue: { blue_fighter_name: "Replacement" },
  sourceDetails: { change_field: "fighters" },
  approvalProposal: {
    action: "replace_fighter",
    event_id: "ufc-approval",
    bout_id: "main-event-alpha-beta",
    corner: "blue",
    expected_red_fighter_slug: "alpha",
    expected_blue_fighter_slug: "beta",
    replacement_fighter_slug: "replacement",
    replacement_fighter_name: "Replacement",
  },
  detectedAt: "2099-08-01T12:00:00.000Z",
  reviewedAt: null,
};

const venueFinding: MonitoringFinding = {
  ...replacementFinding,
  findingId: "44444444-4444-4444-8444-444444444444",
  findingKey: "venue",
  matchupIdentity: null,
  boutId: null,
  summary: "Venue found.",
  beforeValue: null,
  afterValue: "Meta APEX",
  sourceDetails: { change_field: "venue" },
  approvalProposal: {
    action: "update_event_metadata",
    event_id: "ufc-approval",
    field: "venue",
    expected_value: null,
    proposed_value: "Meta APEX",
  },
};

const oddsFinding: MonitoringFinding = {
  ...replacementFinding,
  findingId: "55555555-5555-4555-8555-555555555555",
  findingKey: "odds",
  findingType: "odds_change",
  summary: "American odds changed and were applied automatically.",
  beforeValue: [{ fighter_identity: "alpha", american_odds: -120 }],
  afterValue: [{ fighter_identity: "alpha", american_odds: -135 }],
  sourceDetails: { change_field: "odds", automatically_applied: true },
  approvalProposal: null,
};

const inbox: MonitoringInbox = {
  generatedAt: "2099-08-01T12:01:00.000Z",
  scheduler: {
    jobId: 7,
    jobName: "octagon-hq-pick-monitoring",
    schedule: "7 * * * *",
    active: true,
    tokenConfigured: true,
    lastWakeStatus: "succeeded",
    lastWakeStartedAt: "2099-08-01T12:07:00.000Z",
    lastWakeEndedAt: "2099-08-01T12:07:01.000Z",
  },
  monitoredEvent: {
    kind: "current",
    eventId: "ufc-approval",
    sourceEventIdentity: "ufc:approval",
    name: "UFC Fight Night",
    subtitle: "Alpha vs. Beta",
    startsAt: "2099-08-10T01:00:00.000Z",
    locksAt: "2099-08-10T00:00:00.000Z",
    boutCount: 2,
  },
  scheduleState: {
    sourceEventIdentity: "ufc:approval",
    nextEligibleAt: "2099-08-01T18:00:00.000Z",
    leaseUntil: null,
    lastClaimedAt: "2099-08-01T12:00:00.000Z",
    updatedAt: "2099-08-01T12:00:01.000Z",
  },
  latestScheduledDecision: {
    outcome: "completed",
    reason: null,
    attemptedAt: "2099-08-01T12:00:00.000Z",
    providerCalled: true,
  },
  latestRun: null,
  unresolvedCount: 1,
  newFindings: [replacementFinding],
  reviewedFindings: [],
  recentRuns: [],
};

const emptyInbox: MonitoringInbox = {
  ...inbox,
  unresolvedCount: 0,
  newFindings: [],
};

function repository(...values: MonitoringInbox[]): MonitoringInboxRepository {
  return {
    loadInbox: vi.fn()
      .mockResolvedValueOnce(values[0] ?? inbox)
      .mockResolvedValue(values[1] ?? values[0] ?? inbox),
    runManualCheck: vi.fn().mockResolvedValue(undefined),
    approveFinding: vi.fn().mockResolvedValue(undefined),
    reviewFinding: vi.fn().mockResolvedValue(undefined),
  };
}

function renderPage(repo: MonitoringInboxRepository, onAppliedChange = vi.fn()) {
  return {
    onAppliedChange,
    ...render(
      <MemoryRouter>
        <IdentityProvider gateway={gateway()}>
          <MonitoringInboxPage repository={repo} onAppliedChange={onAppliedChange} />
        </IdentityProvider>
      </MemoryRouter>,
    ),
  };
}

beforeEach(() => {
  vi.spyOn(window, "prompt").mockReturnValue("Official source confirmed");
  vi.spyOn(window, "confirm").mockReturnValue(true);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("Monitoring Inbox approval actions", () => {
  it("renders the shared APPROVE CHANGE action for supported findings", async () => {
    const repo = repository({ ...inbox, newFindings: [venueFinding] });
    renderPage(repo);

    expect(await screen.findByRole("button", { name: "APPROVE CHANGE" })).toBeInTheDocument();
    expect(screen.getByLabelText("Set venue to Meta APEX")).toBeInTheDocument();
    expect(screen.queryByText(/Not set/i)).not.toBeInTheDocument();
  });

  it("approves through the canonical repository exactly once, refreshes control state, and removes the finding", async () => {
    const repo = repository(inbox, emptyInbox);
    const onAppliedChange = vi.fn().mockResolvedValue(undefined);
    renderPage(repo, onAppliedChange);

    expect(await screen.findByText("REPICK REQUIRED FOR AFFECTED MEMBERS")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "APPROVE CHANGE" }));

    await waitFor(() => expect(repo.approveFinding).toHaveBeenCalledTimes(1));
    expect(repo.approveFinding).toHaveBeenCalledWith(
      replacementFinding.findingId,
      "Official source confirmed",
    );
    await waitFor(() => expect(onAppliedChange).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(repo.loadInbox).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(screen.queryByText(replacementFinding.summary)).not.toBeInTheDocument());
    expect(window.confirm).toHaveBeenCalledWith(expect.stringContaining(
      "The backend will reject it if the live card changed since this check.",
    ));
  });

  it("keeps informational findings acknowledgment-only", async () => {
    const repo = repository({
      ...inbox,
      newFindings: [{
        ...replacementFinding,
        approvalProposal: null,
        findingType: "unmatched_fight",
        summary: "A monitored bout did not confidently match a provider snapshot.",
      }],
    });
    renderPage(repo);

    expect(await screen.findByRole("button", { name: "MARK REVIEWED" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "APPROVE CHANGE" })).not.toBeInTheDocument();
  });

  it("labels automatically applied odds and never offers approval", async () => {
    const repo = repository({ ...inbox, newFindings: [oddsFinding] });
    renderPage(repo);

    expect(await screen.findByText("ALREADY APPLIED AUTOMATICALLY")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "MARK REVIEWED" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "APPROVE CHANGE" })).not.toBeInTheDocument();
  });

  it("uses the unique visible finding count", async () => {
    const repo = repository({
      ...inbox,
      unresolvedCount: 2,
      newFindings: [venueFinding, oddsFinding],
    });
    renderPage(repo);

    const counts = await screen.findAllByText("2");
    expect(counts.length).toBeGreaterThanOrEqual(2);
  });
});
