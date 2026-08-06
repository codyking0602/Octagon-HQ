import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { IdentityProvider } from "../identity/IdentityProvider";
import type { IdentityGateway } from "../identity/identityGateway";
import MonitoringInboxPage from "./MonitoringInboxPage";
import type { MonitoringInbox } from "./monitoringInboxModel";
import type { MonitoringInboxRepository } from "./monitoringInboxRepository";

const owner = {
  id: "11111111-1111-4111-8111-111111111111",
  displayName: "CODY",
  initials: "CK",
};

const gateway: IdentityGateway = {
  getSession: async () => ({ userId: owner.id }),
  subscribe: () => () => undefined,
  loadProfile: async () => owner,
  signIn: async () => undefined,
  createProfile: async () => undefined,
  signOut: async () => undefined,
};

function inbox(beforeValue: unknown, afterValue: unknown): MonitoringInbox {
  return {
    generatedAt: "2026-08-06T00:00:00.000Z",
    scheduler: {
      jobId: 7,
      jobName: "octagon-hq-pick-monitoring",
      schedule: "7 * * * *",
      active: true,
      tokenConfigured: true,
      lastWakeStatus: "succeeded",
      lastWakeStartedAt: "2026-08-06T00:00:00.000Z",
      lastWakeEndedAt: "2026-08-06T00:00:03.000Z",
    },
    monitoredEvent: {
      kind: "current",
      eventId: "ufc-event-test",
      sourceEventIdentity: "ufc:event-test",
      name: "UFC Fight Night",
      subtitle: "Alpha vs. Beta",
      startsAt: "2026-08-10T01:00:00.000Z",
      locksAt: "2026-08-10T00:00:00.000Z",
      boutCount: 5,
    },
    scheduleState: {
      sourceEventIdentity: "ufc:event-test",
      nextEligibleAt: "2026-08-06T06:00:00.000Z",
      leaseUntil: null,
      lastClaimedAt: "2026-08-06T00:00:00.000Z",
      updatedAt: "2026-08-06T00:00:03.000Z",
    },
    latestRun: {
      runId: "22222222-2222-4222-8222-222222222222",
      triggerKind: "scheduled",
      status: "completed",
      sourceEventIdentity: "ufc:event-test",
      eventId: "ufc-event-test",
      startedAt: "2026-08-06T00:00:00.000Z",
      completedAt: "2026-08-06T00:00:03.000Z",
      cardSource: "UFC.com",
      cardSourceUrl: "https://www.ufc.com/event/test",
      oddsProvider: "the-odds-api",
      providerRequestsRemaining: 42,
      providerRequestsUsed: 1,
      providerLastRequestCost: 1,
      providerEventCount: 1,
      completeSnapshotCount: 5,
      missingSnapshotCount: 0,
      diagnostics: [],
      findingCount: 1,
      newFindingCount: 1,
    },
    unresolvedCount: 1,
    newFindings: [{
      findingId: "33333333-3333-4333-8333-333333333333",
      runId: "22222222-2222-4222-8222-222222222222",
      triggerKind: "scheduled",
      runStatus: "completed",
      findingKey: "ufc:event-test:card-change:venue",
      findingType: "card_change",
      severity: "warning",
      reviewStatus: "new",
      matchupIdentity: null,
      boutId: null,
      summary: "Venue changed.",
      beforeValue,
      afterValue,
      sourceDetails: {},
      detectedAt: "2026-08-06T00:00:03.000Z",
      reviewedAt: null,
    }],
    reviewedFindings: [],
    recentRuns: [],
    latestScheduledDecision: {
      outcome: "completed",
      reason: null,
      attemptedAt: "2026-08-06T00:00:00.000Z",
      providerCalled: true,
    },
  };
}

function renderInbox(value: MonitoringInbox) {
  const repository: MonitoringInboxRepository = {
    loadInbox: vi.fn().mockResolvedValue(value),
    runManualCheck: vi.fn().mockResolvedValue(undefined),
    reviewFinding: vi.fn().mockResolvedValue(undefined),
  };
  render(
    <MemoryRouter>
      <IdentityProvider gateway={gateway}>
        <MonitoringInboxPage repository={repository} embedded />
      </IdentityProvider>
    </MemoryRouter>,
  );
}

afterEach(cleanup);

describe("compact monitoring change values", () => {
  it("shows the exact before and after values without expanding the card", async () => {
    renderInbox(inbox("Test Arena", "New Arena"));

    expect(await screen.findByLabelText("Test Arena changed to New Arena")).toBeInTheDocument();
    expect(screen.getByText("Test Arena")).toBeInTheDocument();
    expect(screen.getByText("New Arena")).toBeInTheDocument();
    expect(screen.queryByText("VIEW CHANGE")).not.toBeInTheDocument();
  });

  it("hides already-stored cosmetic no-op findings from the owner queue", async () => {
    renderInbox(inbox("UFC Apex", "UFC APEX"));

    expect(await screen.findByLabelText("Pending changes all clear")).toBeInTheDocument();
    expect(screen.getByLabelText("Automation status")).toHaveTextContent("OWNER FINDINGS0");
    expect(screen.queryByText("Venue changed.")).not.toBeInTheDocument();
  });
});
