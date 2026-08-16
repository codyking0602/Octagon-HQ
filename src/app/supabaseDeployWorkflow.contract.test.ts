import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const workflow = readFileSync(".github/workflows/deploy-supabase.yml", "utf8");

describe("Supabase deployment migration verification", () => {
  it("consumes the full migration list instead of exiting the pipeline early", () => {
    expect(workflow).toContain("matched_remote_version = remote_version");
    expect(workflow).toContain("END {");
    expect(workflow).toContain('if (matched_remote_version != "") print matched_remote_version');
    expect(workflow).not.toContain("print remote_version\n                  exit");
  });
});
