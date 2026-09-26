import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const center = readFileSync("src/features/notifications/NotificationCenterPage.tsx", "utf8");
const model = readFileSync("src/features/notifications/notificationModel.ts", "utf8");
const tokens = readFileSync("src/styles/tokens.css", "utf8");
const migration = readFileSync("supabase/migrations/202612310192_mlb_notifications.sql", "utf8");
const scheduler = readFileSync("supabase/functions/run-pick-monitoring/index.ts", "utf8");

describe("MLB notification launch contract", () => {
  it("ships MLB notification infrastructure dormant behind the public season gate", () => {
    expect(migration).toContain("where season_row.public_enabled");
    expect(migration).toContain("dispatch_due_mlb_notifications");
    expect(scheduler).toContain('admin.rpc("dispatch_due_mlb_notifications"');
    expect(scheduler).toContain("second scheduler or delivery path is introduced");
  });

  it("limits MLB push to launch, challenge live, challenge ending, and new rounds", () => {
    expect(migration).toContain("'mlb_launch_available'");
    expect(migration).toContain("'mlb_challenge_available'");
    expect(migration).toContain("'mlb_challenge_four_hours'");
    expect(migration).toContain("'mlb_round_available'");
    expect(migration).toContain("'mlb_round_recap'");
    expect(migration).toContain("Round-complete updates are the single MLB in-app-only notification");
    expect(model).toContain('"mlb_round_recap"');
  });

  it("renders MLB inbox rows with the established muted Baseball green", () => {
    expect(center).toContain("data-hq-theme={sport ?? undefined}");
    expect(model).toContain('return "mlb"');
    expect(tokens).toContain("--mlb-green: #2f855f");
    expect(tokens).toContain('[data-hq-theme="mlb"]');
    expect(tokens).toContain("--hq-context-accent: var(--mlb-green)");
  });
});
