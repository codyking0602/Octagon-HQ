import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { mapMonitoringInbox } from "./monitoringInboxRepository";

const run = {
  run_id: "11111111-1111-4111-8111-111111111111",
  trigger_kind: "scheduled",
  status: "completed",
  source_event_identity: "ufc:event-test",
  event_id: "ufc-event-test",
  started_at: "2026-08-01T12:00:00.000Z",
  completed_at: "2026-08-01T12:00:05.000Z",
  card_source: "MMA Mania",
  card_source_url: "https://www.mmamania.com/test",
  odds_provider: "the-odds-api",
  provider_requests_remaining: 42,
  provider_requests_used: 8,
  provider_last_request_cost: 1,
  provider_event_count: 1,
  complete_snapshot_count: 6,
  missing_snapshot_count: 0,
  diagnostics: [],
  finding_count: 1,
  new_finding_count: 1,
};

const finding = {
  finding_id: "22222222-2222-4222-8222-222222222222",
  run_id: run.run_id,
  trigger_kind: "scheduled",
  run_status: "completed",
  finding_key: "ufc:event-test:card-change:test",
  finding_type: "card_change",
  severity: "warning",
  review_status: "new",
  matchup_identity: "red-fighter|blue-fighter",
  bout_id: "main-event-red-fighter-blue-fighter",
  summary: "Fight order changed.",
  before_value: { position: 2 },
  after_value: { position: 1 },
  source_details: { source: "MMA Mania" },
  detected_at: "2026-08-01T12:00:05.000Z",
  reviewed_at: null,
};

const payload = {
  generated_at: "2026-08-01T12:01:00.000Z",
  scheduler: {
    job_id: 7,
    job_name: "octagon-hq-pick-monitoring",
    schedule: "7 * * * *",
    active: true,
    token_configured: true,
    last_wake_status: "succeeded",
    last_wake_started_at: "2026-08-01T12:07:00.000Z",
    last_wake_ended_at: "2026-08-01T12:07:03.000Z",
  },
  monitored_event: {
    kind: "staged",
    event_id: "ufc-event-test",
    source_event_identity: "ufc:event-test",
    name: "UFC Fight Night",
    subtitle: "Red Fighter vs. Blue Fighter",
    starts_at: "2026-08-03T00:00:00.000Z",
    locks_at: "2026-08-03T00:00:00.000Z",
    bout_count: 6,
  },
  schedule_state: {
    source_event_identity: "ufc:event-test",
    next_eligible_at: "2026-08-01T18:00:00.000Z",
    lease_until: null,
    last_claimed_at: "2026-08-01T12:00:00.000Z",
    updated_at: "2026-08-01T12:00:05.000Z",
  },
  latest_run: run,
  unresolved_count: 1,
  new_findings: [finding],
  reviewed_findings: [{
    ...finding,
    finding_id: "33333333-3333-4333-8333-333333333333",
    review_status: "dismissed",
    reviewed_at: "2026-08-01T12:30:00.000Z",
  }],
  recent_runs: [run],
};

describe("Monitoring Inbox projection mapping", () => {
  it("maps the compact owner projection without inventing operational values", () => {
    const inbox = mapMonitoringInbox(payload);

    expect(inbox.scheduler).toEqual({
      jobId: 7,
      jobName: "octagon-hq-pick-monitoring",
      schedule: "7 * * * *",
      active: true,
      tokenConfigured: true,
      lastWakeStatus: "succeeded",
      lastWakeStartedAt: "2026-08-01T12:07:00.000Z",
      lastWakeEndedAt: "2026-08-01T12:07:03.000Z",
    });
    expect(inbox.monitoredEvent?.name).toBe("UFC Fight Night");
    expect(inbox.scheduleState?.nextEligibleAt).toBe("2026-08-01T18:00:00.000Z");
    expect(inbox.latestRun?.completeSnapshotCount).toBe(6);
    expect(inbox.latestRun?.providerRequestsRemaining).toBe(42);
    expect(inbox.newFindings[0]).toMatchObject({
      findingType: "card_change",
      reviewStatus: "new",
      matchupIdentity: "red-fighter|blue-fighter",
    });
    expect(inbox.reviewedFindings[0]?.reviewStatus).toBe("dismissed");
  });

  it("accepts the valid no-event and no-run state", () => {
    const inbox = mapMonitoringInbox({
      ...payload,
      monitored_event: null,
      schedule_state: null,
      latest_run: null,
      unresolved_count: 0,
      new_findings: [],
      reviewed_findings: [],
      recent_runs: [],
    });

    expect(inbox.monitoredEvent).toBeNull();
    expect(inbox.latestRun).toBeNull();
    expect(inbox.newFindings).toEqual([]);
  });

  it("rejects malformed or over-broad projection payloads", () => {
    expect(() => mapMonitoringInbox({
      ...payload,
      scheduler: { ...payload.scheduler, active: "yes" },
    })).toThrow();
    expect(() => mapMonitoringInbox({
      ...payload,
      new_findings: [{ ...finding, review_status: "deleted" }],
    })).toThrow();
  });
});

describe("Monitoring Inbox repository ownership", () => {
  const repository = readFileSync("src/features/picks-monitoring/monitoringInboxRepository.ts", "utf8");

  it("uses only the canonical projection, review RPC, and existing monitoring runner", () => {
    expect(repository.match(/get_pick_monitoring_inbox/g)).toHaveLength(1);
    expect(repository.match(/review_pick_monitoring_finding/g)).toHaveLength(1);
    expect(repository.match(/functions\.invoke\("run-pick-monitoring"/g)).toHaveLength(1);
    expect(repository).not.toContain("THE_ODDS_API_KEY");
    expect(repository).not.toMatch(/\.from\(["']pick_monitoring_/);
    expect(repository).not.toContain("setInterval");
  });
});
