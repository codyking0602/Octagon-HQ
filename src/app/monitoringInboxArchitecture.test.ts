import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync("supabase/migrations/202608100001_pick_monitoring_inbox.sql", "utf8");
const storageMigration = readFileSync("supabase/migrations/202608070001_pick_monitoring_storage.sql", "utf8");
const repository = readFileSync("src/features/picks-monitoring/monitoringInboxRepository.ts", "utf8");
const page = readFileSync("src/features/picks-monitoring/MonitoringInboxPage.tsx", "utf8");
const router = readFileSync("src/app/router.tsx", "utf8");
const main = readFileSync("src/main.tsx", "utf8");
const home = readFileSync("src/features/home/HomePage.tsx", "utf8");
const shell = readFileSync("src/app/AppShell.tsx", "utf8");

describe("Monitoring Inbox architecture", () => {
  it("uses the existing Fight Night owner boundary for both read and review operations", () => {
    expect(migration.match(/is_pick_control_owner\(auth\.uid\(\)\)/g)).toHaveLength(2);
    expect(migration).toContain("raise exception 'pick control owner required'");
    expect(migration).toContain("grant execute on function public.get_pick_monitoring_inbox() to authenticated");
    expect(migration).toContain("grant execute on function public.review_pick_monitoring_finding(uuid, text) to authenticated");
  });

  it("preserves private ledger tables and returns only bounded app-facing history", () => {
    expect(storageMigration).toContain("revoke all on table public.pick_monitoring_runs, public.pick_monitoring_findings");
    expect(migration).not.toMatch(/grant\s+(?:select|insert|update|delete)\s+on\s+(?:table\s+)?public\.pick_monitoring_/i);
    expect(migration).toContain("limit 50");
    expect(migration).toContain("limit 20");
    expect(migration).toContain("limit 12");
    expect(migration).toContain("order by item.detected_at desc");
    expect(migration).toContain("order by item.reviewed_at desc");
  });

  it("allows one-way review transitions and changes only the permitted review fields", () => {
    const reviewFunction = migration.split("create or replace function public.review_pick_monitoring_finding")[1] ?? "";
    const updateBlock = reviewFunction.split("update public.pick_monitoring_findings finding")[1]?.split("returning finding.* into v_finding")[0] ?? "";

    expect(reviewFunction).toContain("v_status not in ('reviewed', 'dismissed')");
    expect(updateBlock).toContain("review_status = v_status");
    expect(updateBlock).toContain("reviewed_at = now()");
    expect(updateBlock).toContain("reviewed_by = auth.uid()");
    expect(updateBlock).toContain("finding.review_status = 'new'");
    expect(updateBlock).not.toMatch(/summary\s*=|before_value\s*=|after_value\s*=|finding_key\s*=|source_details\s*=/);
    expect(reviewFunction).toContain("monitoring finding already reviewed");
  });

  it("does not expose credentials, scheduler commands, or direct browser table access", () => {
    expect(migration).not.toContain("decrypted_secret");
    expect(migration).not.toContain("service_role_key");
    expect(migration).not.toContain("THE_ODDS_API_KEY");
    expect(migration).not.toContain("'command', v_job.command");
    expect(repository).not.toMatch(/\.from\(["']pick_monitoring_/);
    expect(repository).not.toContain("setInterval");
    expect(page).not.toContain("setInterval");
  });

  it("wires one private route and one stylesheet without adding player navigation or Home entry", () => {
    expect(router.match(/path:\s*["']picks\/monitoring["']/g)).toHaveLength(1);
    expect(main.match(/styles\/picks-monitoring\.css/g)).toHaveLength(1);
    expect(home).not.toContain("/picks/monitoring");
    expect(shell).not.toContain("/picks/monitoring");
  });

  it("never creates a second runner, provider, scheduler, or Picks mutation path", () => {
    expect(migration).not.toContain("cron.schedule");
    expect(migration).not.toContain("net.http_post");
    expect(repository.match(/functions\.invoke\("run-pick-monitoring"/g)).toHaveLength(1);
    expect(`${migration}\n${repository}\n${page}`).not.toMatch(/publish_pick_event_draft|stage_pick_event_draft|submit_pick|record_official_pick_bout_result|transition_pick_event|THE_ODDS_API_KEY/);
    expect(migration.trimEnd()).toMatch(/notify pgrst, 'reload schema';$/);
  });
});
