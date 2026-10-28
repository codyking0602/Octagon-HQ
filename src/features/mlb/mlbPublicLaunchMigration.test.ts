import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202612310205_mlb_public_launch.sql",
  "utf8",
);
const config = readFileSync("src/features/mlb/mlbPlayoffsConfig.ts", "utf8");
const sqlProof = readFileSync("supabase/tests/mlb_notifications.sql", "utf8");

describe("MLB 2026 public launch", () => {
  it("opens both public launch gates without changing field readiness", () => {
    expect(config).toContain("MLB_PLAYOFFS_PUBLIC_ENABLED = true");
    expect(migration).toContain("public_enabled = true");
    expect(migration).toContain("field_ready = true");
  });

  it("suppresses the already-live challenge on launch day", () => {
    expect(migration).toContain("v_launch_at is not null");
    expect(migration).toContain(
      "v_challenge.scheduled_date > (v_launch_at at time zone 'America/Chicago')::date",
    );
    expect(sqlProof).toContain("MLB public launch double-pushed the already-live challenge");
    expect(sqlProof).toContain("Only the first post-launch MLB challenge should create a challenge-live row");
  });

  it("keeps the one canonical MLB launch push", () => {
    expect(migration).toContain("'mlb_launch_available'");
    expect(migration).toContain("'Baseball is live'");
    expect(migration).toContain("'ENTER BASEBALL'");
  });
});
