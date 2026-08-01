import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const workflow = readFileSync(
  ".github/workflows/verify-supabase-backend.yml",
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
