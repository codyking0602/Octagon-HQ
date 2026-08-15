import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const workflow = readFileSync(".github/workflows/deploy-supabase.yml", "utf8");

describe("canonical backend deployment workflow", () => {
  it("deploys every production main head so exact-SHA live verification can finish", () => {
    expect(workflow).toContain("name: Deploy Supabase Backend");
    expect(workflow).toContain("  workflow_call:\n");

    const pushTrigger = workflow.match(/  push:\n([\s\S]*?)\npermissions:/)?.[1] ?? "";
    expect(pushTrigger).toContain("    branches:\n      - main");
    expect(pushTrigger).not.toContain("paths:");
  });
});
