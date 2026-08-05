import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
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

const replacementFinding = {
  findingId: "22222222-2222-4222-8222-222222222222",
  runId: "33333333-3333-4333-8333-333333333333",
  triggerKind: "manual" as const,
  runStatus: "completed" as const,
  findingKey: "replacement",
  findingType: "card_change" as const,
  severity: "warning" as const,
  reviewStatus: "new" as const,
  matchupIdentity: "alpha|beta",
  boutId: "main-event-alpha-beta",
  summary: "Replace Beta with Replacement.",
  beforeValue: { blue_fighter_name: "Beta" },
  afterValue: { blue_fighter_name: "Replacement" },
  sourceDetails: {},
  approvalProposal: {
    action: "replace_fighter" as const,
    event_id: "ufc-approval",
    bout_id: "main-event-alpha-beta",
    corner: "blue" as const,
    expected_red_fighter_slug: "alpha",
    expected_blue_fighter_slug: "beta",
    replacement_fighter_slug: "replacement",
    replacement_fighter_name: "Replacement",
  },
  detectedAt: "2099-08-01T12:00:00.000Z",
  reviewedAt: null,
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

function repository(value: MonitoringInbox = inbox): MonitoringInboxRepository {
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
  vi.spyOn(window, "prompt").mockReturnValue("Official source confirmed");
  vi.spyOn(window, "confirm").mockReturnValue(true);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("Monitoring Inbox approval actions", () => {
  it("explicitly approves an applyable replacement through the repository and refreshes", async () => {
    const repo = repository();
    renderPage(repo);

    expect(await screen.findByText("REPICK REQUIRED FOR AFFECTED MEMBERS")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "APPROVE REPLACEMENT" }));

    await waitFor(() => expect(repo.approveFinding).toHaveBeenCalledWith(
      replacementFinding.findingId,
      "Official source confirmed",
    ));
    await waitFor(() => expect(repo.loadInbox).toHaveBeenCalledTimes(2));
    expect(window.confirm).toHaveBeenCalledWith(expect.stringContaining(
      "The backend will reject it if the live card changed since this check.",
    ));
  });

  it("keeps unsupported findings review-only", async () => {
    const repo = repository({
      ...inbox,
      newFindings: [{ ...replacementFinding, approvalProposal: null, summary: "Venue changed." }],
    });
    renderPage(repo);

    expect(await screen.findByRole("button", { name: "MARK REVIEWED" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /APPROVE/ })).not.toBeInTheDocument();
  });
});
