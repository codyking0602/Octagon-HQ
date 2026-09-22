import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202612310165_ufc_picks_trusted_auto_card_sync.sql",
  "utf8",
);
const runner = readFileSync("supabase/functions/run-pick-monitoring/index.ts", "utf8");
const proposals = readFileSync("src/features/picks-monitoring/cardChangeApproval.ts", "utf8");

describe("trusted automatic UFC Picks card synchronization", () => {
  it("auto-applies only exact current-card actions from the official warning-free scheduler path", () => {
    expect(runner).toContain('sourcePreview?.source === "UFC.com event + card"');
    expect(runner).toContain("sourceWarnings.length === 0");
    expect(runner).toContain('admin.rpc("auto_apply_trusted_pick_monitoring_changes"');
    expect(migration).toContain("v_run.trigger_kind <> 'scheduled'");
    expect(migration).toContain("v_run.card_source is distinct from 'UFC.com event + card'");
    expect(migration).toContain("'add_bout'");
    expect(migration).toContain("'remove_bout'");
    expect(migration).toContain("'replace_fighter'");
    expect(migration).toContain("'reorder_card'");
    expect(migration).toContain("'sync_card_segments'");
    expect(migration).not.toContain("'adjust_event_lock',\n        'update_event_metadata'");
  });

  it("keeps stale-state and lock guards ahead of every automatic mutation", () => {
    expect(migration).toContain("private.apply_pick_fight_change(");
    expect(migration).toContain("private.apply_pick_card_segment_sync(");
    expect(migration).toContain("for update");
    expect(migration).toContain("card segment changed; refresh Picks control");
    expect(migration).toContain("locked, removed, or resulted fights cannot change card segment");
    expect(migration).toContain("same unique fights");
  });

  it("models main/prelim movement as one complete exact-state proposal", () => {
    expect(proposals).toContain('action: "sync_card_segments"');
    expect(proposals).toContain("expected_segments");
    expect(proposals).toContain("proposed_segments");
    expect(proposals).toContain('summary: "Apply the detected main/prelim placement."');
    expect(proposals).toContain("unmatchedCurrent.length === 0 && unmatchedSource.length === 0");
  });

  it("records automated review evidence and preserves owner review as the failure fallback", () => {
    expect(migration).toContain("reviewed_automatically boolean not null default false");
    expect(migration).toContain("reviewed_automatically = true");
    expect(migration).toContain("approval_receipt = v_receipt");
    expect(migration).toContain("Leave the finding new");
    expect(runner).toContain('status: "not_eligible"');
  });

  it("notifies people with existing picks while leaving event headers manual", () => {
    expect(migration).toContain("'picks_card_updated'");
    expect(migration).toContain("'Fight order updated'");
    expect(migration).toContain("'Fight card updated'");
    expect(migration).toContain("select distinct pick.profile_id");
    expect(migration).not.toMatch(/set_pick_event_header|header_storage_path|pick-event-headers/i);
    expect(runner).not.toMatch(/set_pick_event_header|header_storage_path|pick-event-headers/i);
  });
});
