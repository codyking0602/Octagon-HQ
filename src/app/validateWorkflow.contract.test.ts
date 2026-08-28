import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const workflow = readFileSync(".github/workflows/validate.yml", "utf8");
const rankingWorkflow = readFileSync(
  ".github/workflows/validate-ranking-engine.yml",
  "utf8",
);
const packageJson = JSON.parse(readFileSync("package.json", "utf8")) as {
  scripts: Record<string, string>;
};

describe("Validate V2 workflow", () => {
  it("validates the literal pull-request head instead of GitHub's synthetic merge ref", () => {
    expect(workflow).toContain(
      "SOURCE_SHA: ${{ github.event.pull_request.head.sha || github.sha }}",
    );
    expect(workflow.match(/ref: \$\{\{ env\.SOURCE_SHA \}\}/g)).toHaveLength(3);
    expect(workflow.match(/checked_out_sha=\$\(git rev-parse HEAD\)/g)).toHaveLength(3);
    expect(workflow).toContain(
      'if [ "$checked_out_sha" != "$SOURCE_SHA" ]; then',
    );
  });

  it("cancels superseded pull-request validation without coupling main pushes", () => {
    expect(workflow).toContain(
      "group: validate-v2-${{ github.event.pull_request.number || github.sha }}",
    );
    expect(workflow).toContain(
      "cancel-in-progress: ${{ github.event_name == 'pull_request' }}",
    );
  });

  it("shards the complete test suite across eight parallel lanes with locked cached installs", () => {
    expect(workflow.match(/cache: npm/g)).toHaveLength(3);
    expect(workflow.match(/cache-dependency-path: package-lock\.json/g)).toHaveLength(3);
    expect(workflow.match(/npm ci --silent --no-audit --no-fund/g)).toHaveLength(3);
    expect(workflow).not.toContain("npm install --silent");
    expect(workflow).toContain("shard: [1, 2, 3, 4, 5, 6, 7, 8]");
    expect(workflow).toContain(
      "npm test -- --shard=${{ matrix.shard }}/8 2>&1 | tee test-shard-${{ matrix.shard }}.log",
    );
    expect(workflow).toContain("fail-fast: false");
  });

  it("keeps typecheck and production build coverage without typechecking twice", () => {
    expect(packageJson.scripts.build).toBe("npm run typecheck && npm run build:artifacts");
    expect(packageJson.scripts["build:artifacts"]).toBe(
      "vite build && vite build --config vite.worker.config.ts && npm run verify:artifact",
    );
    expect(workflow).toContain("npm run typecheck 2>&1 | tee typecheck.log");
    expect(workflow).toContain("npm run build:artifacts 2>&1 | tee build.log");
    expect(workflow).not.toContain("npm run build 2>&1 | tee build.log");
  });

  it("propagates tee failures and collapses every lane into one authoritative validate gate", () => {
    expect(workflow).toContain(
      "shell: bash --noprofile --norc -eo pipefail {0}",
    );
    expect(workflow).toContain("name: validate");
    expect(workflow).toContain("if: always()");
    expect(workflow).toContain("CORE_RESULT: ${{ needs.core.result }}");
    expect(workflow).toContain("TEST_RESULT: ${{ needs.tests.result }}");
    expect(workflow).toContain("PHONE_RESULT: ${{ needs.phone-layouts.result }}");
    expect(workflow).toContain('test "$CORE_RESULT" = success');
    expect(workflow).toContain('test "$TEST_RESULT" = success');
    expect(workflow).toContain('test "$PHONE_RESULT" = success');
  });

  it("only publishes diagnostics for the step that actually failed", () => {
    expect(workflow).toContain("id: typecheck");
    expect(workflow).toContain("if: failure() && steps.typecheck.outcome == 'failure'");
    expect(workflow).toContain("id: build");
    expect(workflow).toContain("if: failure() && steps.build.outcome == 'failure'");
    expect(workflow).toContain("id: test");
    expect(workflow).toContain("if: failure() && steps.test.outcome == 'failure'");
    expect(workflow).toContain("id: phone");
    expect(workflow).toContain("if: failure() && steps.phone.outcome == 'failure'");
  });

  it("uses public validation-only Supabase configuration for the production build", () => {
    expect(workflow).toContain(
      "VITE_SUPABASE_URL: https://octagon-validation.supabase.co",
    );
    expect(workflow).toContain(
      "VITE_SUPABASE_PUBLISHABLE_KEY: sb_publishable_octagon_validation_only_00000000000000000000",
    );
    expect(workflow).toContain(
      "VITE_EXPECTED_SUPABASE_HOSTNAME: octagon-validation.supabase.co",
    );
    expect(workflow).not.toContain("SUPABASE_ACCESS_TOKEN");
    expect(workflow).not.toContain("SUPABASE_SERVICE_ROLE_KEY");
  });

  it("keeps ranking validation on the same public validation-only browser configuration", () => {
    expect(rankingWorkflow).toContain(
      "VITE_SUPABASE_URL: https://octagon-validation.supabase.co",
    );
    expect(rankingWorkflow).toContain(
      "VITE_SUPABASE_PUBLISHABLE_KEY: sb_publishable_octagon_validation_only_00000000000000000000",
    );
    expect(rankingWorkflow).toContain(
      "VITE_EXPECTED_SUPABASE_HOSTNAME: octagon-validation.supabase.co",
    );
    expect(rankingWorkflow).not.toContain("SUPABASE_ACCESS_TOKEN");
    expect(rankingWorkflow).not.toContain("SUPABASE_SERVICE_ROLE_KEY");
  });
});