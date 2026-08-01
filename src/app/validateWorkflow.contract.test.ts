import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const workflow = readFileSync(".github/workflows/validate.yml", "utf8");

describe("Validate V2 workflow", () => {
  it("propagates failures from commands piped through tee", () => {
    expect(workflow).toContain(
      "shell: bash --noprofile --norc -eo pipefail {0}",
    );
    expect(workflow).toContain(
      "npm run typecheck 2>&1 | tee typecheck.log",
    );
    expect(workflow).toContain("npm test 2>&1 | tee test.log");
    expect(workflow).toContain("npm run build 2>&1 | tee build.log");
    expect(workflow).toContain("VITE_SUPABASE_URL: https://octagon-validation.supabase.co");
    expect(workflow).toContain("VITE_SUPABASE_PUBLISHABLE_KEY: sb_publishable_validation_only_1234567890");
    expect(workflow).toContain("VITE_EXPECTED_SUPABASE_HOSTNAME: octagon-validation.supabase.co");
    expect(workflow).not.toContain("SUPABASE_ACCESS_TOKEN");
    expect(workflow).not.toContain("SUPABASE_SERVICE_ROLE_KEY");
  });
});
