import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
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
  beforeValue: { red_fighter_name: "Alpha", blue_fighter_name: "Beta" },
  afterValue: { red_fighter_name: "Alpha", blue_fighter_name: "Replacement" },
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

const operationalFinding: MonitoringFinding = {
  ...replacementFinding,
  findingId: "66666666-6666-4666-8666-666666666666",
  findingKey: "provider-error",
  findingType: "provider_error",
  severity: "error",
  summary: "Odds provider rejected the configured credential.",
  beforeValue: null,
  afterValue: null,
  sourceDetails: {},
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
  vi.spyOn(window, "prompt").mockReturnValue("This must never be used");
  vi.spyOn(window, "confirm").mockReturnValue(true);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("structured Monitoring Inbox decisions", () => {
  it("shows current and UFC-source values before the canonical mutation can run", async () => {
    const repo = repository({ ...inbox, newFindings: [venueFinding] }, emptyInbox);
    renderPage(repo);

    fireEvent.click(await screen.findByRole("button", { name: "CONFIRM CHANGE" }));

    const confirmation = screen.getByLabelText(`Confirm ${venueFinding.summary}`);
    expect(within(confirmation).getByText(/confirm this change/i, { selector: "h4" })).toBeInTheDocument();
    expect(within(confirmation).getByText("NOT SET")).toBeInTheDocument();
    expect(within(confirmation).getByText("Meta APEX")).toBeInTheDocument();
    expect(within(confirmation).getByText(/No player action is required/i)).toBeInTheDocument();
    expect(repo.approveFinding).not.toHaveBeenCalled();
    expect(window.prompt).not.toHaveBeenCalled();
  });

  it("applies only after final confirmation, invokes the repository once, and refreshes persisted state", async () => {
    const repo = repository({ ...inbox, newFindings: [venueFinding] }, emptyInbox);
    const onAppliedChange = vi.fn().mockResolvedValue(undefined);
    renderPage(repo, onAppliedChange);

    fireEvent.click(await screen.findByRole("button", { name: "CONFIRM CHANGE" }));
    expect(repo.approveFinding).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "APPLY CONFIRMED CHANGE" }));

    await waitFor(() => expect(repo.approveFinding).toHaveBeenCalledTimes(1));
    expect(repo.approveFinding).toHaveBeenCalledWith(
      venueFinding.findingId,
      "Owner confirmed the UFC-source event venue.",
    );
    await waitFor(() => expect(onAppliedChange).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(repo.loadInbox).toHaveBeenCalledTimes(2));
    expect(await screen.findByText("CHANGE APPLIED")).toBeInTheDocument();
    expect(screen.getByLabelText("Owner decision receipt")).toHaveTextContent("0 owner findings remain");
    expect(window.prompt).not.toHaveBeenCalled();
  });

  it("requires explicit acknowledgment before a player-impacting replacement", async () => {
    const repo = repository(inbox, emptyInbox);
    renderPage(repo);

    fireEvent.click(await screen.findByRole("button", { name: "CONFIRM CHANGE" }));
    const apply = screen.getByRole("button", { name: "APPLY CONFIRMED CHANGE" });
    expect(apply).toBeDisabled();
    expect(screen.getByText("REPICK REQUIRED")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("checkbox", { name: /understand the player or card impact/i }));
    expect(apply).toBeEnabled();
    fireEvent.click(apply);

    await waitFor(() => expect(repo.approveFinding).toHaveBeenCalledTimes(1));
    expect(await screen.findByText("CHANGE APPLIED")).toBeInTheDocument();
    expect(screen.getByLabelText("Owner decision receipt")).toHaveTextContent("Affected members must repick");
  });

  it("keeps the current value without applying the proposal", async () => {
    const repo = repository({ ...inbox, newFindings: [venueFinding] }, emptyInbox);
    renderPage(repo);

    fireEvent.click(await screen.findByRole("button", { name: "KEEP CURRENT" }));

    await waitFor(() => expect(repo.reviewFinding).toHaveBeenCalledTimes(1));
    expect(repo.reviewFinding).toHaveBeenCalledWith(venueFinding.findingId, "reviewed");
    expect(repo.approveFinding).not.toHaveBeenCalled();
    expect(await screen.findByText("CURRENT VALUE KEPT")).toBeInTheDocument();
    expect(screen.getByLabelText("Owner decision receipt")).toHaveTextContent("No live Picks mutation occurred");
  });

  it("keeps operational findings review-only with no fake application control", async () => {
    const repo = repository({ ...inbox, newFindings: [operationalFinding] }, emptyInbox);
    renderPage(repo);

    expect(await screen.findByRole("button", { name: "DISMISS NOTICE" })).toBeInTheDocument();
    expect(screen.getByText("REVIEW ONLY · NO LIVE APPLICATION CONTROL EXISTS")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "CONFIRM CHANGE" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "APPLY CONFIRMED CHANGE" })).not.toBeInTheDocument();
  });

  it("keeps automatic odds receipts distinct from owner-confirmed card changes", async () => {
    const repo = repository({ ...inbox, newFindings: [oddsFinding] }, emptyInbox);
    renderPage(repo);

    expect(await screen.findByText("AUTOMATIC ODDS RECEIPT")).toBeInTheDocument();
    expect(screen.getByText("ALREADY APPLIED AUTOMATICALLY · NO OWNER CONFIRMATION REQUIRED")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "DISMISS RECEIPT" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "CONFIRM CHANGE" })).not.toBeInTheDocument();
  });

  it("leaves a failed mutation visible and never shows a false success receipt", async () => {
    const repo = repository(inbox);
    vi.mocked(repo.approveFinding!).mockRejectedValueOnce(new Error("Canonical mutation rejected stale evidence."));
    renderPage(repo);

    fireEvent.click(await screen.findByRole("button", { name: "CONFIRM CHANGE" }));
    fireEvent.click(screen.getByRole("checkbox", { name: /understand the player or card impact/i }));
    fireEvent.click(screen.getByRole("button", { name: "APPLY CONFIRMED CHANGE" }));

    expect(await screen.findByText("Canonical mutation rejected stale evidence.")).toBeInTheDocument();
    expect(screen.getByText(replacementFinding.summary)).toBeInTheDocument();
    expect(screen.queryByLabelText("Owner decision receipt")).not.toBeInTheDocument();
    expect(repo.loadInbox).toHaveBeenCalledTimes(1);
  });
});
