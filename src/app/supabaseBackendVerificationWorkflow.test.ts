import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const workflow = readFileSync(
  ".github/workflows/verify-supabase-backend.yml",
  "utf8",
);
const deploymentWorkflow = readFileSync(
  ".github/workflows/deploy-supabase.yml",
  "utf8",
);
const syncDeploymentVerification = readFileSync(
  "scripts/verify-sync-function-deployment.mjs",
  "utf8",
);

describe("Supabase backend verification release boundary", () => {
  it("resolves the last genuinely deployed frontend ancestor for non-runtime main commits", () => {
    expect(workflow).toContain(
      "- name: Resolve verified live frontend SHA for current main",
    );
    expect(workflow).toContain("id: live_frontend");
    expect(workflow).toContain("for (let depth = 0; depth < 20; depth += 1)");
    expect(workflow).toContain("core.setOutput(\"sha\", candidateSha)");
    expect(workflow).toContain(
      "No runtime-owned paths changed in ${candidateSha}; checking parent ${parentSha}",
    );
  });

  it("fails closed when a runtime owner changed without exact deployment proof", () => {
    for (const owner of [
      String.raw`/^src\//`,
      String.raw`/^public\//`,
      String.raw`/^index\.html$/`,
      String.raw`/^package\.json$/`,
      String.raw`/^package-lock\.json$/`,
      String.raw`/^vite\.config\./`,
      String.raw`/^wrangler\.jsonc$/`,
      String.raw`/^\.github\/workflows\/deploy-cloudflare\.yml$/`,
      String.raw`/^\.github\/workflows\/verify-live-frontend-delivery\.yml$/`,
    ]) {
      expect(workflow).toContain(owner);
    }
    expect(workflow).toContain(
      "has no successful exact-SHA run for runtime-changing commit",
    );
    expect(workflow).toContain("Runtime paths: ${runtimeChanges.join(\", \")}");
  });

  it("executes every Auction SQL suite against a fresh local database", () => {
    expect(workflow).toContain(
      "- name: Execute Auction lifecycle SQL tests on a fresh local database",
    );
    expect(workflow).toContain("supabase db start");
    expect(workflow).toContain("supabase/tests/auction_private_lifecycle.sql");
    expect(workflow).toContain(
      "supabase/tests/auction_private_lifecycle_hardening.sql",
    );
    expect(workflow).toContain(
      "supabase/tests/auction_playable_server_engine.sql",
    );
    expect(workflow).toContain(
      "supabase/tests/auction_launch_notification.sql",
    );
    expect(workflow).toContain(
      'psql "$db_url" --set ON_ERROR_STOP=on --file "$test_file"',
    );
    expect(workflow).toContain(
      "Auction lifecycle and launch-notification SQL tests executed successfully against a fresh local database.",
    );
  });

  it("requires the Auction lifecycle foundation in linked production history", () => {
    expect(deploymentWorkflow).toContain(
      "supabase/migrations/202608210002_auction_private_lifecycle.sql",
    );
    expect(deploymentWorkflow).toContain(
      'require_remote_migration "202608210002"',
    );
    expect(deploymentWorkflow).toContain(
      "supabase/migrations/202608210003_auction_private_lifecycle_hardening.sql",
    );
    expect(deploymentWorkflow).toContain(
      'require_remote_migration "202608210003"',
    );
    expect(deploymentWorkflow).toContain(
      "Auction lifecycle migrations 202608210002 and 202608210003 verified in linked production history",
    );
  });

  it("keeps playable Auction migration proof in both release owners", () => {
    const playableMigrations = [
      [
        "202608220001",
        "supabase/migrations/202608220001_auction_playable_server_engine.sql",
      ],
      [
        "202608220002",
        "supabase/migrations/202608220002_auction_playable_server_engine_hardening.sql",
      ],
      [
        "202608220003",
        "supabase/migrations/202608220003_auction_round_notification_hardening.sql",
      ],
      [
        "202608220004",
        "supabase/migrations/202608220004_auction_catalog_version_rotation.sql",
      ],
    ] as const;

    expect(workflow).toContain(
      "node scripts/verify-sync-function-deployment.mjs",
    );

    for (const [version, path] of playableMigrations) {
      expect(deploymentWorkflow).toContain(path);
      expect(deploymentWorkflow).toContain(
        `require_remote_migration "${version}"`,
      );
      expect(syncDeploymentVerification).toContain(`"${version}"`);
    }

    expect(deploymentWorkflow).toContain(
      "Auction playable server migrations 202608220001 through 202608220004 verified in linked production history",
    );
    expect(syncDeploymentVerification).toContain(
      "PASS: Auction migrations 202608220001 through 202608220004 are recorded in linked remote history.",
    );
  });

  it("verifies the live shell and records the resolved SHA explicitly", () => {
    expect(workflow).toContain(
      "EXPECTED_SOURCE_SHA: ${{ steps.live_frontend.outputs.sha }}",
    );
    expect(workflow).toContain(
      "VERIFIED_LIVE_FRONTEND_SHA: ${{ steps.live_frontend.outputs.sha }}",
    );
    expect(workflow).toContain(
      "Verified live frontend SHA: $VERIFIED_LIVE_FRONTEND_SHA",
    );
    expect(workflow).toContain(
      "Any commits between those SHAs changed no frontend runtime-owned paths",
    );
  });
});
