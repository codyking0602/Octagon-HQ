import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const cadence = readFileSync(
  "src/features/picks-monitoring/scheduledMonitoring.ts",
  "utf8",
);
const migration = readFileSync(
  "supabase/migrations/202608310001_quiet_far_out_pick_monitoring_alerts.sql",
  "utf8",
);
const integrationSql = readFileSync(
  "supabase/tests/pick_monitoring_truthful_decisions.sql",
  "utf8",
);
const deployWorkflow = readFileSync(
  ".github/workflows/deploy-supabase.yml",
  "utf8",
);

describe("quiet far-out Picks monitoring alerts", () => {
  it("keeps provider checks twice daily until the final 48 hours", () => {
    expect(cadence).toContain(
      "if (remaining > 2 * DAY_MS) return 12 * HOUR_MS;",
    );
    expect(cadence).not.toContain(
      "if (remaining > 2 * DAY_MS) return 6 * HOUR_MS;",
    );
  });

  it("counts only scheduled provider calls toward repeated-failure escalation", () => {
    expect(migration).toContain("run.trigger_kind = 'scheduled'");
    expect(migration).toContain("and run.provider_called");
    expect(migration).toContain("and run.decision_reason is null");
    expect(migration).toContain(
      "Three consecutive automatic monitoring runs failed",
    );
    expect(migration).not.toContain(
      "Three consecutive monitoring runs failed for the current UFC event",
    );
  });

  it("proves manual checks and decision-only rows cannot create notification noise", () => {
    expect(integrationSql).toContain(
      "manual or decision-only monitoring failure created repeated-failure notification noise",
    );
    expect(integrationSql).toContain(
      "three scheduled provider failures did not create one owner notification",
    );
    expect(integrationSql).toContain(
      "hourly dispatcher replay duplicated an unchanged repeated-failure alert",
    );
    expect(integrationSql.trimEnd()).toContain("\\ir progressive_pick_bout_deadlines.sql");
  });

  it("requires the repair migration after trusted backend deployment", () => {
    expect(deployWorkflow).toContain(
      "supabase/migrations/202608310001_quiet_far_out_pick_monitoring_alerts.sql",
    );
    expect(deployWorkflow).toContain(
      'require_remote_migration "202608310001"',
    );
  });
});
