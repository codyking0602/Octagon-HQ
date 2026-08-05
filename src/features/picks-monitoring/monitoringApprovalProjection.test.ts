import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { mapMonitoringInbox } from "./monitoringInboxRepository";

const finding = {
  finding_id: "22222222-2222-4222-8222-222222222222",
  run_id: "33333333-3333-4333-8333-333333333333",
  trigger_kind: "manual",
  run_status: "completed",
  finding_key: "replacement",
  finding_type: "card_change",
  severity: "warning",
  review_status: "new",
  matchup_identity: "alpha|beta",
  bout_id: "main-event-alpha-beta",
  summary: "Replace Beta with Replacement.",
  before_value: null,
  after_value: null,
  source_details: {
    approval_proposal: {
      action: "replace_fighter",
      event_id: "ufc-approval",
      bout_id: "main-event-alpha-beta",
      corner: "blue",
      expected_red_fighter_slug: "alpha",
      expected_blue_fighter_slug: "beta",
      replacement_fighter_slug: "replacement",
      replacement_fighter_name: "Replacement",
    },
  },
  detected_at: "2099-08-01T12:00:00.000Z",
  reviewed_at: null,
};

const payload = {
  generated_at: "2099-08-01T12:01:00.000Z",
  scheduler: {
    job_id: 7,
    job_name: "octagon-hq-pick-monitoring",
    schedule: "7 * * * *",
    active: true,
    token_configured: true,
    last_wake_status: "succeeded",
    last_wake_started_at: "2099-08-01T12:07:00.000Z",
    last_wake_ended_at: "2099-08-01T12:07:01.000Z",
  },
  monitored_event: null,
  schedule_state: null,
  latest_scheduled_decision: null,
  latest_run: null,
  unresolved_count: 1,
  new_findings: [finding],
  reviewed_findings: [],
  recent_runs: [],
};

describe("monitoring approval projection", () => {
  it("parses only a supported structured proposal", () => {
    expect(mapMonitoringInbox(payload).newFindings[0].approvalProposal).toMatchObject({
      action: "replace_fighter",
      replacement_fighter_name: "Replacement",
    });

    const invalid = mapMonitoringInbox({
      ...payload,
      new_findings: [{
        ...finding,
        source_details: { approval_proposal: { action: "publish_event" } },
      }],
    });
    expect(invalid.newFindings[0].approvalProposal).toBeNull();
  });

  it("uses one new approval RPC without adding a table write or second runner", () => {
    const repository = readFileSync(
      "src/features/picks-monitoring/monitoringInboxRepository.ts",
      "utf8",
    );
    expect(repository.match(/approve_pick_monitoring_finding/g)).toHaveLength(1);
    expect(repository.match(/get_pick_monitoring_inbox/g)).toHaveLength(1);
    expect(repository.match(/functions\.invoke\("run-pick-monitoring"/g)).toHaveLength(1);
    expect(repository).not.toMatch(/\.from\(["']pick_monitoring_/);
  });
});
